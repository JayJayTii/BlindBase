<script setup>
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
</script>

<template>
    <div class="Panel">
        <div class="PanelHeader"> Select Sheet: </div>

        <div style="overflow-x:hidden; overflow-y:auto;">
            <List :data="sheetStore.getSheetNames" :selectedIndex="sheetStore.getSheetIndexWithID(props.sheetID)"
                  @onItemClick="SheetClicked" />
            
            <div style="display:flex;justify-content:end;">
                <button @click="sheetStore.newSheet(); emit('updateSheetID',sheetStore.sheets.length-1);"
                        class="newButton">
                    +
                </button>
            </div>
        </div>
    </div>
</template>