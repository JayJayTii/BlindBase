import { Sequence } from '@/helpers/sequence.js'
import { useSettingsStore } from '../stores/SettingsStore'

const turns = ['R','F','U','L','B','D']

export class Scramble extends Sequence {
	constructor(length) {
		super()

		//Add random turns until it reaches the length
		//Must use an uncounted loop because turns can collapse
		while (this.turns.length < length) {
			this.add([turns[Math.floor(Math.random() * turns.length)], Math.floor(Math.random() * 3) + 1])
		}
	}
}

export function get3BLDscramble() {
	//First create a normal scramble
	const scrambleSequence = new Scramble(20)

	//Then add a random number of wide moves to move the centers around
	const wideMoves = ['r', 'u', 'f']
	for (var i = 0; i < Math.floor(3 * Math.random()); i++) {
		scrambleSequence.add([wideMoves[Math.floor(3 * Math.random())], 1 + Math.floor(3 * Math.random())])
	}
	let scrambleStr = scrambleSequence.toString()
	if (useSettingsStore().settings.misc_widemovetype == 0)
		scrambleStr = scrambleStr.replace(/[rufldb]/g, match => match.toUpperCase() + "w")
	return scrambleStr
}