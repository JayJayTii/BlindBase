<script setup>
    import { inject, ref, watch, nextTick } from 'vue'
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    import { useCardStore } from "@/stores/CardStore"
    const cardStore = useCardStore()
    cardStore.loadState()
    import { useSettingsStore } from "@/stores/SettingsStore"
    const settingsStore = useSettingsStore()
    settingsStore.loadState()

    import SheetGrid from "@/components/SheetGrid.vue"
    const confirmDialog = inject('confirmDialog')

    const props = defineProps({
        sheetID: Number,
        updateStatsKey: Number,
    })
    const emit = defineEmits(['sheetEditClicked','beginPractice'])

    const columnHeaders = ['','Sheet','Flashcards','','New','Learning','Due','']

    const gridRef = ref(null)
    const selectedCells = ref([])
    function UpdateSelectedCells() {
        selectedCells.value = cardStore.getCardsForSheet(props.sheetID).map(card => card.reference.coord)
        gridRef.value.changeHighlightedCells(selectedCells.value)
    }

    function SelectAll() {
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < 24; j++) {
                if (selectedCells.value.filter(cell => cell.y === i && cell.x === j).length > 0) {
                    continue //Already in the array
                }
                onCellClicked({ x: j, y: i }) //Takes care of if its already empty
            }
        }
    }
    async function SelectNone() {
        if (!(await confirmDialog.value.open('Are you sure you want deselect all? This will delete all cards for this sheet.'))) {
            return
        }

        const selectedCellsCopy = [...selectedCells.value]
        selectedCellsCopy.forEach((card) => {
            onCellClicked(card)
        })
    }

    function onCellClicked(value) {
        if (sheetStore.getCell(props.sheetID, value) === "") {
            return //Empty cell, not allowed!
        }
        if (selectedCells.value.some(cell => cell.x === value.x && cell.y === value.y)) {
            //If it already includes it, remove it
            selectedCells.value = selectedCells.value.filter(cell => !(cell.x === value.x && cell.y === value.y))
            cardStore.deleteCard(props.sheetID, value)
        }
        else {
            //If it wasn't in it, add it
            selectedCells.value.push(value)
            cardStore.createCard(props.sheetID, value)
        }
        gridRef.value.changeHighlightedCells(selectedCells.value)
    }

    watch(
        () => settingsStore.sheets_pairorder,
        (newVal) => {
            UpdateSelectedCells()
        }
    )
</script>

<template>
    <div style="height:10vh"></div>

    <!------CARD MENU GRID------>
    <div class="CardsView">
        <div class="CardsMenuGrid">
            <!------HEADERS------>
            <div v-for="label in columnHeaders" :class="[label.length > 0 ? 'PanelHeader' : '']" style="font-size:1.5rem;">{{label}}</div>
            <div class="RowGap" v-for="x in columnHeaders"></div>

            <!------SHEET ROWS------>
            <template v-for="(name,index) in sheetStore.getSheetNames">
                <div>
                    <img @click="emit('sheetEditClicked', sheetStore.sheets[index].id);nextTick(()=>UpdateSelectedCells())"
                         src="@/assets/edit.svg"
                         :class="['editButton', (sheetID === sheetStore.sheets[index].id) ? 'editButtonSelected': '']" />
                </div>
                <div>{{name}}</div>
                <div>{{cardStore.getCardsForSheet(sheetStore.sheets[index].id).length}}/{{sheetStore.getFilledCellCount(sheetStore.sheets[index].id)}}</div>
                <div />
                <div>{{cardStore.getCardsOfType(sheetStore.sheets[index].id, "New").length}}</div>
                <div>{{cardStore.getCardsOfType(sheetStore.sheets[index].id, "Learning").length}}</div>
                <div>{{cardStore.getCardsOfType(sheetStore.sheets[index].id, "Due").length}}</div>
                <div>
                    <img v-if="cardStore.getCardsToPracticeCount(sheetStore.sheets[index].id) > 0"
                         src="@/assets/arrow-right-long.svg"
                         class="PracticeButton"
                         @click="emit('beginPractice',sheetStore.sheets[index].id)" />
                </div>
                <div class="RowGap" v-for="x in 8" v-if="index + 1 < sheetStore.sheets.length"></div>
            </template>
        </div>
        <div v-if="sheetStore.sheets.length === 0" style="color:var(--info-200); font-size:1.5rem;">
            Create a sheet to begin making flashcards!
        </div>
        <div style="height:10vh"></div>

        <!------EDITING------>
        <div v-if="sheetStore.isValidSheetID(sheetID)" style="display:flex;flex-direction:column;gap:5px;">
            <h3 class="PanelHeader" style="font-size:5vh;">Select flashcards to create from this sheet</h3>
            <div style="display:flex;flex-direction:row;gap:5px;justify-content:center">
                <div class="cardSelectButton" @click="SelectAll()"><h3>Select all</h3></div>
                <div class="cardSelectButton" @click="SelectNone()"><h3>Select none</h3></div>
            </div>
        </div>

        <SheetGrid :sheetID="sheetID"
                   :formatEmpty="true"
                   :fullLineSelection="true"
                   @update:selected-cell="onCellClicked"
                   ref="gridRef"
                   style="width:100%; height:79vh;" />
    </div>
</template>

<style>
    .CardsView {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        text-justify: distribute;
        font-size: 1.5rem;
    }

    .CardsMenuGrid {
        justify-content: center;
        width: 80vw;
        display: grid;
        column-gap: 5px;
        row-gap:5px;
        color: var(--text-color);
        grid-template-columns: 0.5fr 1fr 1fr 0.25fr 0.7fr 0.7fr 0.7fr 1fr;
    }

    .RowGap {
        height: 2px;
        width: 110%;
        background-color: var(--grey-900);
    }

    .editButton {
        cursor: pointer;
        background-color: var(--brand-700);
        border-radius: 5px;
        height: 45px;
    }
        .editButton:hover {
            background-color: var(--brand-500);
        }

    .editButtonSelected {
        background-color: var(--brand-500);
    }

    .PracticeButton {
        background-color: var(--brand-600);
        border-radius: 5px;
        cursor: pointer;
        height: 45px;
        width: 100px;
    }
        .PracticeButton:hover {
            background-color: var(--brand-500);
        }

    .cardSelectButton {
        background-color: var(--brand-700);
        color: var(--brand-900);
        font-size: 1rem;
        width: 110px;
        border-radius: 10px;
        cursor: pointer;
    }
        .cardSelectButton:hover {
            background-color: var(--brand-500);
        }
</style>