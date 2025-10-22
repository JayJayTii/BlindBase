<script setup>
    import { onMounted, onUnmounted } from "vue"

    const props = defineProps({
        runData: Object,
    })

    const emit = defineEmits(['stageComplete'])

    //Distraction is only used in corners
    if (!(props.runData.mode == "Corners" || props.runData.mode == "One mistake")) 
        emit('stageComplete')

    function handleKeydown(event) {
        if (event.code === 'Enter') {
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
    <div style="font-size: 2rem">DISTRACTION GRAAAHHH</div>
    <img src="@/assets/arrow-right-long.svg"
         :class="['CustomButton','NextButton']"
         @click="emit('stageComplete')" />
</template>