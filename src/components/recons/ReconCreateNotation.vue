<script setup>
    import { nextTick, onMounted, onUnmounted, computed, watch, ref } from 'vue'
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import FaceletCube3D from '@/components/FaceletCube3D.vue'
    import { Sequence } from '@/helpers/sequence.js'
    import { GetRandomRecommendation, getRecommendations, getCornerRecommendations, getEdgeRecommendations } from '@/helpers/recommendations.js'
    import { GetInspectionMoves, ToLetters } from '@/helpers/reconstruct.js'

    import { useSheetStore } from '@/stores/SheetStore'
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    import { useReconsStore } from '@/stores/ReconsStore'
    const reconsStore = useReconsStore()
    reconsStore.loadState()

    const props = defineProps({
        scramble: Sequence,
        letterSolution: Array,
        cornerBuffer: Number,
        edgeBuffer: Number,
    })
    const emit = defineEmits(['notationFinished', 'revertToLetterSelection'])

    //Apply scramble and initial rotations to the cube
    const cube = ref(new FaceletCube())
    cube.value.TurnSequence(props.scramble)
    const inspection = Object.assign(new Sequence(), GetInspectionMoves(cube.value))
    function ScrambleCube() {
        cube.value = new FaceletCube()
        cube.value.TurnSequence(props.scramble)
    }

    //Notation for each letter pair and references to the input boxes themselves
    const cornerInput = ref([])
    const cornerInputBox = ref([])
    const edgeInput = ref([])
    const edgeInputBox = ref([])


    const cornerPairs = ToLetters(props.letterSolution[0]).split(' ').filter(pair => pair.length > 1)
    for (const pair of cornerPairs) {
        cornerInput.value.push("")
    }
    const edgePairs = ToLetters(props.letterSolution[1]).split(' ').filter(pair => pair.length > 1)
    for (const pair of edgePairs) {
        edgeInput.value.push("")
    }

	const cornerSheets = sheetStore.getSheetsOfType(1).filter((sheet) => sheet.buffer == props.cornerBuffer)
    const cornerSheetID = ref(cornerSheets[0]?.id || -1)
	const edgeSheets = sheetStore.getSheetsOfType(2).filter((sheet) => sheet.buffer == props.edgeBuffer)
	const edgeSheetID = ref(edgeSheets[0]?.id || -1)

    function FillAllCorners() {
        //Fill in any corner algorithms with ones from the user's pre-existing alg-sheets
        cornerInput.value = []
        for (var i = 0; i < cornerPairs.length; i++) {
            if (props.letterSolution[0].length === 2 * i + 1) //Break if this pair is one letter long
                break
            const letter1 = props.letterSolution[0][2*i]
            const letter2 = props.letterSolution[0][2 * i + 1]
            let newValue = cornerSheetID.value == -1 ? "" : sheetStore.getSheet(cornerSheetID.value).grid[letter1][letter2]
            //If it's in comm notation, convert to alg notation
            if (newValue.includes('[') && newValue.includes(',') && newValue.includes(']')) {
                let commSequence = new Sequence()   
                commSequence.fromCommNotation(newValue)
                newValue = commSequence.toString()
            }
            cornerInput.value.push(newValue)
        }
        cornerInput.value.push("") //For the extra bit at the end
    }
    function FillAllEdges() {
        //Fill in any edge algorithms with ones from the user's pre-existing alg-sheets
        edgeInput.value = []
        for (var i = 0; i < edgePairs.length; i++) {
            if (props.letterSolution[1].length === 2 * i + 1) //Break if this pair is one letter long
                break
            const letter1 = props.letterSolution[1][2 * i]
            const letter2 = props.letterSolution[1][2 * i + 1]
            let newValue = edgeSheetID.value == -1 ? "" : sheetStore.getSheet(edgeSheetID.value).grid[letter1][letter2]

            //If it's in comm notation, convert to alg notation
            if (newValue.includes('[') && newValue.includes(',') && newValue.includes(']')) {
                let commSequence = new Sequence()
                commSequence.fromCommNotation(newValue)
                newValue = commSequence.toString()
            }
            edgeInput.value.push(newValue)
        }
        edgeInput.value.push("") //For the extra bit at the end
    }
    function FillCornerRecommendation(index) {
        //Fill in a valid algorithm for one of the corner input boxes
		const recs = getCornerRecommendations(cornerPairs[index], props.cornerBuffer, 0)
		if (recs.length == 0)
			return
        let newRec = "" //Avoid giving the same recommendation again
        do {
            newRec = recs[Math.floor(Math.random() * recs.length)]
        } while (newRec == cornerInput.value[index] && recs.length != 1);
        cornerInput.value[index] = newRec
        cornerInputBox.value[index].focus()
    }
	function FillEdgeRecommendation(index) {
        //Fill in a valid algorithm for one of the edge input boxes
		const recs = getEdgeRecommendations(edgePairs[index], props.edgeBuffer, 0)
        if (recs.length == 0)
            return
        let newRec = ""
        do {
            newRec = recs[Math.floor(Math.random() * recs.length)]
        } while (newRec == edgeInput.value[index] && recs.length != 1);
        edgeInput.value[index] = newRec
        edgeInputBox.value[index].focus()
    }

    FillAllCorners()
    FillAllEdges()

    let intervalID = null
    let curSelectionStart = 0
    let selectedID = ""
    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
        intervalID = setInterval(() => { UpdateCubeToSelection() }, 50)
    })
    onUnmounted(() => {
        if (intervalID !== null) {
            clearInterval(intervalID)
        }
        window.removeEventListener('keydown', handleKeydown)
    })

    function UpdateCubeToSelection() {
        //Performs the solution on the cube visual up to the typing caret
        if (curSelectionStart === document.activeElement.selectionStart
            && selectedID == document.activeElement.id)
            return
        curSelectionStart = document.activeElement.selectionStart
        selectedID = document.activeElement.id

        ScrambleCube()
        if (curSelectionStart == undefined || selectedID == "")
            return

        cube.value.TurnSequence(inspection)
        const isEdgeInput = (selectedID[0] == 'E')
        const inputIndex = parseInt(selectedID.substring(5))
        for (var i = 0; i < (isEdgeInput ? inputIndex : edgeInput.value.length); i++) {
            const algorithm = new Sequence()
            algorithm.fromAlgorithmNotation(edgeInput.value[i])
            cube.value.TurnSequence(algorithm)
        }
        for (var i = 0; i < (isEdgeInput ? 0 : inputIndex); i++) {
            const algorithm = new Sequence()
            algorithm.fromAlgorithmNotation(cornerInput.value[i])
            cube.value.TurnSequence(algorithm)
        }
        const currentAlgorithm = new Sequence()
        let inputText = isEdgeInput ? edgeInput.value[inputIndex] : cornerInput.value[inputIndex]
        let sampleIndex = curSelectionStart
        while (!([' ', '\n'].includes(inputText[sampleIndex - 1])
            || [' ', '\n'].includes(inputText[sampleIndex])
            || sampleIndex == 0 || sampleIndex >= inputText.length)) {
            sampleIndex++
        }
        currentAlgorithm.fromAlgorithmNotation(inputText.substring(0, sampleIndex))

        cube.value.TurnSequence(currentAlgorithm)
    }

    function handleKeydown(event) {
        if ((event.code === 'Enter' || event.code === 'NumpadEnter')
            && !(['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable)) {
            notationSelectionFinished()
            return
        }

        //Update caret to next or last textbox if necessary
        const el = document.activeElement
        const isEdgeInput = (el.id[0] == 'E')
        if (!el.id.includes('C') && !el.id.includes('E'))
            return
        const inputIndex = parseInt(selectedID.substring(5))
        if (event.code === 'ArrowRight') {
            const inputLength = isEdgeInput ? edgeInput.value[inputIndex].length : cornerInput.value[inputIndex].length
            if (el.selectionStart == inputLength) {
                if (isEdgeInput && inputIndex === edgeInput.value.length - 1)
                    cornerInputBox.value[0].focus()
                else if(isEdgeInput)
                    edgeInputBox.value[inputIndex + 1].focus()
                else if (!isEdgeInput && inputIndex < cornerInput.value.length - 1)
                    cornerInputBox.value[inputIndex + 1].focus()
                else
                    return //End of last input box! Don't want to do anything
                event.preventDefault() // stop broken update order
                document.activeElement.selectionStart = 0
                document.activeElement.selectionEnd = 0
            }
        }
        else if (event.code === 'ArrowLeft') {
            if (el.selectionStart == 0) {
                if (!isEdgeInput && inputIndex === 0)
                    edgeInputBox.value[edgeInputBox.value.length - 1].focus()
                else if (!isEdgeInput)
                    cornerInputBox.value[inputIndex - 1].focus()
                else if (isEdgeInput && inputIndex > 0)
                    edgeInputBox.value[inputIndex - 1].focus()
                else
                    return //Start of first input box! Don't want to do anything
                event.preventDefault() // stop broken update order
                document.activeElement.selectionStart = document.activeElement.value.length
                document.activeElement.selectionEnd = document.activeElement.value.length
            }
        }
    }

    function notationSelectionFinished() {
        emit('notationFinished', {corners: cornerInput.value, edges: edgeInput.value})
    }
    function revertToLetterSelection() {
        emit('revertToLetterSelection')
    }
</script>

<template>
    <div id="ReconCreateNotationLayout">
        <div style="display: flex; flex-direction: column; gap: 10px; padding: 5px;">
            <div class="ReconHeader">Edges:</div>
            <div v-if="edgeSheets.length > 0"
                 title="Fills the alg of a letter pair if the sheet contains one">
                Algs from
                <el-select v-model="edgeSheetID" size="small" @change="FillAllEdges()" style="width: 150px;">
                    <el-option v-for="sheet in edgeSheets"
                               :label="sheet.name"
                               :value="sheet.id">
                        {{sheet.name}}
                    </el-option>
                </el-select>
            </div>
            <div style="display:flex; font-size: 1.5rem; gap: 10px;" v-if="inspection.turns.length > 0">
                <el-input size="large" class="ReconNotationInput" title="Inspection" readonly :value="inspection.toString()" />
            </div>
            <div style="display:flex; font-size: 1.5rem; gap: 10px;"
                 v-for="(pair, index) in edgePairs">
                {{pair}}:
                <el-input type="textarea" resize="none" autosize
                          class="ReconNotationInput"
                          v-model="edgeInput[index]"
                          :id="'Edges' + index.toString()"
                          :ref="el => edgeInputBox[index] = el" />
                <el-tooltip content="Randomise" placement="left">
                    <el-button style="height:45px; width:45px;" type="primary" :plain="true"
                               @click="FillEdgeRecommendation(index)">
                        <el-icon :size="20"><Bell /></el-icon>
                    </el-button>
                </el-tooltip>
            </div>
            <el-input type="textarea" resize="none" autosize
                      title="Parity/Flips/Twists"
                      class="ReconNotationInput"
                      v-model="edgeInput[edgeInput.length - 1]"
                      :id="'Edges' + (edgeInput.length - 1).toString()"
                      :ref="el => edgeInputBox[edgeInput.length - 1] = el" />
            <div style="height: 110px;"></div>
        </div>

        <div style="padding: 10px; display: flex; flex-direction: column;">
            <FaceletCube3D :cube="cube" style="width: 100%; aspect-ratio: 1;" />
        </div>

        <div style="display: flex; flex-direction: column; gap: 5px; padding: 5px;">
            <div class="ReconHeader">Corners:</div>
            <div title="Fills the alg of a letter pair if the sheet contains one" v-if="cornerSheets.length > 0">
                Algs from
                <el-select v-model="cornerSheetID" @change="FillAllCorners()" size="small" style="width: 150px;">
                    <el-option v-for="sheet in cornerSheets"
                               :label="sheet.name"
                               :value="sheet.id">
                        {{sheet.name}}
                    </el-option>
                </el-select>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <div style="display: flex; font-size: 1.5rem; gap: 10px;"
                     v-for="(pair,index) in cornerPairs">
                    {{pair}}:
                    <el-input type="textarea" resize="none" autosize
                              class="ReconNotationInput"
                              v-model="cornerInput[index]"
                              :id="'Corns' + index.toString()"
                              :ref="el => cornerInputBox[index] = el " />
                    <el-tooltip content="Randomise" placement="left">
                        <el-button style="height:45px; width:45px;" type="primary" :plain="true"
                                   @click="FillCornerRecommendation(index)">
                            <el-icon :size="20"><Bell /></el-icon>
                        </el-button>
                    </el-tooltip>
                </div>
                <el-input typeof="textarea" resize="none" autosize
                          title="Parity/Flips/Twists"
                          class="ReconNotationInput"
                          v-model="cornerInput[cornerInput.length - 1]"
                          :id="'Corns' + (cornerInput.length - 1).toString()"
                          :ref="el => cornerInputBox[cornerInput.length - 1] = el" />

                <el-button style="width: 80px; height: 30px; align-self: end;" type="success"
                           @click="notationSelectionFinished()">
                    Confirm
                </el-button>
            </div>
        </div>
    </div>

</template>

<style>
    #ReconCreateNotationLayout {
        display: grid;
        padding: 5px;
        grid-template-columns: 35% 30% 35%;
        width: 100%;
        height: 100%;
    }

    .ReconNotationInput {
        width: 100%;
        font-size: 1.5rem;
    }
</style>