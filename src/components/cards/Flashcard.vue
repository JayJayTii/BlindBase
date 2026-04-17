<script setup>
    import { ref, computed, nextTick, onMounted, onUnmounted } from "vue"
    import { getCardType } from "@/helpers/cards.js"
	import { cornerBuffers, edgeBuffers } from "@/helpers/letter_scheme.js"
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
        if (event.code === 'Space' || event.code == 'ArrowUp' || event.code == 'ArrowDown') {
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
    const getBufferStr = computed({
        get: () => {
            switch (sheetStore.getType(props.sheetID)) {
                case 1: // Corners
                    return cornerBuffers[sheetStore.getBuffer(props.sheetID)]
                case 2: // Edges
                    return edgeBuffers[sheetStore.getBuffer(props.sheetID)]
                default:
                    return ""
            }
        }
    })

    function finishedCard(result) {
        hasFlipped.value = false
        
        var updatedCard = JSON.parse(JSON.stringify(props.card.value)) //Done to deep-copy the reference as well
        const CardMovementWrapper = document.getElementById('card-movement-wrapper')
        if (result == 'Good') {
			updatedCard.successCount += 1
            CardMovementWrapper.classList.add('RightAnimatedCard')
        }
        else if (result == 'Bad') {
			updatedCard.failCount += 1
            CardMovementWrapper.classList.add('LeftAnimatedCard')
        }
        void CardMovementWrapper.offsetWidth
        setTimeout(() => {
			CardMovementWrapper.classList.remove('RightAnimatedCard')
			CardMovementWrapper.classList.remove('LeftAnimatedCard')
			void CardMovementWrapper.offsetWidth
			cardFlipped.value = false
        }, 150)

		var nextTime = new Date()
        switch (cardType.value) {
			case "New":
				//10 minutes later for a new card (can only select good)
				nextTime.setMinutes(nextTime.getMinutes() + 10)
				updatedCard.nextPracticeTime = nextTime.toISOString()
                break
			case "Learning":
				//10 minutes later no matter what result
				//But you repeat it more often if it was bad#
				nextTime.setMinutes(nextTime.getMinutes() + 10)
				updatedCard.nextPracticeTime = nextTime.toISOString()
                break
			case "Due":
				//Both successes and fails taken into account
				const score = updatedCard.successCount - updatedCard.failCount
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
                break
        }
		updatedCard.nextPracticeTime = nextTime.toISOString()
		cardStore.completeCard(updatedCard)
        emit('finishedCard')
    }

    function FlipCard() {
        //Need to animate the card flipping and update the variables at the right time in the animation
        const card = document.getElementById('Card')
		card.classList.remove('AnimatedCardFlipBackward')
		card.classList.add('AnimatedCardFlipForward')

        setTimeout(() => {
			card.classList.remove('AnimatedCardFlipForward')
            cardFlipped.value = !cardFlipped.value;
            hasFlipped.value = true
			nextTick(() => { card.classList.add('AnimatedCardFlipBackward') })
        }, 50)

    }
</script>

<template>
    <div style="overflow: hidden; width: 97vw; height: 70vh;">
        <div id="card-practice">
            <div id="card-movement-wrapper">
                <el-card id="Card" shadow="always" body-style="padding: 0px;" @click="FlipCard()">
                    <div v-if="!cardFlipped" slot="header" class="el-card__header">
                        <div>{{cardType}}</div>
                        <div>{{sheetStore.getSheet(props.sheetID).name}}</div>
                        <div>{{getBufferStr}}</div>
                    </div>
                    <div v-else style="height: 50px;"></div>
                    <div slot="default" id="card-body">
                        <div v-if="!cardFlipped">
                            {{sheetStore.coordToKey(props.sheetID, props.card.value.coord)}}
                        </div>
                        <div v-else>
                            {{sheetStore.getCell(props.sheetID, props.card.value.coord)}}
                        </div>
                    </div>
                </el-card>
            </div>
            <div v-if="hasFlipped" id="result-buttons">
                <!------BAD------>
                <div>
                    <el-tooltip content="Bad" placement="left">
                        <el-button type="danger" :disabled="cardType == 'New'"
                                   @click="finishedCard('Bad')">
                            <el-icon><Close /></el-icon>
                        </el-button>
                    </el-tooltip>
                </div>
                <!------GOOD------>
                <div>
                    <el-tooltip content="Good" placement="right">
                        <el-button type="success"
                                   @click="finishedCard('Good')">
                            <el-icon><Check /></el-icon>
                        </el-button>
                    </el-tooltip>
                </div>
            </div>
        </div>
    </div>

</template>

<style>
	#card-practice {
        --card-width: 50vw;
        --card-height: 55vh;
	}
   
	#Card {
		width: var(--card-width);
		height: var(--card-height);
		position: absolute;
		left: calc(50dvw - var(--card-width) / 2);
		top: calc(35dvh - var(--card-height) / 2);
		border-radius: 10px;
		cursor: pointer;
		transition-duration: 0s;
        user-select: none;
	}
		#Card .el-card__header {
			display: flex;
			justify-content: space-between;
			font-size: 1.2rem;
			font-weight: bold;
		}

	#card-body {
		text-align: center;
		align-content: center;
        height: calc(100% - 90px);
		width: 100%;
		font-size: 2rem;
	}

	#result-buttons {
		display: grid;
		grid-template-columns: 40px 40px;
		gap: 20px;
		position: absolute;
		left: calc(50dvw);
		top: calc(35dvh + var(--card-height) / 2 + 30px);
        transform: translate(-50%, -50%);
	}

    .FlippedCard {
        background-color: var(--el-color-primary-light-9);
    }

    .AnimatedCardFlipForward {
        animation: animatedCardFlipForward 0.05s forwards;
    }
    @keyframes animatedCardFlipForward {
		from { transform: scale(1, 1); }
		to { transform: scale(1.2, 0); }
    }
    .AnimatedCardFlipBackward {
        animation: animatedCardFlipBackward 0.05s forwards;
    }
    @keyframes animatedCardFlipBackward {
		from { transform: scale(1.2, 0); }
		to { transform: scale(1, 1); }
    }

    .RightAnimatedCard {
        animation: rightAnimatedFlashcardMove 0.15s ease-in forwards;
    }
    .LeftAnimatedCard {
        animation: leftAnimatedFlashcardMove 0.15s ease-in forwards;
    }

    @keyframes rightAnimatedFlashcardMove {
        from { transform: translate(0px, 0px); }
        to { transform: translate(200vw, 0px); }
    }
    @keyframes leftAnimatedFlashcardMove {
        from { transform: translate(0px, 0px); }
        to { transform: translate(-200vw, 0px); }
    }
</style>