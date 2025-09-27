<script setup>
    import { reactive, onMounted, onUnmounted } from 'vue'
    import { useTimerStore } from '@/stores/TimerStore'
    const timerStore = useTimerStore()
    timerStore.loadState()

    const props = defineProps({
        sessionID: Number,
    })

    //Initialise solve with last solve of the session
    const solve = reactive({})
    solve.value = timerStore.sessions[timerStore.getSessionIndexWithID(props.sessionID)].solves.at(-1)
    if (!solve.value) {
        solve.value = {solveTime: 0} //Initialise timer to 0.00 if this is the first solve
    }

    function handleKeydown(event) {
        //Status change keybinds
        if (event.code === "ArrowRight") {
            if (solve.value.status < timerStore.solveStatuses.length - 1) {
                solve.value.status++
                timerStore.saveState()
            }
        }
        else if (event.code === "ArrowLeft") {
            if (solve.value.status > 0) {
                solve.value.status--
                timerStore.saveState()
            }
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
    <div class="TimerContainer">
        <!---LAST SOLVE STATUS--->
        <div class="StatusRow" v-if="'status' in solve.value">
            <template v-for="status in timerStore.solveStatuses">
                <div :class="['ListItem', solve.value.status === status.id ? 'ListItemSelected' : 'ListItemUnselected']"
                     @click="solve.value.status = status.id;timerStore.saveState()">
                    {{status.name}}
                </div>
            </template>
        </div>
    </div>
</template>

<style>
    .StatusRow {
        display: grid;
        grid-template-columns: repeat(3, 70px);
        font-size: 1.5rem;
        align-self: center;
        text-align: center;
        color: var(--grey-100);
    }
    .StatusButton {
        background-color: var(--grey-600);
        border: 1px solid var(--panel-color);
        border-radius: 5px;
        color: var(--grey-100);
        cursor: pointer;
        font-size: 1rem;
    }
</style>
