<script setup>
    import { reactive, ref, computed } from "vue";
    import { useSheetStore } from ".././stores/SheetStore";
    const sheetStore = useSheetStore();
    sheetStore.loadState();

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
    function handleCurCellInput(event) {
        const inputChar = event.data || event.target.value.slice(-1);

        // Only allow letters A-Z
        if (!/^[a-zA-Z]$/.test(inputChar)) {
            curCellKeyInput.value = curCellKeyInput.value.slice(0,-1);
            return;
        }

        // Replace full text with the new uppercase letter
        if(curCellKeyInput.value.length == 3)
            curCellKeyInput.value = inputChar.toUpperCase();
        else
            curCellKeyInput.value = curCellKeyInput.value.slice(0, -1) + inputChar.toUpperCase();

        if (curCellKeyInput.value.length != 2)
            return;
        //Now update the actual coordinate of curCell
        const newCoord = cellKeyToCoord(curCellKeyInput.value);
        curCell.x = newCoord.x;
        curCell.y = newCoord.y;
    }
    function cellCoordToKey(coord) {
        return sheetStore.getVisualXHeadings(curSheetIndex.value)[coord.x] + sheetStore.getVisualYHeadings(curSheetIndex.value)[coord.y];
    }
    function cellKeyToCoord(coord) {
        return { x: sheetStore.getVisualXHeadings(curSheetIndex.value).indexOf(coord[0]), y: sheetStore.getVisualYHeadings(curSheetIndex.value).indexOf(coord[1]) };
    }

</script>


<template>
    <div class="SheetsView">
        <div class="LeftColumn">
            <div class="SheetSelect">
                <div class="header-row">
                    <h3>Select Sheet:</h3>
                    <button @click="sheetStore.newSheet()" style="justify-content:right">+</button>
                </div>
                <div v-for="(sheetName, index) in sheetStore.getSheetNames"
                     :key="index"
                     :class="['list-item', curSheetIndex === index ? 'selected' : '']"
                     @click="curSheetIndex = index ">
                    {{ sheetName }}
                </div>
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
                    <button @click="sheetStore.deleteSheet()">Delete</button>
                </div>
            </div>
            <div v-else class="SheetSettings"> Select a sheet! </div>
        </div>
        <div class="SheetGridContainer" v-if="isSheetSelected">
            <div class="SheetGrid">
                <div class="SheetGridBlankCorner">
                    <div class="SheetGridCell">
                        {{currentSheetName}}
                    </div>
                </div>
                <div v-for="char in sheetStore.getVisualXHeadings(curSheetIndex)" class="SheetGridVisualXHeadings">
                    <div class="SheetGridCell">
                        {{ char }}
                    </div>
                </div>


                <template v-for="(row, y) in sheetStore.getVisualYHeadings(curSheetIndex)" :key="y">
                    <div class="SheetGridVisualYHeadings">
                        <div class="SheetGridCell">
                            {{ row }}
                        </div>
                    </div>
                    <div v-for="(col, x) in 24"
                         :key="x"
                         @click="curCell.x = x; curCell.y = y; curCellKeyInput = cellCoordToKey(curCell)"
                         :class="['SheetGridCell', curCell.x === x && curCell.y === y ? 'SheetGridCellSelected' : '']">
                        {{ currentSheet.grid[y][x] }}
                    </div>

                </template>
            </div>
        </div>
        <div v-else class="SheetGridContainer">
            Select a sheet!
        </div>
        <div class="RightColumn" v-if="isSheetSelected">
            <div class="header-row"> <h3>Edit cell:</h3> </div>
            <div class="SheetEditingRow"> 
                Current cell:
                <input v-model="curCellKeyInput" class="editCurCellKey" @input="handleCurCellInput" /> 
            </div>
            Value:
            <input v-model="curCellValue"  />
        </div>
        <div v-else class="RightColumn">
            Select a sheet!
        </div>
    </div>
</template>

<style>
    :root{
        --sheet-cell-height: 2rem;
    }

    .SheetsView {
        display: flex;
        flex-direction: row;
    }

    .LeftColumn {
        display: flex;
        flex-direction: column;
        width: 20vw;
    }

    .SheetSelect {
        height: 40vh;
        border: 3px solid #303030;
        padding: 2px;
    }
    .header-row {
        display: flex;
        justify-content: space-between;
        background-color: #303030;
        align-items: center;
    }

    .SheetSettings {
        height: 53vh;
        border: 3px solid #303030;
        padding: 2px;
        display: flex;
        flex-direction: column;
    }
    .SheetEditingRow {
        display: flex;
        flex-direction: row;
        padding: 2px;
        gap: 5px;
    }

    .SheetGridContainer {
        width: 60vw;
        height: 93vh;
        border: 3px solid #303030;
        overflow: scroll;
        background-color: black;
    }
    .SheetGrid {
        display: grid;
        grid-template-rows: repeat(25, var(--sheet-cell-height));
        grid-template-columns: repeat(25, 100px);
        overflow: visible; 
        position: relative;
    }
    .SheetGridBlankCorner {
        position: sticky;
        top: 0;
        left: 0;
        z-index: 3;
    }
        .SheetGridBlankCorner .SheetGridCell {
            background-color: #303030;
        }
    .SheetGridVisualXHeadings {
        display: grid;
        position: sticky;
        top: 0;
        z-index: 1;
    }
        .SheetGridVisualXHeadings .SheetGridCell {
            background-color: #303030;
        }

    .SheetGridVisualYHeadings {
        position: sticky;
        left: 0;
        background-color: #303030;
        z-index: 2;
    }
    .SheetGridCell {
        display: block;
        padding: 0px 4px;
        border: 1px solid #aaa;
        overflow: hidden;
        text-overflow: ellipsis;
        color: white;
        white-space: nowrap;
        background-color: transparent;
        font-size: 12px;
        word-break: break-word;
        height: var(--sheet-cell-height);
    }
    .SheetGridCellSelected {
        border: 3px solid white;
    }

    .RightColumn {
        width: 20vw;
        height: 93vh;
        border: 3px solid #303030;
        padding: 2px;
    }

    .list-item {
        background-color: #303030;
        cursor: pointer;
        height: 20px;
    }
    .selected {
        background-color: white;
        color: black;
        font-weight: bold;
    }

    .RightColumn{
        display:flex;
        flex-direction:column;
    }

    .editCurCellKey{
        font-size: 2rem;
        width:4ch;
        text-transform: uppercase;
    }

</style>
