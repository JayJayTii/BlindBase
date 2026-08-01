import { useSettingsStore } from '@/stores/SettingsStore.js'
import { Sequence } from '@/helpers/sequence.js'

export const SolvingOrientationToTurns = [
	[],
	[['y', 1]],
	[['y', 2]],
	[['y', 3]],
	[['z', 2]],
	[['z', 2], ['y', 3]],
	[['z', 2], ['y', 2]],
	[['z', 2], ['y', 1]],
	[['x', 2], ['z', 1]],
	[['x', 3], ['z', 1]],
	[['x', 1], ['z', 1]],
	[['z', 1]],
	[['x', 2], ['z', 3]],
	[['x', 3], ['z', 3]],
	[['x', 1], ['z', 3]],
	[['z', 3]],
	[['x', 1], ['y', 3]],
	[['x', 1]],
	[['x', 1], ['y', 2]],
	[['x', 1], ['y', 1]],
	[['y', 3], ['z', 1]],
	[['x', 3], ['y', 2]],
	[['x', 3]],
	[['x', 3], ['y', 1]],
]

export function GetSolvingOrientationTurns() {
	let result = new Sequence()
	result.turns = SolvingOrientationToTurns[useSettingsStore().settings.solving_orientation]
	return result
}