<script setup>
    import { computed } from 'vue'
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()

    const props = defineProps({
        sheetID: Number,
    })
    const emit = defineEmits(['deleteSheet'])

    //Computed properties for name and type so they can be modelled by an input box
    const currentSheetName = computed({
        get: () => sheetStore.getSheet(props.sheetID)?.name || '',
        set: (newName) => {
            if (sheetStore.isValidSheetID(props.sheetID)) {
                sheetStore.sheets[sheetStore.getSheetIndexWithID(props.sheetID)].name = newName
                sheetStore.saveState()
            }
        }
    })
    const currentSheetType = computed({
        get: () => sheetStore.getSheet(props.sheetID).type,
        set: (newType) => {
            if (sheetStore.isValidSheetID(props.sheetID)) {
                sheetStore.sheets[sheetStore.getSheetIndexWithID(props.sheetID)].type = newType
                sheetStore.saveState()
            }
        }
    })
</script>

<template>
    <div class="Panel" v-if="sheetStore.isValidSheetID(props.sheetID)">
        <div class="PanelHeader"> Sheet settings: </div>
        <!------NAME------>
        <div class="SheetEditingRow">
            <input v-model="currentSheetName"
                   maxlength="20"
                   style="white-space:nowrap;font-weight:bold;font-size:2rem;width:100%;text-align:center;" />
        </div>

        <!------TYPE------>
        <div class="SheetEditingRow">
            Type: <select v-model="currentSheetType">
                <option v-for="(type,index) in sheetStore.sheetTypes"
                        :key="index"
                        :value="index">
                    {{type.name}}
                </option>
            </select>
        </div>

        <!------DELETE------>
        <div class="SheetEditingRow">
            <button @click="emit('deleteSheet')">
                Delete
            </button>
        </div>
    </div>
    <div v-else class="SheetSettings">
        <div class="PanelHeader"> Sheet settings: </div>
        <div style="color:var(--info-200)">
            Select a sheet to get started
        </div>
    </div>
</template>

<style>
    .SheetEditingRow {
        display: flex;
        flex-direction: row;
        padding: 2px;
        gap: 5px;
        width: 100%;
    }
</style>