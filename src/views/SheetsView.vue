<script setup>
    import { ref } from "vue";
    import { useSheetStore } from ".././stores/SheetStore";
    const sheetStore = useSheetStore();
    sheetStore.loadState();
</script>

<template>
    <div class="SheetsView">
        <div class="LeftColumn">
            <div class="SheetSelect">
                <div class="header-row">
                    <h3>Select Sheet:</h3>
                    <button @click="sheetStore.newSheet()" style="justify-content:right">+</button>
                </div>
                <div v-for="(sheetName, index) in sheetStore.getSheetNames"
                    :key="index"
                    :class="['list-item', sheetStore.curSheetIndex === index ? 'selected' : '']"
                    @click="sheetStore.curSheetIndex = index">
                    {{ sheetName }}
                </div>
            </div>
            <div class="SheetSettings">
                Sheet settings here
            </div>
        </div>
        <div class="Sheet">
            Sheet view here
        </div>
        <div class="RightColumn">
            Cell editing here
        </div>
    </div>
</template>

<style>
    .SheetsView {
        display: flex;
        flex-direction: row;
    }

    .LeftColumn {
        display: flex;
        flex-direction: column;
        width: 20vw;
    }

    .SheetSelect {
        height: 40vh;
        border: 3px solid #303030;
        padding: 2px;
    }
    .header-row {
        display: flex;
        justify-content: space-between;
        background-color: #303030;
        align-items: center;
    }

    .SheetSettings {
        height: 53vh;
        border: 3px solid #303030;
        padding: 2px;
    }

    .Sheet {
        width: 60vw;
        height: 93vh;
        border: 3px solid #303030;
        padding: 2px;
    }

    .RightColumn {
        width: 20vw;
        height: 93vh;
        border: 3px solid #303030;
        padding: 2px;
    }

    .list-item {
        background-color: #303030;
        cursor: pointer;
        height: 20px;
    }
    .selected {
        background-color: white;
        color: black;
        font-weight: bold;
    }

</style>
