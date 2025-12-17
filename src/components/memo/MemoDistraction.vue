<script setup>
    import { ref, onMounted, onUnmounted } from "vue"
    import { gaussianRandom } from '@/helpers/memo.js'
    import { allLetterPairs } from '@/helpers/pairs.js'

    const props = defineProps({
        runData: Object,
    })

    const emit = defineEmits(['stageComplete'])

    //Distraction is only used in corners
    if (!(props.runData.mode == "Corners" || props.runData.mode == "One mistake")) 
        emit('stageComplete')

    const timer = ref(Math.max(2, gaussianRandom(9, 2)))
    const timerDelta = 0.1 //seconds
    function updateTimer() {
        timer.value -= timerDelta

        if (timer.value <= 0) {
            const rand = Math.random()
            if (rand < 0.9 || hasKidded) {
                emit('stageComplete')
                return
            }
            else {
                justKidding.value = true
                hasKidded = true
                setTimeout(() => justKidding.value = false, 1000)
                timer.value = Math.max(2, gaussianRandom(8, 3))
            }
        }
    }

    //These are keep track of how angry the user is >:)
    const justKidding = ref(false)
    let hasKidded = false

    let intervalID = null
    onMounted(() => {
        intervalID = setInterval(updateTimer, timerDelta * 1000)
    })
    onUnmounted(() => {
        clearInterval(intervalID)
    })

    //There are letter pairs flying across the screen to distract the user
    const pairCount = 100
    const pairHeights = Array.from({ length: pairCount }, () => { return Math.random() * 100 - 5 })
    const pairStrings = Array.from({ length: pairCount }, () => { return allLetterPairs[Math.floor(Math.random() * allLetterPairs.length)] })

    const getStyle = (i) => {
        return {
            position: "Fixed",
            left: "-100px",
            top: `${pairHeights[i]}vh`,
            zIndex: "1000",
            animationDelay: `${i / pairCount * 5}s` // 0.1s stagger per item
        }
    }
</script>

<template>
    <div class="DistractAnimation" style="font-size: 2rem;position:absolute;top:20vh;">
        DISTRACTION GRAAAHHH
    </div>
    <div style="font-size: 8rem; position: absolute; top: 20vh; transform: translate(-50%,50%);">
        {{Math.round(timer)}}
    </div>
    <div v-if="justKidding" style="font-size: 2rem; position: absolute; bottom: 35vh; transform: translate(-50%,50%);">
        just kidding :)
    </div>
    <div v-for="i in pairCount" :style="getStyle(i)" class="distractionPair">
        {{pairStrings[i]}}
    </div>
</template>

<style>

    .distractionPair{
        animation: pairAnimation 5s linear infinite;
    }
    @keyframes pairAnimation{
        from {
            transform: translate(0vw,0vh);
        }
        to{
            transform: translate(150vw, 0vh);
        }
    }


    .DistractAnimation {
        animation: distractionAnimationMove 1.5s ease-in-out infinite;
    }
    @keyframes distractionAnimationMove {
        0% {
            transform: translate(-50%,50%) rotate(20deg) rotate3d(0, 1, 0, 20deg);
        }
        50% {
            transform: translate(-50%,50%) rotate(-20deg) rotate3d(0, 1, 0, -20deg);
        }
        100% {
            transform: translate(-50%,50%) rotate(20deg) rotate3d(0, 1, 0, 20deg);
        }
    }
</style>