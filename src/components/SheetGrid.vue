<script setup>
    //SheetGrid displays a given alg-sheet and provides callbacks for click events
    import { ref, reactive, watch, computed, nextTick } from 'vue'
	import { calculateCellClasses } from '@/helpers/sheets.js'
	import { isPossiblePair } from '@/helpers/pairs.js'
    import { useSettingsStore } from '@/stores/SettingsStore'
    const settingsStore = useSettingsStore()
    settingsStore.loadState()

    const props = defineProps({
        sheet: Object,
        formatEmpty: Boolean,
        fullLineSelection: Boolean,
    })

	const emit = defineEmits(['update:selected-cells', 'update:mouse-enter-cell', 'update:mouse-exit-cell'])
	defineExpose({ changeHighlightedCells })

	const highlightedCells = ref([{ x: -1, y: -1 }])
    const grid = ref(null)

    const sheet = computed({ get: () => props.sheet })
    const flipped = computed({ get: () => settingsStore.settings.sheets_pairorder === 1 })

    function cellClicked(absX, absY) { //Absolute x and y coords
        const create = !highlightedCells.value.some((cell) => cell.x === absX && cell.y === absY)
        if(props.formatEmpty && props.sheet.grid[absY][absX] == "") return

        emit('update:selected-cells', [ {x: absX,y: absY} ], create)
    }

    function getCell(x, y) {
        return props.sheet ? props.sheet.grid[!flipped.value ? y : x][!flipped.value ? x : y] : ""
    }

    function columnClicked(index) { //This is absolute, so also a row with "Column then row" setting
        if (!props.fullLineSelection) return

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

    function lineClicked(index, isRow) {
		if (!props.fullLineSelection) return

		let lineFilled = true //Searching for a cell that isn't empty and isn't highlighted
		for (var i = 0; i < 24; i++) {
			if (props.sheet.grid[isRow ? index : i][isRow ? i : index] != '' && !highlightedCells.value.some((cell) => cell.x === (isRow ? i : index) && cell.y === (isRow ? index : i))) {
				lineFilled = false
				break
			}
        }

        const cells = [] //Cells to either add or delete
		for (var i = 0; i < 24; i++) {
			if (lineFilled && highlightedCells.value.some((cell) => cell.x === (isRow ? i : index) && cell.y === (isRow ? index : i))
				|| !lineFilled && props.sheet.grid[isRow ? index : i][isRow ? i : index] != '' && !highlightedCells.value.some((cell) => cell.x === (isRow ? i : index) && cell.y === (isRow ? index : i)))
				cells.push({ x: (isRow ? i : index), y: (isRow ? index : i) })
		}

		emit('update:selected-cells', cells, !lineFilled)
    }

    function sheetClicked() {
        //If the sheet is already filled, clear all cells. Otherwise add every non-empty cell
        if (!props.fullLineSelection) return

        let sheetFilled = true
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < 24; j++) {
                if (props.sheet.grid[i][j] != '' && !highlightedCells.value.some((cell) => cell.x === j && cell.y === i)) {
                    sheetFilled = false
                    break
                }
            }
        }
    
        const cells = []
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < 24; j++) {
                if (sheetFilled && highlightedCells.value.some((cell) => cell.x === j && cell.y === i)
					|| !sheetFilled && props.sheet.grid[i][j] != '' && !highlightedCells.value.some((cell) => cell.x === j && cell.y === i))
                    cells.push({ x: j, y: i })
            }
        }

        emit('update:selected-cells', cells, !sheetFilled)
    }

    function changeHighlightedCells(newValue) {
        if (newValue.length > 0 && newValue[0].x == -1) return

        highlightedCells.value = newValue
    }

	const nums = Array.from({ length: 25 }, (_, i) => i - 1)
	const headerStyle = { cursor: (props.fullLineSelection ? 'pointer' : 'default') }
</script>

<template>
    <div class="SheetGrid" ref="grid">
        <template v-for="(y, u) in nums">
            <template v-for="(x, v) in nums">
                <div v-if="v == 0 && u == 0" class="SheetGridCorner" :style="headerStyle"
                     :title="props.fullLineSelection ? 'Select sheet' : ''"
                     @click="sheetClicked()">
                </div>
                <div v-else-if="u == 0" class="SheetGridTopRow" :style="headerStyle"
                     :title="props.fullLineSelection ? 'Select column' : ''"
                     @click="lineClicked(x, flipped)">
                    {{ "ABCDEFGHIJKLMNOPQRSTUVWX"[x] }}
                </div>
                <div v-else-if="v == 0" class="SheetGridLeftColumn" :style="headerStyle"
                     :title="props.fullLineSelection ? 'Select row' : ''"
                     @click="lineClicked(y, !flipped)">
                    {{ "ABCDEFGHIJKLMNOPQRSTUVWX"[y] }}
                </div>
                <div v-else :id="x + ',' + y" :class="calculateCellClasses(!flipped ? x : y, !flipped ? y : x, formatEmpty, sheet, highlightedCells)"
                            @click="cellClicked(!flipped ? x : y, !flipped ? y : x);"
                            @mouseover="emit('update:mouse-enter-cell',!flipped ? x : y, !flipped ? y : x)"
                            @mouseout="emit('update:mouse-exit-cell',!flipped ? x : y, !flipped ? y : x)">
                    {{ getCell(x,y) }}
                </div>
            </template>
        </template>
    </div>
</template>

<style>
	.SheetGrid {
		--sheet-cell-height: 1.7rem;
		--sheet-cell-width: 80px;
		--sheet-cell-bg-color: var(--el-fill-color-blank);
		--sheet-cell-bg-color-inverse: var(--el-text-color-primary);
		display: grid;
		grid-template-rows: repeat(25, var(--sheet-cell-height));
		grid-template-columns: var(--sheet-cell-height) repeat(24, var(--sheet-cell-width));
		overflow: auto;
		border: 1px solid var(--el-border-color);
	}

	.SheetGridCorner {
		background-color: var(--sheet-cell-bg-color);
		border-block-end: 1px solid var(--el-border-color-dark);
		border-inline-end: 1px solid var(--el-border-color-dark);
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
		background-color: var(--sheet-cell-bg-color);
		border: 1px solid var(--el-border-color-dark);
		border-block-end: 1px solid var(--el-border-color-dark);
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
		background-color: var(--sheet-cell-bg-color);
		border: 1px solid var(--el-border-color-dark);
		border-inline-end: 1px solid var(--el-border-color-dark);
		user-select: none;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 14px;
	}

	.SheetGridCell {
		width: var(--sheet-cell-width);
		height: var(--sheet-cell-height);
		background-color: var(--sheet-cell-bg-color);
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
		background-color: color-mix(in srgb, var(--sheet-cell-bg-color) 90%, var(--el-color-primary) 10%);
	}

	.SheetGridCellEmpty {
		background-color: color-mix(in srgb, var(--sheet-cell-bg-color) 90%, var(--sheet-cell-bg-color-inverse) 10%);
		cursor: default;
	}

	.SheetGridCellGreyed {
		background-color: color-mix(in srgb, var(--sheet-cell-bg-color) 93%, var(--sheet-cell-bg-color-inverse) 7%);
	}

    .SheetGridCellHightlighted {
        border: 3px solid var(--el-color-primary);
    }
</style>
