<script setup>
    import { nextTick, ref, watch, onMounted, onUnmounted }from 'vue'
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import { Sequence } from '@/helpers/sequence.js'
    import { GetInspectionMoves, FinishCornerCycle, FinishEdgeCycle, ToLetters } from '@/helpers/reconstruct.js'
    import FaceletCubeVisual from '@/components/FaceletCubeVisual.vue'
    import ReconCreateLetters from '@/components/recons/ReconCreateLetters.vue'

    const props = defineProps({
        scramble: Sequence,
    })
    const emit = defineEmits(['lettersFinished'])

    let cube = new FaceletCube()
    cube.TurnSequence(props.scramble)
    const inspection = Object.assign(new Sequence(), GetInspectionMoves(cube))
    cube.TurnSequence(inspection)
    let displayCube = Object.assign(new FaceletCube(), JSON.parse(JSON.stringify(cube)))

    let updating = false //Prevents recursion in watchers
    const edgeInputRef = ref(null)
    const cornerInputRef = ref(null)
    nextTick(() => { cornerInputRef.value.focus()})

    const letterSolution = ref([[],[]])
    const cornerInput = ref("")
    const edgeInput = ref("")
    const letterOptions = ref([])
    const cycleHistory = [] //A stack where each entry is [curlettersolution, piecetype, curletteroptions, cube state], used for undoing
    const pieceType = ref(0) //Use corners = 0 for pieceType here due to indexing

    letterSelected(2)

    function letterSelected(letterIndex) {
        updating = true;
        if (letterIndex !== 2) { //Skip if the buffer is swapping with itself
            cycleHistory.push([JSON.stringify(letterSolution.value), pieceType.value, JSON.stringify(letterOptions.value), JSON.stringify(cube)])
            letterSolution.value[pieceType.value].push(letterIndex) //Add the letter to the solution
        }
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
                if (letterSolution.value[0].length % 2 == 1) //Parity, swap the last corner back to keep solvable
                    cube.SwapCornerCubies(2, letterSolution.value[0].at(-1))
                letterSelected(2) //Trigger next cycle from buffer
            }
        }

        nextTick(() => {
            if (pieceType.value == 0)
                cornerInputRef.value.focus()
            else
                edgeInputRef.value.focus()
            updating = false
        })
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

    function undoCycle() {
        if(cycleHistory.length == 0) return
        updating = true

        const lastCycle = cycleHistory.pop()

        letterSolution.value = JSON.parse(lastCycle[0])
        cornerInput.value = ToLetters(letterSolution.value[0])
        edgeInput.value = ToLetters(letterSolution.value[1])

        pieceType.value = lastCycle[1]
        if (pieceType.value == 0)
            cornerInputRef.value.focus()
        else if (pieceType.value == 1)
            edgeInputRef.value.focus()

        letterOptions.value = JSON.parse(lastCycle[2])

        cube = Object.assign(new FaceletCube(), JSON.parse(lastCycle[3]))

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
    function revertToReconPage() {
        history.back()
    }

    function handleKeydown(event) {
        if (event.code === 'Backspace') {
            undoCycle()
        }
        if (event.code === 'Enter') {
            if (pieceType.value > 1)
                letterSelectionFinished()
        }

        //Update caret to next or last textbox if necessary
        const el = document.activeElement
        if (event.code === 'ArrowRight' && el.id == "cornerInput" && el.selectionStart == cornerInput.value.length && edgeInputRef.value) {
            edgeInputRef.value.focus()
            event.preventDefault() // stop broken update order
            document.activeElement.selectionStart = 0
            document.activeElement.selectionEnd = 0
        }
        else if (event.code === 'ArrowLeft' && el.id == "edgeInput" && el.selectionStart == 0) {
            cornerInputRef.value.focus()
            event.preventDefault() // stop broken update order
            document.activeElement.selectionStart = document.activeElement.value.length
            document.activeElement.selectionEnd = document.activeElement.value.length
        }
    }

    let intervalID = null
    let curSelectionStart = 0
    let selectedID = ""
    const cubeKey = ref(0)
    function UpdateCubeToSelection() {
        if (curSelectionStart === document.activeElement.selectionStart
            && selectedID == document.activeElement.id)
            return
        curSelectionStart = document.activeElement.selectionStart
        selectedID = document.activeElement.id

        displayCube = new FaceletCube()
        displayCube.TurnSequence(props.scramble)
        if (curSelectionStart == undefined || selectedID == "") {
            cubeKey.value++
            return
        }

        displayCube.TurnSequence(inspection)
        const isCornerInput = (selectedID[0] == 'c')
        if (!isCornerInput) { //Complete full corner sequence
            const cornerPairs = cornerInput.value.split(' ').filter(pair => pair.length > 1)
            for (const pair of cornerPairs) {
                displayCube.SwapCornerCubies(2, (pair.charCodeAt(0) - 'A'.charCodeAt(0)))
                displayCube.SwapCornerCubies(2, (pair.charCodeAt(1) - 'A'.charCodeAt(0)))
            }
        }
        let currentLetterSequence = ""
        let inputText = isCornerInput ? cornerInput.value : edgeInput.value
        let sampleIndex = curSelectionStart
        while ((sampleIndex + 2) % 3 != 0) {
            sampleIndex++
        }

        currentLetterSequence = inputText.substring(0, sampleIndex)
        for (const pair of currentLetterSequence.split(' ').filter(pair => pair.length > 1)) {
            if (isCornerInput) {
                displayCube.SwapCornerCubies(2, (pair.charCodeAt(0) - 'A'.charCodeAt(0)))
                displayCube.SwapCornerCubies(2, (pair.charCodeAt(1) - 'A'.charCodeAt(0)))
            } else {
                displayCube.SwapEdgeCubies(2, (pair.charCodeAt(0) - 'A'.charCodeAt(0)))
                displayCube.SwapEdgeCubies(2, (pair.charCodeAt(1) - 'A'.charCodeAt(0)))
            }
        }
        cubeKey.value++
    }

    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
        intervalID = setInterval(() => { UpdateCubeToSelection() }, 50)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
        if (intervalID !== null) {
            clearInterval(intervalID)
        }
    })
