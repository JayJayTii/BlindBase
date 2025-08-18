<script setup>
    import { useTimerStore } from "@/stores/TimerStore"
    const timerStore = useTimerStore()

    const props = defineProps({
        sessionID: Number,
    })
</script>

<template>
    <!--Contains info like single, mo3, ao5, etc. for this session-->
    <div class="Panel">
        <div class="PanelHeader"> Session Details:  </div>
        <div class="SessionDetailsGrid">
            <template v-for="statRow in timerStore.getSessionStatistics(sessionID)">
                <div class="SessionDetail">{{statRow[0]}}</div>
                <div class="SessionDetail">{{statRow[1]}} ({{statRow[2]}} : {{statRow[3]}})</div>
            </template>
        </div>
    </div>
</template>

<style>
    .SessionDetailsGrid {
        width: 100%;
        display: grid;
        grid-template-columns: 50px auto;
        text-align: center;
    }

    .SessionDetail {
        font-size: min(1vw, 2rem);
        border-inline-start: 1px solid var(--border-color);
        border-inline-end: 1px solid var(--border-color);
        border-block-start: 1px solid var(--border-color);
        border-block-end: 1px solid var(--border-color);
    }
</style>