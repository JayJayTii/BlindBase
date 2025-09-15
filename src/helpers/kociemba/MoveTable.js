import { CubieCube } from "./CubieCube.js"
import { WriteToDatabase, FetchFromDatabase } from "@/helpers/indexedDB.js"

let CornOriMove = new Array(2187 * 18) //Uses raw coords
let CornPermMove = new Array(40320 * 18) //Uses raw coords
let EdgeOriMove = new Array(2048 * 18) //Uses raw coords
let FUSMove = new Array(64430 * 18) //Flip UD-slice, uses sym coords

async function GenerateCornOriMove() {
	try {
		CornOriMove = await FetchFromDatabase("CornOriMove")

		if (CornOriMove !== undefined) {
			//console.log("Already cached CornOriMove, skipping...")
			return
		}
	} catch (error) {
		console.error("Error fetching data:", error)
	}
	CornOriMove = new Array(2187 * 18)

	let cube = new CubieCube()
    for (var CornOri = 0; CornOri < 2187; CornOri++) {
		cube.SetCornOriCoord(CornOri)
		for (var face = 0; face < 6; face++) {
			for (var turn = 0; turn < 4; turn++) { //Turn the cube 4 times to put it back to normal by end
				cube.TurnCorners(3 * face)
				if (turn < 3) {
					const moveIndex = 3 * face + turn
					CornOriMove[CornOri * 18 + moveIndex] = cube.CornOriCoord()
				}
            }
        }
	}

	WriteToDatabase("CornOriMove", CornOriMove)
}
async function GenerateCornPermMove() {
	try {
		CornPermMove = await FetchFromDatabase("CornPermMove")

		if (CornPermMove !== undefined) {
			//console.log("Already cached CornPermMove, skipping...")
			return
		}
	} catch (error) {
		console.error("Error fetching data:", error)
	}

	CornPermMove = new Array(40320 * 18)
	let cube = new CubieCube()
	for (var CornPerm = 0; CornPerm < 40320; CornPerm++) {
		cube.SetCornPermCoord(CornPerm)
		for (var face = 0; face < 6; face++) {
			for (var turn = 0; turn < 4; turn++) { //Turn the cube 4 times to put it back to normal by end
				cube.TurnCorners(3 * face)
				if (turn < 3) {
					const moveIndex = 3 * face + turn
					CornPermMove[CornPerm * 18 + moveIndex] = cube.CornPermCoord()

				}
			}
		}
	}
	WriteToDatabase("CornPermMove", CornPermMove)
}

async function GenerateEdgeOriMove() {
	try {
		EdgeOriMove = await FetchFromDatabase("EdgeOriMove")

		if (EdgeOriMove !== undefined) {
			//console.log("Already cached EdgeOriMove, skipping...")
			return
		}
	} catch (error) {
		console.error("Error fetching data:", error)
	}

	EdgeOriMove = new Array(2048 * 18)
	let cube = new CubieCube()
	for (var EdgeOri = 0; EdgeOri < 2048; EdgeOri++) {
		cube.SetEdgeOriCoord(EdgeOri)
		for (var face = 0; face < 6; face++) {
			for (var turn = 0; turn < 4; turn++) { //Turn the cube 4 times to put it back to normal by end
				cube.TurnEdges(3 * face)
				if (turn < 3) {
					const moveIndex = 3 * face + turn
					EdgeOriMove[EdgeOri * 18 + moveIndex] = cube.EdgeOriCoord()
				}
			}
		}
	}

	WriteToDatabase("EdgeOriMove", EdgeOriMove)
}

export { CornOriMove, GenerateCornOriMove, CornPermMove, GenerateCornPermMove, EdgeOriMove, GenerateEdgeOriMove }