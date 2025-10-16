<script setup>
    import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
    import { GeneratePairSequence, FormatPairSequence, GetLongestStringLength, getCorrect, getScore } from '@/helpers/memo.js'
    import { useMemoStore, maxCubes } from '../stores/MemoStore'
    const memoStore = useMemoStore()
    memoStore.loadState()
    import MemoHeader from '@/components/memo/MemoHeader.vue'
    import MemoSelect from '@/components/memo/MemoSelect.vue'
    import MemoDisplay from '@/components/memo/MemoDisplay.vue'
    import MemoDistraction from '@/components/memo/MemoDistraction.vue'
    import MemoInput from '@/components/memo/MemoInput.vue'
    import MemoResult from '@/components/memo/MemoResult.vue'

    const mode = ref(0)
    const stage = ref(0)
    const length = ref(4)
    const cubes = ref(2)
    const pairSelect = ref(0)
    const pairSelectSheet = ref({})
    const possiblePairs = ref([])
    var testSequences = []
    var userSequences = []

    function updateCubes(newValue) {
        cubes.value = mode.value === 2 ? Math.max(2, Math.min(newValue, maxCubes)) : newValue
    }
    function updateMode(newValue) {
        mode.value = newValue
    }
    function updateLength(newValue){
        length.value = newValue
    }
    function updatePairSelect(newValue) {
        pairSelect.value = newValue
    }
    function updatePairSelectSheet(newValue) {
        pairSelectSheet.value = newValue
    }
    function updateUserSequences(newValue) {
        userSequences = newValue
    }

    function startRun(pairs) {
        possiblePairs.value = pairs
        SetStage(1)
    }
    function quitRun() {
        if (stage === 4) {
            UpdateHighscore()
        }
        SetStage(0)
    }
    function EndTurn() {
        UpdateHighscore()
        switch (mode.value) {
            case 0: //Endless
                length.value += getCorrect(testSequences, userSequences) > 0 ? 1 : -1
                if (length.value < 1) {
                    SetStage(0)
                    return
                }
                break
            case 1: //One mistake
                if (getCorrect(testSequences, userSequences) > 0)
                    length.value += 1
                else {
                    SetStage(0)
                    return
                }
                break
            case 2: //Multiblind
                SetStage(0)
                return
        }
        SetStage(1)
    }

    function SetStage(index) {
        stage.value = index
        switch (index) {
            case 1: //Generate sequences to show to user
                testSequences = []
                for (var i = 0; i < cubes.value; i++) {
                    testSequences.push(GeneratePairSequence(possiblePairs.value, length.value))
                }
                break
            case 4: //Format the sequences that the user inputted
                userSequences = userSequences.map((sequence) => FormatPairSequence(sequence))
                break
        }
    }

    function UpdateHighscore() {
        if (pairSelect.value !== 0) //Only allowed highscores when using all possible pairs
            return

        if (mode.value === 2) { //Multiblind uses score for highscore
            //Score must be higher
            if (getScore(testSequences, userSequences) <= memoStore.GetHighscore(mode.value))
                return

            memoStore.SetHighscore(mode.value, getScore(testSequences, userSequences))
        } else { //Others use length for highscore
            if (getCorrect(testSequences, userSequences) === 0) //Must be a success
                return
            if (length.value <= memoStore.GetHighscore(mode.value)) //Length must be longer
                return

            memoStore.SetHighscore(mode.value, length.value)
        }
        memoStore.saveState()
    }
</script>

<template>
    <div class="MemoView">
        <!------HEADER------>
        <MemoHeader v-if="stage > 0"
                    :mode="mode" :length="length" :pairSelect="pairSelect" :cubes="cubes"
                    @quitRun="quitRun" />

        <!------SELECT------>
        <div v-if="stage === 0" class="MemoViewContainer">
            <MemoSelect :mode="mode" :cubes="cubes" :pairSelect="pairSelect" :pairSelectSheet="pairSelectSheet"
                        @updateCubes="updateCubes" @updateLength="updateLength" @updateMode="updateMode"
                        @updatePairSelect="updatePairSelect" @updatePairSelectSheet="updatePairSelectSheet"
                        @startRun="startRun" />
        </div>

        <!------DISPLAY------>
        <div v-else-if="stage === 1" class="MemoViewContainer">
            <MemoDisplay :testSequences="testSequences"
                         @setStage="SetStage" />
        </div>

        <!------DISTRACTION------>
        <div v-else-if="stage === 2" class="MemoViewContainer">
            <MemoDistraction @setStage="SetStage" />
        </div>

        <!------INPUT------>
        <div v-else-if="stage === 3" class="MemoViewContainer">
            <MemoInput :cubes="cubes" :maxSequenceLength="GetLongestStringLength(testSequences)"
                       @setStage='SetStage' @updateUserSequences="updateUserSequences" />
        </div>

        <!------RESULT------>
        <div v-else-if="stage === 4" class="MemoViewContainer">
            <MemoResult :mode="mode" :testSequences="testSequences" :userSequences="userSequences"
                        :correct="getCorrect(testSequences, userSequences)" :score="getScore(testSequences, userSequences)"
                        @endTurn="EndTurn" />
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
        background-color: var(--brand-600);
        border-radius: 5px;
        cursor: pointer;
        height: 3rem;
        width: 80px;
        position: fixed;
        right: 30px;
        bottom: 30px;
        display:flex;
        align-items: center;
        justify-content: center;
        color: var(--brand-900);
        transform: translate(-100%, -100%);
    }
        .NextButton:hover {
            background-color: var(--brand-500);
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
