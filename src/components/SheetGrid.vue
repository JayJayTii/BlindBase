<script setup>
    //SheetGrid displays a given alg-sheet and provides callbacks for click events
    import { ref, reactive, watch, computed, nextTick } from 'vue'
    import { getXHeadings, getYHeadings } from '@/helpers/sheets.js'
    import { allEdgePairs, allCornerPairs } from '@/helpers/pairs.js'
    import { useSettingsStore } from '@/stores/SettingsStore'
    const settingsStore = useSettingsStore()
    settingsStore.loadState()

    const props = defineProps({
        sheet: Object,
        formatEmpty: Boolean,
        fullLineSelection: Boolean,
    })

    const emit = defineEmits(['update:selected-cells'])

    const sheet = computed({
        get: () => props.sheet
    })
    const flipped = computed({
        get: () => settingsStore.settings.sheets_pairorder === 1
    })

    //Grid and headings are separate, so their scrolls need to be synchronised
    const leftColumn = ref(null)
    const topRow = ref(null)
    const mainGrid = ref(null)
    function syncScrollToGrid() {
        if (leftColumn.value && topRow.value && mainGrid.value) {
            leftColumn.value.scrollTop = mainGrid.value.scrollTop
            topRow.value.scrollLeft = mainGrid.value.scrollLeft
        }
    }

    function cellClicked(absX, absY) { //Absolute x and y coords
        const create = !highlightedCells.value.some((cell) => cell.x === absX && cell.y === absY)
        if(props.formatEmpty && props.sheet.grid[absY][absX] == "")
            return

        emit('update:selected-cells', [ {x: absX,y: absY} ], create)
    }

    function getCell(x, y) {
        return props.sheet ? props.sheet.grid[!flipped.value ? y : x][!flipped.value ? x : y] : ""
    }

    function columnClicked(index) { //This is absolute, so also a row with "Column then row" setting
        if (!props.fullLineSelection)
            return
        
        const sheet = props.sheet
        let lineFilled = true //Searching for a cell that isn't empty and isn't highlighted
        for (var i = 0; i < 24; i++) {
            if (sheet.grid[i][index] != '' && !highlightedCells.value.some((cell) => cell.x === index && cell.y === i)) {
                lineFilled = false
                break
            }
        }
    
        const cells = [] //Cells to either add or delete
        if (lineFilled) { //Delete cells in line
            for (var i = 0; i < 24; i++) {
                if(highlightedCells.value.some((cell) => cell.x === index && cell.y === i))
                    cells.push({ x: index, y: i })
            }
        }
        else { //Add unadded cells
            for (var i = 0; i < 24; i++) {
                if (sheet.grid[i][index] != '' && !highlightedCells.value.some((cell) => cell.x === index && cell.y === i))
                    cells.push({ x: index, y: i })
            }
        }

        emit('update:selected-cells', cells, !lineFilled)
    }

    function rowClicked(index) { //This is absolute, so also a column with "Column then row" setting
        if (!props.fullLineSelection)
            return
        
        const sheet = props.sheet
        let lineFilled = true //Searching for a cell that isn't empty and isn't highlighted
        for (var i = 0; i < 24; i++) {
            if (sheet.grid[index][i] != '' && !highlightedCells.value.some((cell) => cell.x === i && cell.y === index)) {
                lineFilled = false
                break
            }
        }
    
        const cells = [] //Cells to either add or delete
        if (lineFilled) { //Delete cells in line
            for (var i = 0; i < 24; i++) {
                if(highlightedCells.value.some((cell) => cell.x === i && cell.y === index))
                    cells.push({ x: i, y: index })
            }
        }
        else { //Add unadded cells
            for (var i = 0; i < 24; i++) {
                if (sheet.grid[index][i] != '' && !highlightedCells.value.some((cell) => cell.x === i && cell.y === index))
                    cells.push({ x: i, y: index })
            }
        }

        emit('update:selected-cells', cells, !lineFilled)
    }

    function sheetClicked() {
        if (!props.fullLineSelection)
            return
        //All cells in the sheet was selected (by clicking the top-left corner)
        //If the sheet is already filled, clear all cells. Otherwise add every non-empty cell

        const sheet = props.sheet
        let sheetFilled = true
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < 24; j++) {
                if (sheet.grid[i][j] != '' && !highlightedCells.value.some((cell) => cell.x === j && cell.y === i)) {
                    sheetFilled = false
                    break
                }
            }
        }
    
        const cells = []
        if (sheetFilled) { //Delete cells
            for (var i = 0; i < 24; i++) {
                for (var j = 0; j < 24; j++) {
                    if (highlightedCells.value.some((cell) => cell.x === j && cell.y === i))
                        cells.push({ x: j, y: i })
                }
            }
        }
        else { //Add cells
            for (var i = 0; i < 24; i++) {
                for (var j = 0; j < 24; j++) {
                    if (sheet.grid[i][j] != '' && !highlightedCells.value.some((cell) => cell.x === j && cell.y === i))
                        cells.push({ x: j, y: i })
                }
            }
        }

        emit('update:selected-cells', cells, !sheetFilled)
    }

    //Highlighted cells are absolute coords
    const highlightedCells = ref([{ x: -1, y: -1 }])
    let intervalID = null
    function changeHighlightedCells(newValue) {
        highlightedCells.value = newValue
        if (highlightedCells.value.length != 1)
            return

        //Scroll to make sure if there is one highlightedCell, it is visible
        const parent = mainGrid.value
        if (!parent)    
            return
        let targetX = !flipped.value ? highlightedCells.value[0].x.toString() : highlightedCells.value[0].y.toString()
        let targetY = !flipped.value ? highlightedCells.value[0].y.toString() : highlightedCells.value[0].x.toString()
        const child = document.getElementById(targetX + ',' + targetY)
        const parentRect = parent.getBoundingClientRect()
        const childRect = child.getBoundingClientRect()
        const isVisible = childRect.top >= parentRect.top && childRect.bottom <= parentRect.bottom && childRect.left >= parentRect.left && childRect.right <= parentRect.right
        if (isVisible)
            return
        const offsetTop = childRect.top - parentRect.top + parent.scrollTop - (parent.clientHeight / 2) + (child.clientHeight / 2)
        const offsetLeft = childRect.left - parentRect.left + parent.scrollLeft - (parent.clientWidth / 2) + (child.clientWidth / 2)
        parent.scrollTo({ top: offsetTop, left: offsetLeft })
    }

    defineExpose({
        changeHighlightedCells,
    })

    function calculateCellClasses(x, y) {
        const [absX, absY] = (flipped.value ? ([y, x]) : ([x, y]))

        //Calculate the CSS classes that a given cell will have in the grid
        let classes = ['SheetGridCell']
        if (!props.sheet || (props.formatEmpty && props.sheet.grid[absY][absX] === ''))
            classes.push('SheetGridCellEmpty')
        else {
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWX"
            if (settingsStore.settings.sheets_greyoutinvalidpairs && (
                (props.sheet.type == 1 && !allCornerPairs.includes(letters[x] + letters[y]))
                || (props.sheet.type == 2 && !allEdgePairs.includes(letters[x] + letters[y])))) {
                classes.push('SheetGridCellGreyed')
            }
            classes.push('SheetGridCellHoverable')
        }
        
        if (Array.isArray(highlightedCells.value) && highlightedCells.value.some((cell) => cell.x === absX && cell.y === absY))
            classes.push('SheetGridCellHightlighted')

        return classes
    }
