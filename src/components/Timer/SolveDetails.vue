<script setup>
    import { computed } from 'vue'
    import { useTimerStore } from "@/stores/TimerStore"
    const timerStore = useTimerStore()

    const props = defineProps({
        sessionID: Number,
        solveIndex: Number,
    })
    const emit = defineEmits(['unselectSolve','deleteSolve'])
    const selectedSolve = computed({
        get: () => props.solveIndex > -1 ? timerStore.getSession(props.sessionID).solves[props.solveIndex] : null
    })

</script>

<template>
    <div class="Panel">
        <div class="PanelHeader"> Solve {{props.solveIndex + 1}}: </div>
        <div class="SolveDetails">
            <div>{{selectedSolve.scramble}}</div>
            <h1>{{timerStore.getSolveTimeString(props.sessionID, props.solveIndex)}}</h1>
            <h3>{{timerStore.getSolveRatioString(props.sessionID, props.solveIndex)}}</h3>
            <div class="StatusRow">
                <template v-for="status in timerStore.solveStatuses">
                    <div :class="['ListItem', selectedSolve.status === status.id ? 'ListItemSelected' : 'ListItemUnselected']"
                         @click="selectedSolve.status = status.id;timerStore.saveState()">
                        {{status.name}}
                    </div>
                </template>
            </div>
            <button @click="emit('unselectSolve')" style="width:30%;">back</button>
            <RouterLink to="/recons" class="PanelHeader">
                RECONSTRUCT
            </RouterLink>
            <button @click="emit('deleteSolve')" style="width:30%;">delete</button>
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