<script setup>
    import { nextTick, watch, computed, ref, onMounted, onUnmounted } from "vue"
    import { allEdgePairs, allCornerPairs, allPossiblePairs, allLetterPairs } from '@/helpers/pairs.js'
    import SheetGrid from '@/components/SheetGrid.vue'
    import { useMemoStore, modes, modesDesc } from '@/stores/MemoStore.js'
    const memoStore = useMemoStore()
    import { useSheetStore } from '@/stores/SheetStore'
    const sheetStore = useSheetStore()
    import { useCardStore } from '@/stores/CardStore'
    const cardStore = useCardStore()
    import { useSettingsStore } from '@/stores/SettingsStore'
    useSettingsStore().loadState()

    const emit = defineEmits(['restartRun', 'cancelRun'])

    const modeValue = ref("Corners")
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
            RestartRun()
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
            if(mode.value === "Multiblind") {
                if (newValue < 2)
                    cubesValue.value = 2
                else if (newValue > 200)
                    cubesValue.value = 200
                RestartRun()
            }
        }
    })

    const pairSelectValue = ref("From all pairs")
    const pairSelect = computed({
        get: () => pairSelectValue.value,
        set: (newValue) => {
            pairSelectValue.value = newValue
            if (newValue === "From sheet")
                pairSelectSheet.value = sheetStore.getSheetsOfType(3)[0]
            else if (newValue === "From cards")
                pairSelectSheet.value = GetSheetsWithLearnedCards()[0]
            else if (newValue === "From custom") {
                highlightedCells.value = []
                generateCustomPairSheet()
            }
            editingCustomPairs.value = false
            RestartRun()
        }
    })

    //Includes both "From sheet" and "From cards" because they both take from alg-sheets
    const pairSelectSheetValue = ref(null)
    const pairSelectSheet = computed({
        get: () => pairSelectSheetValue.value,
        set: (newValue) => {
            pairSelectSheetValue.value = newValue
            RestartRun()
        }
    })

    const pairSelectFinished = computed({
        get: () =>  pairSelect.value == "From all pairs"
                    || pairSelect.value == "From sheet" && pairSelectSheet.value
                    || pairSelect.value == "From cards" && pairSelectSheet.value
                    || pairSelect.value == "From custom" && highlightedCells.value.length > 0
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

    const editingCustomPairsValue = ref(false)
    const editingCustomPairs = computed({
        get: () => editingCustomPairsValue.value,
        set: (newValue) => {
            editingCustomPairsValue.value = newValue
            const grid = document.getElementById("CustomPairGrid")
            if(newValue === false && grid)
                grid.classList.remove('AnimatedGridOpen','AnimatedGridClose')
        }
    })

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
        RestartRun()
    }

    function getPossiblePairs() {
        let possiblePairs = []
        switch (pairSelect.value) {
            case "From all pairs":
                return (useSettingsStore().settings.memo_includeimpossiblepairs ? allLetterPairs
                    : (mode.value == "Corners") ? allCornerPairs : ((mode.value == "Edges") ? allEdgePairs : allPossiblePairs))

            case "From sheet":
                for (var y = 0; y < 24; y++) {
                    for (var x = 0; x < 24; x++) {
                        if (pairSelectSheet.value.grid[y][x] == '')
                            continue
                        possiblePairs.push(pairSelectSheet.value.xHeadings[x] + pairSelectSheet.value.yHeadings[y])
                    }
                }
                return possiblePairs

            case "From cards": // Get learned cards from selected sheet, then convert to letter pair
                return GetLearnedCards()
                    .filter(card => card.sheetID === pairSelectSheet.value.id)
                    .map(card => (pairSelectSheet.value.xHeadings[card.coord.x] + pairSelectSheet.value.yHeadings[card.coord.y]))

            case "From custom": // Convert highlighted cell coords to letter pairs
                const letters = "ABCDEFGHIJKLMNOPQRSTUVWX"
                return highlightedCells.value.map(coord => letters[coord.y] + letters[coord.x])
        }
    }

    function RestartRun() {
        if(!pairSelectFinished.value) {
            emit('cancelRun')
            return
        }
        if (mode.value !== "Multiblind")
            cubes.value = 1
        const possiblePairs = getPossiblePairs()
        emit('restartRun', {
            mode: mode.value,
            cubes: cubes.value,
            pairSelect: pairSelect.value,
            pairSelectSheet: pairSelectSheet.value,
            possiblePairs: possiblePairs,
        })
    }
    RestartRun()

    function editCustomPairButtonClicked() {
        editingCustomPairs.value = !editingCustomPairs.value
        const grid = document.getElementById("CustomPairGrid")
        grid.classList.remove('AnimatedGridOpen','AnimatedGridClose')
        if (editingCustomPairs.value)
            grid.classList.add('AnimatedGridOpen');
        else
            grid.classList.add('AnimatedGridClose');
    }
</script>

<template>
    <div id="MemoSelect">
        <div class="MemoViewHeader">
            <div style="display:flex;flex-direction:column;">
                <select style="font-size: 2rem; text-align:center;" v-model="mode">
                    <option v-for="(mode, index) in modes" :title="modesDesc[index]">{{mode}}</option>
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

        <div class="MemoViewHeader" v-if="modeSelected">
            <select v-model="pairSelect" style="font-size: 2rem; text-align:center;">
                <option title="All possible letter pairs can appear">From all pairs</option>
                <option title="All letter pairs in a chosen sheet can appear">From sheet</option>
                <option title="Flashcards that have been practiced in an images card deck can appear">From cards</option>
                <option title="Select from a grid of letter pairs">From custom</option>
            </select>
        </div>

        <div class="MemoSelectLine" v-if="pairSelect != '' && pairSelect != 'From all pairs'" />
        <div class="MemoViewHeader" v-if="pairSelect == 'From sheet'">
            <div v-if="sheetStore.getSheetsOfType(3).length > 0">
                <select v-model="pairSelectSheet" style="font-size: 2rem; text-align:center;">
                    <option v-for="sheetOption in sheetStore.getSheetsOfType(3)" :value="sheetOption">'{{ sheetOption.name }}'</option>
                </select>
            </div>
            <div v-else>
                No valid sheets
            </div>
        </div>
        <div class="MemoViewHeader" v-if="pairSelect == 'From cards'">
            <div v-if="GetLearnedCards().length > 0">
                <select v-model="pairSelectSheet" style="font-size: 2rem; text-align: center;">
                    <option v-for="sheetOption in GetSheetsWithLearnedCards()" :value="sheetOption">'{{ sheetOption.name }}'</option>
                </select>
            </div>
            <div v-else>
                No valid card decks
            </div>
        </div>
        <div class="MemoViewHeader" v-if="pairSelect == 'From custom'">
            <img @click="editCustomPairButtonClicked(); nextTick(()=> {if(gridRef){gridRef.changeHighlightedCells(highlightedCells)}})"
                 src="@/assets/icons/edit.svg"
                 :class="['CustomButton', editingCustomPairs ? 'CustomButtonHovered': '']"
                 :style="{height: '45px', backgroundColor: (editingCustomPairs ?  'var(--brand-400)' : '')}" />
        </div>
        <div class="MemoSelectLine" v-if="pairSelectFinished && pairSelect == 'From all pairs'" />
        <div class="MemoViewHeader" v-if="pairSelectFinished && pairSelect == 'From all pairs'">
            Highscore: {{ memoStore.GetHighscore(mode) }}
        </div>
    </div>

    <hr />
    
    <SheetGrid v-if="pairSelect == 'From custom'"
               id="CustomPairGrid"
               :sheet="customSheet"
               :key="customSheet.value"
               :formatEmpty="true" :fullLineSelection="true"
               ref="gridRef"
               @update:selected-cells="onCustomPairsClicked" />
</template>

<style>
    #MemoSelect {
        justify-self: start;
        align-items: center;
        min-height: 10vh;
        min-width: 100%;
        display: flex;
        flex-direction: row;
        gap: 10px;
        padding-inline: 20px;
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

    #CustomPairGrid {
        height: 75vh;
        width: 95vw;
        position: absolute;
        left: 2.5vw;
        top: 10vh;
        transform: translate(0vw, -100vh);
        z-index: 20;
        border-radius: 10px;
    }

    .AnimatedGridOpen { animation: animatedGridOpen 0.2s forwards; }
    @keyframes animatedGridOpen {
        from { transform: translate(0vw, -100vh); }
        to { transform: translate(0vw, 0vh); }
    }
    .AnimatedGridClose { animation: animatedGridClose 0.2s forwards; }
    @keyframes animatedGridClose {
        from { transform: translate(0vw, 0vh); }
        to { transform: translate(0vw, -100vh); }
    }

</style>