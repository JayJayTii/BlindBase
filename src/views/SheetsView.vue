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

    //-1 means unselected
    const sheetID = ref(-1)
    const selectedCell = reactive({ x: 0, y: 0 })

    const gridRef = ref(null)
    const editCellRef = ref(null)

    function updateSheetID(index) { //Triggered by SheetSelect component
        if (sheetID.value != sheetStore.sheets[index].id) {
            sheetID.value = sheetStore.sheets[index].id
            nextTick(() => { onCellClicked({ x: 0, y: 0 }) })
        }
    }
    async function deleteSheet() {
        if (!(await confirmDialog.value.open('Are you sure you want to delete this sheet?'))) {
            return
        }
        sheetStore.deleteSheet(sheetID.value)
        sheetID.value = -1
    }

    const focusCellKey = ref(false)
    function onCellClicked(newValue) {
        selectedCell.x = newValue.x
        selectedCell.y = newValue.y
        gridRef.value.changeHighlightedCells([selectedCell])
    }

    //Grid cannot dynamically update highlighted cells after setting change, so just reset them
    watch(
        () => settingsStore.settings.sheets_pairorder,
        (newVal) => {
            onCellClicked({ x: 0, y: 0 })
        }
    );
</script>


<template>
    <div style="display: flex; flex-direction: row;">
        <!---------LEFT COLUMN--------->
        <div class="PanelColumn">
            <SheetSelect style="width:100%; height:33%;"
                         :sheetID="sheetID"
                         @updateSheetID="updateSheetID" />

            <SheetSettings style="width:100%; height:67%;"
                           :sheetID="sheetID"
                           @deleteSheet="deleteSheet" />
        </div>

        <!------------GRID------------->
        <SheetGrid ref="gridRef"
                   style="width: 60vw; height: 93vh;"
                   :sheet="sheetStore.getSheet(sheetID)"
                   :showIfNull="true"
                   :key="sheetID"
                   @update:selected-cell="(event) => {onCellClicked(event);focusCellKey=false;}" />

        <!--------RIGHT COLUMN-------->
        <div class="PanelColumn">
            <EditCell style="width:100%; height: 100%;"
                      ref="editCellRef"
                      :key="sheetID + '-' + selectedCell.x+ '-' + selectedCell.y + '-' + (sheetStore.getSheet(sheetID)?.type || -1) + '-' + settingsStore.settings.sheets_notationtype.toString() + '-' + settingsStore.settings.sheets_extraximages.toString()"
                      :sheetID="sheetID" :selectedCell="selectedCell"
                      :focusCellKey="focusCellKey"
                      @cellKeyChanged="(event) => {onCellClicked(event);focusCellKey=true;}" />
        </div>
    </div>
</template>
