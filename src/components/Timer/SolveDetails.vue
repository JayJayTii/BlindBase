<script setup>
    import { computed, onMounted, onUnmounted } from 'vue'
    import { getSolveTimeString, getSolveRatioString } from "@/helpers/timer.js"
    import { useTimerStore } from "@/stores/TimerStore"
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
        <div style="display: grid; grid-template-columns: 1fr 3fr 1fr; border-block-end: 1px solid var(--el-border-color);">
            <el-tooltip content="Reconstruct">
                <el-button type="primary" style="width: 30px; height: 30px;"
                           @click="Reconstruct()">
                    <img title="Reconstruct" style="width: 40px; height: 30px;" src="@/assets/tool_icons/ReconsIcon.png" />
                </el-button>
            </el-tooltip>
            <el-text style="color: var(--el-text-color-primary); text-align: center; font-size: 1.5rem; font-weight: bold;">
                Solve {{props.solveIndex + 1}}:
            </el-text>
            <el-tooltip content="Delete">
                <el-button type="danger" style="width: 30px; height: 30px; margin-left: auto;"
                           @click="emit('deleteSolve')">
                    <el-icon :size="20"><Delete /></el-icon>
                </el-button>
            </el-tooltip>
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px; overflow-y: auto;">
            <!------SOLVE RESULTS------>
            <el-text size="large" style="text-align: center;">{{selectedSolve[3]}}</el-text>
            <el-text style="font-size: 2rem; font-weight: bold;">{{getSolveTimeString(selectedSolve)}}</el-text>
            <el-text>{{getSolveRatioString(selectedSolve)}}</el-text>
            <!------SOLVE STATUS------>
            <div style="display: grid; grid-template-columns: 80px 10px 80px 10px 80px; width: 260px; align-self: center;">
                <el-button type="primary" :plain="selectedSolve[2] === timerStore.solveStatuses[0].id ? false : true" style="height: 25px; width: 80px;"
                           @click="selectedSolve[2] = timerStore.solveStatuses[0].id; timerStore.saveState()">
                    {{timerStore.solveStatuses[0].name}}
                </el-button>
                <div style="width: 10px;"/>
                <el-button type="primary" :plain="selectedSolve[2] === timerStore.solveStatuses[1].id ? false : true" style="height: 25px; width: 80px;"
                           @click="selectedSolve[2] = timerStore.solveStatuses[1].id; timerStore.saveState()">
                    {{timerStore.solveStatuses[1].name}}
                </el-button>
                <div style="width: 10px;"/>
                <el-button type="primary" :plain="selectedSolve[2] === timerStore.solveStatuses[2].id ? false : true" style="height: 25px; width: 80px;"
                           @click="selectedSolve[2] = timerStore.solveStatuses[2].id; timerStore.saveState()">
                    {{timerStore.solveStatuses[2].name}}
                </el-button>
            </div>
        </div>
    </div>
    <div v-else>
        
    </div>
</template>