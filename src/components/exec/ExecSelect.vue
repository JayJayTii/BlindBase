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
        scrambleMode.value = -1
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

    //Full or one pair
    const modeValue = ref("")
    const mode = computed({
        get: () => modeValue.value,
        set: (newValue) => {
            if (newValue !== modeValue.value)
                resetValues()

            modeValue.value = newValue

            if (newValue == "Full")
                GeneratePairsAndEmit()
        }
    })
    const modeSelected = computed({ get: () => (mode.value != "") })

    //From all, from sheets, from cards, from custom
    const pairSelectValue = ref("")
    const pairSelect = computed({
        get: () => pairSelectValue.value,
        set: (newValue) => {
            pairSelectValue.value = newValue

            pairSelectSheetID.value = -1
            scrambleMode.value = -1

            if (newValue == "From custom") {
                SelectNone()
                generateCustomPairSheet()
            }
        }
    })
    const pairSelectSelected = computed({ get: () => (pairSelect.value != "")})
    const pairSelectSheetIDValue = ref(-1)
    const pairSelectSheetID = computed({
        get: () => pairSelectSheetIDValue.value,
        set: (newValue) => {
            const oldValue = pairSelectSheetIDValue.value
            pairSelectSheetIDValue.value = newValue
            if (newValue != -1 && oldValue != newValue && scrambleMode.value != -1) {
                console.log("emittingoldValue")
                GeneratePairsAndEmit()
            }
        }
    })

    const showScrambleModeSelect = computed({
        get: () => pieceType.value != -1
            && mode.value == "One pair"
            && (pairSelect.value == 'From all pairs'
                || (pairSelect.value == "From sheet" && pairSelectSheetID.value != -1)
                || (pairSelect.value == "From cards" && pairSelectSheetID.value != -1)
                || (pairSelect.value == "From custom" && getSelectedCellCount() > 0))
    })

    const scrambleModeValue = ref(-1)
    const scrambleMode = computed({
        get: () => scrambleModeValue.value,
        set: (newValue) => {
            scrambleModeValue.value = newValue

            if(scrambleMode.value > -1)
                GeneratePairsAndEmit()
        }
    })

    const selectionFinished = computed({
        get: () => pieceType.value != -1
            && ((mode.value == "Full")
                || (mode.value == "One pair"
                    && (pairSelect.value == 'From all pairs'
                        || (pairSelect.value == "From sheet" && pairSelectSheetID.value != -1)
                        || (pairSelect.value == "From cards" && pairSelectSheetID.value != -1)
                        || (pairSelect.value == "From custom" && getSelectedCellCount() > 0))
                    && scrambleMode.value != -1)
               )      
    })

    function GeneratePairsAndEmit() {
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
        emit('update:on-selected', mode.value == "Full", pairs, Number(pieceType.value), scrambleMode.value == 0)
    }
    
    function getValidCardDecks() {
        const out = [
            ...new Set(
                cardStore.cards
                    .filter((card) => card.successCount > 0)
                    .map((card) => card.sheetID),
            ),
        ].map((sheetID) => sheetStore.getSheet(sheetID))
        return out.filter((sheet) => sheet.type === Number(pieceType.value)) //Filter for image sheets
    }

    const customSheet = reactive({})
    customSheet.value = {}
    function generateCustomPairSheet() {
        let grid = Array.from({ length: 24 }, () =>
            Array.from({ length: 24 }, () => ''),
        )
        const allPairs = pieceType.value == 1 ? allCornerPairs : allEdgePairs

        for (var i = 0; i < allPairs.length; i++) {
            const pair = allPairs[i]
            const y = pair.charCodeAt(0) - 'A'.charCodeAt(0)
            const x = pair.charCodeAt(1) - 'A'.charCodeAt(0)
            grid[x][y] = pair
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
        const formattedSelectedCells = selectedCells.value.map((row, y) =>
            row.map((cell, x) => { return cell ? { x: x, y: y } : null })
                .filter(cell => cell != null)).flat()
        nextTick(() => {
            if (gridRef.value)
                gridRef.value.changeHighlightedCells(formattedSelectedCells)
            if (getSelectedCellCount() > 0 && scrambleMode.value != -1)
                GeneratePairsAndEmit()
        })
    }
    nextTick(() => { UpdateSelectedCells() })

    function getSelectedCellCount() {
        let count = 0
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < 24; j++) {
                count += selectedCells.value[i][j] ? 1 : 0
            }
        }
        return count
    }
    function SelectAll() {
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < 24; j++) {
                selectedCells.value[i][j] = (customSheet.value.grid[i][j] != "")
            }
        }
        UpdateSelectedCells()
    }
    function SelectNone() {
        selectedCells.value = Array.from({ length: 24 }, () => Array.from({ length: 24 }, () => false),)
        UpdateSelectedCells()
    }
    function onCustomPairClicked(coord) {
        if (customSheet.value.grid[coord.y][coord.x] === "")
            return //Empty cell, not allowed!

        selectedCells.value[coord.y][coord.x] = !selectedCells.value[coord.y][coord.x]
        UpdateSelectedCells()
    }
    function lineClicked(isCol, index) {
        let lineFilled = true
        for (var i = 0; i < customSheet.value.grid.length; i++) {
            if (customSheet.value.grid[isCol ? i : index][isCol ? index : i] != ''
                && !selectedCells.value[isCol ? i : index][isCol ? index : i]) {
                lineFilled = false
                break
            }
        }
        if (lineFilled) { //Remove line
            for (var i = 0; i < 24; i++) {
                selectedCells.value[isCol ? i : index][isCol ? index : i] = false
            }
            UpdateSelectedCells()
            return
        }
        //Else add line
        for (var i = 0; i < 24; i++) {
            const newValue = (customSheet.value.grid[isCol ? i : index][isCol ? index : i] != "")
            selectedCells.value[isCol ? i : index][isCol ? index : i] = newValue
        }
        UpdateSelectedCells()
    }
    function sheetClicked() {
        for (var i = 0; i < customSheet.value.grid.length; i++) {
            for (var j = 0; j < customSheet.value.grid[0].length; j++) {
                if (customSheet.value.grid[i][j] != '' && !selectedCells.value[i][j]) {
                    //If any cells are not selected, it will always end up as SelectAll, so just do it now
                    SelectAll()
                    return
                }
            }
        }
        SelectNone()
    }

    function handleKeydown(event) {
        //Don't want to block the timer's space input!
        if (event.code === 'Space') {
            event.preventDefault()
        }

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
        <select v-model="pieceType" style="font-size: 2rem; text-align: center;">
            <option value=1>Corners</option>
            <option value=2>Edges</option>
        </select>

        <div class="ExecSelectLine" v-if="pieceTypeSelected" />
        <select v-if="pieceTypeSelected" v-model="mode" style="font-size: 2rem; text-align: center;">
            <option>Full</option>
            <option>One pair</option>
        </select>

        <div class="ExecSelectLine" v-if="mode == 'One pair'" />
        <select v-if="mode == 'One pair'" v-model="pairSelect" style="font-size: 2rem; text-align: center;">
            <option>From all pairs</option>
            <option v-if="sheetStore.getSheetsOfType(Number(pieceType)).length > 0">From sheet</option>
            <option v-if="getValidCardDecks().length">From cards</option>
            <option>From custom</option>
        </select>

        <div class="ExecSelectLine" v-if="pairSelect == 'From sheet' || pairSelect == 'From cards' || pairSelect == 'From custom'" />
        <div v-if="pairSelect == 'From sheet' || pairSelect == 'From cards' || pairSelect == 'From custom'">
            <select v-if="pairSelect == 'From sheet'" v-model="pairSelectSheetID" style="font-size: 2rem;text-align:center;">
                <option v-for="sheet in sheetStore.getSheetsOfType(Number(pieceType))"
                        :value="sheet.id">
                    '{{sheet.name}}'
                </option>
            </select>
            <select v-if="pairSelect == 'From cards'" v-model="pairSelectSheetID" style="font-size: 2rem;text-align:center;">
                <option v-for="sheet in getValidCardDecks()"
                        :value="sheet.id">
                    '{{sheet.name}}'
                </option>
            </select>
            <div v-if="pairSelect == 'From custom'" style="display:flex; justify-content: center;">
                <img @click="editingCustomPairs = !editingCustomPairs; UpdateSelectedCells()"
                     src="@/assets/edit.svg"
                     :class="['CustomButton', editingCustomPairs ? 'CustomButtonHovered': '']"
                     style="height: 45px;" />
            </div>
        </div>

        <div class="ExecSelectLine" v-if="showScrambleModeSelect" />
        <select style="font-size: 2rem; text-align: center;" v-model="scrambleMode" v-if="showScrambleModeSelect">
            <option value="0">With scramble</option>
            <option value="1">No scramble</option>
        </select>
    </div>

    <SheetGrid v-if="editingCustomPairs === true && pairSelect == 'From custom'"
               style="height:83vh;"
               :sheet="customSheet.value"
               :key="customSheet.value"
               :formatEmpty="true" :fullLineSelection="true"
               ref="gridRef"
               @update:selected-cell="onCustomPairClicked"
               @update:full-column-selected="lineClicked(true, $event)"
               @update:full-row-selected="lineClicked(false, $event)"
               @update:full-sheet-selected="sheetClicked"/>
</template>

<style>

    #ExecSelect {
        justify-self: center;
        align-items: center;
        height: 10vh;
        width: 97.5vw;
        display: grid;
        grid-template-columns: 0.2fr 1fr 0.2fr 1fr 0.2fr 1fr 0.2fr 1fr 0.2fr;
        gap: 10px;
    }

    .ExecSelectLine{
        border-block-end: 5px solid var(--brand-700);
        border-radius:5px;
    }
</style>