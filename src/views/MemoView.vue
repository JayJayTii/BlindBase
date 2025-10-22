<script setup>
    import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
    import { GeneratePairSequence, FormatPairSequence, GetLongestStringLength, getCorrect, getScore } from '@/helpers/memo.js'
    //Sheet and card stores for memo header for fetching sheet and card names
    import { useSettingsStore } from '@/stores/SettingsStore.js'
    import { useSheetStore } from '../stores/SheetStore'
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    import { useCardStore } from '../stores/CardStore'
    const cardStore = useCardStore()
    cardStore.loadState()
    import { useMemoStore } from '../stores/MemoStore'
    const memoStore = useMemoStore()
    memoStore.loadState()
    import MemoHeader from '@/components/memo/MemoHeader.vue'
    import MemoSelect from '@/components/memo/MemoSelect.vue'
    import MemoDisplay from '@/components/memo/MemoDisplay.vue'
    import MemoDistraction from '@/components/memo/MemoDistraction.vue'
    import MemoInput from '@/components/memo/MemoInput.vue'
    import MemoResult from '@/components/memo/MemoResult.vue'

    const stage = ref(0)
    let runData = {} //Contains mode, cube count, pair selection mode, pair select sheet, possible pairs
    const length = ref(-1)

    var testSequences = [] //The sequences the user is tasked to remember
    var userSequences = [] //The sequences the user remembered

    function startRun(_runData) {
        runData = _runData
        length.value = (runData.mode === "Multiblind") ? 10 : useSettingsStore().settings.memo_startingmemolength
        startTurn()
    }

    function startTurn() {
        stage.value = 1
        //Generate sequences to show to user
        testSequences = []
        for (var i = 0; i < runData.cubes; i++) {
            testSequences.push(GeneratePairSequence(runData.possiblePairs, length.value))
        }
    }

    function OnTurnComplete() {
        UpdateHighscore()
        switch (runData.mode) {
            case "Corners":
                length.value += getCorrect(testSequences, userSequences) > 0 ? 1 : -1
                if (length.value < 1) {
                    stage.value = 0
                    return
                }
                break
            case "Edges":
                length.value += getCorrect(testSequences, userSequences) > 0 ? 1 : -1
                if (length.value < 1) {
                    stage.value = 0
                    return
                }
                break
            case "One mistake": //One mistake
                if (getCorrect(testSequences, userSequences) > 0)
                    length.value += 1
                else {
                    stage.value = 0
                    return
                }
                break
            case "Multiblind": //Multiblind
                stage.value = 0
                return
        }
        startTurn()
    }
    function quitRun() {
        if (stage === 4)
            UpdateHighscore()

        stage.value = 0
    }

    function UpdateHighscore() {
        if (runData.pairSelect !== 0) //Only allowed highscores when using all possible pairs
            return

        if (runData.mode === "Multiblind") {
            //Multiblind uses points for highscore
            const MultiblindScore = getScore(testSequences, userSequences)
            if (MultiblindScore > memoStore.GetHighscore(runData.mode))
                memoStore.SetHighscore(runData.mode, MultiblindScore)
            return
        }

        //Other modes use length for highscore
        //Must be a success and longer length
        if (getCorrect(testSequences, userSequences) > 0 && length.value > memoStore.GetHighscore(runData.mode))
            memoStore.SetHighscore(runData.mode, length.value)
    }
</script>

<template>
    <div class="MemoView">
        <!------HEADER------>
        <MemoHeader v-if="stage > 0"
                    :runData="runData" :length="length"
                    @quitRun="quitRun" />

        <!------SELECT------>
        <div v-if="stage === 0">
            <MemoSelect @startRun="startRun" />
        </div>

        <!------DISPLAY------>
        <div v-else-if="stage === 1" class="MemoViewContainer">
            <MemoDisplay :testSequences="testSequences"
                         @stageComplete="stage = 2" />
        </div>

        <!------DISTRACTION------>
        <div v-else-if="stage === 2" class="MemoViewContainer">
            <MemoDistraction @stageComplete="stage = 3" />
        </div>

        <!------INPUT------>
        <div v-else-if="stage === 3" class="MemoViewContainer">
            <MemoInput :cubes="runData.cubes" :maxSequenceLength="GetLongestStringLength(testSequences)"
                       @stageComplete='stage = 4;  userSequences = userSequences.map((sequence) => FormatPairSequence(sequence))' 
                       @updateUserSequences="userSequences = $event" />
        </div>

        <!------RESULT------>
        <div v-else-if="stage === 4" class="MemoViewContainer">
            <MemoResult :mode="runData.mode" :testSequences="testSequences" :userSequences="userSequences"
                        :correct="getCorrect(testSequences, userSequences)" :score="getScore(testSequences, userSequences)"
                        @endTurn="OnTurnComplete" />
        </div>

    </div>
</template>

<style>
    .MemoView{
        color: var(--text-color);
    }

    .MemoViewContainer {
        display: flex;
        flex-direction: column;
        justify-self: center;
        padding-top: 15vh;
        gap: 20px;
        font-size: 2rem;
    }

    .NextButton {
        height: 3rem;
        width: 80px;
        position: fixed;
        right: 0px;
        bottom: 0px;
        transform: translate(-100%, -100%);
    }

    .MemoPair {
        border: 4px solid var(--brand-900);
        border-radius: 5px;
        background-color: var(--brand-700);
        width: 50px;
        height: 50px;
        justify-content: center;
        text-align: center;
        font-size: 1.5rem;
    }
</style>
