<script setup>
    import { useSheetStore } from ".././stores/SheetStore";
    const sheetStore = useSheetStore();
    sheetStore.loadState();

    const inputValue = "";
</script>

<template>
    <h1 v-for="type in sheetStore.getSheetTypes">{{type}}</h1>

    <input v-model="inputValue" placeholder="Enter something..." />
    <button @click="sheetStore.addSheetType(inputValue)">Submit</button>
</template>