</script>

<template>
    <div class="SheetGridContainer">
        <!-----BLANK CORNER----->
        <div class="SheetGridCorner" >
            <div class="SheetGridCell" :style="{ cursor: (props.fullLineSelection ? 'pointer' : 'default') }"
                 :title="props.fullLineSelection ? 'Select/deselect the whole sheet' : ''"
                 @click="sheetClicked()"></div>
        </div>

        <!-----COLUMN HEADINGS----->
        <div class="SheetGridTopRow" ref="topRow">
            <div v-for="(char,index) in getXHeadings(sheet)"
                 class="SheetGridCell"
                 :style="{ cursor: props.fullLineSelection ? 'pointer' : 'default' }"
                 @click="!flipped ? columnClicked(index) : rowClicked(index)">
                {{ char }}
            </div>
            <div class="SheetGridCell" style="background-color: var(--border-color);"></div>
        </div>

        <!-----ROW HEADINGS----->
        <div class="SheetGridLeftColumn" ref="leftColumn" @scroll="syncScrollToLeftColumn">
            <div v-for="(char, index) in getYHeadings(sheet)"
                 class="SheetGridCell"
                 :style="{ cursor: props.fullLineSelection ? 'pointer' : 'default' }"
                 @click="!flipped ? rowClicked(index) : columnClicked(index)">
                {{ char }}
            </div>
            <div class="SheetGridCell" style="background-color: var(--border-color);"></div>
        </div>

        <!---------GRID--------->
        <div class="SheetGrid" ref="mainGrid" @scroll="syncScrollToGrid">
            <div v-for="(col, x) in 24">
                <div v-for="(row, y) in 24"
                     @click="cellClicked(!flipped ? x : y, !flipped ? y : x); "
                     :id="x.toString() + ',' + y.toString()"
                     :class="calculateCellClasses(x,y)">
                    {{ getCell(x,y) }}
                </div>
            </div>
        </div>
    </div>
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
        overflow: hidden;
        user-select: none;
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
        overflow: hidden;
        user-select: none;
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

    .SheetGridCellGreyed{
        background-color: var(--border-color);
    }

    .SheetGridCellHightlighted {
        border: 3px solid var(--grey-100);
    }
</style>
