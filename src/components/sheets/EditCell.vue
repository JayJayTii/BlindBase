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
        focusCellKey: Boolean,
    })
    const emit = defineEmits(['cellKeyChanged'])

    const selectedCellKey = computed({
        get: () => sheetStore.coordToKey(props.sheetID, props.selectedCell),
        set: (newKey) => {
            const newCoord = sheetStore.keyToCoord(props.sheetID, newKey)
            //Needs to output absolute coord
            emit('cellKeyChanged', newCoord)
        }
    })
    const selectedCellValue = computed({
        get: () => sheetStore.getCell(props.sheetID, props.selectedCell),
        set: (newValue) => sheetStore.setCell(props.sheetID, props.selectedCell, newValue)
    })

    //Filter any cell key input to only letters and 2 characters long
    const selectedCellInput = ref(selectedCellKey.value)
    watch(selectedCellInput, (newValue, oldValue) => {
        const inputChar = [...newValue].filter(char => !oldValue.includes(char))[0]
        if (!inputChar) { //Return if the change was not a character (e.g. backspace)
            return
        }

        //Regex to check against letters
        if (!/^[a-xA-X]$/.test(inputChar)) {
            //Something other than allowed letters
            selectedCellInput.value = oldValue
            return
        }
        //If it was 2 letters, replace with the new character
        //Also put to uppercase
        let updatedInput = newValue.length === 3 ? inputChar.toUpperCase() : newValue.toUpperCase()
        if (selectedCellInput.value === updatedInput) {
            return //This is triggered to prevent infinite recursion
        }
        selectedCellInput.value = updatedInput //This triggers this same function, hence why we need to prevent recursion

        if (updatedInput.length == 2) {
            //If the length is correct, finally update the whole system to this new key
            selectedCellKey.value = updatedInput
        }
    })

    //Get recommendations for this cell if a sheet is selected
    const options = sheetStore.isValidSheetID(props.sheetID)
                    ? getRecommendations(sheetStore.getSheet(props.sheetID).type, sheetStore.coordToKey(props.sheetID, props.selectedCell))
                    : []

    function OptionClicked(index) {
        selectedCellValue.value = options[index]
    }

    const cellValueInputBox = ref(null)
    const cellKeyInputBox = ref(null)
    nextTick(() => {
        if (props.focusCellKey) {
            if (cellKeyInputBox.value)
                cellKeyInputBox.value.focus()
        } else {
            if (cellValueInputBox.value)
                cellValueInputBox.value.focus()
        }
    })
</script>

<template>
    <div class="Panel" v-if="sheetStore.isValidSheetID(props.sheetID)">
        <div class="PanelHeader"> Edit cell:  </div>
        <!------CELL KEY------>
        <div class="SheetEditingRow">
            <input v-model="selectedCellInput" class="editCurCellKey" ref="cellKeyInputBox" />
        </div>

        <!------CELL VALUE------>
        <div class="SheetEditingRow">
            <input v-model="selectedCellValue"
                   ref="cellValueInputBox"
                   maxlength="50"
                   :key="settingsStore.settings.sheets_pairorder"
                   style="width:100%;" />
        </div>

        <!------RECOMMENDATIONS------>
        <div class="SheetEditingRow">Recommendations:</div>
        <div v-if="sheetStore.getSheet(props.sheetID).type != 0" style="height:100%;overflow-y:auto;">
            <List :data="options"
                  :selectedIndex="-1"
                  @onItemClick="OptionClicked" />
        </div>
        <div v-else class="CellOptions" style="color:var(--info-300);text-align:center;">
            Select a type for this sheet to show algorithm recommendations.
        </div>
    </div>
    <div v-else class="Panel">
        <div class="PanelHeader"> Edit cell:  </div>
        <div style="color:var(--info-200);text-align:center;">
            Select a sheet to get started
        </div>
    </div>
</template>

<style>
    .editCurCellKey {
        font-size: 2rem;
        width: min(100%, 4ch);
        text-transform: uppercase;
    }
</style>