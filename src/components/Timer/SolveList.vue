<script setup>
    import { ref, onMounted, nextTick, watch } from 'vue'
    import { getSolveTimeString } from "@/helpers/timer.js"
    import { useTimerStore } from "@/stores/TimerStore"
    const timerStore = useTimerStore()

    const props = defineProps({
        sessionID: Number,
    })
    const emit = defineEmits(['selectSolve'])
    //When the solve list is updated, scroll to latest solve
    const solveListRef = ref(null)

    onMounted(
        async () => {
            await nextTick()
            if (solveListRef.value) {
                solveListRef.value.scrollTop = solveListRef.value.scrollHeight
            }
        }
    )
    watch(
        () => timerStore.getSession(props.sessionID)?.solves.length,
        async () => {
            await nextTick()
            if (solveListRef.value) {
                solveListRef.value.scrollTop = solveListRef.value.scrollHeight
            }
        }
    )
    function SolveClicked(index) {
        emit('selectSolve', index)
    }
</script>

<template>
    <div class="Panel" v-if="timerStore.isValidSessionID(sessionID)">
        <div class="PanelHeader"> Solves: </div>
        <div ref="solveListRef">
            <div v-for="(label, index) in timerStore.getSession(props.sessionID).solves.map((solve,index) => (index+1).toString() + ' | ' + getSolveTimeString(solve))"
                class="ListItem"
                 @click="SolveClicked(index)">
                {{label}}
            </div>
        </div>
    </div>
    <div v-else class="Panel">
        <div class="PanelHeader"> Solves: </div>
        <div style="color:var(--info-200);text-align:center;">
            Select a session to get started
        </div>
    </div>
</template>

<style>
    .scroller {
        height: 100%; /* or whatever fits your layout */
        overflow-x: hidden;
    }
</style>