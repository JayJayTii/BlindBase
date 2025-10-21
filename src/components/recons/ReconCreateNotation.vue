<script setup>
    import { nextTick, onMounted, onUnmounted, computed, watch, ref } from 'vue'
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import { Sequence } from '@/helpers/sequence.js'
    import { GetRandomRecommendation, getRecommendations, getCornerRecommendations, getEdgeRecommendations } from '@/helpers/recommendations.js'
    import { GetInspectionMoves, ToLetters } from '@/helpers/reconstruct.js'
    import FaceletCubeVisual from '@/components/FaceletCubeVisual.vue'

    import { useSheetStore } from '@/stores/SheetStore'
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    import { useReconsStore } from '@/stores/ReconsStore'
    const reconsStore = useReconsStore()
    reconsStore.loadState()

    const props = defineProps({
        scramble: Sequence,
        letterSolution: Array,
    })
    const emit = defineEmits(['notationFinished', 'revertToLetterSelection'])

    const cube = ref(new FaceletCube())
    cube.value.TurnSequence(props.scramble)
    const inspection = Object.assign(new Sequence(), GetInspectionMoves(cube.value))
    function ScrambleCube() {
        cube.value = new FaceletCube()
        cube.value.TurnSequence(props.scramble)
    }

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
        if (pair.length == 2)
            edgeInput.value.push(GetRandomRecommendation(2, pair))
        else
            edgeInput.value.push("")
    }

    const cornerSheets = sheetStore.getSheetsOfType(1)
    const cornerSheetID = computed({
        get: () => reconsStore.GetCornerAlgsheet(),
        set: (newValue) => { reconsStore.algsheets.corners = newValue; reconsStore.saveState(); }
    })
    const edgeSheets = sheetStore.getSheetsOfType(2)
    const edgeSheetID = computed({
        get: () => reconsStore.GetEdgeAlgsheet(),
        set: (newValue) => { reconsStore.algsheets.edges = newValue; reconsStore.saveState(); }
    })

    function FillAllCorners() {
        cornerInput.value = []
        for (var i = 0; i < cornerPairs.length; i++) {
            if (props.letterSolution[0].length === 2 * i + 1) //Break if this pair is one letter long
                break
            const letter1 = props.letterSolution[0][2*i]
            const letter2 = props.letterSolution[0][2 * i + 1]
            let newValue = cornerSheetID.value == -1 ? "" : sheetStore.getSheet(cornerSheetID.value).grid[letter2][letter1]
            //If it's in comm notation, convert to alg notation
            if (newValue.includes('[') && newValue.includes(',') && newValue.includes(']')) {
                let commSequence = new Sequence()   
                commSequence.setCommNotation(newValue)
                newValue = commSequence.toString()
            }
            cornerInput.value.push(newValue)
        }
        cornerInput.value.push("") //For the extra bit at the end
    }
    function FillAllEdges() {
        edgeInput.value = []
        for (var i = 0; i < edgePairs.length; i++) {
            if (props.letterSolution[1].length === 2 * i + 1) //Break if this pair is one letter long
                break
            const letter1 = props.letterSolution[1][2 * i]
            const letter2 = props.letterSolution[1][2 * i + 1]
            let newValue = edgeSheetID.value == -1 ? "" : sheetStore.getSheet(edgeSheetID.value).grid[letter2][letter1]
            //If it's in comm notation, convert to alg notation
            if (newValue.includes('[') && newValue.includes(',') && newValue.includes(']')) {
                let commSequence = new Sequence()
                commSequence.setCommNotation(newValue)
                newValue = commSequence.toString()
            }
            edgeInput.value.push(newValue)
        }
        edgeInput.value.push("") //For the extra bit at the end
    }
    function FillCornerRecommendation(index) {
        const recs = getCornerRecommendations(cornerPairs[index], 0)
        let newRec = "" //Avoid giving the same recommendation again
        do {
            newRec = recs[Math.floor(Math.random() * recs.length)]
        } while (newRec == cornerInput.value[index]);
        cornerInput.value[index] = newRec
    }
    function FillEdgeRecommendation(index) {
        const recs = getEdgeRecommendations(edgePairs[index], 0)
        let newRec = ""
        do {
            newRec = recs[Math.floor(Math.random() * recs.length)]
        } while (newRec == edgeInput.value[index]);
        edgeInput.value[index] = newRec
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
            algorithm.setAlgorithmNotation(edgeInput.value[i])
            cube.value.TurnSequence(algorithm)
        }
        for (var i = 0; i < (isEdgeInput ? 0 : inputIndex); i++) {
            const algorithm = new Sequence()
            algorithm.setAlgorithmNotation(cornerInput.value[i])
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
        currentAlgorithm.setAlgorithmNotation(inputText.substring(0, sampleIndex))

        cube.value.TurnSequence(currentAlgorithm)
    }

    function handleKeydown(event) {
        if (event.code === 'Enter' && !(['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable)) {
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
        <div style="display: flex; flex-direction: column; gap: 10px; padding: 10px;">
            <div class="ReconHeader">Edges:</div>
            <div style="color:var(--grey-100)" v-if="edgeSheets.length > 0">
                Algs from
                <select v-model="edgeSheetID" @change="FillAllEdges()">
                    <option v-for="sheet in edgeSheets"
                            :value="sheet.id">
                        {{sheet.name}}
                    </option>
                </select>
            </div>
            <div style="display:flex;color: var(--grey-100); font-size: 1.5rem; gap: 10px;" v-if="inspection.turns.length > 0">
                <input class="ReconNotationInput" readonly :value="inspection.toString()"/>
            </div>
            <div style="display:flex;color: var(--grey-100); font-size: 1.5rem; gap: 10px;"
                 v-for="(pair, index) in edgePairs">
                {{pair}}:
                <textarea style="field-sizing: content; resize:none;"
                          class="ReconNotationInput"
                          v-model="edgeInput[index]"
                          :id="'Edges' + index.toString()"
                          :ref="el => edgeInputBox[index] = el" />
                <img src="@/assets/lightbulb-line.svg" class="CustomButton" style="height:40px;min-width:40px;" @click="FillEdgeRecommendation(index)" />
            </div>
            <textarea style="field-sizing: content; resize:none;"
                      class="ReconNotationInput"
                      v-model="edgeInput[edgeInput.length - 1]"
                      :id="'Edges' + (edgeInput.length - 1).toString()"
                      :ref="el => edgeInputBox[edgeInput.length - 1] = el" />
        </div>

        <FaceletCubeVisual :cube="cube"
                           :key="cube.corners.toString() + cube.edges.toString() + cube.centers.toString()"
                           style="align-self: center;" />

        <div style="display: flex; flex-direction: column;gap:5px;padding: 10px;">
            <div class="ReconHeader">Corners:</div>
            <div style="color:var(--grey-100)" v-if="cornerSheets.length > 0">
                Algs from
                <select v-model="cornerSheetID" @change="FillAllCorners()">
                    <option v-for="sheet in cornerSheets"
                            :value="sheet.id">
                        {{sheet.name}}
                    </option>
                </select>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <div style="display: flex; color: var(--grey-100); font-size: 1.5rem; gap: 10px;"
                     v-for="(pair,index) in cornerPairs">
                    {{pair}}:
                    <textarea style="field-sizing: content; resize:none;"
                              class="ReconNotationInput"
                              v-model="cornerInput[index]"
                              :id="'Corns' + index.toString()"
                              :ref="el => cornerInputBox[index] = el " />
                    <img src="@/assets/lightbulb-line.svg" class="CustomButton" style="height:40px;min-width:40px;" @click="FillCornerRecommendation(index)"></img>
                </div>
                <textarea style="field-sizing: content; resize:none;"
                          class="ReconNotationInput"
                          v-model="cornerInput[cornerInput.length - 1]"
                          :id="'Corns' + (cornerInput.length - 1).toString()"
                          :ref="el => cornerInputBox[cornerInput.length - 1] = el" />
            </div>
        </div>
    </div>
    <div style="height:100px;" />
    <img src="@/assets/arrow-left-long.svg"
         class="NextButton" style="left:0px;transform:translate(100%,-100%);"
         @click="revertToLetterSelection()" />
    <img src="@/assets/arrow-right-long.svg"
         class="NextButton"
         @click="notationSelectionFinished()" />
</template>

<style>
    #ReconCreateNotationLayout {
        display: grid;
        grid-template-columns: 35% 30% 35%;
        width: 100%;
        height: 80vh;
    }

    .ReconNotationInput {
        width: 100%;
        font-size: 1.5rem;
    }
</style>