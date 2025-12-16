<script setup>
    import { onMounted, onUnmounted } from "vue"

    const props = defineProps({
        testSequences: Array,
    })
    const emit = defineEmits(['stageComplete'])

    function handleKeydown(event) {
        if (event.code === 'Enter' || event.code === 'NumpadEnter') {
            emit('stageComplete')
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
        <div v-for="sequence in testSequences" style="display:flex;flex-direction:row;gap:5px;justify-content:center;">
            <div v-for="pair in sequence.split(' ')" class="MemoPair">
                {{pair}}
            </div>
        </div>
        <div style="height:20vh;" />
    </div>
    <img src="@/assets/arrow-right-long.svg"
         title="Next"
         :class="['CustomButton','NextButton']"
         @click="emit('stageComplete')" />
</template>