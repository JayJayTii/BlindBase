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
		if (event.code == "Space" && document.activeElement.tagName == "SELECT") {
			event.preventDefault()
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
	<span id="session-settings" v-if="timerStore.isValidSessionID(props.sessionID)">
		<!------TYPE------>
		<div>
			<span style="padding-inline-end: 10px;">Type:</span>
			<el-select v-model="currentSessionType"
					   style="width: 200px;"
					   :options="session_types"
					   :props="{value: 'id',label: 'name', options: session_types}">
			</el-select>
		</div>
	</span>
</template>