<script setup>
    import { useTimerStore } from "@/stores/TimerStore";
    const timerStore = useTimerStore();

    const props = defineProps({
        sessionID: Number,
    })

</script>

<template>
    <div class="SessionDetails">
        <div class="header-row"> <h3>Session Details:</h3>  </div>
        <div class="SessionDetailsGrid">
            <template v-for="statRow in timerStore.getSessionStatistics(sessionID)">
                <div class="SessionDetailBorder"></div>
                <div class="SessionDetailBorder"></div>
                <div class="SessionDetail">{{statRow[0]}}</div>
                <div class="SessionDetail">{{statRow[1]}} ({{statRow[2]}} : {{statRow[3]}})</div>
            </template>
            <div class="SessionDetailBorder"></div>
            <div class="SessionDetailBorder"></div>
        </div>
    </div>
</template>

<style>
    .SessionDetails {
        padding: 2px;
        border-block-end: 3px solid var(--border-color);
        background-color: var(--panel-color);
        overflow-x: hidden;
        overflow-y: auto;
    }

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
    }

    .SessionDetailBorder {
        height: 2px;
        background-color: var(--border-color);
    }
</style>