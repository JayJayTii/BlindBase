<script setup>
    import { ref, onMounted, nextTick, watch } from 'vue'
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
</script>

<template>
    <div class="SolveList">
        <div class="header-row"> <h3>Solves:</h3>  </div>
        <div style="overflow:auto;"
             ref="solveListRef">
            <div v-for="(solve, index) in timerStore.getSession(props.sessionID).solves"
                 class="ListItem"
                 @click="emit('selectSolve',index)">
                <div style="display:flex; flex-direction:row;width:100%;gap:20px;">
                    <div>{{index + 1}}</div>
                    <div>{{ timerStore.getSolveTimeStringFromSolve(solve) }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
    .SolveList {
        position: absolute;
        height: 100%;
        width: 100%;
        padding: 2px;
        display: flex;
        flex-direction: column;
        background-color: var(--panel-color);
    }
</style>