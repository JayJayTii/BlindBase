<script setup>
    import { computed, inject, onMounted, onUnmounted } from 'vue'
    import { session_types, useTimerStore } from "@/stores/TimerStore"
    const timerStore = useTimerStore()

    const props = defineProps({
        sessionID: Number,
    })

    const currentSessionType = computed({
        get: () => timerStore.getSession(props.sessionID).type,
        set: (newType) => {
            if (timerStore.isValidSessionID(props.sessionID)) {
                timerStore.sessions[timerStore.getSessionIndexWithID(props.sessionID)].type = newType
                timerStore.saveState()
            }
        }
    })

    function handleKeydown(event) {
        if (event.code == "Space" && document.activeElement.tagName == "SELECT")
            event.preventDefault()
    }

    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
    })
</script>

<template>
    <div id="session-settings" v-if="timerStore.isValidSessionID(props.sessionID)">
        <!------TYPE------>
        <div>
            Type:
            <el-select v-model="currentSessionType"
                       size="small"
                       style="width: 150px;"
                       :options="session_types"
                       :props="{value: 'id',label: 'name', options: session_types}">
            </el-select>
        </div>
    </div>
</template>

<style>
	#session-settings {
		display: flex;
		flex-direction: row;
		gap: 5px;
		padding: 2px;
		border: 1px solid var(--el-border-color);
		border-radius: var(--el-border-radius-base);
		padding-left: 5px;
	}
</style>