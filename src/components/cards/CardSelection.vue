<script setup>
	import { ref, computed, nextTick } from 'vue'
	import { ElMessage } from 'element-plus'
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    import { useCardStore } from "@/stores/CardStore"
    const cardStore = useCardStore()
    import { useSettingsStore } from "@/stores/SettingsStore"
    const settingsStore = useSettingsStore()
    settingsStore.loadState()

    import SheetGrid from "@/components/SheetGrid.vue"

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
        if (create) {
            if (inCardDeletionMode.value) {
				ElMessage({ message: 'Must be in flashcard creation mode to create flashcards', type: 'info'})
                return
            }
            cardStore.createCards(sheetID.value, values)
        }
        else {
			if (!inCardDeletionMode.value) {
				ElMessage({ message: 'Must be in flashcard deletion mode to delete flashcards', type: 'error' })
				return
			}
            cardStore.deleteCards(sheetID.value, values)
        }
        UpdateSelectedCells();
    }


    const inCardDeletionMode = ref(false)
    const cardDeletionDialog = ref(false)
    function cardDeletionModeChanged() {
        if (inCardDeletionMode.value)
            cardDeletionDialog.value = true //Open card deletion confirmation dialog
	}
	const hoveredCell = ref({ x: -1, y: -1 })
	const hoveredCellCard = computed({
		get: () => (hoveredCell.x != -1 && hoveredCell.y != -1) ? cardStore.getCard(sheetID.value, hoveredCell.value) : null
	})
    function cellEntered(x, y) {
        hoveredCell.value = {x: x, y: y}
	}
	function cellExited(x, y) {
        hoveredCell.value = {x: -1, y: -1}
	}

</script>

<template>
    <!------CARD MENU GRID------>
    <div class="CardsView">
        <div style="height: 50px;"></div>
        <el-table :data="tableData" :border="true"
                  empty-text="Create an alg-sheet to get started" style="width: auto; box-shadow: 0px 0px 10px var(--el-border-color-dark); border-radius: 4px;">
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
                            <el-button type="success" @click="emit('beginPractice', scope.row.sheet_id)">
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
                   :before-close="handleClose"
                   @close="inCardDeletionMode = false;">
            <div style="display: flex; justify-content: space-between; margin-top: -20px;">
                <div>
                    <el-switch v-model="inCardDeletionMode" @change="cardDeletionModeChanged" />
                    {{inCardDeletionMode ? 'Flashcard deletion mode' : 'Flashcard creation mode'}} <el-icon v-if="inCardDeletionMode"><WarnTriangleFilled style="color: var(--el-color-danger);" /></el-icon>
                </div>
                <div v-if="hoveredCell.x != -1 && hoveredCell.y != -1 && sheetStore.getCell(sheetID, hoveredCell) != '' && hoveredCellCard">
                    {{sheetStore.coordToKey(sheetID, hoveredCell)}} | {{sheetStore.getCell(sheetID, hoveredCell)}} | Created: {{new Date(hoveredCellCard.creationTime).toDateString()}} | Practiced: {{hoveredCellCard.successCount + hoveredCellCard.failCount}} times
                </div>
            </div>
           
            
            <SheetGrid :sheet="sheetStore.getSheet(sheetID)"
                       :formatEmpty="true"
                       :fullLineSelection="true"
                       @update:selected-cells="onCellsClicked"
                       @update:mouse-enter-cell="cellEntered"
                       @update:mouse-exit-cell="cellExited"
                       ref="gridRef"
                       style="height: calc(100% - 15px); width: 100%;" />
        </el-drawer>

        <el-dialog v-model="cardDeletionDialog" title="Flashcard Deletion Mode" width="500" @close="inCardDeletionMode = false">
            <span style="font-size: 1rem;">Warning! Any flashcard you click on will be deleted in this mode. That includes any that you hold very dear to you. You have been warned!</span>
            <template #footer>
                <div>
                    <el-button @click="cardDeletionDialog = false;">Cancel</el-button>
                    <el-button type="danger" @click="cardDeletionDialog = false; nextTick(() => {inCardDeletionMode = true})">
                        Confirm
                    </el-button>
                </div>
            </template>
        </el-dialog>
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
</style>