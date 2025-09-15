import { CubieCube } from "./CubieCube.js"
import { WriteToDatabase, FetchFromDatabase } from "@/helpers/indexedDB.js"

let CornOriPrune = new Array(2187)
let CornPermPrune = new Array(40320)
let EdgeOriPrune = new Array(2048)

async function GenerateCornOriPrune() {
    try {
        CornOriPrune = await FetchFromDatabase("CornOriPrune")

        if (CornOriPrune !== undefined) {
            //console.log("Already cached CornOriPrune, skipping...")
            return
        }
    } catch (error) {
        console.error("Error fetching data:", error)
    }

    CornOriPrune = new Array(2187)
    CornOriPrune[0] = 0
    let filled = 1
    let propogateQueue = [0]
    let altPropogateQueue = []
    let curQueue = 0
    let depth = 0
    let cube = new CubieCube()

    while (filled < CornOriPrune.length) {
        //Search through pruning table and propogate coords of current depth
        if (filled < 0.7 * CornOriPrune.length) { //Fill forward
            //================ PROPOGATE FORWARD ===================================================
            for (var i = 0; i < (curQueue === 0 ? propogateQueue.length : altPropogateQueue.length); i++) {
                const BaseCoord = curQueue === 0 ? propogateQueue[i] : altPropogateQueue[i]
                const newDepth = (CornOriPrune[BaseCoord] + 1) % 3
                for (var move = 0; move < 18; move++) {
                    cube.SetCornOriCoord(BaseCoord)
                    cube.TurnCorners(move)
                    const newCO = cube.CornOriCoord()

                    if (CornOriPrune.hasOwnProperty(newCO)) //Already filled with minimum distance
                        continue

                    CornOriPrune[newCO] = newDepth
                    if (curQueue === 0) //Push to the opposite queue as we're reading the current one
                        altPropogateQueue.push(newCO)
                    else
                        propogateQueue.push(newCO)

                    filled++
                }
            }
            //=====================================================================================
        }
        else {
            //================ PROPOGATE BACKWARD =================================================
            for (var i = 0; i < 2187; i++) {
                if (CornOriPrune.hasOwnProperty(i))
                    continue

                for (var move = 0; move < 18; move++) {
                    cube.SetCornOriCoord(i)
                    cube.TurnCorners(move)
                    const newCO = cube.CornOriCoord()
                    if (!CornOriPrune.hasOwnProperty(newCO)) //Needs to be filled adjacent to empty
                        continue
                    if ((CornOriPrune[newCO] + 1) % 3 !== depth) //Needs to be one below the current depth
                        continue

                    CornOriPrune[i] = depth
                    filled++
                    break
                }
            }
            //=====================================================================================
        }
        curQueue = (curQueue + 1) % 2
        if (curQueue === 1)
            propogateQueue = []
        else
            altPropogateQueue = []

        depth = (depth + 1) % 3
    }

    CornOriPrune = ToUint8Array(CornOriPrune)
    WriteToDatabase("CornOriPrune", CornOriPrune)
}
function ReadCornOriPrune(index) {
    return ((CornOriPrune[Math.floor(index / 4)] >> (2 * (3 - index % 4))) & 0b00000011)
}

async function GenerateCornPermPrune() {
    try {
        CornPermPrune = await FetchFromDatabase("CornPermPrune")

        if (CornPermPrune !== undefined) {
            //console.log("Already cached CornPermPrune, skipping...")
            return
        }
    } catch (error) {
        console.error("Error fetching data:", error)
    }

    CornPermPrune = new Array(40320)
    CornPermPrune[0] = 0
    let filled = 1
    let propogateQueue = [0]
    let altPropogateQueue = []
    let curQueue = 0
    let depth = 0
    let cube = new CubieCube()

    while (filled < CornPermPrune.length) {
        //Search through pruning table and propogate coords of current depth
        if (filled < 0.7 * CornPermPrune.length) { //Fill forward
            //================ PROPOGATE FORWARD ===================================================
            for (var i = 0; i < (curQueue === 0 ? propogateQueue.length : altPropogateQueue.length); i++) {
                const BaseCoord = curQueue === 0 ? propogateQueue[i] : altPropogateQueue[i]
                const newDepth = (CornPermPrune[BaseCoord] + 1) % 3

                for (var move = 0; move < 18; move++) {
                    cube.SetCornPermCoord(BaseCoord)
                    cube.TurnCorners(move)
                    const newCP = cube.CornPermCoord()
                    if (CornPermPrune.hasOwnProperty(newCP)) //Already filled with minimum distance
                        continue

                    CornPermPrune[newCP] = newDepth
                    if (curQueue === 0) //Push to the opposite queue as we're reading the current one
                        altPropogateQueue.push(newCP)
                    else
                        propogateQueue.push(newCP)

                    filled++
                }
            }
            //=====================================================================================
        }
        else {
            //================ PROPOGATE BACKWARD =================================================
            for (var i = 0; i < 40320; i++) {
                if (CornPermPrune.hasOwnProperty(i))
                    continue

                for (var move = 0; move < 18; move++) {
                    cube.SetCornPermCoord(i)
                    cube.TurnCorners(move)
                    const newCP = cube.CornPermCoord()
                    if (!CornPermPrune.hasOwnProperty(newCP)) //Needs to be filled adjacent to empty
                        continue
                    if ((CornPermPrune[newCP] + 1) % 3 !== depth) //Needs to be one below the current depth
                        continue

                    CornPermPrune[i] = depth
                    filled++
                    break
                }
            }
            //=====================================================================================
        }

        curQueue = (curQueue + 1) % 2
        if (curQueue === 1)
            propogateQueue = []
        else
            altPropogateQueue = []

        depth = (depth + 1) % 3
    }

    CornPermPrune = ToUint8Array(CornPermPrune)
    WriteToDatabase("CornPermPrune", CornPermPrune)
}
function ReadCornPermPrune(index) {
    return ((CornPermPrune[Math.floor(index / 4)] >> (2 * (3 - index % 4))) & 0b00000011)
}

