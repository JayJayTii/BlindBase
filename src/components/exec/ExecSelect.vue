<script setup>
    import { computed, watch, ref, reactive, nextTick, onMounted, onUnmounted} from "vue"
    import SheetGrid from '@/components/SheetGrid.vue'
    import { allEdgePairs, allCornerPairs } from '@/helpers/pairs.js'
    import { getFilledCells } from '@/helpers/sheets.js'

    import { useSheetStore } from '@/stores/SheetStore'
    const sheetStore = useSheetStore()
    import { useCardStore } from '@/stores/CardStore'
    const cardStore = useCardStore()
    sheetStore.loadState()
    cardStore.loadState()

    const emit = defineEmits(['update:on-selected'])

    function resetValues() {
        modeValue.value = ""
        pairSelect.value = ""
        pairSelectSheetID.value = -1
        customSheet.value = {}
    }

    //Corners or Edges
    const pieceTypeValue = ref(-1)
    const pieceType = computed({
        get: () => pieceTypeValue.value,
        set: (newValue) => {
            if (newValue !== pieceTypeValue.value) {
                resetValues()
            }
            pieceTypeValue.value = newValue
        }
    })
    const pieceTypeSelected = computed({get: () => pieceType.value != -1 })

    //Whole or One pair
    const modeValue = ref("")
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
    const pairSelectValue = ref("")
    const pairSelect = computed({
        get: () => pairSelectValue.value,
        set: (newValue) => {
            pairSelectValue.value = newValue
            pairSelectSheetID.value = -1

            if (newValue == "From sheet") {
                pairSelectSheetID.value = sheetStore.getSheetsOfType(Number(pieceType.value))[0].id
            }
            else if (newValue == "From cards") {
                pairSelectSheetID.value = getValidCardDecks()[0].id
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

    function GeneratePairsAndEmit() {
        if(!selectionFinished.value)
            return
        let pairs = []
        switch (pairSelect.value) {
            case "From all pairs":
                pairs = (Number(pieceType.value) === 1) ? allCornerPairs : allEdgePairs
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
                break
            case "From cards":
                const cards = cardStore.cards
                    .filter((card) => card.sheetID == pairSelectSheetID.value
                        && card.successCount > 0)
                for (var i = 0; i < cards.length; i++) {
                    pairs.push(sheetStore.coordToKey(pairSelectSheetID.value, cards[i].coord))
                }
                break
            case "From custom":
                for (var i = 0; i < 24; i++) {
                    for (var j = 0; j < 24; j++) {
                        if(selectedCells.value[i][j])
                            pairs.push(customSheet.value.grid[i][j])
                    }
                }
                break
            default:
        }

        emit('update:on-selected', mode.value == "Whole", pairs, Number(pieceType.value))
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
        return out.filter((sheet) => sheet.type === Number(pieceType.value))
    }

    //customSheet is the sheet containing all possible letter pairs which the user selects from
    const customSheet = reactive({})
    customSheet.value = {}
    function generateCustomPairSheet() {
        let grid = Array.from({ length: 24 }, () =>
            Array.from({ length: 24 }, () => ''),
        )
        const allPairs = pieceType.value == 1 ? allCornerPairs : allEdgePairs
        //Place all possible pairs into the custom sheet
        for (var i = 0; i < allPairs.length; i++) {
            const pair = allPairs[i]
            const y = pair.charCodeAt(0) - 'A'.charCodeAt(0)
            const x = pair.charCodeAt(1) - 'A'.charCodeAt(0)
            grid[y][x] = pair
        }

        customSheet.value = {
            xHeadings: 'ABCDEFGHIJKLMNOPQRSTUVWX',
            yHeadings: 'ABCDEFGHIJKLMNOPQRSTUVWX',
            grid: grid,
        }
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
            if (getSelectedCellCount() > 0)
                GeneratePairsAndEmit()
        })
    }
    nextTick(() => { UpdateSelectedCells() })


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
        const grid = document.getElementById("CustomExecPairGrid")
        grid.classList.remove('AnimatedGridOpen','AnimatedGridClose')
        if (editingCustomPairs.value)
            grid.classList.add('AnimatedGridOpen');
        else
            grid.classList.add('AnimatedGridClose');
    }


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
        <select v-model="pieceType" title="Piece type in the solve" style="font-size: 2rem; text-align: center;">
            <option value=1>Corners</option>
            <option value=2>Edges</option>
        </select>

        <div class="ExecSelectLine" v-if="pieceTypeSelected" />
        <select v-if="pieceTypeSelected" title="Amount of that piece type" v-model="mode" style="font-size: 2rem; text-align: center;">
            <option>Whole</option>
            <option>One pair</option>
        </select>

        <div class="ExecSelectLine" v-if="mode == 'One pair'" />
        <select v-if="mode == 'One pair'" title="Select letter pairs from..." v-model="pairSelect" style="font-size: 2rem; text-align: center;">
            <option>From all pairs</option>
            <option v-if="sheetStore.getSheetsOfType(Number(pieceType)).length > 0">From sheet</option>
            <option v-if="getValidCardDecks().length">From cards</option>
            <option>From custom</option>
        </select>

        <div class="ExecSelectLine" v-if="pairSelect == 'From sheet' || pairSelect == 'From cards' || pairSelect == 'From custom'" />
        <div v-if="pairSelect == 'From sheet' || pairSelect == 'From cards' || pairSelect == 'From custom'">
            <select v-if="pairSelect == 'From sheet'" title="Which sheet?" v-model="pairSelectSheetID" style="font-size: 2rem;text-align:center;">
                <option v-for="sheet in sheetStore.getSheetsOfType(Number(pieceType))"
                        :value="sheet.id">
                    '{{sheet.name}}'
                </option>
            </select>
            <select v-if="pairSelect == 'From cards'" title="Which card deck?" v-model="pairSelectSheetID" style="font-size: 2rem;text-align:center;">
                <option v-for="sheet in getValidCardDecks()"
                        :value="sheet.id">
                    '{{sheet.name}}'
                </option>
            </select>
            <div v-if="pairSelect == 'From custom'" title="Select from a grid of letter pairs" style="display:flex; justify-content: center;">
                <img @click="editCustomPairButtonClicked(); UpdateSelectedCells()"
                     src="@/assets/icons/edit.svg"
                     :class="['CustomButton', editingCustomPairs ? 'CustomButtonHovered': '']"
            :style="{height: '45px', backgroundColor: (editingCustomPairs ?  'var(--brand-400)' : '')}" />
            </div>
        </div>
    </div>

    <SheetGrid v-if="pairSelect == 'From custom'"
               id="CustomExecPairGrid"
               :sheet="customSheet.value"
               :key="customSheet.value"
               :formatEmpty="true" :fullLineSelection="true"
               ref="gridRef"
               @update:selected-cells="onCustomPairsClicked"/>
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
        border: 2px solid var(--brand-700);
    }

    .ExecSelectLine {
        border-block-end: 5px solid var(--grey-400);
        border-radius: 5px;
        max-width: 100px;
        min-width: 100px;
    }

    #CustomExecPairGrid {
        height: 75vh;
        width: 95vw;
        position: absolute;
        left: 2.5vw;
        top: 10vh;
        transform: translate(0vw, -100vh);
        z-index: 20;
        border-radius: 10px;
    }
</style>