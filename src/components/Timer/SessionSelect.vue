<script setup>
    import { ref } from 'vue';
    import { useTimerStore } from "@/stores/TimerStore";
    const timerStore = useTimerStore();

    const props = defineProps({
        sessionID: Number,
    })
    const emit = defineEmits(['updateSessionID']);
</script>

<template>
    <div class="SessionSelect">
        <div class="header-row">
            <h3>Select Session:</h3>
        </div>
        <div v-for="(sessionName, index) in timerStore.getSessionNames"
             :class="['ListItem', sessionID === timerStore.sessions[index].id ? 'ListItemSelected' : 'ListItemUnselected']"
             @click="emit('updateSessionID', index);">
            {{ sessionName != "" ? sessionName : "&nbsp;" }}
        </div>
        <button @click="timerStore.newSession(); emit('updateSessionID',timerStore.sessions.length-1);"
                style="justify-content:center;">
            +
        </button>
    </div>
</template>

<style>
    .SessionSelect {
        padding: 2px;
        border-block-end: 3px solid var(--border-color);
        background-color: var(--panel-color);
        overflow-x: hidden;
        overflow-y: auto;
    }
</style>
