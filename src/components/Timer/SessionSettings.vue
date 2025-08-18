<script setup>
    import { computed, inject } from 'vue'
    import { useTimerStore } from "@/stores/TimerStore"
    const timerStore = useTimerStore()
    const confirmDialog = inject('confirmDialog')

    const props = defineProps({
        sessionID: Number,
    })
    const emit = defineEmits(['deleteSession'])

    const currentSessionName = computed({
        get: () => timerStore.getSession(props.sessionID)?.name || '',
        set: (newName) => {
            if (timerStore.isValidSessionID(props.sessionID)) {
                timerStore.sessions[timerStore.getSessionIndexWithID(props.sessionID)].name = newName
                timerStore.saveState()
            }
        }
    });
    const currentSessionType = computed({
        get: () => timerStore.getSession(props.sessionID).type,
        set: (newType) => {
            if (timerStore.isValidSessionID(props.sessionID)) {
                timerStore.sessions[timerStore.getSessionIndexWithID(props.sessionID)].type = newType
                timerStore.saveState();
            }
        }
    });

</script>

<template>
    <div class="Panel" v-if="props.sessionID !== -1">
        <div class="PanelHeader"> Session Settings: </div>
        <div class="SessionEditingRow">
            <input v-model="currentSessionName"
                   maxlength="20"
                   style="white-space:nowrap;font-weight:bold;font-size:2rem;width:100%;text-align:center;" />
        </div>
        <div class="SessionEditingRow">
            Type: <select v-model="currentSessionType" style="width: 100%; ">
                <option v-for="(type,index) in timerStore.getSessionTypes"
                        :key="index"
                        :value="index">
                    {{type.name}}
                </option>
            </select>
        </div>
        <div class="SessionEditingRow">
            <button @click="emit('deleteSession')">
                Delete
            </button>
        </div>
    </div>
    <div class="SessionSettings" v-else>
        <div style="color:var(--info-200)">
            Select a session to get started
        </div>
    </div>
</template>

<style>
    .SessionEditingRow {
        display: flex;
        flex-direction: row;
        padding: 2px;
        gap: 5px;
        width: 100%;
    }
</style>