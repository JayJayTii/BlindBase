<script setup>
    import { onMounted, onUnmounted } from "vue"

    const emit = defineEmits(['setStage'])

    function handleKeydown(event) {
        if (event.code === 'Enter') {
            emit('setStage', 3)
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
    <div style="font-size: 2rem">DISTRACTION GRAAAHHH</div>
    <img src="@/assets/arrow-right-long.svg"
         :class="['CustomButton','NextButton']"
         @click="emit('setStage', 3)" />
</template>