import { Sequence } from '@/helpers/sequence.js'

const turns = ['R','F','U','L','B','D']

export class Scramble extends Sequence{
	constructor(length) {
		super()

		//Add random turns until it reaches the length
		//Must use an uncounted loop because turns can collapse
		while (this.turns.length < length) {
			this.add([turns[Math.floor(Math.random() * turns.length)], Math.floor(Math.random() * 3) + 1])
		}
	}
}