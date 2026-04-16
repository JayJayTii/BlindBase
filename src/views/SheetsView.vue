<script setup>
    import { reactive, computed, ref } from "vue"
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
    const selectedCell = reactive({ x: -1, y: -1 })

    const gridRef = ref(null)
    const editCellRef = ref(null)

    function updateSheetID(id) {
        if (sheetID.value == id)
            return

        sheetID.value = id
        selectedCell.x = -1
        selectedCell.y = -1
    }
    updateSheetID(sheetStore.sheets[0]?.id || -1)

    function onCellClicked(newValues, create) {
        if(create) { //New cell clicked
            selectedCell.x = newValues[0].x
            selectedCell.y = newValues[0].y
        }
        else { //Currently selected cell clicked
            selectedCell.x = -1
            selectedCell.y = -1
        }
        if(selectedCell.x == -1 && selectedCell.y == -1)
            gridRef.value.changeHighlightedCells([])
        else
            gridRef.value.changeHighlightedCells([selectedCell])
    }
</script>


<template>
    <div style="display: flex; flex-direction: column;">
        <div style="display: grid; grid-template-columns: auto 3fr; height: 32px; gap: 5px;">
            <SheetSelect :sheetID="sheetID" 
                         @sheetSelected="updateSheetID"/>

            <SheetSettings style="width: 100%; height: 100%;"
                           :sheetID="sheetID" />
        </div>

        <!------------GRID------------->
        <SheetGrid v-if="sheetStore.getSheet(sheetID)"
                   ref="gridRef"
                   style="width: 100%; height: 100%;"
                   :sheet="sheetStore.getSheet(sheetID)"
                   :key="sheetID"
                   @update:selected-cells="(values, create) => { onCellClicked(values, create); }" />

        <EditCell v-if="selectedCell.x  != -1 && selectedCell.y != -1"
                  ref="editCellRef"
                  :key="sheetID + '-' + selectedCell.x+ '-' + selectedCell.y + '-' + (sheetStore.getSheet(sheetID)?.type || -1)"
                  :sheetID="sheetID" :selectedCell="selectedCell"/>
    </div>
</template>