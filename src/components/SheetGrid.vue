<script setup>
    import { ref, reactive, watch, computed, nextTick } from 'vue'
    import { getXHeadings, getYHeadings } from '@/helpers/sheets.js'
    import { useSheetStore } from '../stores/SheetStore'
    import { useSettingsStore } from '../stores/SettingsStore'
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    const settingsStore = useSettingsStore()
    settingsStore.loadState()

    const props = defineProps({
        sheetID: Number,
        formatEmpty: Boolean,
        showIfNull: Boolean,
        fullLineSelection: Boolean,
    })
    const emit = defineEmits(['update:selected-cell'])

    const sheet = computed({
        get: () => sheetStore.getSheet(props.sheetID),
    })

    //Grid and headings are separate, so their scrolls need to be synchronised
    const leftColumn = ref(null)
    const topRow = ref(null)
    const mainGrid = ref(null)
    function syncScroll() {
        if (leftColumn.value && topRow.value && mainGrid.value) {
            leftColumn.value.scrollTop = mainGrid.value.scrollTop
            topRow.value.scrollLeft = mainGrid.value.scrollLeft
        }
    }

    function columnClicked(columnIndex) {
        //If the column is full, deselect all
        //If the column is not full, select the unselected ones
        if (!props.fullLineSelection)
            return

        const flipped = (settingsStore.sheets_pairorder === 1)

        let filledCellsInColumn = 0
        for (var i = 0; i < sheet.value.yHeadings.length; i++) {
            if ((!flipped && sheet.value.grid[columnIndex][i] !== "") || (flipped && sheet.value.grid[i][columnIndex] !== ""))
                filledCellsInColumn++
        }
        let highlightedCellsInColumn = highlightedCells.value.filter((coord) => (coord.y === columnIndex))
        const columnFilled = highlightedCellsInColumn.length >= filledCellsInColumn

        if (columnFilled) {
            for (var i = 0; i < highlightedCellsInColumn.length; i++) {
                emit('update:selected-cell', !flipped ? highlightedCellsInColumn[i] : { x: highlightedCellsInColumn[i].y, y: highlightedCellsInColumn[i].x })
            }
        }
        else {
            highlightedCellsInColumn = highlightedCellsInColumn.map((coord) => coord.x)
            for (var i = 0; i < sheet.value.yHeadings.length; i++) {
                //Select every cell that is in the column and not highlighted
                if (((!flipped && sheet.value.grid[columnIndex][i] !== "") || (flipped && sheet.value.grid[i][columnIndex] !== ""))
                    && highlightedCellsInColumn.indexOf(i) == -1) {
                    emit('update:selected-cell', !flipped ? { x: i, y: columnIndex } : { x: columnIndex, y: i })
                }
            }
        }
    }
    function rowClicked(rowIndex) {
        //If the row is full, deselect all
        //If the row is not full, select the unselected ones
        if (!props.fullLineSelection)
            return

        const flipped = (settingsStore.sheets_pairorder === 1)

        let filledCellsInRow = 0
        for (var i = 0; i < sheet.value.xHeadings.length; i++) {
            if ((!flipped && sheet.value.grid[i][rowIndex] !== "") || (flipped && sheet.value.grid[rowIndex][i] !== ""))
                filledCellsInRow++
        }
        let highlightedCellsInRow = highlightedCells.value.filter((coord) => (coord.x === rowIndex))
        const rowFilled = highlightedCellsInRow.length >= filledCellsInRow

        if (rowFilled) {
            for (var i = 0; i < highlightedCellsInRow.length; i++) {
                emit('update:selected-cell', !flipped ? highlightedCellsInRow[i] : { x: highlightedCellsInRow[i].y, y: highlightedCellsInRow[i].x })
            }
        }
        else {
            highlightedCellsInRow = highlightedCellsInRow.map((coord) => coord.y)
            for (var i = 0; i < sheet.value.xHeadings.length; i++) {
                //Select every cell that is in the row and not highlighted
                if (((!flipped && sheet.value.grid[i][rowIndex] !== "") || (flipped && sheet.value.grid[rowIndex][i] !== ""))
                    && highlightedCellsInRow.indexOf(i) == -1) {
                    emit('update:selected-cell', !flipped ? { x: rowIndex, y: i } : { x: i, y: rowIndex })
                }
            }
        }
    }

    //Highlighted cells are visual coords
    const highlightedCells = ref([{ x: -1, y: -1 }])
    function changeHighlightedCells(newValue) {
        //New values will be absolute, not visual
        highlightedCells.value = newValue.map(coord => sheetStore.absoluteToVisual(coord))
    }

    defineExpose({
        changeHighlightedCells,
    })
