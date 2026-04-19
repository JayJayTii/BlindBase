<script setup>
    import { nextTick, ref, watch, computed, onMounted, onUnmounted }from 'vue'
	import { useReconsStore } from "@/stores/ReconsStore"
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import { Sequence } from '@/helpers/sequence.js'
    import { GetInspectionMoves, FinishCornerCycle, FinishEdgeCycle, ToLetters } from '@/helpers/reconstruct.js'
	import { cornerBuffers, edgeBuffers, cornerScheme, edgeScheme } from '@/helpers/letter_scheme.js'
    import FaceletCube3D from '@/components/FaceletCube3D.vue'
    import ReconCreateLetters from '@/components/recons/ReconCreateLetters.vue'

    const props = defineProps({
        scramble: Sequence,
        cornerBuffer: Number,
        edgeBuffer: Number,
    })
    const emit = defineEmits(['lettersFinished'])

	let cube = new FaceletCube()
	cube.TurnSequence(props.scramble) //Apply the scramble to the cube
	const inspection = Object.assign(new Sequence(), GetInspectionMoves(cube))
    const displayCube = ref({})

    let updating = false //Prevents recursion in watchers
    const edgeInputRef = ref(null)
    const cornerInputRef = ref(null)

    const letterSolution = ref([[], []])
    const cornerInput = ref("")
    const edgeInput = ref("")
    const letterOptions = ref([])
    //Pseudoswap 1 and 2 are the 2 edges that will be swapped when there is parity, normally this is UF-UR
    const pseudoswap1 = computed({
        get: () => useReconsStore().getPseudoswap()[0],
        set: (newValue) => { useReconsStore().setPseudoswap1(newValue) }
    })
    const pseudoswap2 = computed({
        get: () => useReconsStore().getPseudoswap()[1],
        set: (newValue) => { useReconsStore().setPseudoswap2(newValue) }
    })

    let cycleHistory = [] //A stack where each entry is [curlettersolution, piecetype, curletteroptions, newbufferchoice, cube state], used for undoing

    const pieceType = ref(0) //Use corners = 0 for pieceType here due to indexing

	nextTick(() => { cornerInputRef.value.focus() })
	restart()

    function restart() {
		cube = new FaceletCube()
		cube.TurnSequence(props.scramble) //Apply the scramble to the cube
		cube.TurnSequence(inspection) //Apply the inspection rotations to get green-front and white-top
		displayCube.value = Object.assign(new FaceletCube(), JSON.parse(JSON.stringify(cube)))
        letterSolution.value = [[], []]
        letterOptions.value = []
        cornerInput.value = ""
        edgeInput.value = ""
        pieceType.value = 0
        cycleHistory = []
        letterSelected(props.cornerBuffer)
    }

    function letterSelected(letterIndex) {
        updating = true;
        if (pieceType.value === 0 && letterIndex !== props.cornerBuffer
			|| pieceType.value === 1 && letterIndex !== props.edgeBuffer) { //Skip if the buffer is swapping with itself
            cycleHistory.push([JSON.stringify(letterSolution.value), pieceType.value, JSON.stringify(letterOptions.value), JSON.stringify(letterIndex), JSON.stringify(cube)])
            letterSolution.value[pieceType.value].push(letterIndex) //Add the letter to the solution
        }
        //Simulate swapping the stickers
        if (pieceType.value === 0) {
            cube.SwapCornerCubies(props.cornerBuffer, letterIndex)
        } else {
			cube.SwapEdgeCubies(props.edgeBuffer, letterIndex)
        }
        //Generate the rest of the cycle
		const newCycle = pieceType.value === 0 ? FinishCornerCycle(cube, props.cornerBuffer) : FinishEdgeCycle(cube, props.edgeBuffer, [pseudoswap1.value, pseudoswap2.value], letterSolution.value[0].length % 2 == 1)
        letterSolution.value[pieceType.value] = letterSolution.value[pieceType.value].concat(newCycle[0])
        letterOptions.value = newCycle[1]

        const input = pieceType.value === 0 ? cornerInput : edgeInput
        input.value = ToLetters(letterSolution.value[pieceType.value])


        if (letterOptions.value.length === 0) {
            pieceType.value++
            if (pieceType.value == 1) { // Edges
				if (letterSolution.value[0].length % 2 == 1) //Parity, swap the last corner back to keep solvable
					cube.SwapCornerCubies(props.cornerBuffer, letterSolution.value[0].at(-1))
				letterSelected(props.edgeBuffer) //Trigger next cycle from buffer
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
        //This limits the inputs to very specific new buffers
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
        //Reset arrays to previous values
        letterSolution.value = JSON.parse(lastCycle[0])
        cornerInput.value = ToLetters(letterSolution.value[0])
        edgeInput.value = ToLetters(letterSolution.value[1])

        //Focus correct input box
        pieceType.value = lastCycle[1]
        if (pieceType.value == 0)
            cornerInputRef.value.focus()
        else if (pieceType.value == 1)
            edgeInputRef.value.focus()
        //Update possible next buffers
        letterOptions.value = JSON.parse(lastCycle[2])

        cube = Object.assign(new FaceletCube(), JSON.parse(lastCycle[4]))

        nextTick(() => { updating = false })

		return lastCycle
    }

    function restartEdges()
    {
        let lastChoice = [];
		while (pieceType.value > 0 && cycleHistory.length > 0) {
			lastChoice = JSON.parse(undoCycle()[3]) //Get the buffer choice chosen for the cycle that was undone
        }
        if (cycleHistory.length == 0) {
            restart()
        }
        if (pieceType.value == 0) { //If rewound to the end of corners, select the last chosen cycle
            letterSelected(lastChoice)
        }
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

    function handleKeydown(event) {
        if (event.code === 'Backspace') {
            undoCycle()
        }
        if (event.code === 'Enter' || event.code === 'NumpadEnter') {
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
        //Swap cubies to match the solution up to the typing caret
        if (curSelectionStart === document.activeElement.selectionStart
            && selectedID == document.activeElement.id)
            return
        curSelectionStart = document.activeElement.selectionStart
        selectedID = document.activeElement.id

        displayCube.value = new FaceletCube()
        displayCube.value.TurnSequence(props.scramble)
        if (curSelectionStart == undefined || selectedID == "") {
            cubeKey.value++
            return
        }

        displayCube.value.TurnSequence(inspection)
        const isCornerInput = (selectedID[0] == 'c')
        if (!isCornerInput) { //Complete full corner sequence
            const cornerPairs = cornerInput.value.split(' ').filter(pair => pair.length > 1)
            for (const pair of cornerPairs) {
                displayCube.value.SwapCornerCubies(props.cornerBuffer, (pair.charCodeAt(0) - 'A'.charCodeAt(0)))
                displayCube.value.SwapCornerCubies(props.cornerBuffer, (pair.charCodeAt(1) - 'A'.charCodeAt(0)))
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
                displayCube.value.SwapCornerCubies(props.cornerBuffer, (pair.charCodeAt(0) - 'A'.charCodeAt(0)))
                displayCube.value.SwapCornerCubies(props.cornerBuffer, (pair.charCodeAt(1) - 'A'.charCodeAt(0)))
            } else {
                displayCube.value.SwapEdgeCubies(props.edgeBuffer, (pair.charCodeAt(0) - 'A'.charCodeAt(0)))
                displayCube.value.SwapEdgeCubies(props.edgeBuffer, (pair.charCodeAt(1) - 'A'.charCodeAt(0)))
            }
        }
        cubeKey.value++ //Update the cube visual
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
            <el-input v-if="inspection.turns.length !== 0" size="large" style="font-size: 2rem;" :value="inspection.toString()" readonly />

            <div class="ReconHeader">Corners:</div>
            <div>Buffer: {{cornerBuffers[cornerBuffer]}}</div>
            <el-input size="large" style="font-size: 2rem;" ref="cornerInputRef" v-model="cornerInput" id="cornerInput" />

            <div v-if="pieceType > 0" class="ReconHeader">Edges:</div>
            <div v-if="pieceType > 0" style="display: flex; flex-direction:row; gap: 20px;">
                Buffer: {{edgeBuffers[edgeBuffer]}}
                <div v-if="(letterSolution[0].length % 2 == 1)" style="display: flex; flex-direction: row;">
                    Pseudoswap:
                    <el-select v-model="pseudoswap1" size="small" style="width: 50px;" @change="restartEdges()">
                        <el-option v-for="(edgeBuffer, index) in edgeBuffers"
                                   :key="index" :label="edgeBuffer"
                                   :disabled="index == pseudoswap2" :value="index">
                            {{edgeBuffer}}
                        </el-option>
                    </el-select>
                    -
                    <el-select v-model="pseudoswap2" size="small" style="width: 50px;" @change="restartEdges()">
                        <el-option v-for="(edgeBuffer, index) in edgeBuffers"
                                   :key="index" :label="edgeBuffer"
                                   :disabled="index == pseudoswap1" :value="index">
                            {{edgeBuffer}}
                        </el-option>
                    </el-select>
                </div>
            </div>
            <el-input v-if="pieceType > 0" v-model="edgeInput" size="large" style="font-size: 2rem;" ref="edgeInputRef" id="edgeInput" />

            <div style="display:flex;flex-direction:row;">
                <el-button style="font-size: 1.2rem; width: 25px;" type="primary" :plain="true"
                           v-for="(letterIndex, index) in letterOptions" @click="letterSelected(letterIndex)">
                    <i>{{ToLetters([letterIndex])[0]}}</i>
                </el-button>
            </div>

            <el-button v-if="pieceType > 1"
                       style="width: 80px; height: 30px;" type="success"
                       @click="letterSelectionFinished()">
                Confirm
            </el-button>
        </div>

        <FaceletCube3D style="height: calc(100dvh - 250px); aspect-ratio: 1;"
                       :cube="displayCube" />
    </div>
</template>