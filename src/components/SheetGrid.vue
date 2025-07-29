<script setup>
    import { ref, reactive, watch, computed } from "vue";
    import { useSheetStore } from "../stores/SheetStore";
    import { useSettingsStore } from "../stores/SettingsStore";

    const props = defineProps({
        sheetIndex: Number
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
    //Add reaction to changing pair order setting

    const highlightedCell = reactive({ x: -1, y: -1 });
    function changeHighlightedCell(newValue) {
        highlightedCell.x = newValue.x;
        highlightedCell.y = newValue.y;
    }

    defineExpose({
        changeHighlightedCell,
    })
</script>
<template>
    <div class="SheetGridContainer">
        <div class="SheetGridCorner">
            <div class="SheetGridCell">
                {{ sheetStore.sheets[sheetIndex].name }}
            </div>
        </div>
        <div class="SheetGridTopRow" ref="topRow">
            <div v-for="char in sheetStore.getXHeadings(sheetIndex)" class="SheetGridCell">
                {{ char }}
            </div>
            <div class="SheetGridCell"> </div>
        </div>
        <div class="SheetGridLeftColumn" ref="leftColumn">
            <div v-for="char in sheetStore.getYHeadings(sheetIndex)" class="SheetGridCell">
                {{ char }}
            </div>
            <div class="SheetGridCell"> </div>
        </div>
        <div class="SheetGrid" ref="mainGrid" @scroll="syncScroll">
            <div v-for="(row,y) in 24">
                <div v-for="(col, x) in 24"
                     @click="emit('update:selected-cell', { x, y });"
                     :class="['SheetGridCell', highlightedCell.x === x && highlightedCell.y === y ? 'SheetGridCellHightlighted' : '']"
                     style="cursor:pointer">
                    {{ sheetStore.getCell(sheetIndex, {x:x,y:y}) }}
                </div>
            </div>
        </div>
    </div>
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
    }

    .SheetGridCellHightlighted {
        border: 3px solid white;
    }
</style>