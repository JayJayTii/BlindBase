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
        showIfNull: Boolean,
        fullLineSelection: Boolean,
    })

    const emit = defineEmits(['update:selected-cell', 'update:full-column-selected', 'update:full-row-selected', 'update:full-sheet-selected'])

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
    function syncScrollToLeftColumn() {
        if (leftColumn.value && topRow.value && mainGrid.value) {
            mainGrid.value.scrollTop = leftColumn.value.scrollTop
            if (mainGrid.value.scrollTop < leftColumn.value.scrollTop) //Gone past grid height
                leftColumn.value.scrollTop = mainGrid.value.scrollTop
        }
    }
    function syncScrollToTopRow() {
        if (leftColumn.value && topRow.value && mainGrid.value) {
            mainGrid.value.scrollLeft = topRow.value.scrollLeft
            if (mainGrid.value.scrollLeft < topRow.value.scrollLeft) //Gone past grid width
                topRow.value.scrollLeft = mainGrid.value.scrollLeft
        }
    }

    function columnClicked(columnIndex) {
        if (!props.fullLineSelection)
            return

        const flipped = (settingsStore.settings.sheets_pairorder === 1)
        emit('update:full-' + (flipped ? 'column' : 'row') + '-selected', columnIndex)
    }
    function rowClicked(rowIndex) {
        if (!props.fullLineSelection)
            return

        const flipped = (settingsStore.settings.sheets_pairorder === 1)
        emit('update:full-' + (flipped ? 'row' : 'column') + '-selected', rowIndex)
    }
    function sheetClicked() {
        emit('update:full-sheet-selected')
    }

    //Highlighted cells are visual coords
    const highlightedCells = ref([{ x: -1, y: -1 }])
    let intervalID = null
    function changeHighlightedCells(newValue) {
        //New values will be absolute, not visual
        highlightedCells.value = !flipped.value ? newValue : newValue.map(coord => ({ x: coord.y, y: coord.x }))
        if (highlightedCells.value.length != 1)
            return

        //Scroll to make sure if there is one highlightedCell, it is visible
        const parent = mainGrid.value
        if (!parent)
            return
        const child = document.getElementById(highlightedCells.value[0].x.toString() + ',' + highlightedCells.value[0].y.toString())
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
    //Calculate the CSS classes that a given cell will have in the grid
        let classes = ['SheetGridCell']
        if (props.formatEmpty && props.sheet.grid[!flipped.value ? y : x][!flipped.value ? x : y] === '')
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

        if (Array.isArray(highlightedCells.value) && highlightedCells.value.some((cell) => cell.x === x && cell.y === y))
            classes.push('SheetGridCellHightlighted')

        return classes
    }
</script>

<template>
    <div class="SheetGridContainer" v-if="props.sheet">
        <!-----BLANK CORNER----->
        <div class="SheetGridCorner" >
            <div class="SheetGridCell" :style="{ cursor: (props.fullLineSelection ? 'pointer' : 'default') }"
                 :title="props.fullLineSelection ? 'Select/deselect the whole sheet' : ''"
                 @click="sheetClicked()"></div>
        </div>

        <!-----COLUMN HEADINGS----->
        <div class="SheetGridTopRow" ref="topRow" @scroll="syncScrollToTopRow">
            <div v-for="(char,index) in getXHeadings(sheet)"
                 :title="props.fullLineSelection ? 'Select/deselect this column' : ''"
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
                 :title="props.fullLineSelection ? 'Select/deselect this row' : ''"
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
                     :title="props.sheet.yHeadings[flipped ? y : x] + props.sheet.xHeadings[flipped ? x : y] + ': ' + props.sheet.grid[!flipped ? y : x][!flipped ? x : y]"
                     @click="emit('update:selected-cell', !flipped ? {x:x,y:y} : {x:y,y:x})"
                     :id="x.toString() + ',' + y.toString()"
                     :class="calculateCellClasses(x,y)"
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

    .SheetGridCellGreyed{
        background-color: var(--border-color);
    }

    .SheetGridCellHightlighted {
        border: 3px solid var(--grey-100);
    }
</style>
