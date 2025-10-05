import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
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