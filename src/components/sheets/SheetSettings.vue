<script setup>
    import { computed } from 'vue'
    import { sheet_types, useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    import { defaults, useSettingsStore } from '@/stores/SettingsStore'
    const settingsStore = useSettingsStore()
    settingsStore.loadState()
    import { cornerBuffers, edgeBuffers, cornerScheme, edgeScheme } from '@/helpers/letter_scheme.js'

    const props = defineProps({
        sheetID: Number,
    })

    const currentSheetType = computed({
        get: () => sheetStore.getSheet(props.sheetID).type,
        set: (newType) => {
            if (sheetStore.isValidSheetID(props.sheetID)) {
				sheetStore.sheets[sheetStore.getSheetIndexWithID(props.sheetID)].type = newType
                if (newType == 1) { // Corners
                    sheetStore.sheets[sheetStore.getSheetIndexWithID(props.sheetID)].buffer = useSettingsStore().settings.misc_defaultcornerbuffer
                } else if (newType == 2) { //Edges
                    sheetStore.sheets[sheetStore.getSheetIndexWithID(props.sheetID)].buffer = useSettingsStore().settings.misc_defaultedgebuffer
                }
                sheetStore.saveState()
            }
        }
	})
	const currentSheetBuffer = computed({
		get: () => sheetStore.getSheet(props.sheetID).buffer,
        set: (newBuffer) => {
			if (sheetStore.isValidSheetID(props.sheetID)) {
				sheetStore.sheets[sheetStore.getSheetIndexWithID(props.sheetID)].buffer = newBuffer
				sheetStore.saveState()
			}
		}
	})

    
</script>

<template>
    <span id="sheet-settings" v-if="sheetStore.isValidSheetID(props.sheetID)">
        <!------TYPE------>
        <span>
            Type:
            <el-select v-model="currentSheetType"
                       style="width: 100px;"
                       :options="sheet_types"
                       :props="{value: 'id',label: 'name', options: sheet_types}">
            </el-select>
        </span>
        <!------CORNERS BUFFER------>
        <span v-if="currentSheetType == 1">
            Buffer:
            <el-select v-model="currentSheetBuffer"
                       style="width: 100px;"
                       :options="defaults.misc_defaultcornerbuffer.options"
                       :props="{value: 'id',label: 'name', options: defaults.misc_defaultcornerbuffer.options}">
            </el-select>
        </span>
        <!------EDGES BUFFER------>
        <span v-if="currentSheetType == 2">
            Buffer:
            <el-select v-model="currentSheetBuffer"
                       style="width: 100px;"
                       :options="defaults.misc_defaultedgebuffer.options"
                       :props="{value: 'id',label: 'name', options: defaults.misc_defaultedgebuffer.options}">
            </el-select>
        </span>
    </span>
    <div id="sheet-settings" v-else></div>
</template>

<style>
	#sheet-settings {
        gap: 5px;
		padding: 2px;
		padding-left: 5px;
        align-items: center;
	}
		#sheet-settings > * {
			margin-left: 5px;
			height: 100%;
			border-left: 1px solid var(--el-border-color);
		}
</style>