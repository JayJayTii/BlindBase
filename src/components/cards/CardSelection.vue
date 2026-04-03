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
        updateStatsKey: Number,
    })

    const emit = defineEmits(['beginPractice'])

    const sheetID = ref(-1)

    const columnHeaders = ['Sheet','Flashcards','','New','Learning','Due', '']
    const columnTooltips = ['', '', '', `Cards you haven\'t learned yet (${settingsStore.settings.cards_dailymaximumnewcards} max per day)`,'Cards you are starting to learn', 'Cards using spaced repetition for optimal recall', '']
    const gridRef = ref(null)
    const selectedCells = ref(Array.from({ length: 24 }, () =>
        Array.from({ length: 24 }, () => false),
    )) //Selected cells stored as a matrix of booleans which say if that cell is selected

    function UpdateSelectedCells() {
        //Makes sure the highlighted cells in the grid match the cards that exist for the sheet
        const cardsInSheet = cardStore.getCardsForSheet(sheetID.value)
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

    function onCellsClicked(values, create) {
        console.log(values)
        if(create)
            cardStore.createCards(sheetID.value, values)
        else
            cardStore.deleteCards(sheetID.value, values)
        UpdateSelectedCells();
    }

    const editingFlashcards = ref(false)
    function editFlashcardsButtonClicked() {
        editingFlashcards.value = !editingFlashcards.value
        const grid = document.getElementById("CardSelectSheetGrid")
        grid.classList.remove('AnimatedGridOpen','AnimatedGridClose')
        if (editingFlashcards.value) {
            grid.classList.add('AnimatedGridOpen');
            UpdateSelectedCells()
        }
        else
            grid.classList.add('AnimatedGridClose');

    }
</script>

<template>
    <!------CARD MENU GRID------>
    <div class="CardsView">
        <div style="height: calc(100vh - var(--navbar-height) - var(--footer-height));">
            <div style="height:10vh"></div>

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
                <template v-for="(sheet,index) in sheetStore.sheets">
                    <div>{{sheet.name}}</div>
                    <div style="display:flex;flex-direction:row; justify-content:center;gap:10px;align-items:center;">
                        {{cardStore.getCardsForSheet(sheet.id).length}}/{{sheetStore.getFilledCellCount(sheet.id)}}
                        <img title="Create flashcards"
                             @click="sheetID = sheet.id; editFlashcardsButtonClicked()"
                             src="@/assets/icons/edit.svg"
                             :class="['CustomButton', (sheetID === sheet.id) ? 'CustomButtonHovered': '']"
                             style="height: 2rem;" />
                    </div>
                    <div />
                    <div :title="columnTooltips[3]">{{cardStore.getCardsOfType(sheet.id, "New").length}}</div>
                    <div :title="columnTooltips[4]">{{cardStore.getCardsOfType(sheet.id, "Learning").length}}</div>
                    <div :title="columnTooltips[5]">{{cardStore.getCardsOfType(sheet.id, "Due").length}}</div>
                    <div>
                        <img v-if="cardStore.getCardsToPracticeCount(sheet.id) > 0"
                             title="Practice"
                             src="@/assets/icons/arrow-right-long.svg"
                             class="CustomButton"
                             style="height: 40px; width: 60px;"
                             @click="emit('beginPractice', sheet.id)" />
                    </div>
                    <div class="RowGap" v-for="x in columnHeaders.length" :title="columnTooltips[x]" v-if="index + 1 < sheetStore.sheets.length"></div>
                </template>
            </div>
            <div v-if="sheetStore.sheets.length === 0" style="color:var(--info-200); font-size:1.5rem;">
                Create a sheet to begin making flashcards!
            </div>
            <div style="height:10vh"></div>
        </div>

        <!------EDITING------>
        <div id="CardSelectSheetGrid">
            <button style="font-size:1rem;transform:translateX(calc(47.5vw - 50%));"
                    @click="editFlashcardsButtonClicked()">
                X
            </button>
            <SheetGrid :sheet="sheetStore.getSheet(sheetID)"
                       :formatEmpty="true"
                       :fullLineSelection="true"
                       @update:selected-cells="onCellsClicked"
                       ref="gridRef" 
                       style="height: 100%; width: 100%;"/>
        </div>
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
        height: 100%;
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

    #CardSelectSheetGrid {
        height: 75vh;
        width: 95vw;
        position: absolute;
        left: 2.5vw;
        top: 2vh;
        transform: translate(0vw, -100vh);
        z-index: 20;
        border-radius: 10px;
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