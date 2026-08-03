<script setup>
	import { computed, ref, nextTick, watch } from 'vue'
	import { ElMessageBox } from 'element-plus'
	import { downloadSheet } from '@/helpers/sheets.js'
	import { useSheetStore } from "@/stores/SheetStore"
	const sheetStore = useSheetStore()

	import SheetUpload from '@/components/sheets/SheetUpload.vue'

	const props = defineProps({
		sheetID: Number,
	})
	const emit = defineEmits(['sheetSelected'])
	watch(
		() => props.sheetID,
		(newValue) => { selectedSheet.value = newValue }
	)

	function selectSheet(command) {
		emit('sheetSelected', command)
	}

	function newSheet() {
		emit('sheetSelected', sheetStore.newSheet())
	}

	function deleteSheet(sheetID) {
		sheetStore.deleteSheet(sheetID)
		if (sheetStore.sheets.length > 0)
			emit('sheetSelected', sheetStore.sheets[sheetStore.sheets.length - 1].id)
		else {
			emit('sheetSelected', -1)
			nextTick(() => { selectedSheet.value = null })
		}
	}

	const sheetNameEditName = computed({
		get: () => sheetStore.getSheet(sheetNameEditSheet.value)?.name || '',
		set: (newName) => {
			if (sheetStore.isValidSheetID(sheetNameEditSheet.value)) {
				sheetStore.sheets[sheetStore.getSheetIndexWithID(sheetNameEditSheet.value)].name = newName
				sheetStore.saveState()
			}
		}
	})

	const uploadDialog = ref(null)

	const selectedSheet = ref(props.sheetID == -1 ? null : props.sheetID)
	const sheetNameEditSheet = ref(-1)
	const newSheetNameInputRef = ref(null)

	function confirmDownload(sheetID) {
		ElMessageBox.confirm(
			'Do you want to download \'' + sheetStore.getName(sheetID) + '\'?',
			'Download sheet',
			{ confirmButtonText: 'Confirm', cancelButtonText: 'Cancel' }
		).then(() => { downloadSheet(sheetStore.getSheet(sheetID)) }).catch(() => { })
	}
	function confirmDelete(sheetID) {
		ElMessageBox.confirm(
			'Are you sure you want to delete \'' + sheetStore.getName(sheetID) + '\'?',
			'Delete sheet',
			{ confirmButtonText: 'Confirm', cancelButtonText: 'Cancel', type: 'warning', }
		).then(() => { deleteSheet(sheetID) }).catch(() => {})
	}
</script>

<template>
	<span>
		<el-select v-model="selectedSheet" placeholder="Create a sheet" style="width: 300px;">
			<el-option v-for="sheet in sheetStore.sheets" :value="sheet.id" @click="selectSheet(sheet.id)" :label="sheet.name" class="sheet-option">
				<span><el-text class="sheetNameLabel">{{sheet.name}}</el-text></span>
				<span class="edit-sheet" @click.stop @click="sheetNameEditSheet = sheet.id"><el-icon size="18"><Edit /></el-icon></span>
				<span class="edit-sheet" @click.stop @click="confirmDownload(sheet.id)"><el-icon size="18"><Download /></el-icon></span>
				<span class="edit-sheet" :id="'delete' + sheet.id" @click.stop @click="confirmDelete(sheet.id)"><el-icon size="18"><Delete /></el-icon></span>
			</el-option>

			<template #empty>Click the + to create a sheet</template>
			<template #footer>
				<div style="display: flex; justify-content: end;">
					<el-tooltip placement="bottom" content="Upload" :show-after="500">
						<el-button @click="uploadDialog.open()" style="justify-content: center; height: 35px; width: 35px;">
							<el-icon :size="20"><Upload /></el-icon>
						</el-button>
					</el-tooltip>

					<el-tooltip placement="bottom" content="New" :show-after="500">
						<el-button @click="newSheet();" style="justify-content: center; height: 35px; width: 35px;">
							<el-icon :size="20"><Plus /></el-icon>
						</el-button>
					</el-tooltip>
				</div>
			</template>
		</el-select>

		<el-dialog :model-value="sheetNameEditSheet != -1" title="Enter a new name for this sheet:" width="500" @close="sheetNameEditSheet = -1" @opened="newSheetNameInputRef.focus()">
			<el-input v-model="sheetNameEditName" ref="newSheetNameInputRef" maxlength="30" style="width: 100%; font-size: inherit; margin-right: 10px;" />
			<template #footer><el-button @click="sheetNameEditSheet = -1">Done</el-button></template>
		</el-dialog>

		<SheetUpload ref="uploadDialog" @sheetUploaded="selectSheet" />
	</span>
</template>

<style>
	.sheet-option {
		display: grid;
		grid-template-columns: 150px repeat(3, 1fr);
		gap: 5px;
	}

		.sheet-option:hover .sheetNameLabel {
			display: inline-block;
			max-width: 140px;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

	.edit-sheet {
		cursor: pointer;
		margin-top: 4px;
		padding-left: 3px;
		height: 25px;
		width: 25px;
		display: none;
	}

	.sheet-option:hover .edit-sheet {
		display: inline-block;
	}

	.edit-sheet:hover {
		border-radius: 10px;
		background-color: var(--el-fill-color-darker);
	}
</style>