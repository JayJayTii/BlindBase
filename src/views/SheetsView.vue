<script setup>
    import { reactive, ref, watch, nextTick, inject } from "vue"
    import { useSheetStore } from "../stores/SheetStore"
    import { useSettingsStore } from "../stores/SettingsStore"
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    const settingsStore = useSettingsStore()
    settingsStore.loadState()

    import SheetSelect from "@/components/sheets/SheetSelect.vue"
    import SheetSettings from "@/components/sheets/SheetSettings.vue"
    import SheetGrid from "@/components/SheetGrid.vue"
    import EditCell from "@/components/sheets/EditCell.vue"
    const confirmDialog = inject('confirmDialog')

    const sheetID = ref(-1);
    const selectedCell = reactive({ x: 0, y: 0 });

    const gridRef = ref(null);
    const editCellRef = ref(null);

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

    function onCellClicked(newValue) {
        //Absolute coord
        selectedCell.x = newValue.x;
        selectedCell.y = newValue.y;
        gridRef.value.changeHighlightedCells([selectedCell]);
        nextTick(() => { editCellRef.value.cellValueInputBox.focus() })
    }

    watch(
        () => settingsStore.sheets_pairorder,
        (newVal) => {
            onCellClicked({ x: 0, y: 0 }); //Just reset it since this won't happen often
        }
    );
</script>


<template>
    <div style="display: flex; flex-direction: row;">
        <div class="PanelColumn">
            <SheetSelect style="width:100%; height:33%;"
                         :sheetID="sheetID"
                         @updateSheetID="updateSheetID"/>

            <SheetSettings style="width:100%; height:67%;"
                           :sheetID="sheetID"
                           @deleteSheet="deleteSheet"/>
        </div>

        <SheetGrid ref="gridRef"
                   style="width: 60vw; height: 93vh;"
                   :sheetID="sheetID"
                   :showIfNull="true"
                   :key="sheetID"
                   @update:selected-cell="onCellClicked"/>

        <div class="PanelColumn">
            <EditCell style="width:100%; height: 100%;"
                      ref="editCellRef"
                      :key="sheetID + '-' + selectedCell.x+ '-' + selectedCell.y"
                   :sheetID="sheetID" :selectedCell="selectedCell"
                   @cellKeyChanged="onCellClicked"/>
        </div>
    </div>
</template>
