<script setup>
	import { computed, ref, inject } from 'vue'
	import { useSheetStore } from "@/stores/SheetStore"
	const sheetStore = useSheetStore()
	import { downloadSheet, CreateSheetFromFile } from '@/helpers/sheets.js'

	const confirmDialog = inject('confirmDialog')

	const props = defineProps({
		sheetID: Number,
	})
	const emit = defineEmits(['sheetSelected'])

	function selectSheet(command) {
		emit('sheetSelected', command)
	}

	function UploadSheet() {
		//https://stackoverflow.com/questions/16215771/how-to-open-select-file-dialog-via-js
		var input = document.createElement('input')
		input.type = 'file'
		input.accept = '.csv'
		input.onchange = async e => {
			var file = e.target.files[0]
			const newSheetID = await CreateSheetFromFile(file)
			if (newSheetID != -1)
				emit('sheetSelected', newSheetID)
		}
		input.click()
	}

	function NewSheet() {
		emit('sheetSelected', sheetStore.newSheet())
	}

	async function deleteSheet() {
		if (!(await confirmDialog.value.open('Are you sure you want to delete this sheet?'))) {
			return
		}
		sheetStore.deleteSheet(props.sheetID)
		if (sheetStore.sheets.length > 0)
			emit('sheetSelected', sheetStore.sheets[sheetStore.sheets.length - 1].id)
		else
			emit('sheetSelected', -1)
	}

	const currentSheetName = computed({
		get: () => sheetStore.getSheet(props.sheetID)?.name || '',
		set: (newName) => {
			if (sheetStore.isValidSheetID(props.sheetID)) {
				sheetStore.sheets[sheetStore.getSheetIndexWithID(props.sheetID)].name = newName
				sheetStore.saveState()
			}
		}
	})

	const mainDropdownRef = ref(null)

	const sheetEditRef = ref(null)
	const dropdownPositionRef = ref(null)
	const sheetEditOpen = ref(false)
	function onVisibleChange(isOpen) {
		sheetEditOpen.value = isOpen
	}
	const handleClick = () => {
		if (sheetEditOpen.value) {
			sheetEditRef.value?.handleClose()
		} else {
			event.preventDefault()
			sheetEditRef.value?.handleOpen()
		}
	}
</script>

<template>
	<div style="height: 100%;">
		<el-dropdown placement="bottom-end"
					 :split-button="true"
					 trigger="click"
					 @command="selectSheet"
					 @click="handleClick"
					 ref="mainDropdownRef">
			<div class="el-dropdown-link" ref="dropdownPositionRef" style="width: min(300px, 20vw);">
				<el-text :truncated="true">{{sheetStore.getSheet(sheetID)?.name || ''}}</el-text>
			</div>
			<!-- Dropdown with sheets to select from -->
			<template #dropdown>
				<el-dropdown-menu style="width: min(200px, 20vw); max-height: 400px; padding: 5px;">
					<el-dropdown-item v-for="sheet in sheetStore.sheets"
									  :style="(sheet.id == sheetID) ? 'font-weight: bolder;' : ''"
									  :command="sheet.id">
						<el-text :truncated="true">{{sheet.name}}</el-text>
					</el-dropdown-item>
					<hr v-if="sheetStore.sheets.length > 0" />
					<div style="display: grid; grid-template-columns: 1fr 1fr; text-align: center; gap: 5px; margin-top: 5px;">
						<!-- UPLOAD -->
						<el-tooltip placement="left" content="Upload">
							<el-button type="primary" @click="UploadSheet(); mainDropdownRef.handleClose()" 
									   style="justify-content: center; height: auto;">
								<el-icon :size="40">
									<Upload />
								</el-icon>
							</el-button>
						</el-tooltip>
						<!-- NEW -->
						<el-tooltip placement="right" content="New">
							<el-button type="primary" @click="NewSheet(); mainDropdownRef.handleClose()" 
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
		<el-dropdown :disabled="!sheetStore.isValidSheetID(sheetID)"
					 ref="sheetEditRef"
					 virtual-triggering
					 :virtual-ref="dropdownPositionRef"
					 placement="bottom"
					 trigger="click"
					 @visible-change="onVisibleChange">
			<template #dropdown>
				<el-dropdown-menu style="width: min(300px, 20vw); height: 100px; font-size: 1.5rem; padding: 5px; display: flex; flex-direction: column; gap: 10px;">
					<!------NAME------>
					<input v-model="currentSheetName"
						   maxlength="30"
						   style="width: 100%; font-size: inherit;" />

					<div style="width: 100%; display: grid; grid-template-columns: 1fr 1fr;">
						<!------DOWNLOAD------>
						<el-tooltip content="Download">
							<el-button type="primary" style="height: auto;" @click="downloadSheet(sheetStore.getSheet(sheetID))">
								<el-icon :size="30">
									<Download />
								</el-icon>
							</el-button>
						</el-tooltip>
						<!------DELETE------>
						<el-tooltip content="Delete">
							<el-button type="danger" style="height: auto;" @click="deleteSheet()">
								<el-icon :size="30">
									<Delete />
								</el-icon>
							</el-button>
						</el-tooltip>
					</div>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
	</div>
</template>