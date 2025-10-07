<script setup>
    import { nextTick, ref } from 'vue'
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import { Sequence } from '@/helpers/sequence.js'
    import { GetRandomRecommendation } from '@/helpers/recommendations.js'
    import { ToLetters } from '@/helpers/reconstruct.js'
    import FaceletCubeVisual from '@/components/FaceletCubeVisual.vue'

    const props = defineProps({
        scramble: Sequence,
        letterSolution: Array,
    })

    let cube = new FaceletCube()
    for (var i = 0; i < props.scramble.turns.length; i++) {
        cube.Turn(props.scramble.turns[i])
    }

    const cornerInput = ref([])
    const edgeInput = ref([])

    const cornerPairs = ToLetters(props.letterSolution[0]).split(' ')
    for (const pair of cornerPairs) {
        if(pair.length == 2)
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
</script>

<template>
    <div id="ReconCreateNotationLayout">
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <div class="ReconHeader">Corners:</div>
            <div style="display: flex; color: var(--grey-100); font-size: 1.5rem; gap: 10px;" 
                 v-for="(pair,index) in cornerPairs">
                {{pair}}:
                <span contenteditable="true"
                      class="ReconNotationInput"
                      @input="cornerInputUpdated(index, $event)">
                    {{cornerInput[index]}}
                </span>
            </div>
            
        </div>
        <FaceletCubeVisual :cube="cube"
                           :key="cube.corners.toString() + cube.edges.toString() + cube.centers.toString()" />
        <div style="display:flex;flex-direction:column;gap:10px;">
            <div class="ReconHeader">Edges:</div>
            <div style="display:flex;color: var(--grey-100); font-size: 1.5rem; gap: 10px;" 
                 v-for="(pair, index) in ToLetters(props.letterSolution[1]).split(' ')">
                {{pair}}:
                <span contenteditable="true"
                      class="ReconNotationInput"
                      @input="edgeInputUpdated(index, $event)">
                    {{edgeInput[index]}}
                </span>
            </div>
        </div>
    </div>
</template>

<style>
    #ReconCreateNotationLayout {
        display: grid;
        grid-template-columns: 33.3333% 33.3333% 33.3333%;
        width: 100%;
        height: 80vh;
    }

    .ReconNotationInput {

        width: 100%; 
        background-color:white; 
        color: black;
    }
</style>