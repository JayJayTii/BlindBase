import { computed } from 'vue'
import { useSettingsStore } from '.././stores/SettingsStore'
 
//Converting the 0-23 format to UBL format
export const cornerBuffers = ["UBL", "UBR", "UFR", "UFL", "LUB", "LUF", "LDF", "LDB", "FUL", "FUR", "FDR", "FDL", "RUF", "RUB", "RDB", "RDF", "BUR", "BUL", "BDL", "BDR", "DFL", "DFR", "DBR", "DBL"]
export const edgeBuffers = ["UB", "UR", "UF", "UL", "LU", "LF", "LD", "LB", "FU", "FR", "FD", "FL", "RU", "RB", "RD", "RF", "BU", "BL", "BD", "BR", "DF", "DR", "DB", "DL"]

//This is the 0-23 format converted to speffz
export const speffzScheme = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X"]

export function SchemeIncludes(letter, isEdge) {
	if (!isEdge) {
		for (var i = 0; i < 24; i++) {
			if (useSettingsStore().settings.lettering_scheme[i] == letter)
				return true
		}
	} else {
		for (var i = 24; i < 48; i++) {
			if (useSettingsStore().settings.lettering_scheme[i] == letter)
				return true
		}
	}
	return false
}

const AlphabetisedCornerScheme = computed({ get: () => { return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').filter(letter => SchemeIncludes(letter, false)) } })
const AlphabetisedEdgeScheme = computed({ get: () => { return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').filter(letter => SchemeIncludes(letter, true)) } })
export function AlphabetisedScheme(sheetType) {
	if (sheetType == 1) // Corners
		return AlphabetisedCornerScheme.value
	else if (sheetType == 2) // Edges
		return AlphabetisedEdgeScheme.value

	return speffzScheme
}

export function GridIndexToSpeffzIndex(sheetType) {
	return Array.from({ length: 24 }, (_, i) => {
		if (sheetType == 1) // Corners
			return useSettingsStore().settings.lettering_scheme.indexOf(AlphabetisedScheme(1)[i])
		else if (sheetType == 2) // Edges
			return useSettingsStore().settings.lettering_scheme.slice(24, 48).indexOf(AlphabetisedScheme(2)[i])

		return i
	})
}

// Where 0 means UB and it becomes [whatever UB is in the lettering scheme]
export function SpeffzIndexToScheme(index, isEdge) {
	return useSettingsStore().settings.lettering_scheme[index + (isEdge ? 24 : 0)]
}

// Where A becomes [whatever UB is in the lettering scheme]
export function SpeffzToScheme(speffz, isEdge) {
	return useSettingsStore().settings.lettering_scheme[speffzScheme.indexOf(speffz) + (isEdge ? 24 : 0)]
}

// Where [whatever UB is in the lettering scheme] becomes 0
export function SchemeToSpeffzIndex(scheme, isEdge) {
	if (!isEdge) {
		for (var i = 0; i < 24; i++) {
			if (useSettingsStore().settings.lettering_scheme[i] == scheme)
				return i
		}
	} else {
		for (var i = 24; i < 48; i++) {
			if (useSettingsStore().settings.lettering_scheme[i] == scheme)
				return i - 24
		}
	}
	return -1
}

// Where [whatever UB is in the lettering scheme] becomes A
export function SchemeToSpeffz(scheme, isEdge) {
	if (!isEdge) {
		for (var i = 0; i < 24; i++) {
			if (useSettingsStore().settings.lettering_scheme[i] == scheme)
				return speffzScheme[i]
		}
	} else {
		for (var i = 24; i < 48; i++) {
			if (useSettingsStore().settings.lettering_scheme[i] == scheme)
				return speffzScheme[i - 24]
		}
	}
	return "-"
}

// Where A becomes 0
export function SpeffzToSpeffzIndex(speffz) {
	return speffzScheme.indexOf(speffz)
}

// Where 0 becomes A
export function SpeffzIndexToSpeffz(index) {
	return speffzScheme[index]
}