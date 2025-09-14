import { CubieCube } from "./CubieCube.js"
import { CornOriMoveTable, GenerateCornOriMoveTable, EdgeOriMoveTable } from "@/helpers/kociemba/MoveTable.js"
import { CornOriPrune, GenerateCornOriPrune, EdgeOriPrune } from "@/helpers/kociemba/PruningTable.js"

function SolveCO(cube) {
    const startCO = cube.CornOriCoord()

    //Look in the move table for moves which will decrease moves remaining
    let movesRem = CornOriPrune[startCO]
    let COtrail = [startCO]
    let moves = []
    while (COtrail[COtrail.length - 1] !== 0) {
        let foundMove = false
        for (var i = 0; i < 18; i++) {
            const newCO = CornOriMoveTable[COtrail[COtrail.length - 1] * 18 + i]

            if ((CornOriPrune[newCO] + 1) % 3 === movesRem % 3) { //One less move
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

function SolveEO(cube) {
    const startEO = cube.EdgeOriCoord()
    //Look in the move table for moves which will decrease moves remaining
    let movesRem = EdgeOriPrune[startEO]
    let EOtrail = [startEO]
    let moves = []
    while (EOtrail[EOtrail.length - 1] !== 0) {
        let foundMove = false
        for (var i = 0; i < 18; i++) {
            const newEO = EdgeOriMoveTable[EOtrail[EOtrail.length - 1] * 18 + i]

            if ((EdgeOriPrune[newEO] + 1) % 3 === (movesRem % 3)) { //One less move
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

export { SolveCO,SolveEO }