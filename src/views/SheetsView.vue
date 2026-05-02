<script setup>
    import { reactive, computed, nextTick, ref } from "vue"
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

    //-1 means no sheet selected, otherwise it is the selected sheet's ID
    const sheetID = ref(-1)
    const selectedCell = ref({})

    const gridRef = ref(null)
    const editCellRef = ref(null)

    async function updateSheetID(id) {
        if (sheetID.value == id)
            return

        sheetID.value = id
        selectedCell.value.x = 0
        selectedCell.value.y = 0
        await nextTick()
        if(gridRef.value)
            gridRef.value.changeHighlightedCells([selectedCell.value])
    }
    updateSheetID(sheetStore.sheets[0]?.id || -1)

    function onCellClicked(newValues, create) {
        if(create) { //New cell clicked
            selectedCell.value.x = newValues[0].x
            selectedCell.value.y = newValues[0].y
        }
        else { //Currently selected cell clicked
            selectedCell.value.x = -1
            selectedCell.value.y = -1
        }
        if(selectedCell.value.x == -1 && selectedCell.value.y == -1)
            gridRef.value.changeHighlightedCells([])
        else
            gridRef.value.changeHighlightedCells([selectedCell.value])
    }
    function editCellKeyUpdated(coord) {
        onCellClicked([coord], true)
    }
</script>


<template>
    <div style="display: flex; flex-direction: column; gap: 5px;">
        <div style="display: flex; flex-direction: column; gap: 5px; border: 1px solid var(--el-border-color); border-radius: 4px; background-color: var(--el-fill-color-light);">
            <div style="height: 40px; padding: 4px; border-block-end: 1px solid var(--el-border-color);">
                <SheetSelect :sheetID="sheetID"
                             @sheetSelected="updateSheetID" />

                <SheetSettings v-if="sheetStore.isValidSheetID(sheetID)"
                               :sheetID="sheetID" />
            </div>
            <div style="height: 53px; margin-left: 5px;">
                <EditCell v-if="sheetStore.isValidSheetID(sheetID)"
                          ref="editCellRef"
                          @cellKeyChanged="editCellKeyUpdated"
                          :sheetID="sheetID" :selectedCell="selectedCell" />
            </div>
        </div>

        <!------------GRID------------->
        <SheetGrid v-if="sheetStore.getSheet(sheetID)"
                   ref="gridRef"
                   style="width: 100%; height: 75vh;"
                   :sheet="sheetStore.getSheet(sheetID)"
                   :key="sheetID"
                   @update:selected-cells="(values, create) => { onCellClicked(values, create); }" />
    </div>
</template>