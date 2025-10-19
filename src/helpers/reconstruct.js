import { Sequence } from '@/helpers/sequence.js'
import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
import { getSolveTimeString, getSolveRatioString } from '@/helpers/timer.js'
import { adjacentCornerIndices, adjacentEdgeIndices } from '@/helpers/stickers.js'

export function GetInspectionMoves(cube) {
    //Gets the rotations from the start of the solve
    const startCube = Object.assign(new FaceletCube(), JSON.parse(JSON.stringify(cube)))
    const inspection = []
    if (startCube.centers[0] != 0) {
        for (const rot of [['x', 1], ['x', 2], ['x', 3], ['y', 1], ['y', 2], ['y', 3], ['z', 1], ['z', 2], ['z', 3]]) {
            let testCube = Object.assign(new FaceletCube(), JSON.parse(JSON.stringify(startCube)))
            testCube.Turn(rot)
            if (testCube.centers[0] == 0) {
                inspection.push(rot)
                startCube.Turn(inspection[0])
                break
            }
        }
    }

    if (startCube.centers[1] == 1)
        return { turns: inspection }

    for (const rot of [['x', 1], ['x', 2], ['x', 3], ['y', 1], ['y', 2], ['y', 3], ['z', 1], ['z', 2], ['z', 3]]) {
        let testCube = Object.assign(new FaceletCube(), JSON.parse(JSON.stringify(startCube)))
        testCube.Turn(rot)
        if (testCube.centers[1] == 1) {
            inspection.push(rot)
            break
        }
    }
    return { turns: inspection }
}

export function FinishCornerCycle(cube) {
    const bufferStickers = [2, 9, 12]
    const cycle = []
    while (!bufferStickers.includes(cube.corners[2])) { //While not at end of cycle
        cycle.push(cube.corners[2])
        cube.SwapCornerCubies(2,cube.corners[2])
    }

    const availableBuffers = []
    for (var i = 0; i < cube.corners.length; i++) {
        //It is an available buffer if it is not at it's home cubie
        if (!adjacentCornerIndices[i].includes(cube.corners[i])) {
            availableBuffers.push(i)
        }
    }
    return [cycle, availableBuffers]
}

export function FinishEdgeCycle(cube, parity) {
    if (parity)
        cube.SwapEdgeCubies(cube.edges.indexOf(2), cube.edges.indexOf(1))
    const bufferStickers = [2, 8]

    const cycle = []
    while (!bufferStickers.includes(cube.edges[2])) { //While not at end of cycle
        let nextSwap = cube.edges[2]
        cycle.push(nextSwap)
        cube.SwapEdgeCubies(2, nextSwap)
    }

    const availableBuffers = []
    for (var i = 0; i < cube.edges.length; i++) {
        //It is an available buffer if it is not at it's home cubie
        if (!adjacentEdgeIndices[i].includes(cube.edges[i])) {
            availableBuffers.push(i)
        }
    }
    if (parity)
        cube.SwapEdgeCubies(cube.edges.indexOf(2), cube.edges.indexOf(1))
    return [cycle, availableBuffers]
}

export function ToLetters(arr) {
    //Convert array of numbers to pairs of letters
    if (arr.length == 0)
        return ""
    return arr.map(i => String.fromCharCode(i + 65)).join('').match(/.{1,2}/g).join(' ')
}

export function GetReconMoveCount(recon) {
    const notation = recon.notation.corners.concat(recon.notation.edges)
    let turnCount = 0
    for (var i = 0; i < notation.length; i++) {
        //Ignore rotations as moves
        turnCount += notation[i].split(' ').filter(move => move != '' && !move.includes('x') && !move.includes('y') && !move.includes('z')).length
    }
    return turnCount
}

export function GenerateReconBody(recon) {
    let summary = ""
    summary += recon.scramble.toString()

    if (recon.inspection.turns.length > 0) {
        let inspectionSequence = Object.assign(new Sequence(), recon.inspection)
        summary += "\n\n//Inspection\n" + inspectionSequence.toString()
    }

    const edgesEmpty = (recon.notation.edges.length == 1 && recon.notation.edges[0] == '')
    summary += edgesEmpty ? "" : "\n\n//Edges\n"
    const edgePairs = ToLetters(recon.letters[1]).split(' ').filter(pair => pair.length > 1)
    for (var i = 0; i < recon.notation.edges.length; i++) {
        summary += recon.notation.edges[i]
        summary += (i < edgePairs.length ? (" //" + edgePairs[i] + "\n") : "\n")
    }

    const cornersEmpty = (recon.notation.corners.length == 1 && recon.notation.corners[0] == '')
    summary += cornersEmpty ? "" : "\n//Corners\n"
    const cornerPairs = ToLetters(recon.letters[0]).split(' ').filter(pair => pair.length > 1)
    for (var i = 0; i < recon.notation.corners.length; i++) {
        summary += recon.notation.corners[i]
        summary += (i < cornerPairs.length ? (" //" + cornerPairs[i] + "\n") : "\n")
    }

    const moveCount = GetReconMoveCount(recon)
    summary += "\n//" + moveCount.toString() + " move" + (moveCount != 1 ? "s" : "") + "\n"

    if (!recon.hasOwnProperty("solve"))
        return summary

    const solve = JSON.parse(recon.solve)
    summary += "//" + getSolveTimeString(solve) + " (" + getSolveRatioString(solve) + ")\n"
    const tps = moveCount / (solve.solveTime - solve.memoTime) * 1000 //times are stored in milliseconds
    summary += "//" + (Math.round(Math.pow(10, 1) * tps) / Math.pow(10, 1)).toString() + "TPS\n"
    return summary
}