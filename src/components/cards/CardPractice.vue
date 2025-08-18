<script setup>
    import { reactive} from "vue"
    import Flashcard from "@/components/cards/Flashcard.vue"
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    import { useCardStore } from "@/stores/CardStore"
    const cardStore = useCardStore()
    cardStore.loadState()

    const props = defineProps({
        sheetID: Number,
        updateStatsKey: Number,
    })

    const emit = defineEmits(['quitPractice'])

    const currentCard = reactive({});
    function getNextCard() {
        var possibleNextCards = cardStore.getDueCards(props.sheetID).length > 0 ? cardStore.getDueCards(props.sheetID)
            : (cardStore.getLearningCards(props.sheetID).length > 0 ? cardStore.getLearningCards(props.sheetID)
                : cardStore.getNewCards(props.sheetID))

        const nextIndex = Math.floor(Math.random() * possibleNextCards.length);
        currentCard.value = possibleNextCards[nextIndex];
    };
    getNextCard() //Initial card

    function finishedCard(result) { //Result is a string 'Good' or 'Bad'
        if (cardStore.getCardsToPracticeCount(props.sheetID) === 0) {
            emit("quitPractice")
            return;
        }
        getNextCard();
    }
</script>

<template>
    <div class="PracticeView">
        <img @click="emit('quitPractice');"
             src="@/assets/arrow-left-long.svg"
             class="BackButton" />
        <h3 class="PracticeSheetName">{{sheetStore.getSheet(props.sheetID).name}}</h3>
        <div class="RemainingPanel" :key="props.updateStatsKey">
            <div>New</div>
            <div>Learning</div>
            <div>Due</div>
            <div>{{cardStore.getNewCards(props.sheetID).length}}</div>
            <div>{{cardStore.getLearningCards(props.sheetID).length}}</div>
            <div>{{cardStore.getDueCards(props.sheetID).length}}</div>
        </div>

        <Flashcard :card="currentCard"
                   :sheetID="props.sheetID"
                   @finishedCard="finishedCard"/>
    </div>
</template>

<style>
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
        font-size: 4vw;
    }

    .RemainingPanel {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 2px;
        color: var(--text-color);
        text-align: center;
        font-size: 2vw;
    }

</style>