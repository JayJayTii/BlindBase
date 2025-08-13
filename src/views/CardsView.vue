<script setup>
    import { ref, inject, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
    import SheetGrid from "@/components/SheetGrid.vue";
    import { useSettingsStore } from "../stores/SettingsStore";
    import { useSheetStore } from "../stores/SheetStore";
    import { useCardStore } from "../stores/CardStore";
    const sheetStore = useSheetStore();
    sheetStore.loadState();
    const settingsStore = useSettingsStore();
    settingsStore.loadState();
    const cardStore = useCardStore();
    cardStore.loadState();
    const confirmDialog = inject('confirmDialog')

    const sheetID = ref(-1);

    //Reload stats at a regular interval
    let intervalId
    const updateStatsKey = ref(0);
    function updateStats() {
        updateStatsKey.value += 1;
    }
    onMounted(() => {
        updateStats();
        intervalId = setInterval(updateStats, 500)
    })

    onUnmounted(() => {
        clearInterval(intervalId)
    })

    const gridRef = ref(null);
    const selectedCells = ref([]);
    function UpdateSelectedCells() {
        selectedCells.value = cardStore.getCardsForSheet(sheetID.value).map(card => card.reference.coord);
        gridRef.value.changeHighlightedCells(selectedCells.value);
    }
    function SelectAll() {
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < 24; j++) {
                if (selectedCells.value.filter(cell => cell.y === i && cell.x === j).length > 0) {
                    continue; //Already in the array
                }
                onCellClicked({ x: j, y: i }); //Takes care of if its already empty
            }
        }
    }
    async function SelectNone() {
        if (!(await confirmDialog.value.open('Are you sure you want deselect all? This will delete all cards for this sheet.'))) {
            return
        }

        const selectedCellsCopy = [...selectedCells.value];
        selectedCellsCopy.forEach((card) => {
            onCellClicked(card);
        })
    }

    function onCellClicked(value) {
        if (sheetStore.getCell(sheetID.value, value) === "") {
            return; //Empty cell, not allowed!
        }
        if (selectedCells.value.some(cell => cell.x === value.x && cell.y === value.y)) {
            //If it already includes it, remove it
            selectedCells.value = selectedCells.value.filter(cell => !(cell.x === value.x && cell.y === value.y));
            cardStore.deleteCard(sheetID.value, value);
        }
        else {
            //If it wasn't in it, add it
            selectedCells.value.push(value);
            cardStore.createCard(sheetID.value, value);
        }
        gridRef.value.changeHighlightedCells(selectedCells.value);
    }

    const practicing = ref(false);
    const cardFlipped = ref(false);
    const hasFlipped = ref(false);
    function handleKeydown(event) {
        if (event.code === 'Space' && practicing.value === true) {
            cardFlipped.value = !cardFlipped.value;
            hasFlipped.value = true;
        }
        //Right arrow
        else if (event.code == 'ArrowRight' && hasFlipped.value === true && practicing.value === true) {
            finishedCard('Good');
        }
        //left arrow
        else if (event.code == 'ArrowLeft' && hasFlipped.value === true && practicing.value === true && currentCardType.value !== "New") {
            finishedCard('Bad');
        }
    }
    const currentCard = reactive({});
    function getNextCard() {
        practicing.value = true;
        cardFlipped.value = false;
        hasFlipped.value = false;

        var possibleNextCards = cardStore.getDueCards(sheetID.value).length > 0 ? cardStore.getDueCards(sheetID.value)
            : (cardStore.getLearningCards(sheetID.value).length > 0 ? cardStore.getLearningCards(sheetID.value)
                : cardStore.getNewCards(sheetID.value))

        const nextIndex = Math.floor(Math.random() * possibleNextCards.length);
        currentCard.value = possibleNextCards[nextIndex];
    };
    const currentCardType = computed({
        get: () => {
            return cardStore.getCardType(currentCard.value);
        }
    });
    function finishedCard(result) { //Result is a string 'Good' or 'Bad'
        hasFlipped.value = false;
        cardFlipped.value = false;
        var updated = JSON.parse(JSON.stringify(currentCard.value)); //Needed to deep-copy the reference as well
        if (result == 'Good') {
            updated.successCount += 1;
        }
        else {
            updated.failCount += 1;
        }

        if (currentCardType.value == "New") {
            var nextTime = new Date();
            nextTime.setMinutes(nextTime.getMinutes() + 10);
            updated.nextPracticeTime = nextTime.toISOString();
        }
        else if (currentCardType.value == "Learning") {
            //10 minutes later no matter what result
            //But you repeat it more often if it was bad
            var nextTime = new Date();
            nextTime.setMinutes(nextTime.getMinutes() + 10); 
            updated.nextPracticeTime = nextTime.toISOString();
        }
        else if (currentCardType.value == "Due") {
            //Both successes and fails taken into account
            var nextTime = new Date();
            if (updated.successCount - updated.failCount < 4) //Had some trouble while learning
                nextTime.setDate(nextTime.getDate() + 1);
            else if (updated.successCount - updated.failCount < 7)
                nextTime.setDate(nextTime.getDate() + 2);
            else if (updated.successCount - updated.failCount < 11)
                nextTime.setDate(nextTime.getDate() + 7);
            else if (updated.successCount - updated.failCount < 14)
                nextTime.setDate(nextTime.getDate() + 30);
            else
                nextTime.setDate(nextTime.getDate() + 90);

            updated.nextPracticeTime = nextTime.toISOString();
        }
        cardStore.cardComplete(updated)
        if (cardStore.getCardsToPracticeCount(sheetID.value) === 0) {
            sheetID.value = -1;
            practicing.value = false;
            return;
        }
        getNextCard();
    }

    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
    })
    watch(
        () => settingsStore.sheets_pairorder,
        (newVal) => {
            UpdateSelectedCells();
        }
    );
