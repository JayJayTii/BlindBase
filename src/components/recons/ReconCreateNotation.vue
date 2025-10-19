<script setup>
    import { nextTick, onMounted, onUnmounted, computed, watch, ref } from 'vue'
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import { Sequence } from '@/helpers/sequence.js'
    import { GetRandomRecommendation, getRecommendations } from '@/helpers/recommendations.js'
    import { ToLetters } from '@/helpers/reconstruct.js'
    import FaceletCubeVisual from '@/components/FaceletCubeVisual.vue'

    import { useSheetStore } from '@/stores/SheetStore'
    const sheetStore = useSheetStore()
    sheetStore.loadState()

    const props = defineProps({
        scramble: Sequence,
        letterSolution: Array,
    })
    const emit = defineEmits(['notationFinished'])

    const cube = ref(new FaceletCube())
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

    const edgePairs = ToLetters(props.letterSolution[1]).split(' ')
    for (const pair of edgePairs) {
        if (pair.length == 2)
            edgeInput.value.push(GetRandomRecommendation(2, pair))
        else
            edgeInput.value.push("")
    }

    const cornerSheets = sheetStore.getSheetsOfType(1)
    const cornerSheetID = ref(cornerSheets.length === 0 ? -1 : cornerSheets[0].id)
    const edgeSheets = sheetStore.getSheetsOfType(2)
    const edgeSheetID = ref(edgeSheets.length === 0 ? -1 : edgeSheets[0].id)

    function FillAllCorners() {
        cornerInput.value = []
        for (var i = 0; i < cornerPairs.length; i++) {
            if (props.letterSolution[0].length === 2 * i + 1) //Break if this pair is one letter long
                break
            const letter1 = props.letterSolution[0][2*i]
            const letter2 = props.letterSolution[0][2 * i + 1]
            const newValue = cornerSheetID.value == -1 ? "" : sheetStore.getSheet(cornerSheetID.value).grid[letter2][letter1]
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
            const newValue = edgeSheetID.value == -1 ? "" : sheetStore.getSheet(edgeSheetID.value).grid[letter2][letter1]
            edgeInput.value.push(newValue)
        }
        edgeInput.value.push("") //For the extra bit at the end
    }
    function FillCornerRecommendation(index) {
        const recs = getRecommendations(1, cornerPairs[index])
        let newRec = "" //Avoid giving the same recommendation again
        do {
            newRec = recs[Math.floor(Math.random() * recs.length)]
        } while (newRec == cornerInput.value[index]);
        cornerInput.value[index] = newRec
    }
    function FillEdgeRecommendation(index) {
        const recs = getRecommendations(2, edgePairs[index])
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
        intervalID = setInterval(() => {
            if (curSelectionStart === document.activeElement.selectionStart
                && selectedID == document.activeElement.id)
                return
            curSelectionStart = document.activeElement.selectionStart
            selectedID = document.activeElement.id

            ScrambleCube()
            if (curSelectionStart == undefined || selectedID == "")
                return

            const isCornerInput = (selectedID[0] == 'C')
            const inputIndex = parseInt(selectedID.substring(5))
            for (var i = 0; i < (isCornerInput ? inputIndex : cornerInput.value.length); i++) {
                const algorithm = new Sequence()
                algorithm.setAlgorithmNotation(cornerInput.value[i])
                cube.value.TurnSequence(algorithm)
            }
            for (var i = 0; i < (isCornerInput ? 0 : inputIndex); i++) {
                const algorithm = new Sequence()
                algorithm.setAlgorithmNotation(edgeInput.value[i])
                cube.value.TurnSequence(algorithm)
            }
            const currentAlgorithm = new Sequence()
            let inputText = isCornerInput ? cornerInput.value[inputIndex] : edgeInput.value[inputIndex]
            let sampleIndex = curSelectionStart
            while (!([' ', '\n'].includes(inputText[sampleIndex - 1])
                || [' ', '\n'].includes(inputText[sampleIndex])
                || sampleIndex == 0 || sampleIndex >= inputText.length)) {
                sampleIndex++
            }
            currentAlgorithm.setAlgorithmNotation(inputText.substring(0, sampleIndex))

            cube.value.TurnSequence(currentAlgorithm)
        }, 50)
    })
    onUnmounted(() => {
        if (intervalID !== null) {
            clearInterval(intervalID)
        }
        window.removeEventListener('keydown', handleKeydown)
    })
    function handleKeydown(event) {
        const el = document.activeElement
        const isCornerInput = (el.id[0] == 'C')
        if (!el.id.includes('C') && !el.id.includes('E'))
            return
        const inputIndex = parseInt(selectedID.substring(5))
        if (event.code === 'ArrowRight') {
            const inputLength = isCornerInput ? cornerInput.value[inputIndex].length : edgeInput.value[inputIndex].length
            if (el.selectionStart == inputLength) {
                if (isCornerInput && inputIndex === cornerInput.value.length - 1)
                    edgeInputBox.value[0].focus()
                else if(isCornerInput)
                    cornerInputBox.value[inputIndex + 1].focus()
                else if (!isCornerInput && inputIndex < edgeInput.value.length - 1)
                    edgeInputBox.value[inputIndex + 1].focus()
                else
                    return //End of last input box! Don't want to do anything
                event.preventDefault() // stop broken update order
                document.activeElement.selectionStart = 0
                document.activeElement.selectionEnd = 0
            }
        }
        else if (event.code === 'ArrowLeft') {
            if (el.selectionStart == 0) {
                if (!isCornerInput && inputIndex === 0)
                    cornerInputBox.value[cornerInputBox.value.length - 1].focus()
                else if (!isCornerInput)
                    edgeInputBox.value[inputIndex - 1].focus()
                else if (isCornerInput && inputIndex > 0)
                    cornerInputBox.value[inputIndex - 1].focus()
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
</script>

<template>
    <div id="ReconCreateNotationLayout">
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
                    <img src="@/assets/lightbulb-line.svg" class="DeleteButton" style="height:40px;min-width:40px;" @click="FillCornerRecommendation(index)"></img>
                </div>
                <textarea style="field-sizing: content; resize:none;"
                          class="ReconNotationInput"
                          v-model="cornerInput[cornerInput.length - 1]"
                          :id="'Corns' + (cornerInput.length - 1).toString()"
                          :ref="el => cornerInputBox[cornerInput.length - 1] = el" />
            </div>
        </div>
        <FaceletCubeVisual :cube="cube"
                           :key="cube.corners.toString() + cube.edges.toString() + cube.centers.toString()"
                           style="align-self: center;" />
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
            <div style="display:flex;color: var(--grey-100); font-size: 1.5rem; gap: 10px;"
                 v-for="(pair, index) in ToLetters(props.letterSolution[1]).split(' ')">
                {{pair}}:
                <textarea style="field-sizing: content; resize:none;"
                          class="ReconNotationInput"
                          v-model="edgeInput[index]"
                          :id="'Edges' + index.toString()"
                          :ref="el => edgeInputBox[index] = el" />
                <img src="@/assets/lightbulb-line.svg" class="DeleteButton" style="height:40px;min-width:40px;" @click="FillEdgeRecommendation(index)" />
            </div>
            <textarea style="field-sizing: content; resize:none;"
                      class="ReconNotationInput"
                      v-model="edgeInput[edgeInput.length - 1]"
                      :id="'Edges' + (edgeInput.length - 1).toString()"
                      :ref="el => edgeInputBox[edgeInput.length - 1] = el" />
        </div>
    </div>
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