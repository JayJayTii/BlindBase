<script setup>
    import { ref, reactive } from 'vue';
    import SheetGrid from "@/components/SheetGrid.vue";
    import { useSheetStore } from "../stores/SheetStore";
    import { useCardStore } from "../stores/CardStore";
    const sheetStore = useSheetStore();
    sheetStore.loadState();
    const cardStore = useCardStore();
    cardStore.loadState();

    const gridRef = ref(null);
    const editSheetIndex = ref(-1);
    const selectedCells = ref([]);
    function UpdateSelectedCells() {
        selectedCells.value = cardStore.getCardsForSheet(editSheetIndex.value).map(card => card.reference.coord);
        gridRef.value.changeHighlightedCells(selectedCells.value);
    }
    function onCellClicked(value) {
        if (sheetStore.getCell(editSheetIndex.value, value) === "") {
            return; //Empty cell, not allowed!
        }
        if (selectedCells.value.some(cell => cell.x === value.x && cell.y === value.y)) {
            //If it already includes it, remove it
            selectedCells.value = selectedCells.value.filter(cell => !(cell.x === value.x && cell.y === value.y));
            cardStore.deleteCard(editSheetIndex.value, value);
        }
        else {
            //If it wasn't in it, add it
            selectedCells.value.push(value);
            cardStore.createCard(editSheetIndex, value);
        }
        gridRef.value.changeHighlightedCells(selectedCells.value);
    }
</script>

<template>
    <div style="height:10vh"></div>
    <div class="CardsView">
        <div class="MenuLayout">
            <div class="cardsViewCell"></div>
            <div class="Headings"><div class="HeadingText">Sheet</div></div>
            <div class="Headings"><div class="HeadingText">Flashcards</div></div>
            <div class="columnBorder"></div>
            <div class="Headings"><div class="HeadingText">New</div></div>
            <div class="Headings"><div class="HeadingText">Learning</div></div>
            <div class="Headings"><div class="HeadingText">Due</div></div>
            <div class="cardsViewCell"></div>
            <div class="RowGap" v-for="x in 8"></div>
            <template v-for="(name, index) in sheetStore.getSheetNames">
                <div class="cardsViewCell">
                    <!--this should have a pencil icon or smthn-->
                    <img @click="editSheetIndex = (editSheetIndex === index) ? -1 : index;
                                 UpdateSelectedCells();"
                         src="@/assets/edit.svg"
                         :class="['editButton', (editSheetIndex === index) ? 'editButtonSelected': '']" />
                </div>
                <div class="cardsViewCell">{{name}}</div>
                <div class="cardsViewCell">
                {{cardStore.getCardsForSheet(index).length}}/{{sheetStore.getFilledCellCount(index)}}
                </div>
                <div class="columnBorder"></div>
                <div class="cardsViewCell">0</div>
                <div class="cardsViewCell">0</div>
                <div class="cardsViewCell">0</div>
                <div class="cardsViewCell">
                    <button style="width:100%;font-size:100%">---></button>
                </div>
                <div class="RowGap" v-for="x in 8" v-if="index + 1 < sheetStore.sheets.length"></div>
            </template>
        </div>
        <div v-if="sheetStore.sheets.length === 0" style="color:var(--info-200); font-size:1.5rem;">
            Create a sheet to begin making flashcards!
        </div>
    </div>

    <div style="height:10vh"></div>
    <div v-if="editSheetIndex !== -1" class="PromptHeader">
        <h3>Select flashcards to create from this sheet</h3>
    </div>
    <SheetGrid :sheetIndex="editSheetIndex"
               :formatEmpty="true"
               @update:selected-cell="onCellClicked"
               ref="gridRef"
               style="width:100%; height:90vh;" />
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
        grid-template-columns: 0.5fr 1fr 1fr 0.5fr 1fr 1fr 1fr 1fr;
        color: white;
    }
        .MenuLayout > * {
        }

    .Headings {
        display: flex;
        font-size: 1.5rem;
        text-align: center;
        justify-content: center;
    }
    .HeadingText {
        color: var(--grey-100);
        background-color: var(--brand-700);
        border-radius: 5px;
        padding: 2px 10px;
    }

    .RowGap {
        height: 2px;
        background-color: var(--grey-900);
    }

    .cardsViewCell {
        display:flex;
        text-align: center;
        align-items: center;    
        justify-content:center;
        font-size:1.5rem;
        padding: 5px;
    }

    .editButton{
        cursor:pointer;
        background-color:var(--brand-700);
        border-radius: 5px;
    }
    .editButtonSelected {
        background-color: var(--brand-500);
    }

    .PromptHeader{
        display:flex;
        justify-content:center;
        background-color: var(--brand-700);
        font-size:2rem;
        color: var(--grey-100);
        border-radius:10px;
        height: 10vh;
    }
</style>
