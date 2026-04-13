<script setup>
    import { nextTick, ref } from 'vue'
    import { CreateSheetFromFile } from '@/helpers/sheets.js'
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()

    const emit = defineEmits(['updateSheetID'])
    const selectedIndex = ref(0)

    function SheetClicked(index) {
        selectedIndex.value = index
        emit('updateSheetID', index)
    }

    function UploadFile() {
        //https://stackoverflow.com/questions/16215771/how-to-open-select-file-dialog-via-js
        var input = document.createElement('input')
        input.type = 'file'
        input.accept = '.csv'
        input.onchange = async e => {
            var file = e.target.files[0]
            await CreateSheetFromFile(file)
            SheetClicked(sheetStore.sheets.length - 1)
        }
        input.click()
    }
</script>

<template>
    <div class="Panel">
        <!--List of all existing alg-sheets for the user to select from-->
        <div class="PanelHeader"> Select Sheet: </div>

        <div style="overflow-x:hidden; overflow-y:auto;">
            <div v-for="(label, index) in sheetStore.getSheetNames"
                 :class="['ListItem', selectedIndex  === index ? 'ListItemSelected' : 'ListItemUnselected']"
                 style="position: relative;"
                 @click="SheetClicked(index)">
                <span v-if="label">{{label}}</span>
                <span v-else>&nbsp</span>
            </div>

            <div style="display: flex;flex-direction: row; justify-content: space-between; width: 100%; ">
                <!------UPLOAD------>
                <img title="Upload .csv file"
                     src="@/assets/icons/upload.svg" class="CustomButton" style="height:40px;"
                     @click="UploadFile()" />

                <img title="Create new"
                     @click="sheetStore.newSheet(); emit('updateSheetID',sheetStore.sheets.length-1);"
                     class="CustomButton" src="@/assets/icons/add.svg" style="height:40px;" />
            </div>
        </div>
    </div>
</template>