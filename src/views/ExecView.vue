<script setup>
    import { onMounted, onUnmounted, ref } from 'vue'
    import { CubieCube } from "@/helpers/kociemba/CubieCube.js"
    import { SYMS, SYM_INV, SYM_MOVE } from "@/helpers/kociemba/Symmetries.js"
    import { FUSClassToRepresentant, GenerateFUSClassToRepresentant, RawFUSToSymFUS } from '../helpers/kociemba/ClassToRepresentant.js'
    import { FUSMove } from '../helpers/kociemba/MoveTable.js'
    import { GenerateFUSPrune } from '../helpers/kociemba/PruningTable.js'
    import { SolveCO, SolveCP, SolveEO } from "@/helpers/kociemba/Solver.js"
    import { Sequence } from "@/helpers/sequence.js"
    import CubieCubeVisual from "@/components/CubieCubeVisual.vue"

    //GenerateFUSPrune()

    const a = ref(new CubieCube())
    const e = ref(26857)
    //a.value.MultiplyEdges(SYMS[13].edges)
    
    //await GenerateFUSClassToRepresentant()
    a.value.SetFlipUDSliceCoord(FUSClassToRepresentant[Math.floor(e.value / 16)])
    a.value.MultiplyEdges(SYMS[e.value % 16].edges)
    //console.log(FUSClassToRepresentant[11106])
    //console.log("raw is " + a.value.FlipUDSliceCoord())
    //console.log("sym is " + RawFUSToSymFUS[a.value.FlipUDSliceCoord()])

    function handleKeydown(event) {
        if (event.code === 'KeyQ') {
            e.value++
            a.value.SetFlipUDSliceCoord(FUSClassToRepresentant[Math.floor(e.value / 16)])
            a.value.MultiplyEdges(SYMS[e.value % 16].edges)
        }
        if (event.code === 'KeyA') {
            e.value--
            a.value.SetFlipUDSliceCoord(FUSClassToRepresentant[Math.floor(e.value / 16)])
            a.value.MultiplyEdges(SYMS[e.value % 16].edges)
        }
        else if (event.code === 'KeyE') {
            a.value.RandomiseEdges()
        }
        else if (event.code === 'KeyC') {
            a.value.RandomiseCorners()
        }
        else if (event.code === 'KeyU') {
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
        
        const symcoord = RawFUSToSymFUS[a.value.FlipUDSliceCoord()]
        console.log("symcoord is " + symcoord + " (" + Math.floor(symcoord / 16) + ", " + (symcoord % 16) + ")")

        a.value.SetFlipUDSliceCoord(FUSClassToRepresentant[Math.floor(symcoord/ 16)])
        a.value.MultiplyEdges(SYMS[symcoord % 16].edges)
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
