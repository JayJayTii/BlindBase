import { CubieCube } from "./CubieCube.js"

const CornOriMoveTable = new Array(2187 * 18).fill(-1) //Uses raw coords

function GenerateCornOriMoveTable() {
	let cube = new CubieCube()
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
}

export { CornOriMoveTable, GenerateCornOriMoveTable }