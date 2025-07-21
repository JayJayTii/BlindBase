<script setup>
    import { ref } from "vue";
    import { useSheetStore } from ".././stores/SheetStore";
    const sheetStore = useSheetStore();
    sheetStore.loadState();

    const inputValue = ref("");
</script>

<template>
    <div class="SheetsView">
        <div class="LeftColumn">
            <div class="SheetSelect">
                Sheet select here
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
        border: 5px solid red;
    }

    .SheetSettings {
        height: 53vh;
        border: 5px solid red;
    }

    .Sheet {
        width: 60vw;
        height: 93vh;
        border: 5px solid red;
    }

    .RightColumn {
        width: 20vw;
        height: 93vh;
        border: 5px solid red;
    }

</style>
