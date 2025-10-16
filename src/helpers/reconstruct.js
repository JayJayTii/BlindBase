import { Sequence } from '@/helpers/sequence.js'
import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
import { getSolveTimeString, getSolveRatioString } from '@/helpers/timer.js'
import { adjacentCornerIndices, adjacentEdgeIndices } from '@/helpers/stickers.js'

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

export function FinishEdgeCycle(cube) {
    const bufferStickers = [2, 8]

    const cycle = []
    while (!bufferStickers.includes(cube.edges[2])) { //While not at end of cycle
        cycle.push(cube.edges[2])
        cube.SwapEdgeCubies(2, cube.edges[2])
    }

    const availableBuffers = []
    for (var i = 0; i < cube.edges.length; i++) {
        //It is an available buffer if it is not at it's home cubie
        if (!adjacentEdgeIndices[i].includes(cube.edges[i])) {
            availableBuffers.push(i)
        }
    }
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
        turnCount += notation[i].split(' ').filter(move => move != '').length
    }
    return turnCount
}

export function GenerateReconBody(recon) {
    let summary = ""
    summary += recon.scramble.toString()
    summary += "\n\n//Corners\n"
    const cornerPairs = ToLetters(recon.letters[0]).split(' ')
    for (var i = 0; i < cornerPairs.length; i++) {
        summary += recon.notation.corners[i] + " //" + cornerPairs[i] + "\n"
    }
    summary += "\n//Edges\n"
    const edgePairs = ToLetters(recon.letters[1]).split(' ')
    for (var i = 0; i < edgePairs.length; i++) {
        summary += recon.notation.edges[i] + " //" + edgePairs[i] + "\n"
    }
    if (!recon.hasOwnProperty("solve"))
        return summary

    const solve = JSON.parse(recon.solve)
    const moveCount = GetReconMoveCount(recon)
    summary += "\n\n//" + moveCount.toString() + " move" + (moveCount != 1 ? "s" : "") + "\n"
    
    summary += "//" + getSolveTimeString(solve) + " (" + getSolveRatioString(solve) + ")\n"
    const tps = moveCount / (solve.solveTime - solve.memoTime) * 1000 //times are stored in milliseconds
    summary += "//" + (Math.round(Math.pow(10, 1) * tps) / Math.pow(10, 1)).toString() + "TPS\n"
    return summary
}