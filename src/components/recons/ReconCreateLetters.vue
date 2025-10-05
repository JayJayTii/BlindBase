<script setup>
    import { nextTick, ref, watch }from 'vue'
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import { Sequence } from '@/helpers/sequence.js'
    import { FinishCornerCycle, FinishEdgeCycle } from '@/helpers/reconstruct.js'
    import FaceletCubeVisual from '@/components/FaceletCubeVisual.vue'
    import ReconCreateLetters from '@/components/recons/ReconCreateLetters.vue'

    const props = defineProps({
        scramble: Sequence,
    })

    let cube = new FaceletCube()
    for (var i = 0; i < props.scramble.turns.length; i++) {
        cube.Turn(props.scramble.turns[i])
    }
    const cycleResult = FinishCornerCycle(cube)
    const letterSolution = ref([cycleResult[0],[]])
    const cornerInput = ref(ToLetters(letterSolution.value[0]))
    const edgeInput = ref("")
    const letterOptions = ref(cycleResult[1])
    const pieceType = ref(0)

    if (letterOptions.value.length === 0) {
        pieceType.value++
        const firstEdgeCycle = FinishEdgeCycle(cube)
        letterSolution.value[1] = firstEdgeCycle[0]
        letterOptions.value = firstEdgeCycle[1]
        edgeInput.value = ToLetters(letterSolution.value[1])
    }

    function ToLetters(arr) {
        //Convert array of numbers to array of sticker letters
        return arr.map(i => String.fromCharCode(i + 65)).join('')
    }

    function letterSelected(letterIndex) {
        updating = true;
        letterSolution.value[pieceType.value].push(letterIndex)
        if(pieceType.value === 0)
            cube.SwapCornerCubies(2, letterIndex)
        else
            cube.SwapEdgeCubies(2, letterIndex)
        const newCycle = pieceType.value === 0 ? FinishCornerCycle(cube) : FinishEdgeCycle(cube)
        letterSolution.value[pieceType.value] = letterSolution.value[pieceType.value].concat(newCycle[0])
        letterOptions.value = newCycle[1]

        if (pieceType.value === 0) {
            cornerInput.value = ToLetters(letterSolution.value[pieceType.value])
        }
        else
            edgeInput.value = ToLetters(letterSolution.value[pieceType.value])


        if (letterOptions.value.length === 0) {
            if (pieceType.value === 0) {
                const firstEdgeCycle = FinishEdgeCycle(cube)
                letterSolution.value[1] = firstEdgeCycle[0]
                letterOptions.value = firstEdgeCycle[1]
                edgeInput.value = ToLetters(letterSolution.value[1])
            }
            pieceType.value++
        }

        nextTick(() => { updating = false })
    }

    let updating = false //Used to prevent recursion in watchers
    watch(cornerInput, (newValue, oldValue) => {
        if (updating) return
        updating = true
        const inputChar = [...newValue].filter(char => !oldValue.includes(char))[0]
        if (!inputChar || pieceType.value > 0) { //Return if the change was not a character (e.g. backspace)
            cornerInput.value = oldValue
            nextTick(() => { updating = false })
            return
        }

        const charIndex = inputChar.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
        if (!letterOptions.value.includes(charIndex)) {
            cornerInput.value = oldValue
            nextTick(() => { updating = false })
            return
        }

        letterSelected(charIndex)
        nextTick(() => { updating = false })
    })

    watch(edgeInput, (newValue, oldValue) => {
        if (updating) return
        updating = true
        const inputChar = [...newValue].filter(char => !oldValue.includes(char))[0]
        if (!inputChar || pieceType.value > 1) { //Return if the change was not a character (e.g. backspace)
            edgeInput.value = oldValue
            nextTick(() => { updating = false })
            return
        }

        const charIndex = inputChar.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
        if (!letterOptions.value.includes(charIndex)) {
            edgeInput.value = oldValue
            nextTick(() => { updating = false })
            return
        }

        letterSelected(charIndex)
        nextTick(() => { updating = false })
    })
</script>

<template>
    <div class="ReconHeader">Corners:</div>
    <input style="font-size: 2rem;" v-model="cornerInput" />

    <div v-if="pieceType > 0" class="ReconHeader">Edges:</div>
    <input v-if="pieceType > 0" style="font-size: 2rem;" v-model="edgeInput" />

    <div style="display:flex;flex-direction:row;">
        <div v-for="(letterIndex, index) in letterOptions" @click="letterSelected(letterIndex)" class="newBufferOption">
            <i>{{ToLetters([letterIndex])[0]}}</i>
        </div>
    </div>

    <FaceletCubeVisual style="position:absolute;right:20px;top:15vh;" :cube="cube" :key="cube.corners.toString() + cube.edges.toString() +cube.centers.toString()" />
</template>

<style>
    .ReconHeader{
        color: var(--grey-100);
        font-size: 2rem;
        display:flex;
        flex-direction: row;
    }

    .newBufferOption {
        border: 2px solid var(--grey-200);
        text-align: center;
        border-radius: 4px;
        background-color: var(--grey-600);
        cursor: pointer;
        width: 2ch;
        color: var(--grey-100);
        font-size: 1.5rem;
    }
    .newBufferOption:hover {
        background-color: var(--grey-500);
    }
</style>