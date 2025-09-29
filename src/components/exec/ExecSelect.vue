<script setup>
    import { computed, watch, ref, reactive, nextTick } from "vue"
    import SheetGrid from '@/components/SheetGrid.vue'
    import { allEdgePairs, allCornerPairs} from '@/helpers/pairs.js'


    import { useSheetStore } from '@/stores/SheetStore'
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    import { useCardStore } from '@/stores/CardStore'
    const cardStore = useCardStore()
    cardStore.loadState()
    import { useSettingsStore } from '@/stores/SettingsStore'
    const settingsStore = useSettingsStore()
    settingsStore.loadState()

    const emit = defineEmits(['update:on-selected'])
    defineExpose({
        selectionFinished
    })

    function resetValues() {
        modeValue.value = -1
        pairMode.value = -1
        pairModeSheetID.value = -1
        scrambleMode.value = -1
        customSheet.value = {}
    }

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
    const pieceTypeSelected = computed({
        get: () => pieceType.value >= 0
    })

    const modeValue = ref(-1)
    const mode = computed({
        get: () => modeValue.value,
        set: (newValue) => {
            if (newValue !== modeValue.value) {
                resetValues()
            }
            modeValue.value = newValue
        }
    })
    const modeSelected = computed({
        get: () => pieceTypeSelected.value && mode.value == 1
    })

    const pairModeValue = ref(-1)
    const pairMode = computed({
        get: () => pairModeValue.value,
        set: (newValue) => {
            pairModeValue.value = newValue

            pairModeSheetID.value = -1
            scrambleMode.value = -1

            if (newValue == 3) {
                highlightedCells.value = []
                generateCustomPairSheet()
            }
        }
    })
    const pairModeSheetID = ref(-1)
    const pairModeSelected = computed({
        get: () => modeSelected.value &&
            (pairMode.value == 0 ||
            (pairMode.value == 1 && pairModeSheetID.value >= 0) ||
            (pairMode.value == 2 && pairModeSheetID.value >= 0) ||
            (pairMode.value == 3 && highlightedCells.value.length > 0))
    })

    const scrambleModeValue = ref(-1)
    const scrambleMode = computed({
        get: () => scrambleModeValue.value,
        set: (newValue) => {
            scrambleModeValue.value = newValue

            if (selectionFinished())
                GeneratePairsAndEmit()
        }
    })
    const scrambleModeSelected = computed({
        get: () => pairModeSelected.value && scrambleMode.value >= 0
    })

    function selectionFinished() {
        return pieceType.value >= 0 && (
            mode.value == 0 ||
            mode.value == 1 && scrambleModeSelected.value)
    }

    function GeneratePairsAndEmit() {
        let pairs = []
        switch (Number(pairMode.value)) {
            case 0: //All pairs
                if (pieceType.value === 1)
                    pairs = allCornerPairs
                else
                    pairs = allEdgePairs
                break
            case 1: //All pairs from sheet
                const sheet = sheetStore.getSheet(pairModeSheetID.value)
                for (var y = 0; y < sheet.yHeadings.length; y++) {
                    for (var x = 0; x < sheet.xHeadings.length; x++) {
                        if (sheet.grid[y][x] !== "") {
                            pairs.push(sheet.xHeadings.split('')[x] + sheet.yHeadings.split('')[y])
                        }
                    }
                }
                break
            case 2: //All pairs from cards
                const cards = cardStore.cards
                    .filter((card) => card.reference.sheetID == pairModeSheetID.value
                        && card.successCount > 0)
                for (var i = 0; i < cards.length; i++) {
                    pairs.push(sheetStore.coordToKey(pairModeSheetID.value, cards[i].reference.coord))
                }
                break
            case 3: //All pairs from custom
                pairs = highlightedCells.value.map((cell) => customSheet.value.grid[cell.y][cell.x])
                break
            default:
        }
        console.log(mode.value === 0)
        console.log(pairs)
        console.log(Number(pieceType.value))
        console.log(scrambleMode.value)
        emit('update:on-selected', mode.value == 0, pairs, Number(pieceType.value), scrambleMode.value == 0)
    }
    watch(selectionFinished, () => {
        if (selectionFinished()) {
            GeneratePairsAndEmit()
        }
    })

    function getValidCardDecks() {
        const out = [
            ...new Set(
                cardStore.cards
                    .filter((card) => card.successCount > 0)
                    .map((card) => card.reference.sheetID),
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
    const highlightedCells = ref([])
    function onCustomPairClicked(value) {
        if (customSheet.value.grid[value.x][value.y] === "") {
            return
        }
        if (highlightedCells.value.some(cell => cell.x === value.x && cell.y === value.y)) {
            //If it already includes it, remove it
            highlightedCells.value = highlightedCells.value.filter(cell => !(cell.x === value.x && cell.y === value.y))
        }
        else {
            //If it wasn't in it, add it
            highlightedCells.value.push(value)
        }
        gridRef.value.changeHighlightedCells(highlightedCells.value)
        if (selectionFinished()) {
            //let pairs = highlightedCells.value.map((cell) => customSheet.value.grid[cell.y][cell.x])
            GeneratePairsAndEmit()
        }
    }

    watch(
        () => settingsStore.sheets_pairorder,
        (newVal) => {
            generateCustomPairSheet()
        }
    )
</script>

<template>
    <div id="ExecSelect">
        <select style="font-size: 2rem" v-model="pieceType">
            <option value=1>Corners</option>
            <option value=2>Edges</option>
        </select>

        <div class="ExecSelectLine" v-if="pieceTypeSelected" />
        <select style="font-size: 2rem" v-model="mode" v-if="pieceTypeSelected">
            <option value="0">Full</option>
            <option value="1">One pair</option>
        </select>

        <div class="ExecSelectLine" v-if="modeSelected" />
        <select style="font-size: 2rem" v-model="pairMode" v-if="modeSelected">
            <option value="0">From all pairs</option>
            <option value="1" v-if="sheetStore.getSheetsOfType(Number(pieceType)).length > 0">From sheet</option>
            <option value="2" v-if="getValidCardDecks().length">From cards</option>
            <option value="3">From custom</option>
        </select>

        <div class="ExecSelectLine" v-if="pairMode == 1 || pairMode == 2 || pairMode == 3" />
        <select style="font-size: 2rem" v-model="pairModeSheetID" v-if="pairMode == 1">
            <option v-for="sheet in sheetStore.getSheetsOfType(Number(pieceType))"
                    :value="sheet.id">
                {{sheet.name}}
            </option>
        </select>
        <select style="font-size: 2rem" v-model="pairModeSheetID" v-if="pairMode == 2">
            <option v-for="sheet in getValidCardDecks()"
                    :value="sheet.id">
                {{sheet.name}}
            </option>
        </select>
        <div style="display:flex; justify-content: center;" v-if="pairMode == 3">
            <img @click="editingCustomPairs = !editingCustomPairs;
                 nextTick(()=> {if(gridRef){gridRef.changeHighlightedCells(highlightedCells)}})"
            src="@/assets/edit.svg"
            :class="['editButton', editingCustomPairs ? 'editButtonSelected': '']" />
        </div>

        <div class="ExecSelectLine" v-if="pairModeSelected" />
        <select style="font-size: 2rem" v-model="scrambleMode" v-if="pairModeSelected">
            <option value="0">With scramble</option>
            <option value="1">No scramble</option>
        </select>
    </div>

    <SheetGrid v-if="editingCustomPairs === true && pairMode == 3"
               style="height:83vh;"
               :sheet="customSheet.value"
               :key="customSheet.value"
               :formatEmpty="true" :fullLineSelection="true"
               ref="gridRef"
               @update:selected-cell="onCustomPairClicked"/>
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