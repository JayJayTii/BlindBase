<script setup>
    import { reactive, ref, watch, nextTick, inject } from "vue"
    import SheetSelect from "@/components/sheets/SheetSelect.vue"
    import SheetSettings from "@/components/sheets/SheetSettings.vue"
    import SheetGrid from "@/components/SheetGrid.vue"
    import EditCell from "@/components/sheets/EditCell.vue"
    import { useSheetStore } from "../stores/SheetStore"
    import { useSettingsStore } from "../stores/SettingsStore"
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    const settingsStore = useSettingsStore()
    settingsStore.loadState()
    const confirmDialog = inject('confirmDialog')

    const sheetID = ref(-1);
    const selectedCell = reactive({ x: 0, y: 0 });

    const gridRef = ref(null);
    const editCellRef = ref(null);

    function onCellClicked(newValue) {
        //Absolute coord
        selectedCell.x = newValue.x;
        selectedCell.y = newValue.y;
        gridRef.value.changeHighlightedCells([selectedCell]);
        nextTick(() => { editCellRef.value.cellValueInputBox.focus() })
    }

    function updateSheetID(index) {
        if (sheetID.value != sheetStore.sheets[index].id) {
            sheetID.value = sheetStore.sheets[index].id;
            onCellClicked({ x: 0, y: 0 });
        }
    }

    async function deleteSheet() {
        if (await confirmDialog.value.open('Are you sure you want to delete this sheet?')) {
            sheetStore.deleteSheet(sheetID.value)
            sheetID.value = -1
        }
    }

    watch(
        () => settingsStore.sheets_pairorder,
        (newVal) => {
            onCellClicked({ x: 0, y: 0 }); //Just reset it since this won't happen often
        }
    );
</script>


<template>
    <div class="SheetsView">
        <div class="SideColumn">
            <SheetSelect style="width:100%; height:33%;"
                         :sheetID="sheetID"
                         @updateSheetID="updateSheetID"/>

            <SheetSettings style="width:100%; height:67%;"
                           :sheetID="sheetID"
                           @deleteSheet="deleteSheet"/>
        </div>

        <SheetGrid class="SheetGridContainer" 
                   ref="gridRef"
                   :sheetID="sheetID"
                   :showIfNull="true"
                   :key="sheetID"
                   @update:selected-cell="onCellClicked"/>

        <div class="SideColumn">
            <EditCell style="width:100%; height: 100%;"
                      ref="editCellRef"
                      :key="sheetID + '-' + selectedCell.x+ '-' + selectedCell.y"
                   :sheetID="sheetID" :selectedCell="selectedCell"
                   @cellKeyChanged="onCellClicked"/>
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


    .SheetGridContainer{
        width: 60vw;
        height: 93vh;
    }
</style>
