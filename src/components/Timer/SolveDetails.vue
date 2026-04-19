<script setup>
    import { computed, onMounted, onUnmounted } from 'vue'
    import { getSolveTimeString, getSolveRatioString } from "@/helpers/timer.js"
    import Hammer from "@/components/Icons/Hammer.vue"
    import { useTimerStore, solve_statuses } from "@/stores/TimerStore"
    const timerStore = useTimerStore()
    import { useRouter } from 'vue-router'
    const router = useRouter()

    const props = defineProps({
        sessionID: Number,
        solveIndex: Number,
    })
    const emit = defineEmits(['unselectSolve','deleteSolve'])

    const selectedSolve = computed({
        get: () => (props.solveIndex > -1 && timerStore.isValidSessionID(props.sessionID)) ? timerStore.getSession(props.sessionID).solves[props.solveIndex] : null
    })

    //Reconstruct by redirecting to recons tool with scramble in URL
    function Reconstruct() {
        sessionStorage.reconstructionSolve = JSON.stringify(selectedSolve.value)
        router.push('/recons/' + selectedSolve.value[3])
    }

    function handleKeydown(event) {
        //Status change keybinds
        if (event.code === "ArrowRight") {
            selectedSolve.value[2] = (selectedSolve.value[2] + 1) % 3
            timerStore.saveState()
        }
        else if (event.code === "ArrowLeft") {
            selectedSolve.value[2] = (selectedSolve.value[2] + 3 - 1) % 3
            timerStore.saveState()
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
    <div v-if="props.solveIndex > -1 && timerStore.isValidSessionID(props.sessionID)">
        <div style="display: flex; flex-direction: column; overflow-y: auto;">
            <!-- SOLVE X -->
            <el-text style="color: var(--el-text-color-primary); margin-top: -2px; padding-bottom: 5px; text-align: center; font-size: 1.5rem; font-weight: bold; width: 100%; border-block-end: 2px solid var(--el-border-color);">
                Solve {{props.solveIndex + 1}}:
            </el-text>
            <!------SOLVE RESULTS------>
            <el-text size="large" style="text-align: center;">{{selectedSolve[3]}}</el-text>
            <el-text style="font-size: 2rem; font-weight: bold;">{{getSolveTimeString(selectedSolve)}}</el-text>
            <el-text>{{getSolveRatioString(selectedSolve)}}</el-text>

            <div style="margin-top: 10px; height: 30px; display: grid; grid-template-columns: 1fr 5fr 1fr;">
                <!-- RECONSTRUCT BUTTON -->
                <el-tooltip content="Reconstruct">
                    <el-button type="primary" style="width: 30px; height: 30px;" @click="Reconstruct()">
                        <el-icon :size="25"><Hammer /></el-icon>
                    </el-button>
                </el-tooltip>
                <!------SOLVE STATUS------>
                <el-segmented v-model="selectedSolve[2]" size="small" style="border: 1px solid var(--el-border-color); background-color: var(--el-fill-color-blank);"
                              :options="solve_statuses" @change="timerStore.saveState()" />
                <!-- DELETE BUTTON -->
                <el-popconfirm title="Are you sure?" @confirm="emit('deleteSolve')">
                    <template #reference>
                        <el-button type="danger" style="width: 30px; height: 30px; margin-left: auto;">
                            <el-icon :size="20"><Delete /></el-icon>
                        </el-button>
                    </template>
                </el-popconfirm>
            </div>
        </div>
    </div>
    <div v-else>
        
    </div>
</template>