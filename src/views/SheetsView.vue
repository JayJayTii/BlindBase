<script setup>
	import { reactive, nextTick, ref } from "vue"
	import { useSheetStore } from "../stores/SheetStore"
	import { useSettingsStore } from "../stores/SettingsStore"
	const sheetStore = useSheetStore()
	sheetStore.loadState()
	const settingsStore = useSettingsStore()
	settingsStore.loadState()

	import SheetSelect from "@/components/sheets/SheetSelect.vue"
	import SheetSettings from "@/components/sheets/SheetSettings.vue"
	import SheetGrid from "@/components/SheetGrid.vue"
	import EditCell from "@/components/sheets/EditCell.vue"

	const sheetID = ref(sheetStore.sheets[0]?.id || -1)
	const selectedCell = reactive({ value: { x: -1, y: -1 } })

	const grid = ref(null)

	async function updateSheetID(id) {
		sheetID.value = id
		nextTick(() => { grid.value?.changeHighlightedCells([selectedCell.value]) })
	}

	function onCellClicked(newValues, create) {
		selectedCell.value = create ? newValues[0] : { x: -1, y: -1 }
		grid.value.changeHighlightedCells(create ? [selectedCell.value] : [])
	}
</script>


<template>
	<div style="height: 45px; padding: 4px;">
		<SheetSelect :sheetID="sheetID" @sheetSelected="updateSheetID" />
	
		<SheetSettings :sheetID="sheetID" v-if="sheetStore.isValidSheetID(sheetID)" />
	</div>

	<EditCell style="height: 53px; margin-left: 5px;"
			  @cellKeyChanged="onCellClicked([$event], true)"
			  :sheetID="sheetID" :selectedCell="selectedCell" />
	
	<SheetGrid v-if="sheetStore.isValidSheetID(sheetID)" ref="grid" :sheet="sheetStore.getSheet(sheetID)"
			   @update:selected-cells="(values, create) => { onCellClicked(values, create); }" />
</template>