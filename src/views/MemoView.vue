<script setup>
    import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue"
    import { useSheetStore } from "../stores/SheetStore";
    const sheetStore = useSheetStore();
    sheetStore.loadState();
    
    const modes = ["Corners","Edges"]
    const mode = ref("Corners")
    const stage = ref(0)


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
    function PairSelectUpdated() {
        if (pairSelect.value === 1) { //All pairs in sheet
            pairSelectSheet.value = sheetStore.getSheetsOfType(3)[0];
        }
    }
    function updatePossiblePairs() {
        if (pairSelect.value === 0) { //All possible pairs
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWX" //This is incorrect but good enough for now
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
    }

    //Stage 1 (show sequence)
    var testSequence = ""
    function GenerateSequence() {
        //This length calculation is completely wrong, fix with alex's data
        const length = 3 + Math.floor(Math.random() * 3);
        var sequenceArr = [];
        //Remove invalid values from the following
        while (sequenceArr.length < length) {
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

    //Stage 4 



    function handleKeydown(event) {
        if (event.code === 'Enter') {
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
    <div class="MemoViewContainer">
        <div v-if="stage===0">
            <div class="MemoViewHeader">
                Select pairs from:
                <select v-model="pairSelect" @change="PairSelectUpdated()" style="font-size: 2rem;">
                    <option :value=0>All possible pairs</option>
                    <option v-if="sheetStore.getSheetsOfType(3).length > 0" :value=1>All pairs in a sheet</option>
                    <option v-if="sheetStore.getSheetsOfType(3).length > 0" :value=1>All pairs in a sheet</option>
                </select>
            </div>
            <div class="MemoViewHeader" v-if="pairSelect===1">
                Sheet:
                <select v-model="pairSelectSheet" style="font-size: 2rem;">
                    <option v-for="sheetOption in sheetStore.getSheetsOfType(3)" :value="sheetOption">{{sheetOption.name}}</option>
                </select>
            </div>
            <div class="MemoViewHeader">
                Type:
                <select v-model="mode" style="font-size: 2rem;">
                    <option v-for="modeOption in modes">{{modeOption}}</option>
                </select>
            </div>
        </div>
        <div v-else-if="stage===1">
            <div style="font-size: 2rem;">
                {{testSequence}}
            </div>
        </div>
        <div v-else-if="stage===2">
            <div style="font-size: 2rem;">
                DISTRACTION GRAAAHHH
            </div>
        </div>
        <div v-else-if="stage===3">
            <div style="font-size: 2rem;">
                Enter what you memoed:
                <input v-model="userSequence" ref="sequenceInput" style="font-size: 2rem;" />
            </div>
        </div>
        <div v-else-if="stage===4">
            <div style="font-size: 2rem;">
                <div v-if="testSequence === userSequence">
                    Correct!
                </div>
                <div v-else>
                    Incorrect...
                </div>
                <div>You put: {{userSequence}}</div>
                <div>It was: {{testSequence}}</div>
            </div>
        </div>
        <img src="@/assets/arrow-right-long.svg"
             class="NextButton"
             @click="SetStage((stage + 1) % 5);" />
    </div>
</template>

<style>
    .MemoViewContainer {
        display: flex;
        flex-direction: column;
        justify-self: center;
        padding-top: 20vh;
        gap: 5px;
        color: white;
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