<script setup>
    import { nextTick, watch, computed, ref, onMounted, onUnmounted } from "vue"
    import { allEdgePairs, allCornerPairs, allPossiblePairs, allLetterPairs } from '@/helpers/pairs.js'
    import SheetGrid from '@/components/SheetGrid.vue'
    import { useMemoStore, modes } from '@/stores/MemoStore.js'
    const memoStore = useMemoStore()
    import { useSheetStore } from '@/stores/SheetStore'
    const sheetStore = useSheetStore()
    import { useCardStore } from '@/stores/CardStore'
    const cardStore = useCardStore()
    import { useSettingsStore } from '@/stores/SettingsStore'
    useSettingsStore().loadState()

    const props = defineProps({
        stage: Number, //Using v-show, so must suppress things when not in the right stage of memo
    })

    const emit = defineEmits(['startRun'])

    const modeValue = ref("")
    const mode = computed({
        get: () => modeValue.value,
        set: (newValue) => {
            modeValue.value = newValue
            if (newValue === "Multiblind" && cubes.value < 2)
                cubes.value = 2

            //Always clear custom pair settings
            generateCustomPairSheet()
            highlightedCells.value = []
            editingCustomPairs.value = false
        }
    })
    const modeSelected = computed({
        get: () => mode.value != ""
    })

    const cubesValue = ref(2)
    const cubes = computed({
        get: () => cubesValue.value,
        set: (newValue) => {
            cubesValue.value = newValue
            if (mode.value === "Multiblind" && newValue < 2)
                cubesValue.value = 2
            else if (mode.value === "Multiblind" && newValue > 200)
                cubesValue.value = 200
        }
    })

    const pairSelectValue = ref(-1)
    const pairSelect = computed({
        get: () => pairSelectValue.value,
        set: (newValue) => {
            pairSelectValue.value = newValue
            if (newValue === 1) //All pairs in sheet
                pairSelectSheet.value = sheetStore.getSheetsOfType(3)[0]
            else if (newValue === 2) //All cards for a sheet
                pairSelectSheet.value = GetSheetsWithLearnedCards()[0]
            else if (newValue === 3) {
                highlightedCells.value = []
                generateCustomPairSheet()
            }
        }
    })
    //Also includes selection of sheets/cards/custom pairs
    const pairSelectFinished = computed({
        get: () => (pairSelect.value > -1 && pairSelect.value < 3)
                    || pairSelect.value === 3 && highlightedCells.value.length > 0
    })

    //Includes both "From sheet" and "From cards" because they both take from alg-sheets
    const pairSelectSheetValue = ref({})
    const pairSelectSheet = computed({
        get: () => pairSelectSheetValue.value,
        set: (newValue) => {
            pairSelectSheetValue.value = newValue
        }
    })


    function GetSheetsWithLearnedCards() {
        //All unique sheet with learning or due cards
        const IDs = Array.from(new Set(cardStore.cards.filter((card) => card.successCount > 0).map((card) => card.sheetID)))
        //Convert those IDs to sheets and filter for image sheets
        const sheets = IDs.map((sheetID) => sheetStore.getSheet(sheetID)).filter((sheet) => sheet.type === 3)
        return sheets
    }
    function GetLearnedCards() {
        const out = cardStore.cards.filter((card) => card.successCount > 0)
        //Filter for image sheets
        return out.filter((card) => sheetStore.getSheet(card.sheetID).type === 3) 
    }

    const editingCustomPairs = ref(false)
    const gridRef = ref(null)
    const highlightedCells = ref([])
    const customSheet = ref({}) //Contains all the possible letter pairs that the user can select to practice from
    function generateCustomPairSheet() {
        let grid = Array.from({ length: 24 }, () => Array.from({ length: 24 }, () => ''))
        customSheet.value = {
            xHeadings: 'ABCDEFGHIJKLMNOPQRSTUVWX',
            yHeadings: 'ABCDEFGHIJKLMNOPQRSTUVWX',
        }
        let customPairOptions = []
        if (useSettingsStore().settings.memo_includeimpossiblepairs)
            customPairOptions = allLetterPairs
        else if (mode.value == "Corners")
            customPairOptions = allCornerPairs
        else if (mode.value == "Edges")
            customPairOptions = allEdgePairs
        else
            customPairOptions = allPossiblePairs

        for (const pairOption of customPairOptions) {
            const y = pairOption.charCodeAt(0) - 'A'.charCodeAt(0)
            const x = pairOption.charCodeAt(1) - 'A'.charCodeAt(0)
            grid[y][x] = pairOption
        }
        customSheet.value.grid = grid
    }

    function onCustomPairsClicked(values, create) {
        if(create)
            highlightedCells.value = highlightedCells.value.concat(values);
        else {
            const newHighlightedCells = []
            for (const cell of highlightedCells.value) {
                if(!values.some((cellDiff) => cellDiff.x == cell.x && cellDiff.y == cell.y))
                    newHighlightedCells.push(cell)
            }
            highlightedCells.value = newHighlightedCells
        }
        gridRef.value.changeHighlightedCells(highlightedCells.value)
    }

    function getPossiblePairs() {
        let possiblePairs = []
        switch (pairSelect.value) {
            case 0: //From all pairs
                return (useSettingsStore().settings.memo_includeimpossiblepairs ? allLetterPairs
                    : (mode.value == "Corners") ? allCornerPairs : ((mode.value == "Edges") ? allEdgePairs : allPossiblePairs))

            case 1: //From sheet
                for (var y = 0; y < 24; y++) {
                    for (var x = 0; x < 24; x++) {
                        if (pairSelectSheet.value.grid[y][x] == '')
                            continue
                        possiblePairs.push(pairSelectSheet.value.xHeadings[x] + pairSelectSheet.value.yHeadings[y])
                    }
                }
                return possiblePairs

            case 2: //From cards (Get learned cards from selected sheet, then convert to letter pair)
                return GetLearnedCards()
                    .filter(card => card.sheetID === pairSelectSheet.value.id)
                    .map(card => (pairSelectSheet.value.xHeadings[card.coord.x] + pairSelectSheet.value.yHeadings[card.coord.y]))

            case 3: //From custom (convert highlighted cell coords to letter pairs)
                const letters = "ABCDEFGHIJKLMNOPQRSTUVWX"
                return highlightedCells.value.map(coord => letters[coord.y] + letters[coord.x])
        }
    }

    function StartRun() {
        if (mode.value !== "Multiblind")
            cubes.value = 1
        const possiblePairs = getPossiblePairs()
        emit('startRun', {
            mode: mode.value,
            cubes: cubes.value,
            pairSelect: pairSelect.value,
            pairSelectSheet: pairSelectSheet.value,
            possiblePairs: possiblePairs,
        })
        editingCustomPairs.value = false //Hide grid for when run is finished
    }


    function handleKeydown(event) {
        if(props.stage !== 0) 
            return //Not active right now

        if ((event.code === 'Enter' || event.code === 'NumpadEnter') && pairSelectFinished.value)
            StartRun()
    }
    onMounted(() => { window.addEventListener('keydown', handleKeydown) })
    onUnmounted(() => { window.removeEventListener('keydown', handleKeydown) })