async function GenerateEdgeOriPrune() {
    try {
        EdgeOriPrune = await FetchFromDatabase("EdgeOriPrune")

        if (EdgeOriPrune !== undefined) {
            //console.log("Already cached EdgeOriPrune, skipping...")
            return
        }
    } catch (error) {
        console.error("Error fetching data:", error)
    }

    EdgeOriPrune = new Array(2048)
    EdgeOriPrune[0] = 0
    let filled = 1
    let propogateQueue = [0]
    let altPropogateQueue = []
    let curQueue = 0
    let depth = 0
    let cube = new CubieCube()

    while (filled < EdgeOriPrune.length) {
        if (filled < 0.7 * EdgeOriPrune.length) { //Fill forward
            //================ PROPOGATE FORWARD ===================================================
            for (var i = 0; i < (curQueue === 0 ? propogateQueue.length : altPropogateQueue.length); i++) {
                const BaseCoord = curQueue === 0 ? propogateQueue[i] : altPropogateQueue[i]
                const newDepth = (EdgeOriPrune[BaseCoord] + 1) % 3

                for (var move = 0; move < 18; move++) {
                    cube.SetEdgeOriCoord(BaseCoord)
                    cube.TurnEdges(move)
                    const newEO = cube.EdgeOriCoord()
                    if (EdgeOriPrune.hasOwnProperty(newEO)) //Already filled with minimum distance
                        continue

                    EdgeOriPrune[newEO] = newDepth
                    if (curQueue === 0) //Push to the opposite queue as we're reading the current one
                        altPropogateQueue.push(newEO)
                    else
                        propogateQueue.push(newEO)

                    filled++
                }
            }
            //=====================================================================================
        }
        else {
            //================ PROPOGATE BACKWARD =================================================
            for (var i = 0; i < 2048; i++) {
                if (EdgeOriPrune.hasOwnProperty(i))
                    continue

                for (var move = 0; move < 18; move++) {
                    cube.SetEdgeOriCoord(i)
                    cube.TurnEdges(move)
                    const newEO = cube.EdgeOriCoord()
                    if (!EdgeOriPrune.hasOwnProperty(newEO)) //Needs to be filled adjacent to empty
                        continue
                    if ((EdgeOriPrune[newEO] + 1) % 3 !== depth) //Needs to be one below the current depth
                        continue

                    EdgeOriPrune[i] = depth
                    filled++
                    break
                }
            }
            //=====================================================================================
        }
        curQueue = (curQueue + 1) % 2
        if (curQueue === 1)
            propogateQueue = []
        else
            altPropogateQueue = []

        depth = (depth + 1) % 3 //Only need to store mod 3 since a move will only ever increment or decrement depth
    }

    EdgeOriPrune = ToUint8Array(EdgeOriPrune)
    WriteToDatabase("EdgeOriPrune", EdgeOriPrune)
}
function ReadEdgeOriPrune(index) {
    return ((EdgeOriPrune[Math.floor(index / 4)] >> (2 * (3 - index % 4))) & 0b00000011)
}

function ToUint8Array(arr) {
    let out = new Uint8Array(Math.ceil(arr.length / 4))
    for (var i = 0; i < out.length; i++) {
        out[i] = (arr[4 * i] % 4) << 6 |
            (arr[4 * i + 1] % 4) << 4 |
            (arr[4 * i + 2] % 4) << 2 |
            (arr[4 * i + 3] % 4)
    }
    return out
}

export { ReadCornOriPrune, GenerateCornOriPrune, ReadCornPermPrune, GenerateCornPermPrune, ReadEdgeOriPrune, GenerateEdgeOriPrune }