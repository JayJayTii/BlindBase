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
    const showLeftColumn = ref(true)

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
        const column = document.getElementById("leftColumn")
        column.classList.remove('slideLeft', 'slideRight');
        void column.offsetWidth; // Trigger reflow
        if (showLeftColumn.value)
            column.classList.add('slideRight');
        else
            column.classList.add('slideLeft');
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
</script>


<template>
    <div style="display: flex; flex-direction: row; height: calc(100vh - var(--navbar-height) - var(--footer-height));">
        <!---------LEFT COLUMN--------->
        <div id="leftColumn">
            <div class="PanelColumn">
                <SheetSelect style="width:100%; height:33%;"
                             :sheetID="sheetID"
                             @updateSheetID="updateSheetID" />

                <SheetSettings style="width:100%; height:67%;"
                               :sheetID="sheetID"
                               @deleteSheet="deleteSheet" />
            </div>
            <div @click="toggleLeftColumn()" id="leftColumnToggle">{{showLeftColumn ? "<" : ">"}}</div>
        </div>

        <!------------GRID------------->
        <SheetGrid ref="gridRef"
                   style="width: 100%; height: 100%;"
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
    .slideLeft {
        animation: leftColumnSlide 0.1s forwards;
    }
    .slideRight {
        animation: leftColumnSlide 0.1s reverse;
    }
    @keyframes leftColumnSlide {
        from {
            margin-left: 0vw;
        }

        to {
            margin-left: -20vw;
        }
    }

    #leftColumnToggle {
        position: relative;
        transform: translate(20vw, calc(-93vh + var(--footer-height)));
        z-index: 5;
        cursor: pointer;
        width: 33px;
        height: 34px;
        text-align: center;
        align-content: center;
        user-select: none;
        background-color: var(--grey-900);
        border-top: 3px solid var(--grey-800);
        border-right: 3px solid var(--grey-800);
        border-bottom: 3px solid var(--grey-800);
        color: var(--grey-100);
    }
</style>