</script>

<template>
    <div class="SheetGridContainer" v-if="sheetStore.isValidSheetID(sheetID)">
        <!-----BLANK CORNER----->
        <div class="SheetGridCorner">
            <div class="SheetGridCell" style="cursor: default"></div>
        </div>

        <!-----COLUMN HEADINGS----->
        <div class="SheetGridTopRow" ref="topRow">
            <div v-for="(char,index) in getXHeadings(sheet)"
                 class="SheetGridCell"
                 :style="{ cursor: props.fullLineSelection ? 'pointer' : 'default' }"
                 @click="columnClicked(index)">
                {{ char }}
            </div>
            <div class="SheetGridCell" style="background-color:transparent;"></div>
        </div>

        <!-----ROW HEADINGS----->
        <div class="SheetGridLeftColumn" ref="leftColumn">
            <div v-for="(char, index) in getYHeadings(sheet)"
                 class="SheetGridCell"
                 :style="{ cursor: props.fullLineSelection ? 'pointer' : 'default' }"
                 @click="rowClicked(index)">
                {{ char }}
            </div>
        </div>

        <!---------GRID--------->
        <div class="SheetGrid" ref="mainGrid" @scroll="syncScroll">
            <div v-for="(row, y) in 24">
                <div v-for="(col, x) in 24"
                     @click="emit('update:selected-cell', sheetStore.visualToAbsolute({ x, y }))"
                     :class="['SheetGridCell', formatEmpty && sheetStore.getCell(sheetID, sheetStore.visualToAbsolute({x, y }))==='' ? 'SheetGridCellEmpty' : 'SheetGridCellHoverable' ,
                     Array.isArray(highlightedCells) && highlightedCells.some((cell)=>cell.x === x && cell.y === y) ? 'SheetGridCellHightlighted' : '']"
                    >
                    {{ sheetStore.getCell(sheetID, sheetStore.visualToAbsolute({ x, y })) }}
                </div>
            </div>
        </div>
    </div>
    <div class="SheetGridContainer" v-else-if="showIfNull"></div>
</template>

<style>
    .SheetGridContainer {
        --sheet-cell-height: 2rem;
        --sheet-cell-width: 100px;

        border: 3px solid var(--border-color);
        background-color: var(--panel-color);
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto 1fr;
        grid-template-areas:
            'corner top'
            'left grid';
        overflow: hidden;
    }

.SheetGrid {
    grid-area: grid;
    display: grid;
    grid-template-rows: repeat(24, var(--sheet-cell-height));
    grid-template-columns: repeat(24, var(--sheet-cell-width));
    height: 100%;
    overflow: auto;
}

    .SheetGridCorner {
        grid-area: corner;
        background-color: var(--brand-800);
        width: var(--sheet-cell-height);
        border-inline-end: 2px solid var(--border-color);
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
    .SheetGridLeftColumn::after {
        content: '';
        display: block;
        height: 50px;
    }
    .SheetGridLeftColumn .SheetGridCell {
        background-color: var(--brand-700);
        height: var(--sheet-cell-height);
        width: var(--sheet-cell-height);
        display: flex;
        justify-content: center;
        align-items: center;
        border-inline-end: 2px solid var(--border-color);
    }

.SheetGridCell {
    padding: 0px 4px;
    border: 1px solid var(--border-color);
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-color);
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
    border: 3px solid var(--grey-100);
}
</style>
