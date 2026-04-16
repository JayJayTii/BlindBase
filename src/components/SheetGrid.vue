<script setup>
    //SheetGrid displays a given alg-sheet and provides callbacks for click events
    import { ref, reactive, watch, computed, nextTick } from 'vue'
    import { getXHeadings, getYHeadings } from '@/helpers/sheets.js'
	import { isPossiblePair } from '@/helpers/pairs.js'
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
        /*
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
        */
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
			if ((props.sheet.type == 1 || props.sheet.type == 2) && !isPossiblePair(props.sheet.type, letters[x] + letters[y], props.sheet.buffer)) {
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
    <div class="SheetGrid">
        <template v-for="(col, y) in 25">
            <template v-for="(row, x) in 25">
                <!-- Corner -->
                <div v-if="x == 0 && y == 0"
                     class="SheetGridCorner" 
                     :style="{ cursor: (props.fullLineSelection ? 'pointer' : 'default') }"
                     :title="props.fullLineSelection ? 'Select sheet' : ''"
                     @click="sheetClicked()">
                </div>
                <!-- Column headings -->
                <div v-else-if="y == 0"
                     class="SheetGridTopRow"
                     :title="props.fullLineSelection ? 'Select column' : ''"
                     :style="{ cursor: props.fullLineSelection ? 'pointer' : 'default' }"
                     @click="!flipped ? columnClicked(x-1) : rowClicked(x-1)">
                    {{ "ABCDEFGHIJKLMNOPQRSTUVWX"[x-1] }}
                </div>
                <!-- Row headings -->
                <div v-else-if="x == 0"
                     class="SheetGridLeftColumn"
                     :title="props.fullLineSelection ? 'Select row' : ''"
                     :style="{ cursor: props.fullLineSelection ? 'pointer' : 'default' }"
                     @click="!flipped ? rowClicked(x-1) : columnClicked(x-1)">
                    {{ "ABCDEFGHIJKLMNOPQRSTUVWX"[y-1] }}
                </div>
                <!-- Main grid -->
                <div v-else :class="calculateCellClasses(x-1,y-1)"
                            :id="(x-1).toString() + ',' + (y-1).toString()"
                            @click="cellClicked(!flipped ? (x-1) : (y-1), !flipped ? (y-1) : (x-1));">
                    {{ getCell(x-1,y-1) }}
                </div>
            </template>
        </template>
    </div>
</template>

<style>
	.SheetGrid {
		--sheet-cell-height: 2rem;
		--sheet-cell-width: 100px;
		max-height: calc(24 * var(--sheet-cell-height));
		max-width: calc(24 * var(--sheet-cell-width) + var(--sheet-cell-height));
		display: grid;
		grid-template-rows: repeat(25, var(--sheet-cell-height));
		grid-template-columns: var(--sheet-cell-height) repeat(24, var(--sheet-cell-width));
		height: 100%;
		overflow: auto;
		border: 1px solid var(--el-border-color);
		border-radius: var(--el-border-radius-base);
	}

	.SheetGridCorner {
		background-color: var(--el-color-primary-light-8);
		border-block-end: 3px solid var(--el-color-primary-light-3);
		border-inline-end: 3px solid var(--el-color-primary-light-3);
		width: var(--sheet-cell-height);
		height: var(--sheet-cell-height);
		position: sticky;
		top: 0;
		left: 0;
		z-index: 10;
	}

	.SheetGridTopRow {
		position: sticky;
		top: 0;
		z-index: 5;
		width: var(--sheet-cell-width);
		height: var(--sheet-cell-height);
		background-color: var(--el-color-primary-light-8);
		border: 1px solid var(--el-border-color-dark);
		border-block-end: 3px solid var(--el-color-primary-light-3);
		user-select: none;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 14px;
	}

	.SheetGridLeftColumn {
		position: sticky;
		left: 0;
		z-index: 5;
		width: var(--sheet-cell-height);
		height: var(--sheet-cell-height);
		background-color: var(--el-color-primary-light-8);
		border: 1px solid var(--el-border-color-dark);
		border-inline-end: 3px solid var(--el-color-primary-light-3);
		user-select: none;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 14px;
	}

	.SheetGridCell {
		width: var(--sheet-cell-width);
		height: var(--sheet-cell-height);
		background-color: var(--el-fill-color-blank);
		border: 1px solid var(--el-border-color-dark);
		padding: 0px 4px;
		cursor: pointer;
		font-size: 14px;
		overflow: hidden;
		text-overflow: ellipsis;
		word-break: break-word;
		line-height: var(--sheet-cell-height);
	}
	.SheetGridCellHoverable:hover {
		background-color: color-mix(in srgb, var(--el-color-primary) 10%, var(--el-fill-color-blank));
	}

	.SheetGridCellEmpty {
		background-color: var(--el-border-color);
		cursor: default;
	}

	.SheetGridCellGreyed {
		background-color: var(--el-fill-color);
	}

    .SheetGridCellHightlighted {
        border: 3px solid var(--el-color-primary);
    }
</style>
