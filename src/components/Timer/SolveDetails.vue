<script setup>
    import { computed } from 'vue'
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

    function Reconstruct() {
        sessionStorage.reconstructionSolve = JSON.stringify(selectedSolve.value)
        router.push('/recons/' + selectedSolve.value.scramble)
    }
</script>

<template>
    <div class="Panel" v-if="props.solveIndex > -1 && timerStore.isValidSessionID(props.sessionID)">
        <div style="display:flex;flex-direction:row;height:">
            
            <div class="PanelHeader"> Solve {{props.solveIndex + 1}}: </div>
        </div>
        <div class="SolveDetails">
            <!------CONTROLS------>
            <div style="display:flex; justify-content:space-between;  width:100%;">
                <img @click="emit('unselectSolve')" title="Back to solve list" src="@/assets/arrow-left-long.svg" class="CustomButton" style="width:60px; height: 40px;" />
                <img @click="Reconstruct()"         title="Reconstruct this solve" src="@/assets/ReconsIcon.png"      class="CustomButton" style="width:52px; height:40px;"  />
                <img @click="emit('deleteSolve')"   title="Delete this solve" src="@/assets/delete-bin.svg"      class="CustomButton" style="width:40px; height:40px;" />
            </div>  
            
            <!------SOLVE RESULTS------>
            <div>{{selectedSolve.scramble}}</div>
            <h1>{{getSolveTimeString(selectedSolve)}}</h1>
            <h3>{{getSolveRatioString(selectedSolve)}}</h3>
            <!------SOLVE STATUS------>
            <div class="StatusRow">
                <div class="ListItem" style="user-select:none;" @click="selectedSolve.status = (selectedSolve.status - 1 + timerStore.solveStatuses.length) % timerStore.solveStatuses.length;timerStore.saveState()">
                    <--
                </div>
                <template v-for="status in timerStore.solveStatuses">
                    <div :class="['ListItem', selectedSolve.status === status.id ? 'ListItemSelected' : 'ListItemUnselected']"
                         @click="selectedSolve.status = status.id;timerStore.saveState()">
                        {{status.name}}
                    </div>
                </template>
                <div class="ListItem" style="user-select:none;" @click="selectedSolve.status = (selectedSolve.status + 1) % timerStore.solveStatuses.length;timerStore.saveState()">
                    -->
                </div>
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
</style>