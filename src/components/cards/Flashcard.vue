<script setup>
    import { ref, computed, onMounted, onUnmounted } from "vue"
    import { getCardType } from "@/helpers/cards.js"
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    import { useCardStore } from "@/stores/CardStore"
    const cardStore = useCardStore()
    cardStore.loadState()

    const props = defineProps({
        sheetID: Number,
        card: Object,
    })
    const emit = defineEmits(['finishedCard'])

    const cardFlipped = ref(false)
    const hasFlipped = ref(false)

    function handleKeydown(event) {
        //Space (flip card)
        if (event.code === 'Space') {
            cardFlipped.value = !cardFlipped.value
            hasFlipped.value = true
        }
        //Right arrow (good card)
        else if (event.code == 'ArrowRight' && hasFlipped.value === true) {
            finishedCard('Good')
        }
        //Left arrow (bad card)
        else if (event.code == 'ArrowLeft' && hasFlipped.value === true && cardType.value !== "New") {
            finishedCard('Bad')
        }
    }
    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
    })

    const cardType = computed({
        get: () => {
            return getCardType(props.card.value)
        }
    })

    function finishedCard(result) {
        hasFlipped.value = false
        cardFlipped.value = false
        var updated = JSON.parse(JSON.stringify(props.card.value)) //Done to deep-copy the reference as well
        if (result == 'Good') {
            updated.successCount += 1
        }
        else {
            updated.failCount += 1
        }

        if (cardType.value == "New") {
            //10 minutes later for a new card (can only select good)
            var nextTime = new Date()
            nextTime.setMinutes(nextTime.getMinutes() + 10)
            updated.nextPracticeTime = nextTime.toISOString()
        }
        else if (cardType.value == "Learning") {
            //10 minutes later no matter what result
            //But you repeat it more often if it was bad
            var nextTime = new Date()
            nextTime.setMinutes(nextTime.getMinutes() + 10)
            updated.nextPracticeTime = nextTime.toISOString()
        }
        else if (cardType.value == "Due") {
            //Both successes and fails taken into account
            var nextTime = new Date()
            const score = updated.successCount - updated.failCount
            if (score < 4)
                nextTime.setDate(nextTime.getDate() + 1) //1 day
            else if (score < 7)
                nextTime.setDate(nextTime.getDate() + 2) //2 days
            else if (score < 11)
                nextTime.setDate(nextTime.getDate() + 7) //7 days
            else if (score < 14)
                nextTime.setDate(nextTime.getDate() + 30)//30 days
            else
                nextTime.setDate(nextTime.getDate() + 90)//90 days

            updated.nextPracticeTime = nextTime.toISOString()
        }
        cardStore.completeCard(updated)
        emit('finishedCard')
    }
</script>

<template>
    <!------GOOD------>
    <img v-if="cardType != 'New' && hasFlipped"
         @click="finishedCard('Bad')"
         class="BadButton"
         src="@/assets/thumb-down.svg" />
    <div v-else></div>

    <!------CARD------>
    <div :class="['Card', cardFlipped ? 'FlippedCard' : '' ]"
         @click="cardFlipped = !cardFlipped; hasFlipped = true;">
        <div class="CardTypeText">
            <h3>{{cardType}}</h3>
        </div>
        <div class="FlashcardText">
            <div v-if="!cardFlipped">
                {{sheetStore.coordToKey(props.sheetID, props.card.value.reference.coord)}}
            </div>
            <div v-else>{{props.card.value.algorithm}}</div>
        </div>
    </div>

    <!------BAD------>
    <img v-if="hasFlipped"
         @click="finishedCard('Good')"
         class="GoodButton"
         src="@/assets/thumb-up.svg" />
</template>

<style>
    .Card {
        width: 40vw;
        aspect-ratio: 1.5;
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

    .BadButton {
        background-color: var(--error-200);
        border-radius: 10px;
        align-self: center;
        justify-self: end;
        width: 10vw;
        cursor: pointer;
    }
        .BadButton:hover {
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
        align-content: center;
        width: 100%;
        height: 100%;
        font-size: 2rem;
    }

</style>