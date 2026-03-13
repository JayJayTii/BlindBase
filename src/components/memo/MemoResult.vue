<script setup>
    import { onMounted, onUnmounted } from "vue"

    const props = defineProps({
        mode: String,
        testSequences: Array,
        userSequences: Array,
        correct: Number,
        score: Number,
    })
     
    const splitTestSequences = props.testSequences.map(sequence => sequence.split(' '))
    const splitUserSequences = props.userSequences.map(sequence => sequence.split(' '))
    const emit = defineEmits(['endTurn'])

    function handleKeydown(event) {
        if (event.code === 'Enter' || event.code === 'NumpadEnter') {
            emit('endTurn')
        }
    }

    function isCorrectPair(sequence, pair) {
        return splitTestSequences[sequence][pair] == splitUserSequences[sequence][pair]
    }

    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
    })
</script>

<template>
    <!-- Shows the user's score after a memo attempt -->
    <div style="display:flex;align-self:center;">
        <div v-if="mode !== 'Multiblind'">{{ correct === 1 ? 'Correct!' : 'Incorrect' }}</div>
        <div v-else style="font-size: 2.5rem;">
            {{ correct }}/{{ testSequences.length }} (score: {{ score < 0 ? 'DNF' : score }})
        </div>
    </div>
    <div style="font-size: 2rem; display: grid; grid-template-columns: 45vw 45vw; gap: 50px; ">
        <!-- LEFT COLUMN -->
        <div style="text-align:center;">
            It was:
            <div style="display:flex;flex-direction:column;gap:15px;align-items:center;">
                <div v-for="sequence in splitTestSequences" style="display:flex;flex-direction:row;gap:5px;">
                    <div v-for="pair in sequence" class="MemoPair">
                        {{pair}}
                    </div>
                </div>
            </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div style="text-align:center;">
            You put:
            <div style="display: flex; flex-direction: column; gap: 15px; align-items: center;">
                <div v-for="(sequence, i) in splitUserSequences" style="display:flex;flex-direction:row;gap:5px;">
                    <div v-if="sequence.length > 0" 
                         v-for="j in Math.max(splitTestSequences[i].length, splitUserSequences[i].length)" 
                         :class="['MemoPair', (!isCorrectPair(i, j - 1) ? 'MemoPairIncorrect' : '')]">
                        {{splitUserSequences[i][j - 1]}}
                    </div>
                </div>
            </div>
        </div>
        <div style="height:20vh;"></div>
    </div>
    <img src="@/assets/icons/arrow-right-long.svg"  
         title="Next"
         :class="['CustomButton','NextButton']"
         @click="emit('endTurn')" />
</template>

<style>
    .MemoPair.MemoPairIncorrect {
        border: 4px solid var(--error-800);
        background-color: var(--error-700);
    }
</style>