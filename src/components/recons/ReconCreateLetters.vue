<script setup>
    import { ref }from 'vue'
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
    const cornerLetterSolution = ref(cycleResult[0])
    const edgeLetterSolution = ref([])
    const letterOptions = ref(cycleResult[1])
    const pieceType = ref(0)

    function ToLetters(arr) {
        //Convert array of numbers to array of sticker letters
        return arr.map(i => String.fromCharCode(i + 65)).join('')
    }

    function cornerLetterSelected(index) {
        cornerLetterSolution.value.push(letterOptions.value[index])
        cube.SwapCornerCubies(2, letterOptions.value[index])

        const newCycle = FinishCornerCycle(cube)
        cornerLetterSolution.value = cornerLetterSolution.value.concat(newCycle[0])
        letterOptions.value = newCycle[1]
        if (letterOptions.value.length === 0) {
            pieceType.value++
            const firstEdgeCycle = FinishEdgeCycle(cube)
            edgeLetterSolution.value = firstEdgeCycle[0]
            letterOptions.value = firstEdgeCycle[1]
        }
    }

    function edgeLetterSelected(index) {
        edgeLetterSolution.value.push(letterOptions.value[index])
        cube.SwapEdgeCubies(2, letterOptions.value[index])

        const newCycle = FinishEdgeCycle(cube)
        edgeLetterSolution.value = edgeLetterSolution.value.concat(newCycle[0])
        letterOptions.value = newCycle[1]
        if (letterOptions.value.length === 0) {
            pieceType.value++
        }
    }
</script>

<template>
    <div class="ReconHeader">Corners:</div>
    <div class="ReconHeader">
        {{ToLetters(cornerLetterSolution)}}
        <div v-if="pieceType === 0">
            <div v-for="(letter, index) in ToLetters(letterOptions)" @click="cornerLetterSelected(index)" class="newBufferOption">
                <i>{{letter}}</i>
            </div>
        </div>
    </div>
    <div v-if="pieceType > 0" class="ReconHeader">Edges:</div>
    <div v-if="pieceType > 0" class="ReconHeader">
        {{ToLetters(edgeLetterSolution)}}
        <div>
            <div v-for="(letter, index) in ToLetters(letterOptions)" @click="edgeLetterSelected(index)" class="newBufferOption">
                <i>{{letter}}</i>
            </div>
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
    }
    .newBufferOption:hover {
        background-color: var(--grey-500);
    }
</style>