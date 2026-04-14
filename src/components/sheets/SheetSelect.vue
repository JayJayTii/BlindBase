<script setup>
    import { nextTick, ref } from 'vue'
    import { CreateSheetFromFile } from '@/helpers/sheets.js'
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()

	const emit = defineEmits(['updateSheetID'])
	const selectedID = ref(0)

    function SheetClicked(id) {
        selectedID.value = id
        emit('updateSheetID', id)
    }

    function selectSheet(id) {
        selectedID.value = id
    }

    function UploadFile() {
        //https://stackoverflow.com/questions/16215771/how-to-open-select-file-dialog-via-js
        var input = document.createElement('input')
        input.type = 'file'
        input.accept = '.csv'
        input.onchange = async e => {
            var file = e.target.files[0]
            const newSheetID = await CreateSheetFromFile(file)
            if(newSheetID != -1)
                SheetClicked(newSheetID)
        }
        input.click()
	}

	defineExpose({
		selectSheet
	})
</script>

<template>
    <div class="Panel">
        <!--List of all existing alg-sheets for the user to select from-->
        <div class="PanelHeader"> Select Sheet: </div>

        <div style="overflow-x:hidden; overflow-y:auto;">
            <div v-for="(label, index) in sheetStore.getSheetNames"
                 :class="['ListItem', selectedID === sheetStore.sheets[index].id ? 'ListItemSelected' : 'ListItemUnselected']"
                 style="position: relative;"
                 @click="SheetClicked(sheetStore.sheets[index].id)">
                <span v-if="label">{{label}}</span>
                <span v-else>&nbsp</span>
            </div>

            <div style="display: flex;flex-direction: row; justify-content: space-between; width: 100%; ">
                <!------UPLOAD------>
                <img title="Upload .csv file"
                     src="@/assets/icons/upload.svg" class="CustomButton" style="height:40px;"
                     @click="UploadFile()" />

                <img title="Create new"
                     @click="emit('updateSheetID', sheetStore.newSheet());"
                     class="CustomButton" src="@/assets/icons/add.svg" style="height:40px;" />
            </div>
        </div>
    </div>
</template>