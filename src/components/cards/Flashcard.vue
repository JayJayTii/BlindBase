<script setup>
    import { ref, computed, onMounted, onUnmounted } from "vue"
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

    const cardFlipped = ref(false);
    const hasFlipped = ref(false);

    function handleKeydown(event) {
        if (event.code === 'Space') {
            cardFlipped.value = !cardFlipped.value
            hasFlipped.value = true
        }
        //Right arrow
        else if (event.code == 'ArrowRight' && hasFlipped.value === true) {
            finishedCard('Good')
        }
        //left arrow
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
            return cardStore.getCardType(props.card.value);
        }
    });

    function finishedCard(result) {
        hasFlipped.value = false;
        cardFlipped.value = false;
        var updated = JSON.parse(JSON.stringify(props.card.value)); //Done to deep-copy the reference as well
        if (result == 'Good') {
            updated.successCount += 1;
        }
        else {
            updated.failCount += 1;
        }

        if (cardType.value == "New") {
            var nextTime = new Date();
            nextTime.setMinutes(nextTime.getMinutes() + 10);
            updated.nextPracticeTime = nextTime.toISOString();
        }
        else if (cardType.value == "Learning") {
            //10 minutes later no matter what result
            //But you repeat it more often if it was bad
            var nextTime = new Date();
            nextTime.setMinutes(nextTime.getMinutes() + 10);
            updated.nextPracticeTime = nextTime.toISOString();
        }
        else if (cardType.value == "Due") {
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
        emit('finishedCard')
    }
</script>

<template>
    <img v-if="cardType != 'New' && hasFlipped"
         @click="finishedCard('Bad')"
         class="BadButton"
         src="@/assets/thumb-down.svg" />
    <div v-else></div>
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