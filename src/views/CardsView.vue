<script setup>
    import SheetGrid from "@/components/SheetGrid.vue"
    import { useSheetStore } from "../stores/SheetStore";
    const sheetStore = useSheetStore();
    sheetStore.loadState();
</script>

<template>
    <div style="height:10vh"></div>
    <div class="CardsView">
        <div class="MenuLayout">
            <div class="Headings"></div>
            <div class="Headings">Sheet</div>
            <div class="Headings">Algs</div>
            <div class="Headings">Cards</div>
            <div class="columnBorder"></div>
            <div class="Headings">New</div>
            <div class="Headings">Learning</div>
            <div class="Headings">Due</div>
            <div class="Headings"></div>
            <div class="HeadingGap" v-for="x in 9"></div>
            <template v-for="(name, index) in sheetStore.getSheetNames">
                <div class="cardsViewCell">
                    <!--this should have a pencil icon or smthn-->
                    <button>Edit cards</button>
                </div>
                <div class="cardsViewCell">{{name}}</div>
                <div class="cardsViewCell">{{sheetStore.getFilledCellCount(index)}}</div>
                <div class="cardsViewCell">0</div>
                <div class="columnBorder"></div>
                <div class="cardsViewCell">0</div>
                <div class="cardsViewCell">0</div>
                <div class="cardsViewCell">0</div>
                <div class="cardsViewCell">
                    <button style="width:100%;font-size:100%">---></button>
                </div>
            </template>
        </div>
    </div>
    <SheetGrid v-for="(sheet, index) in sheetStore.sheets"
                style="width:100%"
                :sheetIndex="index" />
</template>

<style>
    .CardsView{
        display:flex;
        flex-direction: column;
        align-items: center;
    }

    .MenuLayout {
        justify-content: center;
        width: 80vw;
        display: grid;
        grid-template-columns: 0.5fr 1fr 1fr 1fr 0.5fr 1fr 1fr 1fr 1fr;
        color: white;
    }
        .MenuLayout > * {
        }

    .Headings {
        display: flex;
        font-size: 2rem;
        text-align: center;
        justify-content: center;
        color: var(--brand-300);
    }

    .HeadingGap {
        min-height:1rem;
    }

    .cardsViewCell {
        display:flex;
        text-align: center;
        align-items: center;    
        justify-content:center;
        font-size:1.5rem;
        padding: 5px;
    }
</style>
