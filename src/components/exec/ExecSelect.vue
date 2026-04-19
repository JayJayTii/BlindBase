<script setup>
    import { computed, watch, ref, reactive, nextTick, onMounted, onUnmounted} from "vue"
    import SheetGrid from '@/components/SheetGrid.vue'
    import { allLetterPairs, isPossiblePair } from '@/helpers/pairs.js'
    import { cornerBuffers, edgeBuffers } from '@/helpers/letter_scheme.js'
    import { getFilledCells } from '@/helpers/sheets.js'

    import { useSheetStore } from '@/stores/SheetStore'
    const sheetStore = useSheetStore()
    import { useCardStore } from '@/stores/CardStore'
	const cardStore = useCardStore()
	import { useSettingsStore } from '@/stores/SettingsStore'
	useSettingsStore().loadState()
    sheetStore.loadState()
    cardStore.loadState()

    const emit = defineEmits(['update:on-selected'])

    function resetValues() {
        modeValue.value = ""
        pairSelect.value = ""
        pairSelectSheetID.value = -1
        customSheet.value = {}
        if(editingCustomPairs.value)
            editCustomPairButtonClicked()
    }

    //Corners or Edges
    const pieceTypeValue = ref(1)
    const pieceType = computed({
        get: () => pieceTypeValue.value,
        set: (newValue) => {
            if (Number(newValue) !== pieceTypeValue.value) {
                resetValues()
            }
            pieceTypeValue.value = Number(newValue)
        }
    })
    const pieceTypes = ['', 'Corner', 'Edge']
    const pieceTypeSelected = computed({get: () => pieceType.value != -1 })

    //Whole or One pair
    const modeValue = ref("One pair")
    const mode = computed({
        get: () => modeValue.value,
        set: (newValue) => {
            if (newValue !== modeValue.value)
                resetValues()

            modeValue.value = newValue

            if (newValue == "Whole")
                GeneratePairsAndEmit()
        }
    })
    const modeSelected = computed({ get: () => (mode.value != "") })

    //From all, from sheets, from cards, or from custom
    const pairSelectValue = ref("From all pairs")
    const pairSelect = computed({
        get: () => pairSelectValue.value,
        set: (newValue) => {
            pairSelectValue.value = newValue
            pairSelectSheetID.value = -1

            if(editingCustomPairs.value)
                editCustomPairButtonClicked()

			if (pieceType.value == 1) // Corners
				buffer.value = useSettingsStore().settings.misc_defaultcornerbuffer
			else if (pieceType.value == 2) // Edges
                buffer.value = useSettingsStore().settings.misc_defaultedgebuffer

            if (newValue == "From sheet") {
                pairSelectSheetID.value = getValidSheets().length > 0 ? getValidSheets()[0].id : -1
            }
            else if (newValue == "From cards") {
				pairSelectSheetID.value = getValidCardDecks().length > 0 ? getValidCardDecks()[0].id : -1
            }
            else if (newValue == "From custom") {
                for (var y = 0; y < 24; y++) {
                    for (var x = 0; x < 24; x++) {
                        selectedCells.value[y][x] = false
                    }
                }
                generateCustomPairSheet()
            }
            GeneratePairsAndEmit()
        }
    })
    const pairSelectSelected = computed({ get: () => (pairSelect.value != "")})
    const pairSelectSheetIDValue = ref(-1)
    const pairSelectSheetID = computed({
        get: () => pairSelectSheetIDValue.value,
        set: (newValue) => {
            const oldValue = pairSelectSheetIDValue.value
            pairSelectSheetIDValue.value = newValue
            if (newValue != -1 && oldValue != newValue)
                GeneratePairsAndEmit()
        }
    })

    const selectionFinished = computed({
        get: () => pieceType.value != -1
            && ((mode.value == "Whole")
                || (mode.value == "One pair"
                    && (pairSelect.value == 'From all pairs'
                        || (pairSelect.value == "From sheet" && pairSelectSheetID.value != -1)
                        || (pairSelect.value == "From cards" && pairSelectSheetID.value != -1)
                        || (pairSelect.value == "From custom" && getSelectedCellCount() > 0)))
                )      
    })

    function getValidSheets() {
		return sheetStore.getSheetsOfType(pieceType.value)
    }
    function getValidCardDecks() {
        //Gets card decks which have been practiced before and match the selected piece type
        const out = [
            ...new Set(
                cardStore.cards
                    .filter((card) => card.successCount > 0)
                    .map((card) => card.sheetID),
            ),
        ].map((sheetID) => sheetStore.getSheet(sheetID))
        return out.filter((sheet) => sheet.type === pieceType.value)
    }

	const bufferValue = ref(useSettingsStore().settings.misc_defaultcornerbuffer)
	const buffer = computed({
		get: () => bufferValue.value,
		set: (newValue) => {
			bufferValue.value = newValue
			selectedCells.value = Array.from({ length: 24 }, () => Array.from({ length: 24 }, () => false))
			editingCustomPairs.value = false
            generateCustomPairSheet()

            if(pairSelect.value == "From all pairs")
                GeneratePairsAndEmit()
		}
    })

    //customSheet is the sheet containing all possible letter pairs which the user selects from
    const customSheet = reactive({})
	customSheet.value = {}
	let possibleCustomPairs = 0
    function generateCustomPairSheet() {
		possibleCustomPairs = 0
		let grid = Array.from({ length: 24 }, () => Array.from({ length: 24 }, () => ''))
		customSheet.value = {
			xHeadings: 'ABCDEFGHIJKLMNOPQRSTUVWX',
			yHeadings: 'ABCDEFGHIJKLMNOPQRSTUVWX',
			type: pieceType.value,
			buffer: buffer.value,
		}
		const letters = "ABCDEFGHIJKLMNOPQRSTUVWX"
		for (var y = 0; y < 24; y++) {
			for (var x = 0; x < 24; x++) {
			    grid[y][x] = (isPossiblePair(pieceType.value, letters[y] + letters[x], buffer.value)) ? (letters[y] + letters[x]) : ""
                if(grid[y][x] != '')
					possibleCustomPairs += 1
			}
        }
		customSheet.value.grid = grid
    }

    const editingCustomPairs = ref(false)
    const gridRef = ref(null)
    const selectedCells = ref(Array.from({ length: 24 }, () =>
        Array.from({ length: 24 }, () => false),
    )) //Selected cells stored as a matrix of booleans which say if that cell is selected

    function UpdateSelectedCells() {
        //Make sure that the selected cells match the ones selected in the sheet grid
        const formattedSelectedCells = selectedCells.value.map((row, y) =>
            row.map((cell, x) => { return cell ? { x: x, y: y } : null })
                .filter(cell => cell != null)).flat()
        nextTick(() => {
            if (gridRef.value)
                gridRef.value.changeHighlightedCells(formattedSelectedCells)
        })
    }
    nextTick(() => { UpdateSelectedCells() })

	const handleCustomPairClose = (done) => {
		GeneratePairsAndEmit()
		done()
	}

    function onCustomPairsClicked(values, create) {
        for(const cell of values)
            selectedCells.value[cell.y][cell.x] = create
        UpdateSelectedCells()
    }
   
    function getSelectedCellCount() {
        let count = 0
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < 24; j++) {
                count += selectedCells.value[i][j] ? 1 : 0
            }
        }
        return count
    }

    function editCustomPairButtonClicked() {
        editingCustomPairs.value = !editingCustomPairs.value
    }

	function GeneratePairsAndEmit() {
		if (!selectionFinished.value)
			return
		let pairs = []
		switch (pairSelect.value) {
			case "From all pairs":
				pairs = allLetterPairs.filter((pair) => isPossiblePair(pieceType.value, pair, buffer.value))
				break
			case "From sheet":
				const sheet = sheetStore.getSheet(pairSelectSheetID.value)
				for (var y = 0; y < sheet.yHeadings.length; y++) {
					for (var x = 0; x < sheet.xHeadings.length; x++) {
						if (sheet.grid[y][x] !== "") {
							pairs.push(sheet.xHeadings.split('')[x] + sheet.yHeadings.split('')[y])
						}
					}
                }
                buffer.value = sheet.buffer
				break
			case "From cards":
				const cards = cardStore.cards
					.filter((card) => card.sheetID == pairSelectSheetID.value
						&& card.successCount > 0)
				for (var i = 0; i < cards.length; i++) {
					pairs.push(sheetStore.coordToKey(pairSelectSheetID.value, cards[i].coord))
                }
                buffer.value = sheetStore.getBuffer(pairSelectSheetID.value)
				break
			case "From custom":
				for (var i = 0; i < 24; i++) {
					for (var j = 0; j < 24; j++) {
						if (selectedCells.value[i][j])
							pairs.push(customSheet.value.grid[i][j])
					}
				}
				break
			default:
		}

		emit('update:on-selected', mode.value == "Whole", pairs, pieceType.value, buffer.value)
	}
	GeneratePairsAndEmit()

    function handleKeydown(event) {
        //Don't want to block the timer's space input!
        if (event.code === 'Space')
            event.preventDefault()

    }
    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
    })
    defineExpose({
        selectionFinished
    })
