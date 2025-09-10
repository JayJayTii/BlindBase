<script setup>
    import { onMounted, onUnmounted, ref } from 'vue'
    import { CubieCube } from "@/helpers/kociemba/CubieCube.js"
    import { CornOriMoveTable, GenerateCornOriMoveTable } from "@/helpers/kociemba/MoveTable.js"
    import CubieCubeVisual from "@/components/CubieCubeVisual.vue"

    //GenerateCornOriMoveTable()
    const a = ref(new CubieCube())

    function handleKeydown(event) {
        if (event.code === 'Space') {
            a.value.Randomise()
        }
        if (event.code === 'KeyE') {
            a.value.RandomiseEdges()
        }
        if (event.code === 'KeyC') {
            a.value.RandomiseCorners()
        }
        if (event.code === 'KeyU') {
            a.value.Turn(0)
        }
        else if (event.code === 'KeyR') {
            a.value.Turn(3)
        }
        else if (event.code === 'KeyF') {
            a.value.Turn(6)
        }
        else if (event.code === 'KeyD') {
            a.value.Turn(9)
        }
        else if (event.code === 'KeyL') {
            a.value.Turn(12)
        }
        else if (event.code === 'KeyB') {
            a.value.Turn(15)
        }
    }

    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
    })
</script>

<template>
    <CubieCubeVisual :cube="a"/>
</template>
