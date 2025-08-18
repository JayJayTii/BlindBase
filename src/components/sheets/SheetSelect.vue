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

        <List :data="sheetStore.getSheetNames" :selectedIndex="sheetStore.getSheetIndexWithID(props.sheetID)"
              @onItemClick="SheetClicked" />

        <button @click="sheetStore.newSheet(); emit('updateSheetID',sheetStore.sheets.length-1);"
                class="newButton">+</button>
    </div>
</template>