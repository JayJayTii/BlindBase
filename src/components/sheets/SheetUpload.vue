<script setup>
	import { ref } from 'vue'
	import { ElMessageBox } from 'element-plus'
	import { CreateSheetFromFile } from '@/helpers/sheets.js'
	import { sheet_types, useSheetStore } from "@/stores/SheetStore"
	import { useSettingsStore, defaults } from "@/stores/SettingsStore"
	defineExpose({
		open, close
	})

	const emit = defineEmits(['sheetUploaded'])

	const visible = ref(false)
	const selectedFile = ref(null)
	const sheet = ref({})
	const letterPairOrder = ref(null)
	function open() {
		selectedFile.value = null
		sheet.value = {}
		visible.value = true
		letterPairOrder.value = (useSettingsStore().settings.sheets_pairorder == 1) // true means column-row, false means row-column
	}
	function close() {
		visible.value = false
	}

	const handleBeforeUpload = () => {
		return false
	}

	async function handleUploadChange(uploadFile) {
		selectedFile.value = uploadFile
		if (!selectedFile.value.type.includes('csv')) {
			ElMessageBox.alert('Invalid file type, we only support .csv files. Please "Save as" / "Download" your spreadsheet as a .csv file from your spreadsheet editor.', 'Import Sheet', {confirmButtonText: 'OK',})
			selectedFile.value = null
			return
		}
		const content = await new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsText(selectedFile.value, 'UTF-8')
			reader.onload = e => resolve(e.target.result)
			reader.onerror = reject
		})

		let result = CreateSheetFromFile(content, letterPairOrder.value)
		if (!result[0]) {
			ElMessageBox.alert(result[1], 'Import Sheet', {confirmButtonText: 'OK',})
			selectedFile.value = null
			return
		}

		let name = selectedFile.value.name.slice(0, selectedFile.value.name.lastIndexOf('.')).substr(0, 30)

		sheet.value.name = name
		sheet.value.grid = result[1]
		// Corner type by default to encourage choosing the correct settings
		sheet.value.type = 1
		sheet.value.buffer = useSettingsStore().settings.misc_defaultcornerbuffer
		sheet.value.xHeadings = "ABCDEFGHIJKLMNOPQRSTUVWX"
		sheet.value.yHeadings = "ABCDEFGHIJKLMNOPQRSTUVWX"
	}

	function confirm() {
		sheet.value.id = useSheetStore().getNewSheetID()

		useSheetStore().sheets.push(sheet.value)
		useSheetStore().saveState()

		emit('sheetUploaded', sheet.value.id)
	}
</script>

<template>
	<el-dialog v-model="visible"
			   title="Upload Sheet"
			   width="500">
		<div v-if="selectedFile == null">
			<span>Only .csv files are accepted </span>
			<el-tooltip placement="right">
				<el-icon><QuestionFilled /></el-icon>
				<template #content>
					<div style="width: 300px;">You'll need to "Save As" or "Download" your spreadsheet and change the format to "Comma-separated values (.csv)"</div>
				</template>
			</el-tooltip>
			<el-upload drag
					   accept=".csv,text/csv"
					   :auto-upload="false"
					   :show-file-list="false"
					   :before-upload="handleBeforeUpload"
					   @change="handleUploadChange($event.raw)">
				<el-icon class="el-icon--upload"><upload-filled /></el-icon>
				<div class="el-upload__text">
					Drop your .csv file here or <em>click to upload</em>
				</div>
			</el-upload>
		</div>
		<div v-else style="display: flex; flex-direction: column; gap: 5px;">
			<div>
				Name: <el-input v-model="sheet.name" style="width: 200px" :maxlength="30" />
			</div>
			<div>
				Type:
				<el-select v-model="sheet.type"
						   style="width: 100px;"
						   @change="sheet.buffer = (sheet.type == 1 ? useSettingsStore().settings.misc_defaultcornerbuffer : useSettingsStore().settings.misc_defaultedgebuffer)"
						   :options="sheet_types"
						   :props="{value: 'id',label: 'name', options: sheet_types}">
				</el-select>
			</div>
			<div v-if="sheet.type == 1 || sheet.type == 2">
				Buffer:
				<span v-if="sheet.type == 1">
					<el-select v-model="sheet.buffer"
							   style="width: 100px;"
							   :options="defaults.misc_defaultcornerbuffer.options"
							   :props="{value: 'id',label: 'name', options: defaults.misc_defaultcornerbuffer.options}">
					</el-select>
				</span>
				<span v-else-if="sheet.type == 2">
					<el-select v-model="sheet.buffer"
							   style="width: 100px;"
							   :options="defaults.misc_defaultedgebuffer.options"
							   :props="{value: 'id',label: 'name', options: defaults.misc_defaultedgebuffer.options}">
					</el-select>
				</span>
			</div>
			<div>
				Letter pair order in sheet:
				<el-select v-model="letterPairOrder" style="width: 150px;" @change="handleUploadChange(selectedFile, letterPairOrder)">
					<el-option :value="false" label="row-column">row-column</el-option>
					<el-option :value="true" label="column-row">column-row</el-option>
				</el-select>
				<el-tooltip placement="right">
					<el-icon><QuestionFilled /></el-icon>
					<template #content>
						<div style="width: 250px;">Does 'XA' mean 'row X, column A', or does it mean 'column X, row A'?</div>
					</template>
				</el-tooltip>
			</div>
		</div>
		<template #footer>
			<div class="dialog-footer">
				<el-button v-if="selectedFile == null" @click="close()">
					Cancel
				</el-button>
				<el-button v-else @click="open()">
					Back
				</el-button>
				<el-button type="primary" @click="confirm(); close()" :disabled="selectedFile == null">
					Confirm
				</el-button>
			</div>
		</template>
	</el-dialog>
</template>