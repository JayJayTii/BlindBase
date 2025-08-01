<script setup>
    import { ref, reactive, watch, computed } from "vue";
    import { useSheetStore } from "../stores/SheetStore";
    import { useSettingsStore } from "../stores/SettingsStore";

    const props = defineProps({
        sheetID: Number,
        formatEmpty: Boolean,
        showIfNull: Boolean,
    });
    const emit = defineEmits(['update:selected-cell']);

    const sheetStore = useSheetStore();
    sheetStore.loadState();
    const settingsStore = useSettingsStore();
    settingsStore.loadState();

    const leftColumn = ref(null);
    const topRow = ref(null);
    const mainGrid = ref(null);
    function syncScroll() {
        if (leftColumn.value && topRow.value && mainGrid.value) {
            leftColumn.value.scrollTop = mainGrid.value.scrollTop;
            topRow.value.scrollLeft = mainGrid.value.scrollLeft;
        }
    }

    //Highlighted cells are all absolute
    const highlightedCells = reactive([{ x: -1, y: -1 }]);
    function changeHighlightedCells(newValue) {
        //New values will be absolute, not visual
        highlightedCells.value = newValue.map(coord => sheetStore.absoluteToVisual(coord)) || [];
    }

    defineExpose({
        changeHighlightedCells,
    })
</script>
<template>
    <div class="SheetGridContainer" v-if="sheetStore.isValidSheetID(sheetID)">
        <div class="SheetGridCorner">
            <div class="SheetGridCell" style="cursor:default">
                {{ sheetStore.getSheet(sheetID).name }}
            </div>
        </div>
        <div class="SheetGridTopRow" ref="topRow">
            <div v-for="char in sheetStore.getXHeadings(sheetID)" class="SheetGridCell" style="cursor:default">
                {{ char }}
            </div>
            <div class="SheetGridCell"> </div>
        </div>
        <div class="SheetGridLeftColumn" ref="leftColumn">
            <div v-for="char in sheetStore.getYHeadings(sheetID)" class="SheetGridCell" style="cursor:default">
                {{ char }}
            </div>
            <div class="SheetGridCell"> </div>
        </div>
        <div class="SheetGrid" ref="mainGrid" @scroll="syncScroll">
            <div v-for="(row,y) in 24">
                <div v-for="(col, x) in 24"
                     @click="emit('update:selected-cell', sheetStore.visualToAbsolute({x,y}));"
                     :class="['SheetGridCell', (formatEmpty && sheetStore.getCell(sheetID, sheetStore.absoluteToVisual({x,y})) === '') ? 'SheetGridCellEmpty' : 'SheetGridCellHoverable', 
                     (Array.isArray(highlightedCells.value) && highlightedCells.value.some(cell => cell.x === x && cell.y === y)) ? 'SheetGridCellHightlighted' : '']"
                >
                    {{ sheetStore.getCell(sheetID, sheetStore.absoluteToVisual({x,y})) }}
                </div>
            </div>
        </div>
    </div>
    <div class="SheetGridContainer" v-else-if="showIfNull"></div>
</template>

<style>
    .SheetGridContainer {
        border: 3px solid var(--border-color);
        background-color: var(--panel-color);
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto 1fr;
        grid-template-areas:
            "corner top"
            "left grid";
        overflow: hidden;
    }

    .SheetGrid {
        grid-area: grid;
        display: grid;
        grid-template-rows: repeat(24, var(--sheet-cell-height));
        grid-template-columns: repeat(24, var(--sheet-cell-width));
        height: calc(100%);
        overflow: auto;
    }

    .SheetGridCorner {
        grid-area: corner;
        background-color: var(--brand-800);
    }

    .SheetGridTopRow {
        display: flex;
        flex-direction: row;
        grid-area: top;
        overflow-x: hidden;
    }

        .SheetGridTopRow .SheetGridCell {
            background-color: var(--brand-700);
            min-width: var(--sheet-cell-width);
            display: flex;
            justify-content: center;
            align-items: center;
        }

    .SheetGridLeftColumn {
        grid-area: left;
        overflow-y: hidden;
    }

        .SheetGridLeftColumn .SheetGridCell {
            background-color: var(--brand-700);
            min-height: var(--sheet-cell-height);
            max-width: var(--sheet-cell-width);
            display: flex;
            justify-content: center;
            align-items: center;
        }

    .SheetGridCell {
        padding: 0px 4px;
        border: 1px solid var(--border-color);
        overflow: hidden;
        text-overflow: ellipsis;
        color: white;
        white-space: nowrap;
        background-color: transparent;
        font-size: 14px;
        word-break: break-word;
        height: var(--sheet-cell-height);
        line-height: var(--sheet-cell-height);
        width: var(--sheet-cell-width);
        cursor: pointer;
    }
    .SheetGridCellHoverable:hover {
        background-color: var(--grey-700);
    }

    .SheetGridCellEmpty {
        background-color: var(--brand-800);
        cursor: default;
    }

    .SheetGridCellHightlighted {
        border: 3px solid white;
    }
</style>