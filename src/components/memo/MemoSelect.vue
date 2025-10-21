<script setup>
    import { computed, ref, onMounted, onUnmounted } from "vue"
    import { useMemoStore, modes } from '@/stores/MemoStore.js'
    const memoStore = useMemoStore()
    import { useSheetStore } from '@/stores/SheetStore'
    const sheetStore = useSheetStore()
    import { useCardStore } from '@/stores/CardStore'
    const cardStore = useCardStore()
    import { allEdgePairs, allCornerPairs, allPairs } from '@/helpers/pairs.js'

    const emit = defineEmits(['startRun'])

    const modeValue = ref("")
    const mode = computed({
        get: () => modeValue.value,
        set: (newValue) => {
            modeValue.value = newValue
            if (newValue === "Multiblind" && cubes.value < 2)
                cubes.value = 2
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
        }
    })
    //Also includes selection of sheets/cards/custom pairs
    const pairSelectFinished = computed({
        get: () => pairSelect.value > -1 
    })

    //Includes both "From sheet" and "From cards"
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


    function getPossiblePairs() {
        let possiblePairs = []
        switch (pairSelect.value) {
            case 0: //From all pairs
                return (mode.value == "Corners") ? allCornerPairs : ((mode.value == "Edges") ? allEdgePairs : allPairs) 
            case 1: //From sheet
                for (var y = 0; y < 24; y++) {
                    for (var x = 0; x < 24; x++) {
                        if (pairSelectSheet.value.grid[y][x] == '')
                            continue
                        possiblePairs.push(pairSelectSheet.value.xHeadings[x] + pairSelectSheet.value.yHeadings[y])
                    }
                }
                return possiblePairs
            case 2: //From cards
                //Get learned cards from selected sheet, then convert to letter pair
                return GetLearnedCards()
                    .filter(card => card.sheetID === pairSelectSheet.value.id)
                    .map(card => (pairSelectSheet.value.xHeadings[card.coord.x] + pairSelectSheet.value.yHeadings[card.coord.y]))
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
    }


    function handleKeydown(event) {
        if (event.code === 'Enter')
            StartRun()
    }
    onMounted(() => { window.addEventListener('keydown', handleKeydown) })
    onUnmounted(() => { window.removeEventListener('keydown', handleKeydown) })
</script>

<template>
    <div id="MemoSelect">
        <div class="MemoViewHeader">
            <div style="display:flex;flex-direction:column;">
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

        <div class="MemoViewHeader" v-if="modeSelected">
            <select v-model="pairSelect" style="font-size: 2rem;text-align:center;">
                <option :value="0">From all pairs</option>
                <option v-if="sheetStore.getSheetsOfType(3).length > 0" :value="1">From sheet</option>
                <option v-if="GetLearnedCards().length > 0" :value="2">From cards</option>
            </select>
        </div>

        <div class="MemoSelectLine" v-if="pairSelect > 0" />
        <div class="MemoViewHeader" v-if="pairSelect === 1">
            <select v-model="pairSelectSheet" style="font-size: 2rem;text-align:center;">
                <option v-for="sheetOption in sheetStore.getSheetsOfType(3)" :value="sheetOption">'{{ sheetOption.name }}'</option>
            </select>
        </div>
        <div class="MemoViewHeader" v-if="pairSelect === 2">
            <select v-model="pairSelectSheet" style="font-size: 2rem">
                <option v-for="sheetOption in GetSheetsWithLearnedCards()" :value="sheetOption">'{{ sheetOption.name }}'</option>
            </select>
        </div>
        <div class="MemoSelectLine" v-if="pairSelectFinished && pairSelect == 0" />
        <div class="MemoViewHeader" v-if="pairSelectFinished && pairSelect == 0">
            Highscore: {{ memoStore.GetHighscore(mode) }}
        </div>
    </div>
    <img v-if="pairSelectFinished"
         src="@/assets/arrow-right-long.svg"
         :class="['CustomButton','NextButton']"
         @click="StartRun()" />
</template>

<style>

    #MemoSelect {
        justify-self: start;
        align-items: center;
        height: 10vh;
        width: calc(100% - 20px);
        display: flex;
        flex-direction:row;
        /*grid-template-columns: auto auto auto auto auto auto auto;*/
        gap: 10px;
        transform: translate(20px,10px);
    }
    .MemoViewHeader {
        display: flex;
        flex-direction: row;
        gap: 10px;
        justify-content: center;
        font-size:2rem;
    }

    .MemoSelectLine {
        border-block-end: 5px solid var(--brand-700);
        border-radius: 5px;
        max-width: 100px;
        min-width:100px;
    }
</style>