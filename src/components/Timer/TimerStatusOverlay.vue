<script setup>
    import { reactive, onMounted, onUnmounted } from 'vue'
    import { useTimerStore } from '@/stores/TimerStore'
    const timerStore = useTimerStore()

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
            solve.value.status = (solve.value.status + 1) % 3
            timerStore.saveState()
        }
        else if (event.code === "ArrowLeft") {
            solve.value.status = (solve.value.status + 3 - 1) % 3
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
    <!---LAST SOLVE STATUS--->
    <div class="StatusRow" v-if="'status' in solve.value">
        <div class="ListItem" style="user-select:none;" @click="solve.value.status = (solve.value.status - 1 + timerStore.solveStatuses.length) % timerStore.solveStatuses.length;timerStore.saveState()">
            <--
        </div>
        <template v-for="status in timerStore.solveStatuses">
            <div :class="['ListItem', solve.value.status === status.id ? 'ListItemSelected' : 'ListItemUnselected']"
                 style="user-select:none;"
                 @click="solve.value.status = status.id;timerStore.saveState()">
                {{status.name}}
            </div>
        </template>
        <div class="ListItem" style="user-select:none;" @click="solve.value.status = (solve.value.status + 1) % timerStore.solveStatuses.length;timerStore.saveState()">
            -->
        </div>
    </div>
</template>

<style>
    .StatusRow {
        display: grid;
        grid-template-columns: 30px 70px 70px 70px 30px;
        text-align: center;
        color: var(--grey-100);
    }
    .StatusButton {
        background-color: var(--grey-600);
        border: 1px solid var(--panel-color);
        border-radius: 5px;
        color: var(--grey-100);
        cursor: pointer;
    }
</style>
