<script setup>
    import { computed } from 'vue'
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    import { useSettingsStore } from '@/stores/SettingsStore'
    const settingsStore = useSettingsStore()
    settingsStore.loadState()
    import { cornerBuffers, edgeBuffers, cornerScheme, edgeScheme } from '@/helpers/letter_scheme.js'

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

    function downloadSheet() {
        const sheet = sheetStore.getSheet(props.sheetID)
        const flipped = settingsStore.settings.sheets_pairorder === 1

        //Convert sheet object into csv format
        let csvString = "," + sheet.xHeadings.split('').join(',') + ",\n"
        for (var i = 0; i < sheet.yHeadings.length; i++) {
            csvString += sheet.yHeadings[i] + ","
            for (var j = 0; j < sheet.xHeadings.length; j++) {
                let cellVal = sheet.grid[flipped ? i : j][flipped ? j : i]
                if (cellVal.includes(','))
                    cellVal = '\"' + cellVal + '\"'
                csvString += cellVal + ","
            }
            csvString += "\n"
        }
        const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString)

        //Perform web dev stupidity to download it
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", sheet.name + ".csv")
        document.body.appendChild(link)
        link.click();
        document.body.removeChild(link)
    }
</script>

<template>
    <div class="Panel" v-if="sheetStore.isValidSheetID(props.sheetID)">
        <div class="PanelHeader"> Sheet settings: </div>
        <!------NAME------>
        <div class="SheetEditingRow">
            <input title="Name"
                   v-model="currentSheetName"
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
        <!------CORNERS BUFFER------>
        <div class="SheetEditingRow" v-if="currentSheetType == 1">
            Buffer: <select v-model="currentSheetBuffer" >
                <option v-for="(cornerBuffer, index) in cornerBuffers"
                        :key="index"
                        :value="index">
                    {{cornerBuffer + " (" + cornerScheme[index] + ")"}}
                </option>
            </select>
        </div>
        <!------EDGES BUFFER------>
        <div class="SheetEditingRow" v-if="currentSheetType == 2">
            Buffer: <select v-model="currentSheetBuffer">
                <option v-for="(edgeBuffer, index) in edgeBuffers"
                        :key="index"
                        :value="index">
                    {{edgeBuffer + " (" + edgeScheme[index] + ")"}}
                </option>
            </select>
        </div>

        <div style="display: flex; flex-direction: row; justify-content:space-between; width:100%;">
            <!------DOWNLOAD------>
            <img title="Download as .csv"
                 src="@/assets/icons/download.svg" @click="downloadSheet()" class="CustomButton" style="height:40px;" />

            <!------DELETE------>
            <img title="Delete"
                 src="@/assets/icons/delete-bin.svg" @click="emit('deleteSheet')" class="CustomButton" style="height:40px;" />
        </div>
    </div>
    <div v-else class="Panel">
        <div class="PanelHeader"> Sheet settings: </div>
        <div style="color:var(--info-200);text-align:center;">
            Create a sheet to get started
        </div>
    </div>
</template>

<style>
    .SheetEditingRow {
        display: flex;
        flex-direction: row;
        justify-content: center;
        padding: 2px;
        gap: 5px;
        width: 100%;
    }
</style>