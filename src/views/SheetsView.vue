<script setup>
    import { reactive, ref, watch, computed } from "vue";
    import { getRecommendations } from "../helpers/Recommendations"
    import { useSheetStore } from "../stores/SheetStore";
    import { useSettingsStore } from "../stores/SettingsStore";
    const sheetStore = useSheetStore();
    sheetStore.loadState();
    const settingsStore = useSettingsStore();
    
    settingsStore.loadState();

    const leftColumn = ref(null);
    const topRow = ref(null);
    const mainGrid = ref(null);

    const curSheetIndex = ref(0);

    const isSheetSelected = computed({
        get: () => sheetStore.isValidSheetIndex(curSheetIndex.value),
    });
    const currentSheet = computed({
        get: () => sheetStore.sheets[curSheetIndex.value],
    });
    const currentSheetName = computed({
        get: () => sheetStore.sheets[curSheetIndex.value]?.name || '',
        set: (newName) => {
            if (sheetStore.sheets[curSheetIndex.value]) {
                sheetStore.sheets[curSheetIndex.value].name = newName;
                sheetStore.saveState();
            }
        }
    });
    const currentSheetType = computed({
        get: () => sheetStore.sheets[curSheetIndex.value].type,
        set: (newType) => {
            sheetStore.sheets[curSheetIndex.value].type = newType;
            sheetStore.saveState();
        }
    });
    const curCellValue = computed({
        get: () => sheetStore.getCell(curSheetIndex.value, curCell),
        set: (newValue) => sheetStore.setCell(curSheetIndex.value, curCell, newValue)
    })

    //Theres 3 layers to the curCell: the actual coordinate, that coordinate's key, and the input box's value (could be 1 char)
    const curCell = reactive({ x: 0, y: 0 });
    const curCellKeyInput = ref("AA");
    const cellValueInputBox = ref(null);
    function handleCurCellInput(event) {
        const cursorPos = event.target.selectionStart;
        const inputChar = event.data;

        if (!inputChar) return;

        const valueAfterInput = curCellKeyInput.value;
        const valueBeforeInput = curCellKeyInput.value.slice(0, cursorPos - 1) + event.target.value.slice(cursorPos);

        // Only allow letters A-X
        if (!/^[a-xA-X]$/.test(inputChar)) {
            curCellKeyInput.value = valueBeforeInput;
            event.target.setSelectionRange(cursorPos - 1, cursorPos - 1); // Restore cursor
            return;
        }

        // Replace full text with the new uppercase letter
        if (curCellKeyInput.value.length == 3)
            curCellKeyInput.value = inputChar.toUpperCase();
        else {
            curCellKeyInput.value = valueAfterInput.toUpperCase();
        }

        if (curCellKeyInput.value.length != 2)
            return;
        //Now update the actual coordinate of curCell
        const newCoord = sheetStore.keyToCoord(curSheetIndex.value, curCellKeyInput.value);
        curCell.x = newCoord.x;
        curCell.y = newCoord.y;
    }

    function syncScroll() {
        if (leftColumn.value && topRow.value && mainGrid.value) {
            leftColumn.value.scrollTop = mainGrid.value.scrollTop;
            topRow.value.scrollLeft = mainGrid.value.scrollLeft;
        }
    }

    watch(
        () => settingsStore.sheets_pairorder,
        (newVal) => {
            const newCoord = sheetStore.keyToCoord(curSheetIndex.value, curCellKeyInput.value);
            curCell.x = newCoord.x;
            curCell.y = newCoord.y;
        }
    );
</script>


