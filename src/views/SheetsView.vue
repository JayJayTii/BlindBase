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

    //-1 means no sheet selected, otherwise it is the selected sheet's ID
    const sheetID = ref(-1)
    const selectedCell = reactive({ x: -1, y: -1 })
    const showLeftColumn = ref(false)
    toggleLeftColumn()

    const gridRef = ref(null)
    const editCellRef = ref(null)

    function updateSheetID(index) { //Triggered by SheetSelect component
        if (sheetID.value != sheetStore.sheets[index].id) {
            sheetID.value = sheetStore.sheets[index].id
            selectedCell.x = -1
            selectedCell.y = -1
        }
    }
    async function deleteSheet() {
        if (!(await confirmDialog.value.open('Are you sure you want to delete this sheet?'))) {
            return
        }
        sheetStore.deleteSheet(sheetID.value)
        sheetID.value = -1
    }

    function toggleLeftColumn() {
        showLeftColumn.value = !showLeftColumn.value
        nextTick(() => {
            const leftColumnWidth = document.getElementById("leftColumn").offsetWidth
            document.getElementById("leftColumnToggle").style.setProperty("left", leftColumnWidth + "px")
        })
    }

    const focusCellKey = ref(false)
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

    //Grid cannot update highlighted cells after setting change, so just reset them
    watch(
        () => settingsStore.settings.sheets_pairorder,
        (newVal) => {
            onCellClicked({ x: -1, y: -1 })
        }
    );
</script>


<template>
    <div style="display: flex; flex-direction: row;">
        <!---------LEFT COLUMN--------->
        <div id="leftColumn" class="PanelColumn" v-show="showLeftColumn">
            <SheetSelect style="width:100%; height:33%;"
                         :sheetID="sheetID"
                         @updateSheetID="updateSheetID" />

            <SheetSettings style="width:100%; height:67%;"
                           :sheetID="sheetID"
                           @deleteSheet="deleteSheet" />
        </div>

        <!------------GRID------------->
        <div @click="toggleLeftColumn()" class="Panel" id="leftColumnToggle">{{showLeftColumn ? "<" : ">"}}</div>
        <SheetGrid ref="gridRef"
                   style="width: 100%; height: 93vh;"
                   :sheet="sheetStore.getSheet(sheetID)"
                   :showIfNull="true"
                   :key="sheetID"
                   @update:selected-cells="(values, create) => {onCellClicked(values, create);focusCellKey=false;}" />

        <EditCell v-if="selectedCell.x  != -1 && selectedCell.y != -1"
                  ref="editCellRef"
                  :key="sheetID + '-' + selectedCell.x+ '-' + selectedCell.y + '-' + (sheetStore.getSheet(sheetID)?.type || -1) + '-' + settingsStore.settings.sheets_notationtype.toString() + '-' + settingsStore.settings.sheets_extraximages.toString()"
                  :sheetID="sheetID" :selectedCell="selectedCell"
                  :focusCellKey="focusCellKey"
                  @cellKeyChanged="(event) => {onCellClicked(event);focusCellKey=true;}" />
    </div>
</template>

<style>
    #leftColumnToggle {
        position: absolute;
        z-index:10;
        cursor: pointer;
        width: 30px;
        height: 30px;
        text-align: center;
        user-select: none;
        left: 0;
    }
</style>