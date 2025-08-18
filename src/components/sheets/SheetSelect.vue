<script setup>
    import { useSheetStore } from "@/stores/SheetStore";
    const sheetStore = useSheetStore();

    const props = defineProps({
        sheetID: Number,
    })
    const emit = defineEmits(['updateSheetID']);
</script>

<template>
    <div class="SheetSelect">
        <div class="header-row">
            <h3>Select Sheet:</h3>
        </div>
        <div v-for="(sheetName, index) in sheetStore.getSheetNames"
             :key="sheetStore.sheets[index].id"
             :class="['ListItem', props.sheetID === sheetStore.sheets[index].id ? 'ListItemSelected' : 'ListItemUnselected']"
             @click="emit('updateSheetID',index)">
            {{ sheetName != "" ? sheetName : "&nbsp;" }}
        </div>
        <button @click="sheetStore.newSheet(); emit('updateSheetID',sheetStore.sheets.length-1);"
                style="justify-content:center;">
            +
        </button>
    </div>
</template>

<style>
    .SheetSelect {
        padding: 2px;
        border-block-end: 3px solid var(--border-color);
        background-color: var(--panel-color);
        overflow-x: hidden;
        overflow-y: auto;
    }

</style>