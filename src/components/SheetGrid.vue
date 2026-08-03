<script setup>
	//SheetGrid displays a given alg-sheet and provides callbacks for click events
	import { ref, computed } from 'vue'
	import { gridHeadings, calculateCellClasses } from '@/helpers/sheets.js'
	import { GridIndexToSpeffzIndex } from '@/helpers/lettering_scheme.js'
	import { useSettingsStore } from '@/stores/SettingsStore'
	const settingsStore = useSettingsStore()

	const props = defineProps({
		sheet: Object,
		formatEmpty: Boolean,
		fullLineSelection: Boolean,
	})

	const emit = defineEmits(['update:selected-cells', 'update:mouse-enter-cell', 'update:mouse-exit-cell'])
	defineExpose({ changeHighlightedCells })

	// Highlighted cells are stored in speffz
	const highlightedCells = ref([{ x: -1, y: -1 }])
	const grid = ref(null)

	const sheet = computed({ get: () => props.sheet })
	const flipped = computed({ get: () => settingsStore.settings.sheets_pairorder === 1 })

	function cellClicked(absX, absY) { //Absolute x and y coords, but in the lettering scheme
		const create = !highlightedCells.value.some((cell) => cell.x === absX && cell.y === absY)
		if (props.formatEmpty && props.sheet.grid[absY][absX] == "") return

		emit('update:selected-cells', [ {x: absX,y: absY} ], create)
	}

	function getCell(x, y) {
		return props.sheet ? props.sheet.grid[!flipped.value ? y : x][!flipped.value ? x : y] : ""
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

	const headerStyle = { cursor: (props.fullLineSelection ? 'pointer' : 'default') }
</script>

<template>
	<div class="SheetGrid" ref="grid">
		<template v-for="(speffzY, u) in [-1].concat(GridIndexToSpeffzIndex(props.sheet.type))">
			<template v-for="(speffzX, v) in [-1].concat(GridIndexToSpeffzIndex(props.sheet.type))">
				<div v-if="v == 0 && u == 0" class="SheetGridCorner" :style="headerStyle"
					 :title="props.fullLineSelection ? 'Select sheet' : ''"
					 @click="sheetClicked()">
				</div>
				<div v-else-if="u == 0" class="SheetGridTopRow" :style="headerStyle"
					 :title="props.fullLineSelection ? 'Select column' : ''"
					 @click="lineClicked(speffzX, flipped)">
					{{ gridHeadings(props.sheet.type)[v - 1] }}
				</div>
				<div v-else-if="v == 0" class="SheetGridLeftColumn" :style="headerStyle"
					 :title="props.fullLineSelection ? 'Select row' : ''"
					 @click="lineClicked(speffzY, !flipped)">
					{{ gridHeadings(props.sheet.type)[u - 1] }}
				</div>
				<div v-else :id="speffzX + ',' + speffzY" :class="calculateCellClasses(!flipped ? speffzX : speffzY, !flipped ? speffzY : speffzX, formatEmpty, sheet, highlightedCells)"
							@click="cellClicked(!flipped ? speffzX : speffzY, !flipped ? speffzY : speffzX);"
							@mouseover="emit('update:mouse-enter-cell',!flipped ? speffzX : speffzY, !flipped ? speffzY : speffzX)"
							@mouseout="emit('update:mouse-exit-cell',!flipped ? speffzX : speffzY, !flipped ? speffzY : speffzX)">
					{{ getCell(speffzX, speffzY) }}
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
		grid-template-columns: repeat(25, var(--sheet-cell-width));
		overflow: auto;
		border: 1px solid var(--el-border-color);
	}

	.SheetGridCorner {
		background-color: var(--sheet-cell-bg-color);
		border-block-end: 1px solid var(--el-border-color-dark);
		border-inline-end: 1px solid var(--el-border-color-dark);
		width: var(--sheet-cell-width);
		height: var(--sheet-cell-height);
		position: sticky;
		top: 0;
		left: 0;
		z-index: 9;
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
		width: var(--sheet-cell-width);
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
