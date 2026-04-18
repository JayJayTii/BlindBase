<script setup>
    import { computed, ref, inject } from 'vue'
    import { useTimerStore } from "@/stores/TimerStore"
	const timerStore = useTimerStore()
	const confirmDialog = inject('confirmDialog')

    const props = defineProps({
        sessionID: Number,
    })
    const emit = defineEmits(['sessionSelected'])

    function selectSession(id) {
        emit('sessionSelected', id)
    }

	function newSession() {
		emit('sessionSelected', timerStore.newSession())
	}

	async function deleteSession() {
		if (!(await confirmDialog.value.open('Are you sure you want to delete this session?'))) {
			return
		}
		timerStore.deleteSession(props.sessionID)
		if (timerStore.sessions.length > 0)
			emit('sessionSelected', timerStore.sessions[timerStore.sessions.length - 1].id)
		else
			emit('sessionSelected', -1)
	}

	const currentSessionName = computed({
		get: () => timerStore.getSession(props.sessionID)?.name || '',
		set: (newName) => {
			if (timerStore.isValidSessionID(props.sessionID)) {
				timerStore.sessions[timerStore.getSessionIndexWithID(props.sessionID)].name = newName
				timerStore.saveState()
			}
		}
	})

	const mainDropdownRef = ref(null)

	const sessionEditRef = ref(null)
	const dropdownPositionRef = ref(null)
	const sessionEditOpen = ref(false)
	function onVisibleChange(isOpen) {
		sessionEditOpen.value = isOpen
	}
	const handleClick = () => {
		if (sessionEditOpen.value) {
			sessionEditRef.value?.handleClose()
		} else {
			event.preventDefault()
			sessionEditRef.value?.handleOpen()
		}
	}
</script>

<template>
	<div style="height: 100%;">
		<el-dropdown placement="bottom-end"
					 :split-button="true"
					 trigger="click"
					 @command="selectSession"
					 @click="handleClick"
					 ref="mainDropdownRef">
			<div class="el-dropdown-link" ref="dropdownPositionRef" style="width: min(300px, 20vw);">
				<el-text :truncated="true">{{timerStore.getSession(sessionID)?.name || ''}}</el-text>
			</div>
			<!-- Dropdown with sheets to select from -->
			<template #dropdown>
				<el-dropdown-menu style="width: min(200px, 20vw); max-height: 400px; padding: 5px;">
					<el-dropdown-item v-for="session in timerStore.sessions"
									  :style="(session.id == sessionID) ? 'font-weight: bolder;' : ''"
									  :command="session.id">
						<el-text :truncated="true">{{session.name}}</el-text>
					</el-dropdown-item>
					<hr v-if="timerStore.sessions.length > 0" />
					<div style="display: grid; grid-template-columns: 1fr 1fr; text-align: center; gap: 5px; margin-top: 5px;">
						<div></div>
						<!-- NEW -->
						<el-tooltip placement="right" content="New">
							<el-button type="primary" @click="newSession(); mainDropdownRef.handleClose()"
									   style="justify-content: center; height: auto;">
								<el-icon :size="40">
									<Plus />
								</el-icon>
							</el-button>
						</el-tooltip>
					</div>
				</el-dropdown-menu>
			</template>
		</el-dropdown>

		<!-- Sheet editing dropdown, virtually triggered -->
		<el-dropdown :disabled="!timerStore.isValidSessionID(sessionID)"
					 ref="sessionEditRef"
					 virtual-triggering
					 :virtual-ref="dropdownPositionRef"
					 placement="bottom"
					 trigger="click"
					 @visible-change="onVisibleChange">
			<template #dropdown>
				<el-dropdown-menu style="width: min(300px, 20vw); font-size: 1.2rem; padding: 5px; display: flex; flex-direction: row; gap: 10px;">
					<!------NAME------>
					<input v-model="currentSessionName"
						   maxlength="30"
						   style="width: 100%; font-size: inherit;" />

					<!------DELETE------>
					<el-tooltip content="Delete">
						<el-button type="danger" style="height: auto; width: 15px;" @click="deleteSession()">
							<el-icon :size="15">
								<Delete />
							</el-icon>
						</el-button>
					</el-tooltip>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
	</div>
</template>