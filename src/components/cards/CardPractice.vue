<script setup>
    import { reactive} from "vue"
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    import { useCardStore } from "@/stores/CardStore"
    const cardStore = useCardStore()
    cardStore.loadState()

    import Flashcard from "@/components/cards/Flashcard.vue"

    const props = defineProps({
        sheetID: Number,
        updateStatsKey: Number,
    })
    const emit = defineEmits(['quitPractice'])

    //Current card is stored here then passed into the flashcard
    const currentCard = reactive({})
    function getNextCard() {
        //Prioritise cards in the order Due -> Learning -> New
        const dueCards = cardStore.getCardsOfType(props.sheetID, "Due")
        const learningCards = cardStore.getCardsOfType(props.sheetID, "Learning")
        const newCards = cardStore.getCardsOfType(props.sheetID, "New")
        const possibleNextCards = dueCards.length > 0 ? dueCards
            : (learningCards.length > 0 ? learningCards : newCards)

        //Choose a random card out of the type that is being practiced
        const nextIndex = Math.floor(Math.random() * possibleNextCards.length)
        currentCard.value = possibleNextCards[nextIndex]
    }
    getNextCard() //Get initial card

    function finishedCard(result) { //Result is a string 'Good' or 'Bad'
        if (cardStore.getCardsToPracticeCount(props.sheetID) === 0) {
            emit("quitPractice")
            return
        }
        getNextCard()
    }
</script>

<template>
    <div class="PracticeView">
        <!------BACK------>
        <img src="@/assets/arrow-left-long.svg" @click="emit('quitPractice')"
             class="CustomButton" style="margin-left: 10px; width:70px;height:50px;" />

        <!------SHEET NAME------>
        <h3 class="PracticeSheetName">{{sheetStore.getSheet(props.sheetID).name}}</h3>

        <!------REMAINING CARDS STATS------>
        <div class="RemainingPanel" :key="props.updateStatsKey">
            <div>New</div>
            <div>Learning</div>
            <div>Due</div>
            <div>{{cardStore.getCardsOfType(props.sheetID, 'New').length}}</div>
            <div>{{cardStore.getCardsOfType(props.sheetID,'Learning').length}}</div>
            <div>{{cardStore.getCardsOfType(props.sheetID,'Due').length}}</div>
        </div>

        <!------FLASHCARD------>
        <Flashcard :card="currentCard"
                   :sheetID="props.sheetID"
                   @finishedCard="finishedCard" />
    </div>
</template>

<style>
    .PracticeView {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        margin-top: 10px;
        gap: 10px;
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