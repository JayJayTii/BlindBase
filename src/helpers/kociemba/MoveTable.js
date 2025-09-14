import { CubieCube } from "./CubieCube.js"

const CornOriMoveTable = new Array(2187 * 18).fill(-1) //Uses raw coords
const EdgeOriMoveTable = new Array(2048 * 18).fill(-1) //Uses raw coords

function GenerateCornOriMoveTable() {
	let cube = new CubieCube()
	console.time("GenerateCornOriMove")
    for (var CornOri = 0; CornOri < 2187; CornOri++) {
		cube.SetCornOriCoord(CornOri)
		for (var face = 0; face < 6; face++) {
			for (var turn = 0; turn < 4; turn++) { //Turn the cube 4 times to put it back to normal by end
				cube.Turn(3 * face)
				if (turn < 3) {
					const moveIndex = 3 * face + turn
					CornOriMoveTable[CornOri * 18 + moveIndex] = cube.CornOriCoord()
				}
            }
        }
	}
	console.timeEnd("GenerateCornOriMove")
}

function GenerateEdgeOriMoveTable() {
	let cube = new CubieCube()
	console.time("GenerateEdgeOriMove")
	for (var EdgeOri = 0; EdgeOri < 2048; EdgeOri++) {
		cube.SetEdgeOriCoord(EdgeOri)
		for (var face = 0; face < 6; face++) {
			for (var turn = 0; turn < 4; turn++) { //Turn the cube 4 times to put it back to normal by end
				cube.Turn(3 * face)
				if (turn < 3) {
					const moveIndex = 3 * face + turn
					EdgeOriMoveTable[EdgeOri * 18 + moveIndex] = cube.EdgeOriCoord()
				}
			}
		}
	}
	console.timeEnd("GenerateEdgeOriMove")
}

function TestEdgeOriMoveTable() {
	let testCube = new CubieCube()
	for (var i = 0; i < 2048; i++) {
		for (var move = 0; move < 18; move++) {
			testCube.SetEdgeOriCoord(i)
			const shouldBe = EdgeOriMoveTable[testCube.EdgeOriCoord() * 18 + move]
			testCube.Turn(move)
			if (testCube.EdgeOriCoord() !== shouldBe)
				console.log("Wrong for EO " + testCube.EdgeOriCoord() + " move " + move)
		}
	}
	console.log("Finished testing edge ori move table")
}

export { CornOriMoveTable, GenerateCornOriMoveTable, EdgeOriMoveTable, GenerateEdgeOriMoveTable }