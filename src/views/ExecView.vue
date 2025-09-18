<script setup>
    import { onMounted, onUnmounted, ref } from 'vue'
    import { CubieCube } from "@/helpers/kociemba/CubieCube.js"
    import { SYMS, SYM_INV, SYM_MOVE } from "@/helpers/kociemba/Symmetries.js"
    import { SolveCO, SolveCP, SolveEO } from "@/helpers/kociemba/Solver.js"
    import { Sequence } from "@/helpers/sequence.js"
    import CubieCubeVisual from "@/components/CubieCubeVisual.vue"

    const a = ref(new CubieCube())
    const e = ref(0)

    function handleKeydown(event) {
        if (event.code === 'Space') {
            e.value++
            console.log(e.value)
            a.value = new CubieCube()
            a.value.Multiply(SYMS[e.value])
            a.value.Turn(3)
            a.value.Turn(0)
            a.value.Turn(5)
            a.value.Turn(8)
            a.value.Turn(3)
            a.value.Turn(0)
            a.value.Turn(5)
            a.value.Turn(2)
            a.value.Turn(5)
            a.value.Turn(6)
            a.value.Turn(4)
            a.value.Turn(2)
            a.value.Turn(5)
            a.value.Turn(2)
            a.value.Multiply(SYMS[SYM_INV[e.value]])
        }
        if (event.code === 'KeyW') {
            a.value.Multiply(SYMS[1])
            a.value.Multiply(SYMS[16])
        }
        if (event.code === 'KeyQ') {
            a.value.Multiply(SYMS[SYM_INV[e.value]])
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

    function GetCOSolution() {
        let seq = new Sequence()
        seq.setKociembaMoves(SolveCO(a.value))
        return seq.toString()
    }
    function GetCPSolution() {
        let seq = new Sequence()
        seq.setKociembaMoves(SolveCP(a.value))
        return seq.toString()
    }
    function GetEOSolution() {
        let seq = new Sequence()
        seq.setKociembaMoves(SolveEO(a.value))
        return seq.toString()
    }

    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
    })
</script>

<template>
    <CubieCubeVisual :cube="a" />
    <h1 style="color:white">To fix CO: {{GetCOSolution()}}</h1>
    <h1 style="color:white">To fix CP: {{GetCPSolution()}}</h1>
    <h1 style="color:white">To fix EO: {{GetEOSolution()}}</h1>
</template>
