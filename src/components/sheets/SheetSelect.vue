<script setup>
	import { computed, ref } from 'vue'
	import { ElMessage } from 'element-plus'
	import SheetUpload from '@/components/sheets/SheetUpload.vue'
	import { useSheetStore } from "@/stores/SheetStore"
	const sheetStore = useSheetStore()
	import { downloadSheet } from '@/helpers/sheets.js'

	const props = defineProps({
		sheetID: Number,
	})
	const emit = defineEmits(['sheetSelected'])

	function selectSheet(command) {
		emit('sheetSelected', command)
	}

	function newSheet() {
		emit('sheetSelected', sheetStore.newSheet())
	}

	function deleteSheet() {
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
	const uploadDialogRef = ref(null)

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
	<span>
		<el-dropdown placement="bottom-end"
					 :split-button="true"
					 trigger="click"
					 @command="selectSheet"
					 @click="handleClick"
					 ref="mainDropdownRef">
			<div class="el-dropdown-link" ref="dropdownPositionRef" style="width: min(250px, 20vw);">
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
					<div style="display: flex; flex-direction: row; justify-content:end; margin-top: 5px;">
						<!-- UPLOAD -->
						<el-tooltip placement="bottom" content="Upload">
							<el-button type="primary" @click="uploadDialogRef.open(); mainDropdownRef.handleClose()" 
									   style="justify-content: center; height: 35px; width: 35px;">
								<el-icon :size="20">
									<Upload />
								</el-icon>
							</el-button>
						</el-tooltip>
						<!-- NEW -->
						<el-tooltip placement="bottom" content="New">
							<el-button type="primary" @click="newSheet(); mainDropdownRef.handleClose()" 
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
		<el-dropdown :disabled="!sheetStore.isValidSheetID(sheetID)"
					 ref="sheetEditRef"
					 virtual-triggering
					 :virtual-ref="dropdownPositionRef"
					 placement="bottom"
					 trigger="click"
					 @visible-change="onVisibleChange">
			<template #dropdown>
				<el-dropdown-menu style="width: min(300px, 20vw); height: 40px; font-size: 1.5rem; padding: 5px; display: flex; flex-direction: row;">
					<!------NAME------>
					<el-input v-model="currentSheetName"
						   maxlength="30"
						   style="width: 100%; font-size: inherit; margin-right: 10px;;" />
					<!------DOWNLOAD------>
					<el-tooltip content="Download">
						<el-button type="primary" style="height: auto; width: 45px; padding: 0px;" @click="downloadSheet(sheetStore.getSheet(sheetID))">
							<el-icon :size="20">
								<Download />
							</el-icon>
						</el-button>
					</el-tooltip>

					<!------DELETE------>
					<el-popconfirm title="Are you sure?" @confirm="deleteSheet">
						<template #reference>
							<el-button type="danger" style="height: auto; width: 45px; padding: 0px;">
								<el-icon :size="20">
									<Delete />
								</el-icon>
							</el-button>
						</template>
					</el-popconfirm>
				</el-dropdown-menu>
			</template>
		</el-dropdown>

		<SheetUpload ref="uploadDialogRef" @sheetUploaded="selectSheet" />
	</span>
</template>