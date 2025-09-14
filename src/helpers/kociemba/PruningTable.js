import { CubieCube } from "./CubieCube.js"

let CornOriPrune = new Array(2187).fill(-1)
let EdgeOriPrune = new Array(2048).fill(-1)
let filled = 0
let depth = 0
let propogateQueue = []
let altPropogateQueue = []
let curQueue = 0

function GenerateCornOriPrune() {
    CornOriPrune = new Array(2187).fill(-1)
    CornOriPrune[0] = 0
    filled = 0
    depth = 0
    curQueue = 0
    propogateQueue = [0]
    altPropogateQueue = []
    filled++

    console.time("GenerateCornOriPrune")
    while (filled < CornOriPrune.length) {
        //Search through pruning table and propogate coords of current depth
        for (var i = 0; i < (curQueue === 0 ? propogateQueue.length : altPropogateQueue.length); i++) {
            PropogateCornOriPrune(curQueue === 0 ? propogateQueue[i] : altPropogateQueue[i])
        }
        curQueue = (curQueue + 1) % 2
        if (curQueue === 1)
            propogateQueue = []
        else
            altPropogateQueue = []

        depth = (depth + 1) % 3
    }

    console.timeEnd("GenerateCornOriPrune")
}
function PropogateCornOriPrune(BaseCoord) {
    const baseDepth = CornOriPrune[BaseCoord]
    let cube = new CubieCube()

    for (var face = 0; face < 6; face++) {
        for (var turn = 0; turn < 3; turn++) {
            cube.SetCornOriCoord(BaseCoord)
            cube.Turn(face * 3 + turn)
            const newCO = cube.CornOriCoord()
            if (CornOriPrune[newCO] !== -1) //Already filled with minimum distance
                continue

            CornOriPrune[newCO] = (baseDepth + 1) % 3
            if (curQueue === 0) //Push to the opposite queue as we're reading the current one
                altPropogateQueue.push(newCO)
            else
                propogateQueue.push(newCO)

            filled++
        }
    }
}

function GenerateEdgeOriPrune() {
    EdgeOriPrune = new Array(2048).fill(-1)
    filled = 0
    depth = 0
    curQueue = 0
    propogateQueue = [0]
    altPropogateQueue = []
    EdgeOriPrune[0] = 0
    filled++

    //console.time("GenerateEdgeOriPrune")
    while (filled < EdgeOriPrune.length) {
        for (var i = 0; i < (curQueue === 0 ? propogateQueue.length : altPropogateQueue.length); i++) {
            PropogateEdgeOriPrune(curQueue === 0 ? propogateQueue[i] : altPropogateQueue[i])
        }
        curQueue = (curQueue + 1) % 2
        if (curQueue === 1)
            propogateQueue = []
        else
            altPropogateQueue = []

        depth = (depth + 1) % 3 //Only need to store mod 3 since a move will only ever increment or decrement depth
    }
    //console.timeEnd("GenerateEdgeOriPrune")
}
function PropogateEdgeOriPrune(BaseCoord) {
    const baseDepth = EdgeOriPrune[BaseCoord]
    let cube = new CubieCube()

    for (var face = 0; face < 6; face++) {
        for (var turn = 0; turn < 3; turn++) {
            cube.SetEdgeOriCoord(BaseCoord)
            cube.Turn(face * 3 + turn)
            const newEO = cube.EdgeOriCoord()
            if (EdgeOriPrune[newEO] !== -1) //Already filled with minimum distance
                continue

            EdgeOriPrune[newEO] = (baseDepth + 1) % 3
            if (curQueue === 0) //Push to the opposite queue as we're reading the current one
                altPropogateQueue.push(newEO)
            else 
                propogateQueue.push(newEO)

            filled++
        }
    }
}

export { CornOriPrune, GenerateCornOriPrune, EdgeOriPrune, GenerateEdgeOriPrune }