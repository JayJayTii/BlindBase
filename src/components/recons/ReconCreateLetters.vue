<script setup>
    import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
    import { Sequence } from '@/helpers/sequence.js'
    import { FinishCornerCycle } from '@/helpers/reconstruct.js'
    import FaceletCubeVisual from '@/components/FaceletCubeVisual.vue'
    import ReconCreateLetters from '@/components/recons/ReconCreateLetters.vue'

    const props = defineProps({
        scramble: Sequence,
    })

    let cube = new FaceletCube()
    for (var i = 0; i < props.scramble.turns.length; i++) {
        cube.Turn(props.scramble.turns[i])
    }
</script>

<template>
    <div class="ReconHeader">Corners:</div>
    <div class="ReconHeader">{{FinishCornerCycle(cube)}}</div>
    <FaceletCubeVisual style="position:absolute;right:20px;top:15vh;" :cube="cube" />
</template>

<style>
    .ReconHeader{
        color: var(--grey-100);
        font-size: 2rem;
    }
</style>