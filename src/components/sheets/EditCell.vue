<script setup>
    import { computed, watch, ref } from 'vue'
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

    const selectedCellKey = computed({
        get: () => sheetStore.coordToKey(props.sheetID, props.selectedCell),
        set: (newKey) => {
            const newCoord = sheetStore.keyToCoord(props.sheetID, newKey)
            //Needs to output absolute coord
            emit('cellKeyChanged', newCoord)
        }
    });
    const selectedCellValue = computed({
        get: () => sheetStore.getCell(props.sheetID, props.selectedCell),
        set: (newValue) => sheetStore.setCell(props.sheetID, props.selectedCell, newValue)
    });

    const selectedCellInput = ref(selectedCellKey.value);
    watch(selectedCellInput, (newValue, oldValue) => {
        const inputChar = [...newValue].filter(char => !oldValue.includes(char))[0];
        if (!inputChar) return;
        if (!/^[a-xA-X]$/.test(inputChar)) {
            //Something other than allowed letters
            selectedCellInput.value = oldValue;
            return;
        }

        let updatedInput = newValue.length === 3 ? inputChar.toUpperCase() : newValue.toUpperCase();
        if (selectedCellInput.value === updatedInput) {
            return;
        }
        selectedCellInput.value = updatedInput;

        if (updatedInput.length == 2) {
            selectedCellKey.value = updatedInput;
        }
    });

    const cellValueInputBox = ref(null)
    defineExpose({
        cellValueInputBox
    })
</script>

<template>
    <div class="EditCell" v-if="sheetID !== -1">
        <div class="header-row"> <h3>Edit cell:</h3>  </div>
        <div class="SheetEditingRow">
            Current cell: <input v-model="selectedCellInput" class="editCurCellKey" />
        </div>
        <div class="SheetEditingRow">
            Value: <input v-model="selectedCellValue"
                            ref="cellValueInputBox"
                            :key="settingsStore.sheets_pairorder"
                            style="width:100%;" />
        </div>
        <div class="CellOptions" v-if="sheetStore.getSheet(props.sheetID).type != 0">
            Recommendations:
            <div v-for="algorithm in getRecommendations(sheetStore.getSheet(props.sheetID).type, sheetStore.coordToKey(props.sheetID, selectedCell))"
                 :class="['ListItem']"
                 @click="selectedCellValue = algorithm;">
                {{ algorithm }}
            </div>
        </div>
        <div v-else class="CellOptions" style="color:var(--info-300)">
            Select a type for this sheet to show algorithm recommendations.
        </div>
    </div>
    <div v-else class="EditCell">
        <div class="header-row"> <h3>Edit cell:</h3>  </div>
        <div style="color:var(--info-200)">
            Select a sheet to get started
        </div>
    </div>
</template>

<style>
    .EditCell {
        padding: 2px;
        background-color: var(--panel-color);
        display: flex;
        flex-direction: column;
        color: var(--text-color);
    }

    .editCurCellKey {
        font-size: 2rem;
        width: min(100%, 4ch);
        text-transform: uppercase;
    }

    .CellOptions {
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
    }
</style>