<script setup>
    import { ref, reactive, watch, computed, nextTick } from 'vue'
    import { getXHeadings, getYHeadings } from '@/helpers/sheets.js'
    import { useSettingsStore } from '@/stores/SettingsStore'
    const settingsStore = useSettingsStore()
    settingsStore.loadState()

    const props = defineProps({
        sheet: Object,
        formatEmpty: Boolean,
        showIfNull: Boolean,
        fullLineSelection: Boolean,
    })

    const emit = defineEmits(['update:selected-cell'])

    const sheet = computed({
        get: () => props.sheet
    })
    const flipped = computed({
        get: () => settingsStore.sheets_pairorder === 1
    })

    //Grid and headings are separate, so their scrolls need to be synchronised
    const leftColumn = ref(null)
    const topRow = ref(null)
    const mainGrid = ref(null)
    let suppressScrollSync = false
    let prevScrollX = 0
    let prevScrollY = 0
    function syncScrollToGrid() {
        if (leftColumn.value && topRow.value && mainGrid.value) {
            leftColumn.value.scrollTop = mainGrid.value.scrollTop
            topRow.value.scrollLeft = mainGrid.value.scrollLeft
        }
    }
    function syncScrollToLeftColumn() {
        if (suppressScrollSync)
            return
        if (leftColumn.value && topRow.value && mainGrid.value) {
            mainGrid.value.scrollTop = leftColumn.value.scrollTop
            if (mainGrid.value.scrollTop < leftColumn.value.scrollTop) //Gone past grid height
                leftColumn.value.scrollTop = mainGrid.value.scrollTop
        }
    }
    function syncScrollToTopRow() {
        if (suppressScrollSync)
            return
        if (leftColumn.value && topRow.value && mainGrid.value) {
            mainGrid.value.scrollLeft = topRow.value.scrollLeft
            if (mainGrid.value.scrollLeft < topRow.value.scrollLeft) //Gone past grid width
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
        highlightedCells.value = !flipped.value ? newValue : newValue.map(coord => ({ x: coord.y, y: coord.x }))
        if (highlightedCells.value.length > 1)
            return

        //Scroll to make sure if there is one highlightedCell, it is visible
        const parent = mainGrid.value
        const child = document.getElementById(highlightedCells.value[0].x.toString() + ',' + highlightedCells.value[0].y.toString())
        const parentRect = parent.getBoundingClientRect()
        const childRect = child.getBoundingClientRect()

        const isVisible = childRect.top >= parentRect.top &&
            childRect.bottom <= parentRect.bottom &&
            childRect.left >= parentRect.left &&
            childRect.right <= parentRect.right
        if (isVisible)
            return

        suppressScrollSync = true
        const offsetTop = childRect.top - parentRect.top + parent.scrollTop - (parent.clientHeight / 2) + (child.clientHeight / 2)
        const offsetLeft = childRect.left - parentRect.left + parent.scrollLeft - (parent.clientWidth / 2) + (child.clientWidth / 2)
        parent.scrollTo({ top: offsetTop, left: offsetLeft, behavior: 'smooth' })

        //Suppress scroll syncing until scroll delta between frames is 0
        prevScrollX = parent.scrollLeft
        prevScrollY = parent.scrollTop

        let intervalID
        intervalID = setInterval(() => {
            if (Math.abs(prevScrollX - parent.scrollLeft) == 0 && Math.abs(prevScrollY - parent.scrollTop) == 0) {
                suppressScrollSync = false
                clearInterval(intervalID)
            }
            prevScrollX = parent.scrollLeft
            prevScrollY = parent.scrollTop
        }, 50)
    }

    defineExpose({
        changeHighlightedCells,
    })
</script>

<template>
    <div class="SheetGridContainer" v-if="props.sheet">
        <!-----BLANK CORNER----->
        <div class="SheetGridCorner">
            <div class="SheetGridCell" style="cursor: default"></div>
        </div>

        <!-----COLUMN HEADINGS----->
        <div class="SheetGridTopRow" ref="topRow" @scroll="syncScrollToTopRow">
            <div v-for="(char,index) in getXHeadings(sheet)"
                 class="SheetGridCell"
                 :style="{ cursor: props.fullLineSelection ? 'pointer' : 'default' }"
                 @click="columnClicked(index)">
                {{ char }}
            </div>
            <div class="SheetGridCell" style="background-color: var(--border-color);"></div>
        </div>

        <!-----ROW HEADINGS----->
        <div class="SheetGridLeftColumn" ref="leftColumn" @scroll="syncScrollToLeftColumn">
            <div v-for="(char, index) in getYHeadings(sheet)"
                 class="SheetGridCell"
                 :style="{ cursor: props.fullLineSelection ? 'pointer' : 'default' }"
                 @click="rowClicked(index)">
                {{ char }}
            </div>
            <div class="SheetGridCell" style="background-color: var(--border-color);"></div>
        </div>

        <!---------GRID--------->
        <div class="SheetGrid" ref="mainGrid" @scroll="syncScrollToGrid">
            <div v-for="(row, y) in 24">
                <div v-for="(col, x) in 24"
                     @click="emit('update:selected-cell', !flipped ? {x:x,y:y} : {x:y,y:x})"
                     :id="x.toString() + ',' + y.toString()"
                     :class="['SheetGridCell', formatEmpty && props.sheet.grid[!flipped ? y : x][!flipped ? x : y] === '' ? 'SheetGridCellEmpty' : 'SheetGridCellHoverable' ,
                     Array.isArray(highlightedCells) && highlightedCells.some((cell)=>cell.x === x && cell.y === y) ? 'SheetGridCellHightlighted' : '']"
                    >
                    {{ props.sheet.grid[!flipped ? y : x][!flipped ? x : y] }}
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
        overflow-x: auto;
        scrollbar-width: none;
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
        overflow-y: auto;
        scrollbar-width:none;
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
