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
    <div class="Panel" v-if="props.solveIndex > -1 && timerStore.isValidSessionID(props.sessionID)">
        <div style="display:flex;flex-direction:row;height:">
            <div class="PanelHeader"> Solve {{props.solveIndex + 1}}: </div>
        </div>
        <div class="SolveDetails">
            <!------CONTROLS------>
            <div style="display:flex; justify-content:space-between;  width:100%;">
                <img @click="emit('unselectSolve')" title="Back" src="@/assets/icons/arrow-left-long.svg" class="CustomButton" style="width:60px; height: 40px;" />
                <img @click="Reconstruct()"         title="Reconstruct" src="@/assets/tool_icons/ReconsIcon.png"      class="CustomButton" style="width:52px; height:40px;"  />
                <img @click="emit('deleteSolve')"   title="Delete" src="@/assets/icons/delete-bin.svg"      class="CustomButton" style="width:40px; height:40px;" />
            </div>  
            
            <!------SOLVE RESULTS------>
            <div>{{selectedSolve[3]}}</div>
            <h1>{{getSolveTimeString(selectedSolve)}}</h1>
            <h3>{{getSolveRatioString(selectedSolve)}}</h3>
            <!------SOLVE STATUS------>
            <div class="StatusRow">
                <template v-for="status in timerStore.solveStatuses">
                    <div :class="['ListItem', selectedSolve[2] === status.id ? 'ListItemSelected' : 'ListItemUnselected']"
                         @click="selectedSolve[2] = status.id; timerStore.saveState()">
                        {{status.name}}
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<style>
    .SolveDetails {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 2px;
        overflow-x: hidden;
        overflow-y: auto;
    }

    .StatusRow {
        display: grid;
        grid-template-columns: 70px 70px 70px;
        text-align: center;
        color: var(--grey-100);
    }
</style>