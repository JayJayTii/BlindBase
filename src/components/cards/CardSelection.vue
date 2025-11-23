<script setup>
    import { inject, ref, watch, nextTick } from 'vue'
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    import { useCardStore } from "@/stores/CardStore"
    const cardStore = useCardStore()
    import { useSettingsStore } from "@/stores/SettingsStore"
    const settingsStore = useSettingsStore()
    settingsStore.loadState()

    import SheetGrid from "@/components/SheetGrid.vue"
    const confirmDialog = inject('confirmDialog')

    const props = defineProps({
        sheetID: Number,
        updateStatsKey: Number,
    })
    const emit = defineEmits(['sheetEditClicked','beginPractice'])

    const columnHeaders = ['Sheet','Flashcards','','New','Learning','Due', '']
    const columnTooltips = ['', '', '', `Cards you haven\'t learned yet (${settingsStore.settings.cards_dailymaximumnewcards} max per day)`,'Cards you are starting to learn', 'Cards using spaced repetition for optimal recall', '']
    const gridRef = ref(null)
    const selectedCells = ref(Array.from({ length: 24 }, () =>
        Array.from({ length: 24 }, () => false),
    )) //Selected cells stored as a matrix of booleans which say if that cell is selected

    function UpdateSelectedCells() {
        const cardsInSheet = cardStore.getCardsForSheet(props.sheetID)
        selectedCells.value = Array.from({ length: 24 }, () => Array.from({ length: 24 }, () => false))
        for (const card of cardsInSheet) {
             selectedCells.value[card.coord.y][card.coord.x] = true
        }
        const formattedSelectedCells = selectedCells.value.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
                    return cell ? { x: colIndex, y: rowIndex } : null
            }).filter(cell => cell != null)).flat()
        gridRef.value.changeHighlightedCells(formattedSelectedCells)
    }
    nextTick(() => { UpdateSelectedCells() }) 

    function SelectAll() {
        const sheet = sheetStore.getSheet(props.sheetID)
        const cardsToCreate = []
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < 24; j++) {
                const wasSelected = selectedCells.value[i][j]
                selectedCells.value[i][j] = (sheet.grid[i][j] != "")
                if (!wasSelected && selectedCells.value[i][j]) {
                    cardsToCreate.push({ x: j, y: i })
                }
            }
        }
        cardStore.createCards(props.sheetID, cardsToCreate)
        UpdateSelectedCells()
    }
    async function SelectNone() {
        if (!(await confirmDialog.value.open('Are you sure you want deselect all? This will delete all cards for this sheet.'))) {
            return
        }

        const cardsToDelete = []
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < 24; j++) {
                if (selectedCells.value[i][j]) {
                    cardsToDelete.push({ x: j, y: i })
                }
                selectedCells.value[i][j] = false
            }
        }
        cardStore.deleteCards(props.sheetID, cardsToDelete)
        UpdateSelectedCells()
    }

    function onCellClicked(value) {
        const sheet = sheetStore.getSheet(props.sheetID)
        if (sheet.grid[value.y][value.x] === "") {
            return //Empty cell, not allowed!
        }
        if (selectedCells.value[value.y][value.x] == true) {
            //If it already includes it, remove it
            selectedCells.value[value.y][value.x] = false
            cardStore.deleteCard(props.sheetID, value)
        }
        else {
            //If it wasn't in it, add it
            selectedCells.value[value.y][value.x] = true
            cardStore.createCard(props.sheetID, value)
        }
        UpdateSelectedCells()
    }
    function lineClicked(isCol, index) {
        const sheet = sheetStore.getSheet(props.sheetID)
        let lineFilled = true
        for (var i = 0; i < sheet.grid.length; i++) {
            if (sheet.grid[isCol ? i : index][isCol ? index : i] != ''
                && !selectedCells.value[isCol ? i : index][isCol ? index : i]) {
                lineFilled = false
                break
            }
        }

        if (lineFilled) { //Delete cards in line
            const cardsToDelete = []
            for (var i = 0; i < 24; i++) {
                if (selectedCells.value[isCol ? i : index][isCol ? index : i]) {
                    cardsToDelete.push({ x: (isCol ? index : i), y: (isCol ? i : index) })
                }
                selectedCells.value[isCol ? i : index][isCol ? index : i] = false
            }
            cardStore.deleteCards(props.sheetID, cardsToDelete)
        }
        else { //Add unadded cards
            const cardsToCreate = []
            for (var i = 0; i < 24; i++) {
                const wasSelected = selectedCells.value[isCol ? i : index][isCol ? index : i]
                const newValue = (sheet.grid[isCol ? i : index][isCol ? index : i] != "")
                selectedCells.value[isCol ? i : index][isCol ? index : i] = newValue
                if (!wasSelected && newValue == true) {
                    cardsToCreate.push({ x: (isCol ? index : i), y: (isCol ? i : index) })
                }
            }
            cardStore.createCards(props.sheetID, cardsToCreate)
        }
        UpdateSelectedCells()
    }
    function sheetClicked() {
        const sheet = sheetStore.getSheet(props.sheetID)
        let sheetFilled = true
        for (var i = 0; i < sheet.grid.length; i++) {
            for (var j = 0; j < sheet.grid[0].length; j++) {
                if (sheet.grid[i][j] != '' && !selectedCells.value[i][j]) {
                    sheetFilled = false
                    break
                }
            }
        }
        if (sheetFilled) //Delete cards in sheet
            SelectNone()
        else //Add unadded cards
            SelectAll()
    }

    watch(
        () => settingsStore.settings.sheets_pairorder,
        (newVal) => {
            UpdateSelectedCells()
        }
    )
