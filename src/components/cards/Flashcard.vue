<script setup>
    import { ref, computed, nextTick, onMounted, onUnmounted } from "vue"
    import { getCardType } from "@/helpers/cards.js"
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    import { useCardStore } from "@/stores/CardStore"
    const cardStore = useCardStore()

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
            FlipCard()
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

    const lastCard = ref({ value: { sheetID: 0, coord: { x: 0, y: 0 } } })
    const lastFlipValue = ref(false)
    function finishedCard(result) {
        lastCard.value = { ...props.card }
        lastFlipValue.value = cardFlipped.value
        const AnimatedCard = document.getElementById('AnimatedCard')
        const RealCard = document.getElementById('Card')
        //Match animated card's position to real card
        AnimatedCard.style.position = "fixed"
        AnimatedCard.style.top = `${RealCard.getBoundingClientRect().top}px`
        AnimatedCard.style.left = `${RealCard.getBoundingClientRect().left}px`
        //Translate the card
        AnimatedCard.classList.remove('RightAnimatedCard')
        AnimatedCard.classList.remove('LeftAnimatedCard')
        void AnimatedCard.offsetWidth


        hasFlipped.value = false
        cardFlipped.value = false

        var updated = JSON.parse(JSON.stringify(props.card.value)) //Done to deep-copy the reference as well
        if (result == 'Good') {
            updated.successCount += 1
            nextTick(() => { AnimatedCard.classList.add('RightAnimatedCard') })
        }
        else {
            updated.failCount += 1
            nextTick(() => { AnimatedCard.classList.add('LeftAnimatedCard') })
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

    function FlipCard() {
        //Need to animate the card flipping and update the variables at the right time in the animation
        const RealCard = document.getElementById('Card')
        RealCard.classList.remove('AnimatedCardFlipBackward')
        RealCard.classList.add('AnimatedCardFlipForward')

        setTimeout(() => {
            RealCard.classList.remove('AnimatedCardFlipForward')
            if (!hasFlipped.value) {
                hasFlipped.value = true
                nextTick(() => {
                    const goodButton = document.getElementById('GoodButton')
                    const badButton = document.getElementById('BadButton')
                    goodButton.classList.remove('AnimatedCardFlipBackward')
                    void goodButton.offsetWidth
                    goodButton.classList.add('AnimatedCardFlipBackward')
                    if (badButton) {
                        badButton.classList.remove('AnimatedCardFlipBackward')
                        void badButton.offsetWidth
                        badButton.classList.add('AnimatedCardFlipBackward')
                    }
                })
            }

            cardFlipped.value = !cardFlipped.value;
            hasFlipped.value = true
            nextTick(() => { RealCard.classList.add('AnimatedCardFlipBackward') })
        }, 50)

    }
</script>

<template>
    <!------BAD------>
    <img v-if="cardType != 'New' && hasFlipped"
         title="Didn't remember - click/left arrow"
         @click="finishedCard('Bad')"
         id="BadButton"
         class="BadButton"
         src="@/assets/thumb-down.svg" />
    <div v-else></div>

    <!------CARD------>
    <div id="Card" :class="['Card', cardFlipped ? 'FlippedCard' : '' ]"
         title="Flip - click/space"
         @click="FlipCard()">
        <div class="CardTypeText">
            <h3>{{cardType}}</h3>
        </div>
        <div class="FlashcardText">
            <div v-if="!cardFlipped">
                {{sheetStore.coordToKey(props.sheetID, props.card.value.coord)}}
            </div>
            <div v-else>{{sheetStore.getCell(props.sheetID, props.card.value.coord)}}</div>
        </div>

    </div>       
    <!------ANIMATED CARD------>
    <div id="AnimatedCard" style="position:fixed;left:10000%;"
         :class="['Card', lastFlipValue ? 'FlippedCard' : '' ]">
        <div class="CardTypeText">
            <h3>{{getCardType(lastCard.value)}}</h3>
        </div>
        <div class="FlashcardText">
            <div v-if="!lastFlipValue">
                {{sheetStore.coordToKey(props.sheetID, lastCard.value.coord)}}
            </div>
            <div v-else>{{sheetStore.getCell(props.sheetID, lastCard.value.coord)}}</div>
        </div>
    </div>


    <!------GOOD------>
    <img v-if="hasFlipped"
         title="Remembered - click/right arrow"
         @click="finishedCard('Good')"
         id="GoodButton"
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
    .AnimatedCardFlipForward {
        animation: animatedCardFlipForward 0.05s forwards;
    }
    @keyframes animatedCardFlipForward {
        from { transform: scale(1, 1); }
        to { transform: scale(1, 0); }
    }
    .AnimatedCardFlipBackward {
        animation: animatedCardFlipBackward 0.05s forwards;
    }
    @keyframes animatedCardFlipBackward {
        from { transform: scale(1, 0); }
        to { transform: scale(1, 1); }
    }

    .RightAnimatedCard {
        animation: rightAnimatedFlashcardMove 0.1s ease-in forwards;
    }
    .LeftAnimatedCard {
        animation: leftAnimatedFlashcardMove 0.1s ease-in forwards;
    }

    @keyframes rightAnimatedFlashcardMove {
        from { transform: translate(0px, 0px); }
        to { transform: translate(200vw, 0px); }
    }
    @keyframes leftAnimatedFlashcardMove {
        from { transform: translate(0px, 0px); }
        to { transform: translate(-200vw, 0px); }
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