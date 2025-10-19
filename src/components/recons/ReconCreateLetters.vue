<script setup>
    import { nextTick, ref, watch }from 'vue'
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import { Sequence } from '@/helpers/sequence.js'
    import { FinishCornerCycle, FinishEdgeCycle, ToLetters } from '@/helpers/reconstruct.js'
    import FaceletCubeVisual from '@/components/FaceletCubeVisual.vue'
    import ReconCreateLetters from '@/components/recons/ReconCreateLetters.vue'

    const props = defineProps({
        scramble: Sequence,
    })
    const emit = defineEmits(['lettersFinished'])

    let cube = new FaceletCube()
    cube.TurnSequence(props.scramble)

    let updating = false //Prevents recursion in watchers
    const edgeInputRef = ref(null)
    const cornerInputRef = ref(null)
    nextTick(() => { cornerInputRef.value.focus()})

    const letterSolution = ref([[],[]])
    const cornerInput = ref("")
    const edgeInput = ref("")
    const letterOptions = ref([])
    const pieceType = ref(0) //Use corners = 0 for pieceType here due to indexing

    letterSelected(2)

    function letterSelected(letterIndex) {
        updating = true;
        if(letterIndex !== 2) //Skip if the buffer is swapping with itself
            letterSolution.value[pieceType.value].push(letterIndex) //Add the letter to the solution
        //Simulate swapping the stickers
        if(pieceType.value === 0)
            cube.SwapCornerCubies(2, letterIndex)
        else
            cube.SwapEdgeCubies(2, letterIndex)
        //Generate the rest of the cycle
        const newCycle = pieceType.value === 0 ? FinishCornerCycle(cube) : FinishEdgeCycle(cube, letterSolution.value[0].length % 2 == 1)
        letterSolution.value[pieceType.value] = letterSolution.value[pieceType.value].concat(newCycle[0])
        letterOptions.value = newCycle[1]

        const input = pieceType.value === 0 ? cornerInput : edgeInput
        input.value = ToLetters(letterSolution.value[pieceType.value])


        if (letterOptions.value.length === 0) {
            pieceType.value++
            if (pieceType.value < 2) {
                nextTick(() => { edgeInputRef.value.focus() })
                if (letterSolution.value[0].length % 2 == 1) //Parity, swap the last corner back to keep solvable
                    cube.SwapCornerCubies(2, letterSolution.value[0].at(-1))
                letterSelected(2) //Trigger next cycle from buffer
            }
        }

        nextTick(() => { updating = false })
    }
    function inputUpdated(input, newValue, oldValue) {
        if (updating) return
        updating = true
        const inputChar = [...newValue].filter(char => !oldValue.includes(char))[0]
        const charIndex = inputChar ? (inputChar.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)) : -1

        if (letterOptions.value.includes(charIndex))
            letterSelected(charIndex)
        else
            input.value = oldValue
        nextTick(() => { updating = false })
    }
    watch(cornerInput, (newValue, oldValue) => {
        inputUpdated(cornerInput, newValue, oldValue)
    })
    watch(edgeInput, (newValue, oldValue) => {
        inputUpdated(edgeInput, newValue, oldValue)
    })

    function letterSelectionFinished() {
        emit('lettersFinished', letterSolution.value)
    }
</script>

<template>
    <div style="display:flex; justify-content:space-between;padding:10px;">
        <div style="display:flex;flex-direction:column;gap:5px;">
            <div class="ReconHeader">Corners:</div>
            <input style="font-size: 2rem;" ref="cornerInputRef" v-model="cornerInput" />

            <div v-if="pieceType > 0" class="ReconHeader">Edges:</div>
            <input v-if="pieceType > 0" ref="edgeInputRef" style="font-size: 2rem;" v-model="edgeInput" />

            <div style="display:flex;flex-direction:row;">
                <div v-for="(letterIndex, index) in letterOptions" @click="letterSelected(letterIndex)" class="newBufferOption">
                    <i>{{ToLetters([letterIndex])[0]}}</i>
                </div>
            </div>

            <img v-if="pieceType > 1"
                 src="@/assets/arrow-right-long.svg"
                 class="NextButton"
                 @click="letterSelectionFinished()" />
        </div>
        <FaceletCubeVisual style="width: 45%;"
                           :cube="cube"
                           :key="cube.corners.toString() + cube.edges.toString() + cube.centers.toString()" />
    </div>
</template>

<style>

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