</script>

<template>
    <div style="height:10vh"></div>

    <!------CARD MENU GRID------>
    <div class="CardsView">
        <div class="CardsMenuGrid">
            <!------HEADERS------>
            <div v-for="(label,index) in columnHeaders"
                 :title="columnTooltips[index]"
                 :class="[label.length > 0 ? 'PanelHeader' : '']" 
                 style="font-size:1.5rem;">
                {{label}}
            </div>
            <div class="RowGap" v-for="x in columnHeaders"></div>

            <!------SHEET ROWS------>
            <template v-for="(name,index) in sheetStore.getSheetNames">
                <div>{{name}}</div>
                <div style="display:flex;flex-direction:row; justify-content:center;gap:10px;align-items:center;">{{cardStore.getCardsForSheet(sheetStore.sheets[index].id).length}}/{{sheetStore.getFilledCellCount(sheetStore.sheets[index].id)}}
                    <img title="Create flashcards from this sheet"
                         @click="emit('sheetEditClicked', sheetStore.sheets[index].id);nextTick(()=>{UpdateSelectedCells()})"
                         src="@/assets/edit.svg"
                         :class="['CustomButton', (sheetID === sheetStore.sheets[index].id) ? 'CustomButtonHovered': '']"
                         style="height: 2rem;" />
                </div>
                <div />
                <div :title="columnTooltips[3]">{{cardStore.getCardsOfType(sheetStore.sheets[index].id, "New").length}}</div>
                <div :title="columnTooltips[4]">{{cardStore.getCardsOfType(sheetStore.sheets[index].id, "Learning").length}}</div>
                <div :title="columnTooltips[5]">{{cardStore.getCardsOfType(sheetStore.sheets[index].id, "Due").length}}</div>
                <div>
                    <img v-if="cardStore.getCardsToPracticeCount(sheetStore.sheets[index].id) > 0"
                         title="Practice this card decks"
                         src="@/assets/arrow-right-long.svg"
                         class="CustomButton"
                         style="height: 40px; width: 60px;"
                         @click="emit('beginPractice',sheetStore.sheets[index].id)" />
                </div>
                <div class="RowGap" v-for="x in columnHeaders.length" :title="columnTooltips[x]" v-if="index + 1 < sheetStore.sheets.length"></div>
            </template>
        </div>
        <div v-if="sheetStore.sheets.length === 0" style="color:var(--info-200); font-size:1.5rem;">
            Create a sheet to begin making flashcards!
        </div>
        <div style="height:10vh"></div>

        <!------EDITING------>
        <div v-if="sheetStore.isValidSheetID(sheetID)" style="display:flex;flex-direction:column;gap:5px;">
            <h3 class="PanelHeader" style="font-size:5vh;padding-inline:10px;">Select flashcards to create from '{{sheetStore.getSheet(sheetID).name}}'</h3>
            <div style="display:flex;flex-direction:row;gap:5px;justify-content:center">
                <div class="CustomButton" style="font-size:1rem;width:110px;" @click="SelectAll()"><h3>Select all</h3></div>
                <div class="CustomButton" style="font-size:1rem;width:110px;" @click="SelectNone()"><h3>Select none</h3></div>
            </div>
        </div>

        <SheetGrid :sheet="sheetStore.getSheet(sheetID)"
                   :formatEmpty="true"
                   :fullLineSelection="true"
                   @update:selected-cell="onCellClicked"
                   @update:full-column-selected="lineClicked(true, $event)"
                   @update:full-row-selected="lineClicked(false, $event)"
                   @update:full-sheet-selected="sheetClicked()"
                   ref="gridRef"
                   style="width:100%; height:79vh;" />
    </div>
</template>

<style>
    .CardsView {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        text-justify: distribute;
        font-size: 1.5rem;
        gap: 10px;
    }

    .CardsMenuGrid {
        justify-content: center;
        width: 80vw;
        display: grid;
        column-gap: 5px;
        row-gap:5px;
        color: var(--text-color);
        grid-template-columns: 1.5fr 1fr 0.25fr 0.7fr 0.7fr 0.7fr 0.5fr;
    }

    .RowGap {
        height: 2px;
        width: 110%;
        background-color: var(--border-color);
    }

    .cardSelectButton {
        background-color: var(--brand-700);
        color: var(--brand-900);
        font-size: 1rem;
        width: 110px;
        border-radius: 5px;
        cursor: pointer;
    }
        .cardSelectButton:hover {
            background-color: var(--brand-500);
        }
</style>