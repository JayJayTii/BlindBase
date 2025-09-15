import { CubieCube } from "./CubieCube.js"
import { CornOriMove, CornPermMove, EdgeOriMove } from "@/helpers/kociemba/MoveTable.js"
import { ReadCornOriPrune, ReadCornPermPrune, ReadEdgeOriPrune } from "@/helpers/kociemba/PruningTable.js"

function SolveCO(cube) {
    const startCO = cube.CornOriCoord()

    //Look in the move table for moves which will decrease moves remaining
    let movesRem = ReadCornOriPrune(startCO)
    let COtrail = [startCO]
    let moves = []
    while (COtrail[COtrail.length - 1] !== 0) {
        let foundMove = false
        for (var i = 0; i < 18; i++) {
            const newCO = CornOriMove[COtrail[COtrail.length - 1] * 18 + i]

            if ((ReadCornOriPrune(newCO) + 1) % 3 === movesRem % 3) { //One less move
                foundMove = true
                COtrail.push(newCO)
                moves.push(i)
                movesRem = (movesRem + 2) % 3 //Same as subtracting 1
                break
            }
        }
        if (!foundMove) {
            console.log("UUUUHH COULDNT FIND A MOVE FOR CORN ORI DEBUG THAT THANKS for " + startCO)
            break
        }
    }

    return moves
}
function SolveCP(cube) {
    const startCP = cube.CornPermCoord()

    //Look in the move table for moves which will decrease moves remaining
    let movesRem = ReadCornPermPrune(startCP)
    let CPtrail = [startCP]
    let moves = []
    while (CPtrail[CPtrail.length - 1] !== 0) {
        let foundMove = false
        for (var i = 0; i < 18; i++) {
            const newCP = CornPermMove[CPtrail[CPtrail.length - 1] * 18 + i]

            if ((ReadCornPermPrune(newCP) + 1) % 3 === movesRem % 3) { //One less move
                foundMove = true
                CPtrail.push(newCP)
                moves.push(i)
                movesRem = (movesRem + 2) % 3 //Same as subtracting 1
                break
            }
        }
        if (!foundMove) {
            console.log("UUUUHH COULDNT FIND A MOVE FOR CORN PERM DEBUG THAT THANKS for " + startCP)
            break
        }
    }

    return moves
}

function SolveEO(cube) {
    const startEO = cube.EdgeOriCoord()
    //Look in the move table for moves which will decrease moves remaining
    let movesRem = ReadEdgeOriPrune(startEO)
    let EOtrail = [startEO]
    let moves = []
    while (EOtrail[EOtrail.length - 1] !== 0) {
        let foundMove = false
        for (var i = 0; i < 18; i++) {
            const newEO = EdgeOriMove[EOtrail[EOtrail.length - 1] * 18 + i]

            if ((ReadEdgeOriPrune(newEO) + 1) % 3 === (movesRem % 3)) { //One less move
                foundMove = true
                EOtrail.push(newEO)
                moves.push(i)
                movesRem = (movesRem + 2) % 3 //Same as subtracting 1
                break
            }
        }
        if (!foundMove) {
            console.log("UUUUHH COULDNT FIND A MOVE FOR EDGE ORI DEBUG THAT THANKS for " + startEO)
            break
        }
    }

    return moves
}

export { SolveCO, SolveCP, SolveEO }