<script setup>
	import { computed, ref, watch, nextTick } from 'vue'
	import { ElMessageBox } from 'element-plus'
	import { useTimerStore } from "@/stores/TimerStore"
	const timerStore = useTimerStore()

	const props = defineProps({
		sessionID: Number,
	})
	const emit = defineEmits(['sessionSelected'])
	watch(
		() => props.sessionID,
		(newValue) => { selectedSession.value = newValue }
	)

	function selectSession(id) {
		document.activeElement.blur() // Prevent select box from taking the space input instead of timer
		emit('sessionSelected', id)
	}

	function newSession() {
		emit('sessionSelected', timerStore.newSession())
	}

	function deleteSession(sessionID) {
		timerStore.deleteSession(sessionID)
		if (timerStore.sessions.length > 0)
			emit('sessionSelected', timerStore.sessions[timerStore.sessions.length - 1].id)
		else {
			emit('sessionSelected', -1)
			nextTick(() => { selectedSession.value = null })
		}
	}

	const sessionNameEditName = computed({
		get: () => timerStore.getSession(sessionNameEditSession.value)?.name || '',
		set: (newName) => {
			if (timerStore.isValidSessionID(sessionNameEditSession.value)) {
				timerStore.sessions[timerStore.getSessionIndexWithID(sessionNameEditSession.value)].name = newName
				timerStore.saveState()
			}
		}
	})

	const selectedSession = ref(props.sessionID == -1 ? null : props.sessionID)

	const sessionNameEditSession = ref(-1)
	const newSessionNameInputRef = ref(null)

	function confirmDelete(sessionID) {
		ElMessageBox.confirm(
			'Are you sure you want to delete \'' + timerStore.getName(sessionID) + '\'?',
			'Delete session',
			{ confirmButtonText: 'Confirm', cancelButtonText: 'Cancel', type: 'warning', }
		).then(() => { deleteSession(sessionID) }).catch(() => { })
	}
</script>

<template>
	<span >
		<el-select v-model="selectedSession" placeholder="Create a session" style="width: 100%;">
			<el-option v-for="session in timerStore.sessions" :value="session.id" @click="selectSession(session.id)" :label="session.name" class="session-option">
				<span><el-text class="sessionNameLabel">{{session.name}}</el-text></span>
				<span class="edit-session" @click.stop @click="sessionNameEditSession = session.id"><el-icon size="18"><Edit /></el-icon></span>
				<span class="edit-session" :id="'delete' + session.id" @click.stop @click="confirmDelete(session.id)"><el-icon size="18"><Delete /></el-icon></span>
			</el-option>

			<template #empty>
				Click the + to create a session
			</template>
			<template #footer>
				<div style="display: flex; justify-content: end;">

					<el-tooltip placement="bottom" content="New" :show-after="500">
						<el-button @click="newSession();" style="justify-content: center; height: 35px; width: 35px;">
							<el-icon :size="20"><Plus /></el-icon>
						</el-button>
					</el-tooltip>
				</div>
			</template>
		</el-select>

		<el-dialog :model-value="sessionNameEditSession != -1" title="Enter a new name for this session:" width="500" @close="sessionNameEditSession = -1" @opened="newSessionNameInputRef.focus()">
			<el-input v-model="sessionNameEditName" ref="newSessionNameInputRef" id="sessionNameInput" maxlength="30" style="width: 100%; font-size: inherit; margin-right: 10px;" />
			<template #footer>
				<el-button @click="sessionNameEditSession = -1">Done</el-button>
			</template>
		</el-dialog>
	</span>
</template>

<style>
	.session-option {
		display: grid;
		grid-template-columns: 180px repeat(2, 1fr);
		gap: 5px;
	}

		.session-option:hover .sessionNameLabel {
			display: inline-block;
			max-width: 140px;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

	.edit-session {
		cursor: pointer;
		margin-top: 4px;
		padding-left: 3px;
		height: 25px;
		width: 25px;
		display: none;
	}

	.session-option:hover .edit-session {
		display: inline-block;
	}

	.edit-session:hover {
		border-radius: 10px;
		background-color: var(--el-fill-color-darker);
	}
</style>