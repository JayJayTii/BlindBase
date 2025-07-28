//This should be the only file which works with chichu
import cornerData from "../assets/recommendations/cornerManmade_formatted.json"
import edgeData from "../assets/recommendations/edgeManmade_formatted.json"
import imageData from "../assets/recommendations/imageRecommendations.json"
import { useSettingsStore } from "../stores/SettingsStore";

export function getSettingsStore() {
	return useSettingsStore();
}


export function getRecommendations(sheetType, key) {
	if (sheetType == 0) //No sheet type, no recommendations
		return [];
	if(sheetType == 1) //Corners
		return getCornerRecommendations(key);
	if (sheetType == 2) //Edges
		return getEdgeRecommendations(key);
	if (sheetType == 3) //Images
		return getImageRecommendations(key);
}

function getEquivalentCornerComms(key) {
	const cycled = [key, key[2] + key[0] + key[1], key[1] + key[2] + key[0]];
	let output = [];
    for (let cycle of cycled) {
		for (var j = 0; j < 3; j++) { //How many times we rotate each sticker around its corner
			let rotation = "";
			for (var i = 0; i < 3; i++) {//Index cycle
				let letter = cycle[i];
				rotation += adjacentCornerStickers[letter][j];
			}
			output.push(rotation);
        }
    }
	return output;
}
function getEquivalentEdgeComms(key) {
	const cycled = [key, key[2] + key[0] + key[1], key[1] + key[2] + key[0]];
	let output = [];
	for (let cycle of cycled) { //For each cycle of the base key
		for (var j = 0; j < 2; j++) { //For each inversion of that cycle around the edge piece
			let rotation = "";
			for (var i = 0; i < 3; i++) {//For each letter of that inversion
				let letter = cycle[i];
				rotation += adjacentEdgeStickers[letter][j];
			}
			output.push(rotation);
		}
	}
	return output;
}

function getCornerRecommendations(baseKey) {
	baseKey = "C" + baseKey;
	const equivalentKeys = getEquivalentCornerComms(baseKey);
	let allComms = [];
	for (var key of equivalentKeys) {
		if (!cornerData[key])
			continue;

		//Each of these equivalent keys could have multiple algs
		for (var alg of cornerData[key]) {
			allComms.push(alg[0]);
		}
	}
	return allComms;
}
function getEdgeRecommendations(baseKey) {
	const notation = getSettingsStore().sheets_notationtype;
	baseKey = "C" + baseKey;
	const equivalentKeys = getEquivalentEdgeComms(baseKey);
	let allComms = [];
	for (var key of equivalentKeys) {
		if (!edgeData[key])
			continue;

		//Each of these equivalent keys could have multiple algs
		for (var alg of edgeData[key]) {
			allComms.push(alg[notation]);
		}
	}
	return allComms;
}

function getImageRecommendations(baseKey) {
	let result = imageData[baseKey]
	if (!(baseKey.includes("X") && getSettingsStore().sheets_extraximages == true))
		return result;

	if (baseKey[0] == "X") {
		result = result.concat(imageData["ʧ" + baseKey[1]]);
	}
	if (baseKey[1] == "X") {
		result = result.concat(imageData[baseKey[0] + "ʧ"]);
	}
	if (baseKey == "XX") {
		result = result.concat(imageData["ʧʧ"]);
    }

	return result;
}

//These should maybe go in a rubik's cube script or something instead
//Connects a corner sticker to all stickers on the piece that it is on (in clockwise direction)
const adjacentCornerStickers = {
	'A': ['A', 'E', 'R'],
	'B': ['B', 'Q', 'N'],
	'C': ['C', 'M', 'J'],
	'D': ['D', 'I', 'F'],
	'E': ['E', 'R', 'A'],
	'F': ['F', 'D', 'I'],
	'G': ['G', 'L', 'U'],
	'H': ['H', 'X', 'S'],
	'I': ['I', 'F', 'D'],
	'J': ['J', 'C', 'M'],
	'K': ['K', 'P', 'V'],
	'L': ['L', 'U', 'G'],
	'M': ['M', 'J', 'C'],
	'N': ['N', 'B', 'Q'],
	'O': ['O', 'T', 'W'],
	'P': ['P', 'V', 'K'],
	'Q': ['Q', 'N', 'B'],
	'R': ['R', 'A', 'E'],
	'S': ['S', 'H', 'X'],
	'T': ['T', 'W', 'O'],
	'U': ['U', 'G', 'L'],
	'V': ['V', 'K', 'P'],
	'W': ['W', 'O', 'T'],
	'X': ['X', 'S', 'H']
}
//Connects a edge sticker to all stickers on the piece that it is on
const adjacentEdgeStickers = {
	'A': ['A', 'Q'],
	'B': ['B', 'M'],
	'C': ['C', 'I'],
	'D': ['D', 'E'],
	'E': ['E', 'D'],
	'F': ['F', 'L'],
	'G': ['G', 'X'],
	'H': ['H', 'R'],
	'I': ['I', 'C'],
	'J': ['J', 'P'],
	'K': ['K', 'U'],
	'L': ['L', 'F'],
	'M': ['M', 'B'],
	'N': ['N', 'T'],
	'O': ['O', 'V'],
	'P': ['P', 'J'],
	'Q': ['Q', 'A'],
	'R': ['R', 'H'],
	'S': ['S', 'W'],
	'T': ['T', 'N'],
	'U': ['U', 'K'],
	'V': ['V', 'O'],
	'W': ['W', 'S'],
	'X': ['X', 'G']
}
