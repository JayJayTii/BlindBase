<script setup>
    import { computed, ref } from 'vue'
    import { useTimerStore } from "@/stores/TimerStore"
	const timerStore = useTimerStore()

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

	function deleteSession() {
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

	function handleKeydown(event) {
		if (event.code == 'Space' || event.key == ' ') {
			// If it's been selected, it opens by space press on default but that messes with the timer
			mainDropdownRef.value.handleClose()
		}
	}
</script>

<template>
	<div style="display: flex; align-items: center;">
		<el-dropdown placement="bottom-end"
					 :split-button="true"
					 trigger="click"
					 @command="selectSession"
					 @click="handleClick"
					 style="padding-inline-start: 5px;"
					 @keydown="handleKeydown"
					 ref="mainDropdownRef">
			<div class="el-dropdown-link" ref="dropdownPositionRef" style="width: 222px;">
				<el-text :truncated="true">{{timerStore.getSession(sessionID)?.name || ''}}</el-text>
			</div>
			<!-- Dropdown with sheets to select from -->
			<template #dropdown>
				<el-dropdown-menu style="width: min(200px, 20vw); max-height: 400px; padding: 5px;">
					<el-dropdown-item v-for="session in timerStore.sessions"
									  :style="(session.id == sessionID) ? 'font-weight: bolder;' : ''"
									  :command="session.id">
						<el-text :truncated="true" id="name-input">{{session.name}}</el-text>
					</el-dropdown-item>
					<hr v-if="timerStore.sessions.length > 0" />
					<div style="display: flex; flex-direction: row; justify-content: end; margin-top: 5px;">
						<!-- NEW -->
						<el-tooltip placement="right" content="New">
							<el-button type="primary" @click="newSession(); mainDropdownRef.handleClose()"
									   style="justify-content: center; height: 35px; width: 35px;">
								<el-icon :size="20">
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
					 placement="bottom-start"
					 trigger="click"
					 @visible-change="onVisibleChange" >
			<template #dropdown>
				<el-dropdown-menu style="width: min(300px, 20vw); font-size: 1.2rem; padding: 5px; display: flex; flex-direction: row; gap: 10px;">
					<!------NAME------>
					<input v-model="currentSessionName"
						   maxlength="30"
						   @keydown.space.stop
						   style="width: 100%; font-size: inherit;" />

					<!------DELETE------>
					<el-popconfirm title="Are you sure?" @confirm="deleteSession">
						<template #reference>
							<el-button type="danger" style="height: auto; width: 15px;">
								<el-icon :size="15">
									<Delete />
								</el-icon>
							</el-button>
						</template>
					</el-popconfirm>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
	</div>
</template>