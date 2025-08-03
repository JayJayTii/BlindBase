<script setup>
    import { ref, computed, onMounted, onUnmounted, nextTick } from "vue"
    import { useSheetStore } from "../stores/SheetStore";
    import { useCardStore } from "../stores/CardStore";
    import { useMemoStore, modes } from "../stores/MemoStore";
    const sheetStore = useSheetStore();
    sheetStore.loadState();
    const cardStore = useCardStore();
    cardStore.loadState();
    const memoStore = useMemoStore();
    memoStore.loadState();
    
    const mode = ref(0)
    const stage = ref(0)
    const length = ref(4)

    function SetStage(index) {
        stage.value = index;
        switch (index) {
            case 0:
                break;
            case 1:
                updatePossiblePairs();
                testSequence = GenerateSequence();
                break;
            case 3:
                rawUserSequence.value = ""
                nextTick(() => { sequenceInput.value.focus() })
        }
    }

    //Stage 0 (choose settings)
    const pairSelect = ref(0)
    const pairSelectSheet = ref({})
    const possiblePairs = ref([])
    function GetLearnedCards() {
        const out = cardStore.cards.filter((card) => card.successCount > 0);
        return out.filter((card) => sheetStore.getSheet(card.reference.sheetID).type === 3); //Filter for image sheets
    }
    function GetSheetsWithLearnedCards() {
        const out = [...new Set(cardStore.cards.filter((card) => card.successCount > 0).map((card) => card.reference.sheetID))].map((sheetID) => sheetStore.getSheet(sheetID));
        return out.filter((sheet) => sheet.type === 3); //Filter for image sheets
    }
    function PairSelectUpdated() {
        if (pairSelect.value === 1) { //All pairs in sheet
            pairSelectSheet.value = sheetStore.getSheetsOfType(3)[0];
        }
        if (pairSelect.value === 2) { //All cards for a sheet
            pairSelectSheet.value = GetSheetsWithLearnedCards()[0];
        }
    }
    function updatePossiblePairs() {
        if (pairSelect.value === 0) { //All possible pairs
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWX".split('') //This is incorrect but good enough for now
            possiblePairs.value = [] 
            letters.forEach((char1) => {
                letters.forEach((char2) => {
                    possiblePairs.value.push(char1 + char2)
                })
            })
        }
        if (pairSelect.value === 1) { //All pairs in a sheet
            possiblePairs.value = []
            for (var y = 0; y < 24; y++) {
                for (var x = 0; x < 23; x++) {
                    if (pairSelectSheet.value.grid[y][x] === "")
                        continue;
                    possiblePairs.value.push(pairSelectSheet.value.xHeadings[x] + pairSelectSheet.value.yHeadings[y])
                }
            }
        }
        if (pairSelect.value === 2) { //All cards for a sheet
            possiblePairs.value = []
            const relevantCards = GetLearnedCards().filter((card) => (card.reference.sheetID === pairSelectSheet.value.id))
            //Each card only has a coordinate, map it to the key in the sheet
            possiblePairs.value = relevantCards.map((card) => pairSelectSheet.value.xHeadings[card.reference.coord.x] + pairSelectSheet.value.yHeadings[card.reference.coord.y])
        }
    }
    function StartRun() {
        length.value = 4;
        SetStage(1);
    }

    //Stage 1 (show sequence)
    var testSequence = ""
    function GenerateSequence() {
        var sequenceArr = [];
        //Remove invalid values from the following
        while (sequenceArr.length < length.value) {
            const nextKey = possiblePairs.value[Math.floor(Math.random() * possiblePairs.value.length)];
            sequenceArr.push(nextKey);
        }
        var sequenceStr = "";
        for (var i = 0; i < sequenceArr.length; i++) {
            sequenceStr += sequenceArr[i] + " "
        }
        return sequenceStr.trimEnd();
    }

    //Stage 2 (distraction)

    //Stage 3 (enter memo)
    const sequenceInput = ref(null)
    const rawUserSequence = ref("");
    const userSequence = computed({
        get: () => rawUserSequence.value,
        set: (newVal) => {
            if (newVal.length < rawUserSequence.value.length || newVal.length > rawUserSequence.value.length + 1) {
                rawUserSequence.value = newVal;
                return;
            }

            const inputChar = [...newVal].filter(char => !rawUserSequence.value.includes(char))[0];
            if (!inputChar) {
                return;
            }

            let updated = rawUserSequence.value;
            if (updated.length % 3 === 2) updated += " ";
            updated += inputChar.toUpperCase();

            rawUserSequence.value = updated;
        }
    });

    //Stage 4 (compare to correct)
    const correct = computed({
        get: () => testSequence === userSequence.value
    })
    function EndTurn() {
        if (pairSelect.value === 0 && correct.value) //Only update highscore when testing all possible letter pairs
            UpdateHighscore();
        if (mode.value === 0) {//Endless (kinda)
            length.value += correct.value ? 1 : -1
            if (length.value < 1) {
                SetStage(0)
                return
            }
        }
        else if (mode.value === 1 && !(correct.value)) { //One mistake
            SetStage(0);
            return;
        }
        SetStage(1)
    }
    function UpdateHighscore() {
        if (length.value <= memoStore.highscores[mode.value])
            return;

        memoStore.highscores[mode.value] = length.value;
        memoStore.saveState();
    }



    function handleKeydown(event) {
        if (event.code === 'Enter') {
            if (stage.value === 0) {
                StartRun();
            }
            else if (stage.value === 4)
                EndTurn();
            else
                SetStage((stage.value + 1) % 5);
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
    <div v-if="stage > 0" style="display:grid;grid-template-columns:repeat(4,25vw); color:white;font-size:1.5rem;justify-self:center;">
        <button @click="SetStage(0)" style="width:100px;height:2rem;"><------------</button>
        <div>Mode: {{modes[mode]}}</div>
        <div>Length: {{length}}</div>
        <div v-if="pairSelect === 0">Highscore:  {{memoStore.highscores[mode]}}</div>
    </div>
    <div v-if="stage===0" class="MemoViewContainer">
        <div class="MemoViewHeader">
            Mode:
            <select v-model="mode" style="font-size: 2rem;">
                <option v-for="(modeOption, index) in modes" :value="index">{{modeOption}}</option>
            </select>
            <div v-if="pairSelect === 0" style="margin-left:20px;">(Highscore: {{memoStore.highscores[mode]}})</div>
        </div>
        <div class="MemoViewHeader">
            Select pairs from:
            <select v-model="pairSelect" @change="PairSelectUpdated()" style="font-size: 2rem;">
                <option :value=0>All possible pairs</option>
                <option v-if="sheetStore.getSheetsOfType(3).length > 0" :value=1>All pairs in a sheet</option>
                <option v-if="GetLearnedCards().length > 0" :value=2>All cards for a sheet</option>
            </select>
        </div>
        <div class="MemoViewHeader" v-if="pairSelect===1">
            Sheet:
            <select v-model="pairSelectSheet" style="font-size: 2rem;">
                <option v-for="sheetOption in sheetStore.getSheetsOfType(3)" :value="sheetOption">{{sheetOption.name}}</option>
            </select>
        </div>
        <div class="MemoViewHeader" v-if="pairSelect===2">
            Sheet:
            <select v-model="pairSelectSheet" style="font-size: 2rem;">
                <option v-for="sheetOption in GetSheetsWithLearnedCards()" :value="sheetOption">{{sheetOption.name}}</option>
            </select>
        </div>
        <img src="@/assets/arrow-right-long.svg"
             class="NextButton"
             @click="StartRun();" />
    </div>
    <div v-else-if="stage===1" class="MemoViewContainer">
            <div style="font-size: 2rem;">
                {{testSequence}}
            </div>
            <img src="@/assets/arrow-right-long.svg"
                 class="NextButton"
                 @click="SetStage((stage + 1) % 5);" />
        </div>
    <div v-else-if="stage===2" class="MemoViewContainer">
            <div style="font-size: 2rem;">
                DISTRACTION GRAAAHHH
            </div>
            <img src="@/assets/arrow-right-long.svg"
                 class="NextButton"
                 @click="SetStage((stage + 1) % 5);" />
        </div>
    <div v-else-if="stage===3" class="MemoViewContainer">
            <div style="font-size: 2rem;">
                Enter what you memoed:
                <input v-model="userSequence" ref="sequenceInput" style="font-size: 2rem;" />
            </div>
            <img src="@/assets/arrow-right-long.svg"
                 class="NextButton"
                 @click="SetStage((stage + 1) % 5);" />
        </div>
    <div v-else-if="stage===4" class="MemoViewContainer">
        <div style="font-size: 2rem;">
             {{correct ? "Correct!" : "Incorrect..."}}
            <div>You put: {{userSequence}}</div>
            <div>It was: {{testSequence}}</div>
            <img src="@/assets/arrow-right-long.svg"
                 class="NextButton"
                 @click="EndTurn();" />
        </div>
    </div>
</template>

<style>
    .MemoViewContainer {
        display: flex;
        flex-direction: column;
        justify-self: center;
        padding-top: 15vh;
        color: white;
        gap:20px;
        font-size: 2rem;
    }
    .MemoViewHeader {
        display: flex;
        flex-direction: row;
        gap: 5px;
    }

    .NextButton {
        background-color: var(--brand-600);
        border-radius: 5px;
        cursor: pointer;
        height: 3rem;
        width: 80px;
        align-self: end;
    }
        .NextButton:hover {
            background-color: var(--brand-500);
        }
</style>