<script setup>
    import { nextTick } from 'vue'
    import { CreateSheetFromFile } from '@/helpers/sheets.js'
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    import List from "@/components/List.vue"

    const props = defineProps({
        sheetID: Number,
    })
    const emit = defineEmits(['updateSheetID'])

    function SheetClicked(index) {
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
        <div class="PanelHeader"> Select Sheet: </div>

        <div style="overflow-x:hidden; overflow-y:auto;">
            <List :data="sheetStore.getSheetNames" :selectedIndex="sheetStore.getSheetIndexWithID(props.sheetID)"
                  @onItemClick="SheetClicked" />
            
            <div style="display: flex;flex-direction: row; justify-content: space-between; width: 100%; ">
                <!------UPLOAD------>
                <img title="Upload an algsheet - must be saved as a .csv file"
                     src="@/assets/upload.svg" class="CustomButton" style="height:40px;" 
                      @click="UploadFile()" />

                <img title="Create an empty algsheet"
                     @click="sheetStore.newSheet(); emit('updateSheetID',sheetStore.sheets.length-1);"
                     class="CustomButton" src="@/assets/add.svg" style="height:40px;" />
            </div>
        </div>
    </div>
</template>