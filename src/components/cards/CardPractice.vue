<script setup>
    import { reactive} from "vue"
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    import { useCardStore } from "@/stores/CardStore"
    const cardStore = useCardStore()

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

    function finishedCard(result) { //result is 'Good' or 'Bad'
        if (cardStore.getCardsToPracticeCount(props.sheetID) === 0) {
            emit("quitPractice")
            return
        }
        getNextCard()
    }
</script>

<template>
    <div>
        <!------BACK------>
        <div style="position: absolute; top: 5px; left: 20px; height: auto;">
            <el-tooltip content="Back">
                <el-button type="primary" :plain="true" style="height: 40px;" @click="emit('quitPractice')">
                    <el-icon :size="30"><DArrowLeft /></el-icon>
                </el-button>
            </el-tooltip>
        </div>
        
        <!------FLASHCARD------>
        <Flashcard :card="currentCard"
                   :sheetID="props.sheetID"
                   @finishedCard="finishedCard" />

        <!------REMAINING CARDS STATS------>
        <div id="RemainingPanel" :key="props.updateStatsKey">
            <div>New</div>
            <div>Learning</div>
            <div>Due</div>
            <div>{{cardStore.getCardsOfType(props.sheetID, 'New').length}}</div>
            <div>{{cardStore.getCardsOfType(props.sheetID, 'Learning').length}}</div>
            <div>{{cardStore.getCardsOfType(props.sheetID, 'Due').length}}</div>
        </div>
    </div>
</template>

<style>
    .PracticeSheetName {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        width: 100%;
        height: 100%;
        background-color: var(--brand-700);
        font-size: 2rem;
        color: var(--grey-100);
        border-radius: 10px;
        font-size: min(3rem, 5vw);
        word-break: break-all;
    }

    #RemainingPanel {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 2px;
        width: 300px;
        height: 80px;
        position: absolute;
        top: 0px;
        right: 0px;
        border: 1px solid var(--el-border-color);
        border-radius: 4px;
        text-align: center;
        padding: 10px;
        font-size: 1.2rem;
        background-color: var(--el-bg-color);
    }
</style>