<template>
    <div class="SheetsView">
        <div class="LeftColumn">
            <div class="SheetSelect">
                <div class="header-row">
                    <h3>Select Sheet:</h3>
                </div>
                <div v-for="(sheetName, index) in sheetStore.getSheetNames"
                     :key="index"
                     :class="['ListItem', curSheetIndex === index ? 'Selected' : '']"
                     @click="if(curSheetIndex != index) {
                                curSheetIndex = index;
                                curCell.x = 0;
                                curCell.y = 0;
                                curCellKeyInput = sheetStore.coordToKey(curSheetIndex, curCell);
                             }">
                    {{ sheetName }}
                </div>
                <button @click="sheetStore.newSheet(); curSheetIndex = sheetStore.sheets.length - 1;" 
                        style="justify-content:center;">+</button>
            </div>
            <div class="SheetSettings" v-if="isSheetSelected">
                <div class="header-row">
                    <h3>Sheet settings:</h3>
                </div>
                <h1 style="overflow:hidden;text-overflow:ellipsis; white-space:nowrap;">
                    {{currentSheetName != "" ? currentSheetName : "&nbsp;"}}
                </h1>
                <div class="SheetEditingRow"> Name: <input v-model="currentSheetName" maxlength="20" /> </div>
                <div class="SheetEditingRow">
                    Type: <select v-model="currentSheetType">
                        <option v-for="(type,index) in sheetStore.sheetTypes" :key="index" :value="index">
                            {{type.name}}
                        </option>
                    </select>
                </div>
                <div class="SheetEditingRow">
                    <button @click="sheetStore.deleteSheet(); 
                            if(curSheetIndex == sheetStore.sheets.length) 
                                curSheetIndex--;
                            ">
                    Delete
                    </button>
                </div>
            </div>
            <div v-else class="SheetSettings">
                <div class="header-row">
                    <h3>Sheet settings:</h3>
                </div>
                <div style="color:var(--info-200)">
                    Select a sheet to get started
                </div>
            </div>
        </div>
        <div class="SheetGridContainer" v-if="isSheetSelected">
            <div class="SheetGridCorner">
                <div class="SheetGridCell">
                    {{ currentSheetName }}
                </div>
            </div>
            <div class="SheetGridTopRow" ref="topRow">
                <div v-for="char in sheetStore.getXHeadings(curSheetIndex)" class="SheetGridCell">
                    {{ char }}
                </div>
                <div class="SheetGridCell"> </div>
            </div>
            <div class="SheetGridLeftColumn" ref="leftColumn">
                <div v-for="char in sheetStore.getYHeadings(curSheetIndex)" class="SheetGridCell">
                    {{ char }}
                </div>
                <div class="SheetGridCell"> </div>
            </div>
            <div class="SheetGrid" ref="mainGrid" @scroll="syncScroll">
                <div v-for="(row,y) in 24">
                    <div v-for="(col, x) in 24"
                         @click="curCell.x = x; 
                                curCell.y = y; 
                                curCellKeyInput = sheetStore.coordToKey(curSheetIndex, curCell)
                                cellValueInputBox.focus()"
                         :class="['SheetGridCell', curCell.x === x && curCell.y === y ? 'SheetGridCellSelected' : '']"
                         style="cursor:pointer">
                        {{ sheetStore.getCell(curSheetIndex, {x:x,y:y}) }}
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="SheetGridContainer"> </div>
        <div class="RightColumn" v-if="isSheetSelected">
            <div class="header-row"> <h3>Edit cell:</h3>  </div>
            <div class="SheetEditingRow">
                Current cell:
                <input v-model="curCellKeyInput" 
                       class="editCurCellKey" 
                       @input="handleCurCellInput"/>
            </div>
            <div class="SheetEditingRow">
                Value:
                <input v-model="curCellValue" ref="cellValueInputBox" :key="settingsStore.sheets_pairorder" />
            </div>

            <div class="CellOptions" v-if="currentSheetType != 0">
                Recommendations:
                <div v-for="algorithm in getRecommendations(currentSheetType, sheetStore.coordToKey(curSheetIndex, curCell))"
                     :class="['ListItem']"
                     @click="sheetStore.setCell(curSheetIndex, curCell, algorithm)">
                    {{ algorithm }}
                </div>
            </div>
            <div v-else class="CellOptions" style="color:var(--info-300)">
                Select a type for this sheet to show algorithm recommendations.
            </div>
        </div>
        <div v-else class="RightColumn">
            <div class="header-row"> <h3>Edit cell:</h3>  </div>
            <div style="color:var(--info-200)">
                Select a sheet to get started
            </div>
        </div>
    </div>
