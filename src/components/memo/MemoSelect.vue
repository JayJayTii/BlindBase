<script setup>
    import { computed, onMounted, onUnmounted } from "vue"
    import { useSheetStore } from '@/stores/SheetStore'
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    import { useCardStore } from '@/stores/CardStore'
    const cardStore = useCardStore()
    cardStore.loadState()
    import { useMemoStore, modes } from '@/stores/MemoStore'
    const memoStore = useMemoStore()
    memoStore.loadState()

    const props = defineProps({
        mode: Number,
        cubes: Number,
        pairSelect: Number,
        pairSelectSheet: Object,
    })
    const emit = defineEmits(['updateMode', 'updateCubes', 'updatePairSelect', 'updatePairSelectSheet', 'updateLength','startRun'])

    function ModeUpdated() {
        if (props.mode === 2) {
            //Multiblind
            if (props.cubes < 2) {
                emit('updateCubes', 2)
            }
        }
    }
    function PairSelectUpdated() {
        if (props.pairSelect === 1) {
            //All pairs in sheet
            emit('updatePairSelectSheet', sheetStore.getSheetsOfType(3)[0])
        } else if (props.pairSelect === 2) {
            //All cards for a sheet
            emit('updatePairSelectSheet', GetSheetsWithLearnedCards()[0])
        }
    }

    function GetSheetsWithLearnedCards() {
        const out = [
            ...new Set(
                cardStore.cards
                    .filter((card) => card.successCount > 0)
                    .map((card) => card.reference.sheetID),
            ),
        ].map((sheetID) => sheetStore.getSheet(sheetID))
        return out.filter((sheet) => sheet.type === 3) //Filter for image sheets
    }
    function GetLearnedCards() {
        const out = cardStore.cards.filter((card) => card.successCount > 0)
        //Filter for image sheets
        return out.filter((card) => sheetStore.getSheet(card.reference.sheetID).type === 3) 
    }

    function getPossiblePairs() {
        let possiblePairs = []
        if (props.pairSelect === 0) {
            //All possible pairs
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('') //This is incorrect but good enough for now
            letters.forEach((char1) => {
                letters.forEach((char2) => {
                    possiblePairs.push(char1 + char2)
                })
            })
        }
        else if (props.pairSelect === 1) {
            //All pairs in a sheet
            for (var y = 0; y < 24; y++) {
                for (var x = 0; x < 24; x++) {
                    if (props.pairSelectSheet.grid[y][x] === '') {
                        continue
                    }
                    possiblePairs.push(
                        props.pairSelectSheet.xHeadings[x] + props.pairSelectSheet.yHeadings[y],
                    )
                }
            }
        }
        else if (props.pairSelect === 2) {
            //All cards for a sheet
            const relevantCards = GetLearnedCards().filter(
                (card) => card.reference.sheetID === pairSelectSheet.value.id,
            )
            //Each card only has a coordinate, map it to the key in the sheet
            possiblePairs = relevantCards.map(
                (card) =>
                    pairSelectSheet.value.xHeadings[card.reference.coord.x] +
                    pairSelectSheet.value.yHeadings[card.reference.coord.y],
            )
        }
        return possiblePairs
    }

    function StartRun() {
        if (props.mode !== 2) {
            emit('updateLength', 4)
            emit('updateCubes', 1)
        } else {
            emit('updateLength', 10)
        }
        emit('startRun', getPossiblePairs())
    }

    const mode = computed({
        get: () => props.mode,
        set: (newValue) => emit('updateMode', newValue)
    })
    const cubes = computed({
        get: () => props.cubes,
        set: (newValue) => emit('updateCubes', newValue)
    })
    const pairSelect = computed({
        get: () => props.pairSelect,
        set: (newValue) => emit('updatePairSelect', newValue)
    })
    const pairSelectSheet = computed({
        get: () => props.pairSelectSheet,
        set: (newValue) => emit('updatePairSelectSheet', newValue)
    })

    function handleKeydown(event) {
        if (event.code === 'Enter') {
            StartRun()
        }
    }
    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
    })
</script>

<template>
    <div class="MemoViewHeader">
        Mode:
        <select v-model="mode" @change="ModeUpdated()" style="font-size: 2rem">
            <option v-for="(modeOption, index) in modes" :value="index">
                {{ modeOption }}
            </option>
        </select>
        <div v-if="props.pairSelect === 0" style="margin-left: 20px">
            (Highscore: {{ memoStore.GetHighscore(props.mode) }})
        </div>
    </div>
    <div class="MemoViewHeader" v-if="props.mode === 2">
        Cubes:
        <input type="number"
               v-model="cubes"
               value="2"
               min="2"
               :max="maxCubes"
               style="font-size: 2rem; width: 100px" />
    </div>
    <div class="MemoViewHeader">
        Select pairs from:
        <select v-model="pairSelect" @change="PairSelectUpdated()" style="font-size: 2rem">
            <option :value="0">All possible pairs</option>
            <option v-if="sheetStore.getSheetsOfType(3).length > 0" :value="1">
                All pairs in a sheet
            </option>
            <option v-if="GetLearnedCards().length > 0" :value="2">
                All cards for a sheet
            </option>
        </select>
    </div>
    <div class="MemoViewHeader" v-if="pairSelect === 1">
        Sheet:
        <select v-model="pairSelectSheet" style="font-size: 2rem">
            <option v-for="sheetOption in sheetStore.getSheetsOfType(3)" :value="sheetOption">
                {{ sheetOption.name }}
            </option>
        </select>
    </div>
    <div class="MemoViewHeader" v-if="pairSelect === 2">
        Sheet:
        <select v-model="pairSelectSheet" style="font-size: 2rem">
            <option v-for="sheetOption in GetSheetsWithLearnedCards()" :value="sheetOption">
                {{ sheetOption.name }}
            </option>
        </select>
    </div>
    <img src="@/assets/arrow-right-long.svg" class="NextButton" @click="StartRun()" />
</template>

<style>
    .MemoViewHeader {
        display: flex;
        flex-direction: row;
        gap: 10px;
    }
</style>