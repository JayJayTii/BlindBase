<script setup>
    import { reactive, ref, watch, computed, onMounted, nextTick, inject } from "vue";
    import SheetGrid from "@/components/SheetGrid.vue";
    import { getRecommendations } from "../helpers/Recommendations"
    import { useSheetStore } from "../stores/SheetStore";
    import { useSettingsStore } from "../stores/SettingsStore";
    const sheetStore = useSheetStore();
    sheetStore.loadState();
    const settingsStore = useSettingsStore();
    settingsStore.loadState();
    const confirmDialog = inject('confirmDialog')

    const curSheetID = ref(-1);
    const gridRef = ref(null);

    const isSheetSelected = computed({
        get: () => sheetStore.isValidSheetID(curSheetID.value),
    });
    const currentSheet = computed({
        get: () => sheetStore.getSheet(curSheetID.value),
    });
    const currentSheetName = computed({
        get: () => sheetStore.getSheet(curSheetID.value)?.name || '',
        set: (newName) => {
            if (sheetStore.isValidSheetID(curSheetID.value)) {
                sheetStore.sheets[sheetStore.getSheetIndexWithID(curSheetID.value)].name = newName;
                sheetStore.saveState();
            }
        }
    });
    const currentSheetType = computed({
        get: () => sheetStore.getSheet(curSheetID.value).type,
        set: (newType) => {
            if (sheetStore.isValidSheetID(curSheetID.value)) {
                sheetStore.sheets[sheetStore.getSheetIndexWithID(curSheetID.value)].type = newType;
                sheetStore.saveState();
            }
        }
    });
    async function DeleteSheet() {
        if (await confirmDialog.value.open('Are you sure you want to delete this sheet?')) {
            sheetStore.deleteSheet(curSheetID)
        }
    }
    const selectedCell = reactive({ x: 0, y: 0 });
    const selectedCellKey = computed({
        get: () => sheetStore.coordToKey(curSheetID.value, selectedCell),
        set: (newKey) => {
            const newCoord = sheetStore.keyToCoord(curSheetID.value, newKey);
            selectedCell.x = newCoord.x;
            selectedCell.y = newCoord.y;
            gridRef.value.changeHighlightedCells([selectedCell]);
        }
    });
    const selectedCellValue = computed({
        get: () => {
            return sheetStore.getCell(curSheetID.value, selectedCell);
        },
        set: (newValue) => {
            sheetStore.setCell(curSheetID.value, selectedCell, newValue);
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
        selectedCellInput.value = sheetStore.coordToKey(curSheetID.value, newValue);
        gridRef.value.changeHighlightedCells([selectedCell]);
        nextTick(() => { cellValueInputBox.value.focus() });
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
                     :key="sheetStore.sheets[index].id"
                     :class="['ListItem', curSheetID === sheetStore.sheets[index].id ? 'ListItemSelected' : 'ListItemUnselected']"
                     @click="
                     if(curSheetID != sheetStore.sheets[index].id) {
                                curSheetID = sheetStore.sheets[index].id;
                                onCellClicked({x:0,y:0});
                             }">
                    {{ sheetName != "" ? sheetName : "&nbsp;" }}
                </div>
                <button @click="sheetStore.newSheet(); curSheetID = sheetStore.sheets[sheetStore.sheets.length - 1].id;" 
                        style="justify-content:center;">+</button>
            </div>
            <div class="SheetSettings" v-if="isSheetSelected">
                <div class="header-row">
                    <h3>Sheet settings:</h3>
                </div>
                <div class="SheetEditingRow">
                    <input v-model="currentSheetName"
                           maxlength="20"
                           style="white-space:nowrap;font-weight:bold;font-size:2rem;width:100%;text-align:center;" />
                </div>
                <div class="SheetEditingRow">
                    Type: <select v-model="currentSheetType">
                        <option v-for="(type,index) in sheetStore.sheetTypes" 
                                :key="index" 
                                :value="index">
                            {{type.name}}
                        </option>
                    </select>
                </div>
                <div class="SheetEditingRow">
                    <button @click="DeleteSheet()">
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
        <SheetGrid class="SheetGridContainer" 
                   ref="gridRef"
                   :sheetID="curSheetID"
                   :showIfNull="true"
                   :key="curSheetID"
                   @update:selected-cell="onCellClicked"/>
        <div class="RightColumn" v-if="isSheetSelected">
            <div class="header-row"> <h3>Edit cell:</h3>  </div>
            <div class="SheetEditingRow">
                Current cell:
                <input v-model="selectedCellInput" 
                       class="editCurCellKey"/>
            </div>
            <div class="SheetEditingRow">
                Value:
                <input v-model="selectedCellValue" 
                       ref="cellValueInputBox" 
                       :key="settingsStore.sheets_pairorder"
                       style="width:100%;"/>
            </div>
            <div class="CellOptions" v-if="currentSheetType != 0">
                Recommendations:
                <div v-for="algorithm in getRecommendations(currentSheetType, sheetStore.coordToKey(curSheetID, selectedCell))"
    :class="['ListItem']"
    @click="selectedCellValue = algorithm;">
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
        text-align: center;
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
        overflow-x: hidden;
        overflow-y: auto;
    }
    .ListItem {
        background-color: var(--grey-600);
        border: 1px solid var(--panel-color);
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        justify-content:center;
        font-size: 1rem;
        text-overflow: ellipsis;
    }
    .ListItem:hover {
        background-color: var(--grey-500);
    }

    .ListItemSelected {
        background-color: var(--grey-100);
        color: var(--grey-900);
        font-weight: bold;
    }
    .ListItemSelected:hover {
        background-color: var(--grey-100);
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

    .editCurCellKey {
        font-size: 2rem;
        width: min(100%, 4ch);
        text-transform: uppercase;
    }

    .CellOptions{
        width: 100%;
        height:100%;
        overflow-x: hidden;
        overflow-y: auto;
    }

</style>
