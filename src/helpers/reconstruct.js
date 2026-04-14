import { Sequence } from '@/helpers/sequence.js'
import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
import { getSolveTimeString, getSolveRatioString } from '@/helpers/timer.js'
import { cornerBuffers, edgeBuffers } from '@/helpers/letter_scheme.js'
import { adjacentCornerIndices, adjacentEdgeIndices } from '@/helpers/stickers.js'
import { useSettingsStore } from '../stores/SettingsStore'

//Some scrambles begin with rotations, but a reconstruction always begins from the same rotation of the cube.
//So we need to add certain rotations before beginning the reconstruction to get the cube back to the correct rotation.
export function GetInspectionMoves(cube) {
    //Gets the rotations from the start of the solve
    const startCube = Object.assign(new FaceletCube(), JSON.parse(JSON.stringify(cube)))
    const inspection = []
    const rotations = [['x', 1], ['x', 2], ['x', 3], ['y', 1], ['y', 2], ['y', 3], ['z', 1], ['z', 2], ['z', 3]]
    //Get the rotation which places the white center on the top
    if (startCube.centers[0] != 0) {
        for (const rot of rotations) {
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

    //Then get the rotation which places the green center on the front
    for (const rot of rotations) {
        let testCube = Object.assign(new FaceletCube(), JSON.parse(JSON.stringify(startCube)))
        testCube.Turn(rot)
        if (testCube.centers[1] == 1) {
            inspection.push(rot)
            break
        }
    }
    return { turns: inspection }
}

//This function finishes as much of the corners on the cube as possible until requiring more information from the user.
export function FinishCornerCycle(cube, cornerBuffer) {
    //This keeps swapping the corner buffer piece with its target, until the buffer piece is back there.
    const bufferStickers = adjacentCornerIndices[cornerBuffer]
    const cycle = []
    while (!bufferStickers.includes(cube.corners[cornerBuffer])) { //While not at end of cycle
        cycle.push(cube.corners[cornerBuffer])
        cube.SwapCornerCubies(cornerBuffer, cube.corners[cornerBuffer])
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


//This function finishes as much of the edges on the cube as possible until requiring more information from the user.
export function FinishEdgeCycle(cube, edgeBuffer, pseudoswap, parity) {
    //This keeps swapping the edge buffer piece with its target, until the buffer piece is back there.
    if (parity)
        cube.SwapEdgeCubies(cube.edges.indexOf(pseudoswap[0]), cube.edges.indexOf(pseudoswap[1]))
    const bufferStickers = adjacentEdgeIndices[edgeBuffer]

    const cycle = []
    while (!bufferStickers.includes(cube.edges[edgeBuffer])) { //While not at end of cycle
        let nextSwap = cube.edges[edgeBuffer]
        cycle.push(nextSwap)
        cube.SwapEdgeCubies(edgeBuffer, nextSwap)
    }

    const availableBuffers = []
    for (var i = 0; i < cube.edges.length; i++) {
        //It is an available buffer if it is not at it's home cubie
        if (!adjacentEdgeIndices[i].includes(cube.edges[i])) {
            availableBuffers.push(i)
        }
    }
    if (parity)
        cube.SwapEdgeCubies(cube.edges.indexOf(pseudoswap[0]), cube.edges.indexOf(pseudoswap[1]))
    return [cycle, availableBuffers]
}

//Internally, the reconstruction is stored as numbers, these need to be converted to letters for the user.
export function ToLetters(arr) {
    //Convert array of numbers to pairs of letters
    if (arr.length == 0)
        return ""
    return arr.map(i => String.fromCharCode(i + 65)).join('').match(/.{1,2}/g).join(' ')
}

//This returns the number of moves in a reconstruction, so it can be written at the end of the reconstruction
export function GetReconMoveCount(recon) {
    const notation = recon.notation.corners.concat(recon.notation.edges)
    let turnCount = 0
    for (var i = 0; i < notation.length; i++) {
        //Ignore rotations as moves
        turnCount += notation[i].split(' ').filter(move => move != '' && !move.includes('x') && !move.includes('y') && !move.includes('z')).length
    }
    return turnCount
}

//Takes all the facts of the reconstruction that have been worked out and puts them together in a human-friendly reconstruction.
export function GenerateReconBody(recon) {
    let summary = ""
    summary += recon.scramble.toString()

    if (recon.inspection.turns.length > 0) {
        let inspectionSequence = Object.assign(new Sequence(), recon.inspection)
        summary += "\n\n//Inspection\n" + inspectionSequence.toString()
    }

    const edgesEmpty = (recon.notation.edges.length == 1 && recon.notation.edges[0] == '')
    summary += edgesEmpty ? "" : `\n\n//Edges (${edgeBuffers[recon.edgeBuffer]})\n`
    const edgePairs = ToLetters(recon.letters[1]).split(' ').filter(pair => pair.length > 1)
    for (var i = 0; i < recon.notation.edges.length; i++) {
        summary += recon.notation.edges[i]
        summary += (i < edgePairs.length ? (" //" + edgePairs[i] + "\n") : "\n")
    }

    const cornersEmpty = (recon.notation.corners.length == 1 && recon.notation.corners[0] == '')
    summary += cornersEmpty ? "" : `\n//Corners (${cornerBuffers[recon.cornerBuffer]})\n`
    const cornerPairs = ToLetters(recon.letters[0]).split(' ').filter(pair => pair.length > 1)
    for (var i = 0; i < recon.notation.corners.length; i++) {
        summary += recon.notation.corners[i]
        summary += (i < cornerPairs.length ? (" //" + cornerPairs[i] + "\n") : "\n")
    }

    const moveCount = GetReconMoveCount(recon)
    summary += "\n//" + moveCount.toString() + " move" + (moveCount != 1 ? "s" : "") + "\n"

    if (!recon.hasOwnProperty("solve"))
        return summary
    //Add timing information if arriving from the timer tool
    const solve = JSON.parse(recon.solve)
    summary += "//" + getSolveTimeString(solve) + " (" + getSolveRatioString(solve) + ")\n"
    const tps = moveCount / (solve[0] - solve[1]) * 1000 //times are stored in milliseconds
    summary += "//" + (Math.round(10 * tps) / 10).toString() + "TPS\n"
    return summary
}