</script>

<template>
    <div v-if="practicing === false">
        <div style="height:10vh"></div>
        <div class="CardsView">
            <div class="MenuLayout" :key="updateStatsKey">
                <div class="cardsViewCell"></div>
                <div class="Headings"><div class="HeadingText">Sheet</div></div>
                <div class="Headings"><div class="HeadingText">Flashcards</div></div>
                <div class="columnBorder"></div>
                <div class="Headings"><div class="HeadingText">New</div></div>
                <div class="Headings"><div class="HeadingText">Learning</div></div>
                <div class="Headings"><div class="HeadingText">Due</div></div>
                <div class="cardsViewCell"></div>
                <div class="RowGap" v-for="x in 8"></div>
                <template v-for="(name,index) in sheetStore.getSheetNames">
                    <div class="cardsViewCell">
                        <img @click="
                             sheetID = (sheetID === sheetStore.sheets[index].id) ? -1 : sheetStore.sheets[index].id;
                                 UpdateSelectedCells();"
                             src="@/assets/edit.svg"
                             :class="['editButton', (sheetID === sheetStore.sheets[index].id) ? 'editButtonSelected': '']" />
                    </div>
                    <div class="cardsViewCell">{{name}}</div>
                    <div class="cardsViewCell">
                        {{cardStore.getCardsForSheet(sheetStore.sheets[index].id).length}}/{{sheetStore.getFilledCellCount(sheetStore.sheets[index].id)}}
                    </div>
                    <div class="columnBorder"></div>
                    <div class="cardsViewCell">{{cardStore.getNewCards(sheetStore.sheets[index].id).length}}</div>
                    <div class="cardsViewCell">{{cardStore.getLearningCards(sheetStore.sheets[index].id).length}}</div>
                    <div class="cardsViewCell">{{cardStore.getDueCards(sheetStore.sheets[index].id).length}}</div>
                    <div class="cardsViewCell">
                        <img v-if="cardStore.getCardsToPracticeCount(sheetStore.sheets[index].id) > 0"
                             src="@/assets/arrow-right-long.svg"
                             class="PracticeButton"
                             @click="sheetID = sheetStore.sheets[index].id;
                                        getNextCard();"/>
                    </div>
                    <div class="RowGap" v-for="x in 8" v-if="index + 1 < sheetStore.sheets.length"></div>
                </template>
            </div>
            <div v-if="sheetStore.sheets.length === 0" style="color:var(--info-200); font-size:1.5rem;">
                Create a sheet to begin making flashcards!
            </div>
            <div style="height:10vh"></div>
            <div v-if="sheetID !== -1" style="display:flex;flex-direction:column;gap:5px;">
                <h3 class="PromptHeader">Select flashcards to create from this sheet</h3>
                <div style="display:flex;flex-direction:row;gap:5px;justify-content:center">
                    <div class="cardSelectButton" @click="SelectAll()"><h3>Select all</h3></div>
                    <div class="cardSelectButton" @click="SelectNone()"><h3>Select none</h3></div>
                </div>
            </div>
            <SheetGrid :sheetID="sheetID"
                       :formatEmpty="true"
                       @update:selected-cell="onCellClicked"
                       ref="gridRef"
                       style="width:100%; height:90vh;" />
        </div>
    </div>
    <div v-else class="PracticeView">
        <img @click="sheetID = -1; practicing = false;" 
             src="@/assets/arrow-left-long.svg"
             class="BackButton" />
        <h3 class="PracticeSheetName">{{sheetStore.getSheet(sheetID).name}}</h3>
        <div class="RemainingPanel" :key="updateStatsKey">
            <div class="Headings">New</div>
            <div class="Headings">Learning</div>
            <div class="Headings">Due</div>
            <div class="Headings">{{cardStore.getNewCards(sheetID).length}}</div>
            <div class="Headings">{{cardStore.getLearningCards(sheetID).length}}</div>
            <div class="Headings">{{cardStore.getDueCards(sheetID).length}}</div>
        </div>
        <img v-if="currentCardType != 'New' && hasFlipped"
             @click="finishedCard('Bad')"
             class="BadButton"
             src="@/assets/thumb-down.svg" />
        <div v-else></div>
        <div :class="['Card', cardFlipped ? 'FlippedCard' : '' ]"
             @click="cardFlipped = !cardFlipped; hasFlipped = true;">
            <div class="CardTypeText">
                <h3>{{currentCardType}}</h3>
            </div>
            <div class="FlashcardText">
                <div v-if="!cardFlipped">
                    {{sheetStore.coordToKey(sheetID, currentCard.value.reference.coord)}}
                </div>
                <div v-else>{{currentCard.value.algorithm}}</div>
            </div>
        </div>
        <img v-if="hasFlipped"
             @click="finishedCard('Good')"
             class="GoodButton"
             src="@/assets/thumb-up.svg" />
    </div>

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
        color: var(--grey-100);
    }
    .HeadingText {
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

    .editButton {
        cursor: pointer;
        background-color: var(--brand-700);
        border-radius: 5px;
        height: 60px;
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
        height: 60px;
        width: 100px;
    }
    .PracticeButton:hover{
        background-color: var(--brand-500);
    }

    .PromptHeader{
        display:flex;
        justify-content:center;
        background-color: var(--brand-700);
        font-size:2rem;
        color: var(--grey-100);
        width: 700px;
        border-radius:10px;
    }
    .cardSelectButton {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--brand-700);
        color: var(--brand-900);
        font-size: 1rem;
        width:110px;
        border-radius: 10px;
        cursor:pointer;
    }
    .cardSelectButton:hover{
        background-color: var(--brand-500);
    }


    .PracticeView {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        margin-top: 10px;
        gap: 10px;
    }

    .BackButton {
        background-color: var(--brand-600);
        border-radius: 5px;
        cursor: pointer;
        height: 50px;
        width: 70px;
        margin-left: 10px;
    }
    .BackButton:hover {
        background-color: var(--brand-500);
    }

    .PracticeSheetName {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        width: auto;

        background-color: var(--brand-700);
        font-size: 2rem;
        color: var(--grey-100);
        border-radius: 10px;
    }

    .RemainingPanel{
        display:grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 2px;
    }

    .Card {
        width: 40vw;
        height: 50vh;
        justify-self: center;
        align-self: center;
        background-color: var(--brand-700);
        border: 5px solid var(--grey-100);
        border-radius: 20px;
        display: flex;
        position: relative;
        color: var(--grey-100);
        font-size: 1.5rem;
        cursor: pointer;
    }
    .FlippedCard {
        background-color: var(--brand-800);
        border: 5px solid var(--grey-200);
    }

    .CardTypeText {
        position: absolute;
        top: 0px;
        left: 10px;
    }

    .BadButton{
        background-color: var(--error-200);
        border-radius: 10px;
        align-self: center;
        justify-self: end;
        width: 10vw;
        cursor: pointer;
    }
    .BadButton:hover{
         background-color: var(--error-300);
     }

    .GoodButton {
        background-color: var(--confirm-200);
        border-radius: 10px;
        align-self: center;
        justify-self: start;
        width: 10vw;
        cursor: pointer;
    }
    .GoodButton:hover {
        background-color: var(--confirm-300);
    }

    .FlashcardText {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        width: 100%;
    }
</style>