</script>

<template>
    <div style="display:flex; justify-content:space-between;padding:10px;">
        <div style="display:flex;flex-direction:column;gap:5px;">
            <div v-if="inspection.turns.length !== 0" class="ReconHeader">Inspection:</div>
            <input v-if="inspection.turns.length !== 0" style="font-size: 2rem;" :value="inspection.toString()" readonly />

            <div class="ReconHeader">Corners:</div>
            <input style="font-size: 2rem;" ref="cornerInputRef" v-model="cornerInput" id="cornerInput" />

            <div v-if="pieceType > 0" class="ReconHeader">Edges:</div>
            <input v-if="pieceType > 0" ref="edgeInputRef" style="font-size: 2rem;" v-model="edgeInput" id="edgeInput" />

            <div style="display:flex;flex-direction:row;">
                <div v-for="(letterIndex, index) in letterOptions" @click="letterSelected(letterIndex)" class="newBufferOption">
                    <i>{{ToLetters([letterIndex])[0]}}</i>
                </div>
            </div>

            <img src="@/assets/arrow-left-long.svg"
                 title="Back"
                 :class="['CustomButton','NextButton']" 
                 style="left:0px;transform:translate(100%,-100%);"
                 @click="revertToReconPage()" />
            <img v-if="pieceType > 1"
                 title="Continue to notation"
                 src="@/assets/arrow-right-long.svg"
                 :class="['CustomButton','NextButton']"
                 @click="letterSelectionFinished()" />
        </div>
        <FaceletCubeVisual style="width: 45%;"
                           :cube="displayCube"
                           :key="cubeKey" />
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