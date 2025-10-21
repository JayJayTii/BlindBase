<script setup>
    import { ref, onMounted, onUnmounted } from "vue"

    const props = defineProps({
        cubes: Number,
        maxSequenceLength: Number,
    })
    const emit = defineEmits(['setStage', 'updateUserSequences'])

    let userSequences = Array(props.cubes).fill('')

    function FinishStage() {
        emit('updateUserSequences', userSequences)
        emit('setStage', 4)
    }

    function handleKeydown(event) {
        if (event.code === 'Enter') {
            FinishStage()
        }
    }

    const inputRef = ref(null)
    onMounted(() => {
        inputRef.value[0].focus()
        window.addEventListener('keydown', handleKeydown)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
    })
</script>

<template>
    <input v-for="cube in cubes"
           v-model="userSequences[cube - 1]"
           ref="inputRef"
           :maxlength="props.maxSequenceLength"
           :style="{
                textTransform: 'uppercase',
                fontSize: '2rem',
                width: props.maxSequenceLength + 1 + 'ch',
            }" />
    
    <img src="@/assets/arrow-right-long.svg"
         :class="['CustomButton','NextButton']"
         @click="FinishStage()" />
</template>