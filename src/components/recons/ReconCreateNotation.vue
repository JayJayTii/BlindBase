<script setup>
    import { nextTick, computed, watch, ref } from 'vue'
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

    const cube = ref(new FaceletCube())
    function ScrambleCube() {
        cube.value = new FaceletCube()
        cube.value.TurnSequence(props.scramble)
    }

    const cornerInput = ref([])
    const edgeInput = ref([])

    const cornerPairs = ToLetters(props.letterSolution[0]).split(' ')
    for (const pair of cornerPairs) {
        if(false  && pair.length == 2)
            cornerInput.value.push(GetRandomRecommendation(1, pair))
        else
            cornerInput.value.push("")
    }

    const edgePairs = ToLetters(props.letterSolution[1]).split(' ')
    for (const pair of edgePairs) {
        if (pair.length == 2)
            edgeInput.value.push(GetRandomRecommendation(2, pair))
        else
            edgeInput.value.push("")
    }

    //Ad-hoc v-models for spans
    function cornerInputUpdated(index, event) {
        cornerInput.value[index] = event.target.innerText
    }
    function edgeInputUpdated(index, event) {
        edgeInput.value[index] = event.target.innerText
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
            cornerInput.value.push(sheetStore.getSheet(cornerSheetID.value).grid[letter2][letter1])
        }
    }
    function FillEdges() {
        edgeInput.value = []
        for (var i = 0; i < edgePairs.length; i++) {
            if (props.letterSolution[1].length === 2 * i + 1) //Break if this pair is one letter long
                break
            const letter1 = props.letterSolution[1][2 * i]
            const letter2 = props.letterSolution[1][2 * i + 1]
            edgeInput.value.push(sheetStore.getSheet(edgeSheetID.value).grid[letter2][letter1])
        }
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
    FillEdges()


    let curSelectionStart = 0
    let selectedID = ""
    setInterval(() => {
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
        while (!(inputText[sampleIndex - 1] == ' '
            || inputText[sampleIndex] == ' '
            || sampleIndex == 0 || sampleIndex >= inputText.length)){
            sampleIndex++
        }
        currentAlgorithm.setAlgorithmNotation(inputText.substring(0, sampleIndex))

        cube.value.TurnSequence(currentAlgorithm)
    }, 50)
</script>

<template>
    <div id="ReconCreateNotationLayout">
        <div style="display: flex; flex-direction: column;">
            <div class="ReconHeader">Corners:</div>
            <div style="color:white" v-if="cornerSheets.length > 0">
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
                              :id="'Corns' + index.toString()"/>
                    <button style="height:40px;min-width:40px;" @click="FillCornerRecommendation(index)">?</button>
                </div>
            </div>
        </div>
        <FaceletCubeVisual :cube="cube"
                           :key="cube.corners.toString() + cube.edges.toString() + cube.centers.toString()"
                           style="align-self: center;"/>
        <div style="display:flex;flex-direction:column;gap:10px;">
            <div class="ReconHeader">Edges:</div>
            <div style="color:white" v-if="edgeSheets.length > 0">
                Algs from
                <select v-model="edgeSheetID" @change="FillEdges()">
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
                          :id="'Edges' + index.toString()" />
                <button style="height:40px;min-width:40px;" @click="FillEdgeRecommendation(index)">?</button>
            </div>
        </div>
    </div>
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
        background-color: white;
        color: black;
        font-size: 1.5rem;
    }
</style>