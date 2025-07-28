<script setup>
    import { useSheetStore } from "../stores/SheetStore";
    const sheetStore = useSheetStore();
    sheetStore.loadState();
</script>

<template>
    <div class="CardsView">
        <div class="MenuLayout">
            <div class="Headings"></div>
            <div class="Headings">Total</div>
            <div class="Headings">Included</div>
            <div class="Headings">New</div>
            <div class="Headings">Learning</div>
            <div class="Headings">Due</div>
            <div class="Headings"></div>
            <div class="Headings"></div>

            <template v-for="(name, index) in sheetStore.getSheetNames">
                <div>{{name}}</div>
                <div>{{sheetStore.getFilledCellCount(index)}}</div>
                <div>helloagainagain</div>
                <div>helloagain3</div>
                <div>helloagain4</div>
                <div>helloagain5</div>
                <div>helloagain6</div>
                <div>helloagain7</div>
            </template>
        </div>
    </div>
</template>

<style>
    .CardsView{
        display:flex;
        flex-direction: column;
    }

    .MenuLayout {
        justify-content: center;
        min-width: 100vw;
        display: grid;
        grid-template-columns: repeat(8, 150px);
        color: white;
    }

    .Headings{
        display:flex;
        font-size: 30px;
        color: white;
        border: 2px solid red;
        justify-content: center;
    }

    .sheetRow {
        background-color: red;
        border: 2px solid red;
    }
</style>