</script>

<template>
    <div id="ExecSelect">

        <!-- PIECE TYPE -->
        <el-select v-model="pieceType" size="large" style="width: 130px;">
            <el-option :value="1" label="Corners">Corners</el-option>
            <el-option :value="2" label="Edges">Edges</el-option>
        </el-select>

        <!-- PIECE TYPE => MODE -->
        <el-divider class="ExecSelectLine" v-if="pieceTypeSelected" />
        <el-select v-if="pieceTypeSelected" v-model="mode" size="large" style="width: 120px;">
            <el-tooltip content="One pair per scramble" placement="right">
                <el-option value="One pair">One pair</el-option>
            </el-tooltip>
            <el-tooltip :content="pieceTypes[pieceType] + '-only scramble'" placement="right">
                <el-option value="Whole">Whole</el-option>
            </el-tooltip>
        </el-select>

        <!-- PIECE TYPE => ONE PAIR => FROM [___] -->
        <el-divider class="ExecSelectLine" v-if="mode == 'One pair'" />
        <el-select v-if="mode == 'One pair'" v-model="pairSelect" size="large" style="width: 150px;">
            <el-tooltip content="All letter pairs" placement="right">
                <el-option value="From all pairs">From all pairs</el-option>
            </el-tooltip>
            <el-tooltip content="All letter pairs in an alg-sheet" placement="right">
                <el-option value="From sheet">From sheet</el-option>
            </el-tooltip>
            <el-tooltip content="Flashcards in a card deck" placement="right">
                <el-option value="From cards">From cards</el-option>
            </el-tooltip>
            <el-tooltip content="Select from a grid of letter pairs" placement="right">
                <el-option value="From custom">From custom</el-option>
            </el-tooltip>
        </el-select>

        <!-- PIECE TYPE => ONE PAIR => FROM ALL PAIRS/CUSTOM => BUFFER -->
        <el-divider class="ExecSelectLine" v-if="pairSelect == 'From custom' || pairSelect == 'From all pairs'" />
        <el-select v-if="pairSelect == 'From custom' || pairSelect == 'From all pairs'"
                   v-model="buffer" size="large" style="width: 80px;">
            <el-option v-for="(buffer, index) in (pieceType == 1 ? cornerBuffers : edgeBuffers)" :label="buffer" :value="index">{{ buffer }}</el-option>
        </el-select>

        <el-divider class="ExecSelectLine" v-if="pairSelect == 'From sheet' || pairSelect == 'From cards' || pairSelect == 'From custom'" />
        <div v-if="pairSelect == 'From sheet' || pairSelect == 'From cards' || pairSelect == 'From custom'">
            <!-- PIECE TYPE => ONE PAIR => FROM SHEET => [_______] -->
            <div v-if="pairSelect == 'From sheet'">
                <el-select v-if="getValidSheets().length > 0" v-model="pairSelectSheetID"
                           size="large" style="width: 250px;">
                    <el-option v-for="sheet in getValidSheets()" :label="sheet.name" :value="sheet.id">{{sheet.name}}</el-option>
                </el-select>
                <div v-else>
                    No valid sheets
                </div>
            </div>
            <!-- PIECE TYPE => ONE PAIR => FROM CARDS => [_______] -->
            <div v-if="pairSelect == 'From cards'">
                <el-select v-if="getValidCardDecks().length > 0" v-model="pairSelectSheetID"
                           size="large" style="width: 250px;">
                    <el-option v-for="sheet in getValidCardDecks()" :label="sheet.name" :value="sheet.id">{{sheet.name}}</el-option>
                </el-select>
                <div v-else>
                    No valid card decks
                </div>
            </div>
            <!-- PIECE TYPE => ONE PAIR => FROM CUSTOM => [_] -->
            <el-button v-if="pairSelect == 'From custom'" type="primary" style="height: 40px;" @click="editCustomPairButtonClicked()">
                <el-icon :size="25"><Edit /></el-icon>
            </el-button>
        </div>
    </div>

    <hr />


    <el-drawer v-model="editingCustomPairs"
               :title="'Select letter pairs to practice: ' + getSelectedCellCount().toString() + '/' + possibleCustomPairs.toString()"
               size="95%"
               direction="rtl"
               body-class="drawer-body"
               :before-close="handleCustomPairClose">
        <SheetGrid :sheet="customSheet.value"
                   :formatEmpty="true"
                   :fullLineSelection="true"
                   :key="customSheet.value"
                   @update:selected-cells="onCustomPairsClicked"
                   ref="gridRef"
                   style="height: 100%; width: 100%;" />
    </el-drawer>
</template>

<style>

	#ExecSelect {
		justify-self: start;
		align-items: center;
		height: 10vh;
		min-width: 100%;
		display: flex;
		flex-direction: row;
		gap: 10px;
		padding-inline: 20px;
		padding-bottom: 20px;
	}

    .ExecSelectLine {
        border-width: 2px;
        width: 100px;
    }

    #CustomExecPairGrid {
        height: 75vh;
        width: 95vw;
        position: absolute;
        left: 2.5vw;
        top: 7vh;
        transform: translate(0vw, -100vh);
        z-index: 20;
        border-radius: 10px;
    }
</style>