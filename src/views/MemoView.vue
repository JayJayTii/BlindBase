<script setup>
    import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue"

    const modes = ["Corners","Edges"]
    const mode = ref("Corners")
    const stage = ref(0)


    function SetStage(index) {
        stage.value = index;
        switch (index) {
            case 0:
                break;
            case 1:
                testSequence = GenerateSequence();
                break;
            case 3:
                nextTick(() => { sequenceInput.value.focus()})
        }
    }

    //Stage 1 (show sequence)
    var testSequence = ""
    function GenerateSequence() {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWX"
        //This length calculation is completely wrong, fix with alex's data
        const length = 3 + Math.floor(Math.random() * 3);
        var sequenceArr = [];
        //Remove invalid values from the following
        while (sequenceArr.length < length) {
            const nextKey = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)];
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
    <div v-if="stage===0" class="MemoViewContainer">
        Type:
        <select v-model="mode" style="font-size: 2rem;">
            <option v-for="modeOption in modes">{{modeOption}}</option>
        </select>

        <img src="@/assets/arrow-right-long.svg"
             class="NextButton"
             @click="SetStage(1)" />
    </div>
    <div v-else-if="stage===1" class="MemoViewContainer">
        <div style="font-size: 2rem;">
            {{testSequence}}
        </div>
        <img src="@/assets/arrow-right-long.svg"
             class="NextButton"
             @click="SetStage(2)" />
    </div>
    <div v-else-if="stage===2" class="MemoViewContainer">
        <div style="font-size: 2rem;">
            DISTRACTION GRAAAHHH
        </div>
        <img src="@/assets/arrow-right-long.svg"
             class="NextButton"
             @click="SetStage(3)" />
    </div>
    <div v-else-if="stage===3" class="MemoViewContainer">
        <div style="font-size: 2rem;">
            Enter what you memoed:
            <input v-model="userSequence" ref="sequenceInput" style="font-size: 2rem;" />
        </div>
        <img src="@/assets/arrow-right-long.svg"
             class="NextButton"
             @click="SetStage(4)" />
    </div>
    <div v-else-if="stage===4" class="MemoViewContainer">
        <div style="font-size: 2rem;">
            <div v-if="testSequence === userSequence">
                Correct!
            </div>
            <div v-else>
                Incorrect...
            </div>
        </div>
        <img src="@/assets/arrow-right-long.svg"
             class="NextButton"
             @click="SetStage(0)" />
    </div>
</template>

<style>
    .MemoViewContainer {
        display: flex;
        margin-top: 40vh;
        align-content: center;
        justify-content: center;
        gap: 5px;
        color: white;
        font-size: 2rem;
    }

    .NextButton {
        background-color: var(--brand-600);
        border-radius: 5px;
        cursor: pointer;
        height: 3rem;
        width: 80px;
    }
        .NextButton:hover {
            background-color: var(--brand-500);
        }
</style>