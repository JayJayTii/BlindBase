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
    const columnTooltips = ['', '', '', `Cards you haven\'t learned yet (${settingsStore.settings.cards_dailymaximumnewcards} max per day)`,'Cards you are starting to learn', 'Long-term cards using spaced repetition', '']

    const tableData = ref([])
	function calculateTableData() {
        tableData.value = []
		for (var i = 0; i < sheetStore.sheets.length; i++) {
			const sheet = sheetStore.sheets[i]
			tableData.value.push({
				sheet_name: sheet.name,
				sheet_id: sheet.id,
				flashcards: cardStore.getCardsForSheet(sheet.id).length.toString() + "/" + sheetStore.getFilledCellCount(sheet.id).toString(),
				cards_new: cardStore.getCardsOfType(sheet.id, "New").length.toString(),
				cards_learning: cardStore.getCardsOfType(sheet.id, "Learning").length.toString(),
				cards_due: cardStore.getCardsOfType(sheet.id, "Due").length.toString(),
				can_practice: (cardStore.getCardsToPracticeCount(sheet.id) > 0),
			})
		}
    }
    calculateTableData()


	const gridRef = ref(null)
	const editingFlashcards = ref(false)
	async function editFlashcardsButtonClicked(id) {
		sheetID.value = id;
		editingFlashcards.value = !editingFlashcards.value
        await nextTick()
        UpdateSelectedCells()
    }
    const handleClose = (done) => {
        calculateTableData()
        done()
    }
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
        if(create)
            cardStore.createCards(sheetID.value, values)
        else
            cardStore.deleteCards(sheetID.value, values)
        UpdateSelectedCells();
    }

</script>

<template>
    <!------CARD MENU GRID------>
    <div class="CardsView">
        <div style="height: 50px;"></div>
        <el-table :data="tableData" :border="true" 
                  empty-text="Create an alg-sheet to get started" style="width: auto;">
            <el-table-column prop="sheet_name" label="Sheet" width="250" />
            <el-table-column label="Flashcards" prop="flashcards" width="150">
                <template #default="scope">
                    <div style="display: flex; justify-content: space-between;">
                        {{scope.row.flashcards}}

                        <el-tooltip content="Edit" placement="right">
                            <el-button type="primary" :plain="true"
                                       @click="editFlashcardsButtonClicked(scope.row.sheet_id)">
                                <el-icon><Edit /></el-icon>
                            </el-button>
                        </el-tooltip>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="cards_new" label="New" width="100" />
            <el-table-column prop="cards_learning" label="Learning" width="100" />
            <el-table-column prop="cards_due" label="Due" width="100" />
            <el-table-column label="" props="can_practice" width="70">
                <template #default="scope">
                    <div v-if="scope.row.can_practice">
                        <el-tooltip content="Practice" placement="right">
                            <el-button type="primary" :plain=true @click="emit('beginPractice', scope.row.sheet_id)">
                                <el-icon><DArrowRight /></el-icon>
                            </el-button>
                        </el-tooltip>
                    </div>
                </template>
            </el-table-column>
        </el-table>


        <el-drawer v-model="editingFlashcards"
                   :title="'\'' + (sheetStore.getSheet(sheetID)?.name || '') + '\' flashcards: ' + cardStore.getCardsForSheet(sheetID).length.toString() + '/' + sheetStore.getFilledCellCount(sheetID).toString()"
                   size="95%"
                   direction="rtl"
                   body-class="drawer-body"
                   :before-close="handleClose">
            <SheetGrid :sheet="sheetStore.getSheet(sheetID)"
                       :formatEmpty="true"
                       :fullLineSelection="true"
                       @update:selected-cells="onCellsClicked"
                       ref="gridRef"
                       style="height: 100%; width: 100%;" />
        </el-drawer>
    </div>
</template>

<style>
    .CardsView {
        display: flex;
        flex-direction: column;
        align-items: center;
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