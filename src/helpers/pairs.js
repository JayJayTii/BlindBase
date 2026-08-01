import { scheme } from '@/stores/SettingsStore'
import { adjacentCornerStickers, adjacentEdgeStickers } from '@/helpers/stickers.js'

export function getAllLetterPairs(mode = "") {
	var letters = []
	if (mode == "Corners") { // Use just corner letters
		letters = scheme().slice(0, 24)
	} else if (mode == "Edges") { // Use just edge letters
		letters = scheme().slice(24, 48)
	} else {
		const cornerLetters = scheme().slice(0, 24)
		const edgeLetters = scheme().slice(24, 48)
		letters = [...new Set([...cornerLetters, ...edgeLetters])]
	}
	const pairs = []
	for (var i = 0; i < letters.length; i++) {
		for (var j = 0; j < letters.length; j++) {
			pairs.push(letters[i] + letters[j])
		}
	}
	return pairs
}
export function isPossiblePair(pieceType, pair, buffer) {
	//pieceType: 1 for corners, 2 for edges
	//Buffer is 0-23 following speffz
	//Pair is "AB" for example
	if (buffer < 0 || buffer > 23)
		return false

	if (pieceType == 2)
		buffer += 24

	switch (pieceType) {
		case 1:
			//Skip if contains buffer sticker
			//Skip if second letter is on first letter's cubie
			return !(adjacentCornerStickers(scheme()[buffer]).includes(pair[0]) || adjacentCornerStickers(scheme()[buffer]).includes(pair[1])
						|| adjacentCornerStickers(pair[0]).includes(pair[1]))
		case 2:
			//Skip if contains buffer sticker
			//Skip if second letter is on first letter's cubie
			return !(adjacentEdgeStickers(scheme()[buffer]).includes(pair[0])
				|| adjacentEdgeStickers(scheme()[buffer]).includes(pair[1])
				|| adjacentEdgeStickers(pair[0]).includes(pair[1]))
		default:
			return false
	}
}