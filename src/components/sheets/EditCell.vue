<script setup>
    import { computed, watch, nextTick, ref } from 'vue'
    import { getRecommendations } from "@/helpers/Recommendations"
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    import { useSettingsStore } from "@/stores/SettingsStore"
    const settingsStore = useSettingsStore()

    const props = defineProps({
        sheetID: Number,
        selectedCell: Object,
	})
	const emit = defineEmits(['cellKeyChanged'])
    const isImageSheet = computed({ get: () => sheetStore.getType(props.sheetID) == 3 })

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
        cellKeyInput.value = sheetStore.coordToKey(props.sheetID, props.selectedCell)
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

    const cellValueInputBox = ref(null)

	//Key of the selected cell e.g. AB, XP, DL
	const cellKey = computed({
		get: () => sheetStore.coordToKey(props.sheetID, props.selectedCell),
		set: (newKey) => {
			const newCoord = sheetStore.keyToCoord(props.sheetID, newKey)
            emit('cellKeyChanged', newCoord)
            cellKeyInput.value = newKey
		}
    })
	//Value of the selected cell (i.e. an algorithm)
	const cellValue = computed({
		get: () => sheetStore.getCell(props.sheetID, props.selectedCell),
		set: (newValue) => sheetStore.setCell(props.sheetID, props.selectedCell, newValue)
	})

	//Filter any cell key input to only letters and 2 characters long
	const cellKeyInput = ref(cellKey.value)
	const cellKeyInputBox = ref(null)
    watch(cellKeyInput, (newValue, oldValue) => {
        if (document.activeElement.tagName != "INPUT" || typeof oldValue == "number") {
            cellKeyInput.value = ""
            return
        }
		const inputChar = [...newValue].filter(char => !oldValue.includes(char))[0]
		if (!inputChar) { //Return if the change was not a character (e.g. backspace)
			return
		}

		//Regex to check against letters
		if (!/^[a-xA-X]$/.test(inputChar)) {
			cellKeyInput.value = oldValue
			return
		}
		//If it was 2 letters, replace with the new character
		//Also put to uppercase
		let updatedInput = newValue.length === 3 ? inputChar.toUpperCase() : newValue.toUpperCase()
		if (cellKeyInput.value === updatedInput)
			return //This is triggered to prevent infinite recursion

		cellKeyInput.value = updatedInput //This triggers this same function, hence why we need to prevent recursion

		if (updatedInput.length == 2) //If the length is correct, finally update the whole system to this new key
			cellKey.value = updatedInput
	})
</script>

<template>
    <div style="display: flex; flex-direction: column; position: relative;">
        <div style="display: grid; grid-template-columns: 45px 400px auto; gap: 5px; width: 100%;">
            <el-input ref="cellKeyInputBox" 
                      v-model="cellKeyInput"
                      style="height: 32px;" />
            <el-input v-model="cellValue"
                      ref="cellValueInputBox"
                      maxlength="80" 
                      style="height: 32px;" 
                      :disabled="(selectedCell.x == -1 || selectedCell.y == -1)" />

            <div style="display: flex; flex-direction: row; overflow-x: auto; gap: 5px;" :key="sheetSettings">
                <el-button type="primary"
                           style="margin: 0px;"
                           v-for="(option, index) in options"
                           @click="cellValue = options[index]">{{option}}</el-button>
            </div>
        </div>

        <div v-if="options.length > 0"
             style="position: absolute; top: 35px; display: flex; flex-direction: row; justify-content: space-between; width: 445px; font-size: 0.6rem; ">
            <el-text style="font-size: inherit;">
                Recommendations from 
                <el-link size="small" style="margin-bottom: 3px; font-size: inherit;" underline="always" :href="isImageSheet ? 'https://bestsiteever.net/colpi/' : 'https://v2.blddb.net/'" target="_blank">
                    {{isImageSheet ? "bestsiteever.net/colpi" : "v2.blddb.net"}}
                </el-link>
            </el-text>
            <div v-if="sheetStore.getType(props.sheetID) == 1 || sheetStore.getType(props.sheetID) == 2" style="font-size: inherit;">
                {{notationType ? 'Comm' : 'Alg'}} notation <el-switch v-model="notationType" size="small" style="height: 10px;" />
            </div>
        </div>
    </div>
</template>