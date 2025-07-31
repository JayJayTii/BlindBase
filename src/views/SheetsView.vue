<script setup>
    import { reactive, ref, watch, computed, onMounted } from "vue";
    import SheetGrid from "@/components/SheetGrid.vue";
    import { getRecommendations } from "../helpers/Recommendations"
    import { useSheetStore } from "../stores/SheetStore";
    import { useSettingsStore } from "../stores/SettingsStore";
    const sheetStore = useSheetStore();
    sheetStore.loadState();
    const settingsStore = useSettingsStore();
    settingsStore.loadState();

    const curSheetIndex = ref(0);
    const gridRef = ref(null);

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
    const selectedCell = reactive({ x: 0, y: 0 });
    const selectedCellKey = computed({
        get: () => sheetStore.coordToKey(curSheetIndex.value, selectedCell),
        set: (newKey) => {
            const newCoord = sheetStore.keyToCoord(curSheetIndex.value, newKey);
            selectedCell.x = newCoord.x;
            selectedCell.y = newCoord.y;
            gridRef.value.changeHighlightedCells([selectedCell]);
        }
    });
    const selectedCellValue = computed({
        get: () => {
            return sheetStore.getCell(curSheetIndex.value, selectedCell);
        },
        set: (newValue) => {
            sheetStore.setCell(curSheetIndex.value, selectedCell, newValue);
        },
    });

    const selectedCellInput = ref("AA");
    watch(selectedCellInput, (newValue, oldValue) => {
        const inputChar = [...newValue].filter(char => !oldValue.includes(char))[0];
        if (!inputChar) return;
        if (!/^[a-xA-X]$/.test(inputChar)) {
            //Something other than allowed letters
            selectedCellInput.value = oldValue;
            return;
        }

        let updatedInput = newValue.length === 3 ? inputChar.toUpperCase() : newValue.toUpperCase();
        if (selectedCellInput.value === updatedInput) {
            return;
        }
        selectedCellInput.value = updatedInput;

        if (updatedInput.length == 2) {
            selectedCellKey.value = updatedInput;
        }
    });

    const cellValueInputBox = ref(null);
    function onCellClicked(newValue) {
        selectedCell.x = newValue.x;
        selectedCell.y = newValue.y;
        selectedCellInput.value = sheetStore.coordToKey(curSheetIndex.value, newValue);
        gridRef.value.changeHighlightedCells([selectedCell]);
        cellValueInputBox.value.focus();
    }
    onMounted(() => {
        gridRef.value?.changeHighlightedCells([selectedCell]);
    });

    watch(
        () => settingsStore.sheets_pairorder,
        (newVal) => {
            onCellClicked({ x: 0, y: 0 }); //Just reset it since this won't happen often
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
                                gridRef.selectedCellKey = 'AA';
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
                    <button @click="sheetStore.deleteSheet(curSheetIndex); 
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
        <SheetGrid v-if="isSheetSelected"
                   class="SheetGridContainer" 
                   ref="gridRef"
                   :sheetIndex="curSheetIndex"
                   @update:selected-cell="onCellClicked"/>
        <div v-else class="SheetGridContainer"> </div>
        <div class="RightColumn" v-if="isSheetSelected">
            <div class="header-row"> <h3>Edit cell:</h3>  </div>
            <div class="SheetEditingRow">
                Current cell:
                <input v-model="selectedCellInput" class="editCurCellKey"/>
            </div>
            <div class="SheetEditingRow">
                Value:
                <input v-model="selectedCellValue" ref="cellValueInputBox" :key="settingsStore.sheets_pairorder" />
            </div>
            <div class="CellOptions" v-if="currentSheetType != 0">
                Recommendations:
                <div v-for="algorithm in getRecommendations(currentSheetType, sheetStore.coordToKey(curSheetIndex, selectedCell))"
    :class="['ListItem']"
    @click="selectedCellValue = algorithm">
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

    .SheetGridContainer{
        width: 60vw;
        height: 93vh;
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
