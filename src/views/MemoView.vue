<script setup>
    import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
    import { gaussianRandom, GeneratePairSequence, FormatPairSequence, GetLongestStringLength, getCorrect, getScore } from '@/helpers/memo.js'
    //Sheet and card stores for memo header for fetching sheet and card names
    import { defaults, useSettingsStore } from '@/stores/SettingsStore.js'
    const settingsStore = useSettingsStore()
    import { useSheetStore } from '../stores/SheetStore'
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    import { useCardStore } from '../stores/CardStore'
    const cardStore = useCardStore()
    cardStore.loadState()
    import { useMemoStore } from '../stores/MemoStore'
    const memoStore = useMemoStore()
    memoStore.loadState()
    import MemoSelect from '@/components/memo/MemoSelect.vue'
    import MemoDisplay from '@/components/memo/MemoDisplay.vue'
    import MemoDistraction from '@/components/memo/MemoDistraction.vue'
    import MemoInput from '@/components/memo/MemoInput.vue'
    import MemoResult from '@/components/memo/MemoResult.vue'

    const stage = ref(0)
    let runData = {} //Contains mode, cube count, pair selection mode, pair select sheet, possible pairs
    const length = ref(-1)
    let firstTurn = true;

    var testSequences = [] //The sequences the user is tasked to remember
    var userSequences = [] //The sequences the user remembered
   
    function RestartRun(_runData) {
        runData = _runData
        length.value = Number(useSettingsStore().settings.memo_startingmemolength)
        stage.value = 0 //needed to update MemoDisplay
        firstTurn = true;
        startTurn()
    }

    function startTurn() {
        stage.value = 1
        //Generate sequences to show to user
        testSequences = []
        for (var i = 0; i < runData.cubes; i++) {
            let seqLength = length.value
            if (runData.mode === "Multiblind")
                seqLength = Math.round(Math.max(0, Math.min(20, gaussianRandom(10, 1.5))))
            testSequences.push(GeneratePairSequence(runData.possiblePairs, seqLength))
        }
    }

    function OnTurnComplete() {
        UpdateHighscore()
        switch (runData.mode) {
            case "Corners":
                length.value += getCorrect(testSequences, userSequences) > 0 ? 1 : -1
                if (length.value < 1) {
                    RestartRun(runData)
                    return
                }
                firstTurn = false;
                break
            case "Edges":
                length.value += getCorrect(testSequences, userSequences) > 0 ? 1 : -1
				if (length.value < 1) {
					RestartRun(runData)
                    return
                }
                firstTurn = false;
                break
            case "One mistake":
                if (getCorrect(testSequences, userSequences) > 0) {
                    length.value += 1
                    firstTurn = false
                }
				else {
					RestartRun(runData)
                    return
                }
                break
			case "Multiblind":
				RestartRun(runData)
                return
        }
        startTurn()
    }

    function UpdateHighscore() {
        if (runData.pairSelect !== "From all pairs") //Only allowed highscores when using all possible pairs
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
    <div>
        <!------SELECT------>
        <MemoSelect @restartRun="RestartRun" @cancelRun="stage = 0" />

        <div style="height:15vh;"></div>
        <!------DISPLAY------>
        <div v-if="stage === 1" class="MemoViewContainer">
            <MemoDisplay :testSequences="testSequences"
                         @stageComplete="stage = 2" />
        </div>

        <!------DISTRACTION------>
        <div v-else-if="stage === 2" class="MemoViewContainer">
            <MemoDistraction :runData="runData" @stageComplete="stage = 3" />
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

        <div style="position: absolute; bottom: calc(var(--footer-height) + 5px); right: 10px; font-size:0.8rem;">
            Inspired by <a href="https://willian-pessoa.github.io/bld-trainer/" target="_blank">BldTrainer</a>
        </div>
    </div>
</template>

<style>
    .MemoViewContainer {
        display: flex;
        flex-direction: column;
        justify-self: center;
        gap: 20px;
        font-size: 2rem;
    }

    .NextButton {
        height: 50px;
        width: 80px;
        position: fixed;
        right: 50px;
        bottom: calc(var(--footer-height) + 50px);
    }

    .MemoPair {
        background-color: var(--el-fill-color);
        border: 2px solid var(--el-border-color-dark);
        border-radius: 4px;
        width: 2.7rem;
        height: 2.7rem;
        text-align: center;
        padding-top: 5px;
        font-size: 1.2rem;
    }
</style>
