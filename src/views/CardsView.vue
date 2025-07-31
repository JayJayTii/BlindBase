<script setup>
    import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
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

    const sheetIndex = ref(-1);

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
        selectedCells.value = cardStore.getCardsForSheet(sheetIndex.value).map(card => card.reference.coord);
        gridRef.value.changeHighlightedCells(selectedCells.value);
    }
    function onCellClicked(value) {
        if (sheetStore.getCell(sheetIndex.value, value) === "") {
            return; //Empty cell, not allowed!
        }
        if (selectedCells.value.some(cell => cell.x === value.x && cell.y === value.y)) {
            //If it already includes it, remove it
            selectedCells.value = selectedCells.value.filter(cell => !(cell.x === value.x && cell.y === value.y));
            cardStore.deleteCard(sheetIndex.value, value);
        }
        else {
            //If it wasn't in it, add it
            selectedCells.value.push(value);
            cardStore.createCard(sheetIndex.value, value);
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
    }
    const currentCard = reactive({});
    function getNextCard() {
        practicing.value = true;
        cardFlipped.value = false;
        hasFlipped.value = false;

        var possibleNextCards = cardStore.getDueCards(sheetIndex.value).length > 0 ? cardStore.getDueCards(sheetIndex.value)
            : (cardStore.getLearningCards(sheetIndex.value).length > 0 ? cardStore.getLearningCards(sheetIndex.value)
                : cardStore.getNewCards(sheetIndex.value))
        //Sort next cards by practice time, we want the oldest first
        possibleNextCards.sort((a, b) => new Date(a.nextPracticeTime) - new Date(b.nextPracticeTime));
        currentCard.value = possibleNextCards[0];
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
        if (cardStore.getCardsToPracticeCount(sheetIndex.value) === 0) {
            sheetIndex.value = -1;
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
                <template v-for="(name, index) in sheetStore.getSheetNames">
                    <div class="cardsViewCell">
                        <!--this should have a pencil icon or smthn-->
                        <img @click="sheetIndex = (sheetIndex === index) ? -1 : index;
                                 UpdateSelectedCells();"
                             src="@/assets/edit.svg"
                             :class="['editButton', (sheetIndex === index) ? 'editButtonSelected': '']" />
                    </div>
                    <div class="cardsViewCell">{{name}}</div>
                    <div class="cardsViewCell">
                        {{cardStore.getCardsForSheet(index).length}}/{{sheetStore.getFilledCellCount(index)}}
                    </div>
                    <div class="columnBorder"></div>
                    <div class="cardsViewCell">{{cardStore.getNewCards(index).length}}</div>
                    <div class="cardsViewCell">{{cardStore.getLearningCards(index).length}}</div>
                    <div class="cardsViewCell">{{cardStore.getDueCards(index).length}}</div>
                    <div class="cardsViewCell">
                        <img v-if="cardStore.getCardsToPracticeCount(index) > 0"
                             src="@/assets/arrow-right-long.svg"
                             class="PracticeButton"
                             @click="sheetIndex = index;
                                        getNextCard()"/>
                    </div>
                    <div class="RowGap" v-for="x in 8" v-if="index + 1 < sheetStore.sheets.length"></div>
                </template>
            </div>
            <div v-if="sheetStore.sheets.length === 0" style="color:var(--info-200); font-size:1.5rem;">
                Create a sheet to begin making flashcards!
            </div>
            <div style="height:10vh"></div>
            <div v-if="sheetIndex !== -1" class="PromptHeader">
                <h3>Select flashcards to create from this sheet</h3>
            </div>
            <SheetGrid :sheetIndex="sheetIndex"
                       :formatEmpty="true"
                       @update:selected-cell="onCellClicked"
                       ref="gridRef"
                       style="width:100%; height:90vh;" />
        </div>
    </div>
    <div v-else class="PracticeView">
        <img @click="sheetIndex = -1; practicing = false;" 
             src="@/assets/arrow-left-long.svg"
             class="BackButton" />
        <h3 class="PracticeSheetName">{{sheetStore.sheets[sheetIndex].name}}</h3>
        <div class="RemainingPanel" :key="updateStatsKey">
            <div class="Headings">New</div>
            <div class="Headings">Learning</div>
            <div class="Headings">Due</div>
            <div class="Headings">{{cardStore.getNewCards(sheetIndex).length}}</div>
            <div class="Headings">{{cardStore.getLearningCards(sheetIndex).length}}</div>
            <div class="Headings">{{cardStore.getDueCards(sheetIndex).length}}</div>
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
                    {{sheetStore.coordToKey(sheetIndex,currentCard.value.reference.coord)}}
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
        border-radius:10px;
    }

    .PracticeView {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        margin-top: 10px;
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
        height:60px;
        width: auto;

        background-color: var(--brand-700);
        font-size: 2rem;
        color: var(--grey-100);
        border-radius: 10px;
    }

    .RemainingPanel{
        display:grid;
        grid-template-columns: 1fr 1fr 1fr;
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
