<script setup>
    import { computed } from 'vue'
    import { useTimerStore } from "@/stores/TimerStore"
    import { formatTime } from '@/helpers/timer.js'
    const timerStore = useTimerStore()

    const props = defineProps({
        sessionID: Number,
    })
    function format(stat) {
        if (!Array.isArray(stat)) {
            //Best average
            if (stat == -1)
                return "---"
            return formatTime(stat)
        }

        if (stat[0] == -1)
            return "---"
        if (stat[1])
            return "DNF (" + formatTime(stat[0]) + ")"

        return formatTime(stat[0])
    }

    const dnfRatio = computed({
        get: () => {
            const dnfs = timerStore.getDnfCount(props.sessionID)
            return [timerStore.getSession(props.sessionID).solves.length - dnfs, dnfs]
        }
    })
</script>

<template>
    <!--Contains info like single, mo3, ao5, etc. for this session-->
    <div class="Panel" v-if="timerStore.isValidSessionID(sessionID)">
        <div class="PanelHeader"> Session Details:  </div>
        <div style="text-align:center;">{{dnfRatio[0]}} successes : {{dnfRatio[1]}} DNFs</div>
        <div class="SessionDetailsGrid">
            <div class="SessionDetail"></div>
            <div class="SessionDetail">Current</div>
            <div class="SessionDetail">Best</div>
            <template v-for="statRow in timerStore.getSessionStatistics(props.sessionID)">
                <div class="SessionDetail">{{statRow[0]}}</div>
                <div class="SessionDetail">{{format(statRow[1][0])}}<br />({{format(statRow[1][1])}} : {{format(statRow[1][2])}})</div>
                <div class="SessionDetail">{{format(statRow[2][0])}}<br />({{format(statRow[2][1])}} : {{format(statRow[2][2])}})</div>
            </template>
        </div>
    </div>
    <div v-else class="Panel">
        <div class="PanelHeader"> Session Details: </div>
        <div style="color:var(--info-200);text-align:center;">
            Select a session to get started
        </div>
    </div>
</template>

<style>
    .SessionDetailsGrid {
        width: 100%;
        display: grid;
        grid-template-columns: auto 2fr 2fr;
        text-align: center;
    }

    .SessionDetail {
        font-size: 0.75rem;
        border-inline-start: 1px solid var(--border-color);
        border-inline-end: 1px solid var(--border-color);
        border-block-start: 1px solid var(--border-color);
        border-block-end: 1px solid var(--border-color);
    }
</style>