</template>

<style>
    :root{
        --sheet-cell-height: 2rem;
        --sheet-cell-width: 100px;
        --border-color: var(--grey-900);
        --panel-color: var(--grey-800);
        --panel-header-color: var(--brand-700);
        --panel-header-text-color: var(--grey-100);
        --text-color: var(--grey-100);
    }

    .SheetsView {
        display: flex;
        flex-direction: row;
    }

    .header-row {
        display: flex;
        justify-content: center;
        background-color: var(--panel-header-color);
        color: var(--panel-header-text-color);
        align-items: center;
        border-radius: 3px;
        font-size: 1rem;
    }

    .LeftColumn {
        display: flex;
        flex-direction: column;
        width: 20vw;
        color: var(--text-color);
    }

    .SheetSelect {
        height: 33%;
        border: 3px solid var(--border-color);
        padding: 2px;
        background-color: var(--panel-color);
        overflow:auto;
    }
    .ListItem {
        background-color: var(--grey-600);
        border: 1px solid var(--panel-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        font-size: 1rem;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .Selected {
        background-color: white;
        color: black;
        font-weight: bold;
    }
    .SheetSettings {
        height: 67%;
        border: 3px solid var(--border-color);
        padding: 2px;
        display: flex;
        flex-direction: column;
        background-color: var(--panel-color);
    }

    .SheetGridContainer {
        width: 60vw;
        height: 93vh;
        border: 3px solid var(--border-color);
        background-color: var(--panel-color);
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto 1fr;
        grid-template-areas:
            "corner top"
            "left grid";
        overflow: hidden;
    }
    .SheetGrid {
        grid-area: grid;
        display: grid;
        grid-template-rows: repeat(24, var(--sheet-cell-height));
        grid-template-columns: repeat(24, var(--sheet-cell-width));
        height: calc(100%);
        overflow: auto; 
    }
    .SheetGridCorner {
        grid-area: corner;
        background-color: var(--brand-800);
    }
    .SheetGridTopRow {
        display: flex;
        flex-direction: row;
        grid-area: top;
        overflow-x: hidden;
    }
        .SheetGridTopRow .SheetGridCell {
            background-color: var(--brand-700);
            min-width: var(--sheet-cell-width);
            display:flex;
            justify-content:center;
            align-items:center;
        }
    .SheetGridLeftColumn {
        grid-area: left;
        overflow-y: hidden;
    }
        .SheetGridLeftColumn .SheetGridCell {
            background-color: var(--brand-700);
            min-height: var(--sheet-cell-height);
            max-width: var(--sheet-cell-width);
            display: flex;
            justify-content: center;
            align-items: center;
        }

    .SheetGridCell {
        padding: 0px 4px;
        border: 1px solid var(--border-color);
        overflow: hidden;
        text-overflow: ellipsis;
        color: white;
        white-space: nowrap;
        background-color: transparent;
        font-size: 14px;
        word-break: break-word;
        height: var(--sheet-cell-height);
        line-height: var(--sheet-cell-height);
        width: var(--sheet-cell-width);
    }
    .SheetGridCellSelected {
        border: 3px solid white;
    }

    .RightColumn {
        width: 20vw;
        height: 93vh;
        border: 3px solid var(--border-color);
        padding: 2px;
        background-color: var(--panel-color);
        display: flex;
        flex-direction: column;
        color: var(--text-color);
    }

    .SheetEditingRow {
        display: flex;
        flex-direction: row;
        padding: 2px;
        gap: 5px;
        width: 100%;
    }

    .editCurCellKey{
        font-size: 2rem;
        width:4ch;
        text-transform: uppercase;
    }

    .CellOptions{
        width: 100%;
        height:100%;
        overflow: auto;
    }

</style>
