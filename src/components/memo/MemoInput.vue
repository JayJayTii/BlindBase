<script setup>
    import { ref, onMounted, onUnmounted } from "vue"

    const props = defineProps({
        cubes: Number,
        maxSequenceLength: Number,
    })
    const emit = defineEmits(['stageComplete', 'updateUserSequences'])

    const userSequences = ref(Array(props.cubes).fill(''))

    function FinishStage() {
        emit('updateUserSequences', userSequences.value)
        emit('stageComplete')
    }

    function handleKeydown(event) {
        if (event.code === 'Enter' || event.code === 'NumpadEnter') {
            FinishStage()
        }
    }

    const formatText = (value) => {
        return value.toString().toUpperCase()
	}

    const inputRefs = ref(Array(props.cubes).fill(null))

    onMounted(() => {
        inputRefs.value[0]?.focus()
        window.addEventListener('keydown', handleKeydown)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
    })
</script>

<template>
    <!-- Input box for each of the sequences the user had to remember -->
    <div v-for="(cube, index) in cubes" :key="index">
        <el-input v-model="userSequences[index]"
                 :ref="el => inputRefs[index] = el"
                 :maxlength="props.maxSequenceLength"
                 :formatter="formatText"
                  size="large"
                  class="memo-input-box"
                 :style="{ fontSize: '1.5rem', width: 1.5*(props.maxSequenceLength + 2) + 'ch'}" />
    </div>
    <div style="height:20vh;" />

    <el-button class="NextButton" type="primary" :plain=true @click="FinishStage()">
        <el-icon size="25"><DArrowRight /></el-icon>
    </el-button>
</template>