<script setup>
    import { computed, watch, nextTick, ref } from 'vue'
    import { getRecommendations } from "@/helpers/Recommendations"
    import List from "@/components/List.vue"
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    import { useSettingsStore } from "@/stores/SettingsStore"
    const settingsStore = useSettingsStore()

    const props = defineProps({
        sheetID: Number,
        selectedCell: Object,
    })
    const isImageSheet = computed({ get: () => sheetStore.getType(props.sheetID) == 3 })

	const cellKeyInput = computed({
		get: () => (props.selectedCell.x == -1 || props.selectedCell.y == -1) ? '' : sheetStore.coordToKey(props.sheetID, props.selectedCell)
	})
	const cellValueInput = computed({
		get: () => (props.selectedCell.x == -1 || props.selectedCell.y == -1) ? '' : sheetStore.getCell(props.sheetID, props.selectedCell),
		set: (newValue) => { sheetStore.setCell(props.sheetID, props.selectedCell, newValue) }
    })
    const cellValueInputBox = ref(null)

    let options = []
    function getOptions() {
        if (!sheetStore.isValidSheetID(props.sheetID) || props.selectedCell.x == -1 || props.selectedCell.y == -1) {
            options = []
            return
        }
		options = getRecommendations(sheetStore.getSheet(props.sheetID).type, sheetStore.coordToKey(props.sheetID, props.selectedCell), sheetStore.getSheet(props.sheetID).buffer)
    }
	watch(props.selectedCell, async () => {
        getOptions()
        await nextTick()
        cellValueInputBox.value.focus()
    });

	const sheetSettings = computed(() => {
        if (!sheetStore.isValidSheetID(props.sheetID))
            return {}
		const { grid, ...rest } = sheetStore.getSheet(props.sheetID)
		return rest
	})
    watch(sheetSettings, () => {
        getOptions()
    })

	const notationType = computed({
		get: () => settingsStore.settings.sheets_notationtype == 1 ? true : false,
		set: (newValue) => {
			settingsStore.settings.sheets_notationtype = (newValue ? 1 : 0)
			settingsStore.saveState()
			getOptions()
		}
	})
</script>

<template>
    <div style="display: flex; flex-direction: column; position: relative;">
        <div style="display: grid; grid-template-columns: 45px 400px auto; gap: 5px; width: 100%;">
            <el-input v-model="cellKeyInput" 
                      style="height: 32px;" />
            <el-input v-model="cellValueInput" ref="cellValueInputBox" 
                      maxlength="80" 
                      style="height: 32px;" 
                      :disabled="(selectedCell.x == -1 || selectedCell.y == -1)" />

            <div style="display: flex; flex-direction: row; overflow-x: auto; gap: 5px;" :key="sheetSettings">
                <el-button type="primary" :plain="true"
                           style="margin: 0px;"
                           v-for="(option, index) in options"
                           @click="cellValueInput = options[index]">{{option}}</el-button>
            </div>
        </div>

        <div v-if="options.length > 0"
             style="position: absolute; top: 30px; display: flex; flex-direction: row; justify-content: space-between; width: 445px; font-size: 0.6rem; ">
            <el-text style="font-size: inherit;">
                Recommendations from 
                <el-link size="small" style="margin-bottom: 3px; font-size: inherit;" underline="always" :href="isImageSheet ? 'https://bestsiteever.net/colpi/' : 'https://v2.blddb.net/'" target="_blank">
                    {{isImageSheet ? "bestsiteever.net/colpi" : "v2.blddb.net"}}
                </el-link>
            </el-text>
            <div v-if="sheetStore.getType(props.sheetID) == 1 || sheetStore.getType(props.sheetID) == 2" style="font-size: inherit; margin-bottom: 4px;" >
                <el-checkbox v-model="notationType" size="small" label="Comm notation" />
            </div>
        </div>
    </div>
</template>