</script>

<template>
    <div id="MemoSelect">
        <div class="MemoViewHeader">
            <div style="display:flex;flex-direction:column;" title="Memo mode">
                <select style="font-size: 2rem; text-align:center;" v-model="mode">
                    <option v-for="mode in modes">{{mode}}</option>
                </select>
            </div>
        </div>
        <div class="MemoSelectLine" v-if="modeSelected" />

        <div class="MemoViewHeader" v-if="mode === 'Multiblind'">
            <input type="number" v-model="cubes" min="2" max="200"
                   style="font-size: 2rem; height:2.5rem; width: 80px; align-self:center; text-align: end;" />
            cubes
        </div>
        <div class="MemoSelectLine" v-if="mode === 'Multiblind'" />

        <div class="MemoViewHeader" title="Select letter pairs from..." v-if="modeSelected">
            <select v-model="pairSelect" style="font-size: 2rem;text-align:center;">
                <option :value="0">From all pairs</option>
                <option v-if="sheetStore.getSheetsOfType(3).length > 0" :value="1">From sheet</option>
                <option v-if="GetLearnedCards().length > 0" :value="2">From cards</option>
                <option :value="3">From custom</option>
            </select>
        </div>

        <div class="MemoSelectLine" v-if="pairSelect > 0" />
        <div class="MemoViewHeader"  title="Which sheet?" v-if="pairSelect === 1">
            <select v-model="pairSelectSheet" style="font-size: 2rem;text-align:center;">
                <option v-for="sheetOption in sheetStore.getSheetsOfType(3)" :value="sheetOption">'{{ sheetOption.name }}'</option>
            </select>
        </div>
        <div class="MemoViewHeader" title="Which card deck?" v-if="pairSelect === 2">
            <select v-model="pairSelectSheet" style="font-size: 2rem">
                <option v-for="sheetOption in GetSheetsWithLearnedCards()" :value="sheetOption">'{{ sheetOption.name }}'</option>
            </select>
        </div>
        <div class="MemoViewHeader" title="Select from a grid of letter pairs" v-if="pairSelect === 3">
            <img @click="editingCustomPairs = !editingCustomPairs;
                 nextTick(()=> {if(gridRef){gridRef.changeHighlightedCells(highlightedCells)}})"
            src="@/assets/icons/edit.svg"
            :class="['CustomButton', editingCustomPairs ? 'CustomButtonHovered': '']"
            style="height: 45px;"/>
        </div>
        <div class="MemoSelectLine" v-if="pairSelectFinished && pairSelect == 0" />
        <div class="MemoViewHeader" v-if="pairSelectFinished && pairSelect == 0">
            Highscore: {{ memoStore.GetHighscore(mode) }}
        </div>
    </div>

    <SheetGrid v-if="editingCustomPairs === true && pairSelect == 3"
               style="height: 83vh;"
               :sheet="customSheet"
               :key="customSheet.value"
               :formatEmpty="true" :fullLineSelection="true"
               ref="gridRef"
               @update:selected-cells="onCustomPairsClicked" />

    <img v-if="pairSelectFinished"
         src="@/assets/icons/arrow-right-long.svg"
         :class="['CustomButton','NextButton']"
         @click="StartRun()" />
</template>

<style>
    #MemoSelect {
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
    .MemoViewHeader {
        display: flex;
        flex-direction: row;
        gap: 10px;
        justify-content: center;
        font-size: 2rem;
    }

    .MemoSelectLine {
        border-block-end: 5px solid var(--grey-400);
        border-radius: 5px;
        max-width: 100px;
        min-width: 100px;
    }
</style>