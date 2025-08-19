<script setup>
    import { onMounted, onUnmounted } from "vue"

    const props = defineProps({
        mode: Number,
        testSequences: Array,
        userSequences: Array,
        correct: Number,
        score: Number,
    })
    const emit = defineEmits(['endTurn'])

    function handleKeydown(event) {
        if (event.code === 'Enter') {
            emit('endTurn')
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
    <div style="display:flex;align-self:center;">
        <div v-if="mode !== 2">{{ correct === 1 ? 'Correct!' : 'Incorrect' }}</div>
        <div v-else style="font-size: 2.5rem;">
            {{ correct }}/{{ testSequences.length }} (score: {{ score < 0 ? 'DNF' : score }})
        </div>
    </div>
    <div style="font-size: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap:50px;">
        <div>
            It was:
            <div style="display:flex;flex-direction:column;gap:15px;">
                <div v-for="sequence in testSequences" style="display:flex;flex-direction:row;gap:5px;">
                    <div v-for="pair in sequence.split(' ')" class="MemoPair">
                        {{pair}}
                    </div>
                </div>
            </div>
        </div>

        <div>
            You put:
            <div style="display:flex;flex-direction:column;gap:15px;">
                <div v-for="sequence in userSequences" style="display:flex;flex-direction:row;gap:5px;">
                    <div v-if="sequence.length > 0" v-for="pair in sequence.split(' ')" class="MemoPair">
                        {{pair}}
                    </div>
                </div>
            </div>
        </div>
        <div style="height:20vh;"></div>
    </div>
    <img src="@/assets/arrow-right-long.svg"
         class="NextButton"
         @click="emit('endTurn')" />
</template>