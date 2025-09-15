import { CubieCube } from "./CubieCube.js"

//URF3 (typically unused, rotation 120 degrees around UFR-DBL axis)
const SYM_URF3_CORN = [[0,1], [4,2], [5,1], [1,2], [3,2], [7,1], [6,2], [2,1]]
const SYM_URF3_EDGE = [[1, 1], [8, 0], [5, 1], [9, 0], [3, 1], [11, 0], [7, 1], [10, 0], [0, 1], [4, 1], [6, 1], [2, 1]]
let SYM_URF3 = new CubieCube()
SYM_URF3.corners = SYM_URF3_CORN
SYM_URF3.edges = SYM_URF3_EDGE

//F2 (z2 rotation)
const SYM_F2_CORN = [[5,0], [4, 0], [7,0], [6,0], [1,0], [0,0], [3,0], [2,0]]
const SYM_F2_EDGE = [[6,0], [5,0], [4,0], [7,0], [2,0], [1,0], [0,0], [3,0], [9,0], [8,0], [11,0], [10,0]]
let SYM_F2 = new CubieCube()
SYM_F2.corners = SYM_F2_CORN
SYM_F2.edges = SYM_F2_EDGE

//U4 (y rotation)
const SYM_U4_CORN = [[3,0], [0,0], [1,0], [2,0], [7,0], [4,0], [5,0], [6,0]]
const SYM_U4_EDGE = [[3, 0], [0, 0], [1, 0], [2, 0], [7, 0], [4, 0], [5, 0], [6, 0], [11, 1], [8, 1], [9, 1], [10, 1]]
let SYM_U4 = new CubieCube()
SYM_U4.corners = SYM_U4_CORN
SYM_U4.edges = SYM_U4_EDGE

//CO of 3->5 means mirrored
//LR2 (mirror in the plane through UFDB centers)
const SYM_LR2_CORN = [[1,3], [0,3], [3,3], [2,3], [5,3], [4,3], [7,3], [6,3]]
const SYM_LR2_EDGE = [[2,0], [1,0], [0,0], [3,0], [6,0], [5,0], [4,0], [7,0], [9,0], [8,0], [11,0], [10,0]]
let SYM_LR2 = new CubieCube()
SYM_LR2.corners = SYM_LR2_CORN
SYM_LR2.edges = SYM_LR2_EDGE

const BASE_SYMS = [SYM_URF3, SYM_F2, SYM_U4, SYM_LR2]
let SYMS = []
let cube = new CubieCube()
for (var urf3 = 0; urf3 < 3; urf3++) {
    for (var f2 = 0; f2 < 2; f2++) {
        for (var u4 = 0; u4 < 4; u4++) {
            for (var l2 = 0; l2 < 2; l2++) {
                let refCube = new CubieCube()
                refCube.corners = cube.corners
                refCube.edges = cube.edges
                SYMS.push(refCube)
                cube.Multiply(SYM_LR2)
            }
            cube.Multiply(SYM_U4)
        }
        cube.Multiply(SYM_F2)
    }
    cube.Multiply(SYM_URF3)
}

//console.time("SYM INV creation")
let SYM_INV = new Array(48) //Every symmetry needs to be inverted after conjugated, returns index of inverse symmetry
const solved = new CubieCube()
for (var i = 0; i < 48; i++) {
    for (var j = 0; j < 48; j++) {
        let cube = new CubieCube()
        cube.MultiplyCorners(SYMS[i]) //Cube with the symmetry
        cube.MultiplyCorners(SYMS[j]) //Inverse sym being tested
        if (solved.MatchesCorners(cube)) {
            SYM_INV[i] = j
        }
    }
}
//console.timeEnd("SYM INV creation")

//console.time("Sym move generation")
let SYM_MOVE = new Array(48 * 18) //Each symmetry of each move
for (var move = 0; move < 18; move++) {
    for (var sym = 0; sym < 48; sym++) {
        let symMoveCube = new CubieCube()
        symMoveCube.Multiply(SYMS[sym])
        symMoveCube.Turn(move)
        symMoveCube.Multiply(SYMS[SYM_INV[sym]])
        SYM_MOVE[move * 48 + sym] = symMoveCube
    }
}
//console.timeEnd("Sym move generation")

//console.time("SYM MULT generation")
let SYM_MULT = new Array(48 * 48) //One symmetry multiplied by another
for (var s1 = 0; s1 < 48; s1++) {
    for (var s2 = 0; s2 < 48; s2++) {
        let symMultCube = new CubieCube()
        symMultCube.corners = SYMS[s1].corners
        symMultCube.MultiplyCorners(SYMS[s2])
        //Test this new state with every symmetry
        for (var testIndex = 0; testIndex < 48; testIndex++) {
            let testCube = { corners: SYMS[testIndex].corners }
            if (symMultCube.MatchesCorners(testCube)) {
                SYM_MULT[s1 * 48 + s2] = testIndex
                break
            }
        }
    }
}
//console.timeEnd("SYM MULT generation")

export { SYMS, SYM_INV, SYM_MOVE, SYM_MULT }