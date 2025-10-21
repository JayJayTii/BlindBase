<script setup>
    import { onMounted, onUnmounted } from "vue"

    const props = defineProps({
        testSequences: Array,
    })
    const emit = defineEmits(['setStage'])

    function handleKeydown(event) {
        if (event.code === 'Enter') {
            emit('setStage', 2)
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
    <div style="display:flex;flex-direction:column;gap:15px;">
        <div v-for="sequence in testSequences" style="display:flex;flex-direction:row;gap:5px;">
            <div v-for="pair in sequence.split(' ')" class="MemoPair">
                {{pair}}
            </div>
        </div>
    </div>
    <img src="@/assets/arrow-right-long.svg"
         :class="['CustomButton','NextButton']"
         @click="emit('setStage', 2)" />
</template>