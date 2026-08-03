import { defineStore } from 'pinia'
import { isEmpty } from '@/helpers/sheets.js'
import { speffzScheme, SpeffzToSpeffzIndex, SchemeToSpeffzIndex } from '@/helpers/lettering_scheme.js'
import { scheme } from './SettingsStore'

export const sheet_types = [
	{ name: 'None', id: 0 },
	{ name: 'Corners', id: 1 },
	{ name: 'Edges', id: 2 },
	{ name: 'Images', id: 3 },
]

//Always stored as top row: AA AB AC. down to bottom row: "XV XW XX" (Y axis then X axis).
const DEFAULT_SHEET_GRID = Array.from({ length: 24 }, () => Array.from({ length: 24 }, () => ''))

export const useSheetStore = defineStore('sheetStore', {
	state: () => {
		return {
			sheets: [],
		}
	},
	actions: {
		getNewSheetID() {
			//Every sheet has a unique ID so that the names can be the same
			//Consider making it a big random number? Currently a new ID can be created that has been used before
			//which means things like reconStore saving preferred algsheet ID will be wrong
			const existingIDs = new Set(this.sheets.map((s) => s.id))
			let newID = 1
			while (existingIDs.has(newID)) {
				newID++
			}
			return newID
		},

		newSheet() {
			//Create a default sheet
			const newID = this.getNewSheetID()
			this.sheets.push({
				name: 'Untitled',
				id: newID,
				type: 0,
				buffer: 2,
				grid: JSON.parse(JSON.stringify(DEFAULT_SHEET_GRID)),
			})

			this.saveState()
			this.loadState()

			return newID
		},
		deleteSheet(id) {
			//Removes the sheet at its index in the array, then saves the change
			this.sheets.splice(this.getSheetIndexWithID(id), 1)
			this.saveState()
			this.loadState()
		},
		getSheetsOfType(type) {
			return this.sheets.filter((sheet) => {
				//Ignore the sheet if it is empty
				return sheet.type === type && !isEmpty(sheet)
			})
		},
		isValidSheetID(id) {
			//Checks if a sheet with that ID exists
			for (var i = 0; i < this.sheets.length; i++) {
				if (this.sheets[i].id === id) return true
			}
			return false
		},
		getType(id) {
			for (var i = 0; i < this.sheets.length; i++) {
				if (this.sheets[i].id === id) return this.sheets[i].type
			}
			return -1
		},
		getBuffer(id) {
			for (var i = 0; i < this.sheets.length; i++) {
				if (this.sheets[i].id === id) return this.sheets[i].buffer
			}
			return -1
		},

		getFilledCellCount(id) {
			if (!id || !this.isValidSheetID(id))
				return 0
			const grid = this.sheets[this.getSheetIndexWithID(id)].grid
			const rows = Object.values(grid)
			return rows.reduce(function (a, b) {
				return a.concat(b)
			}).filter((val) => val != '').length
		},

		getSheetIndexWithID(id) {
			for (var i = 0; i < this.sheets.length; i++) {
				if (this.sheets[i].id === id) return i
			}
			return -1
		},

		getSheet(id) {
			for (var i = 0; i < this.sheets.length; i++) {
				if (this.sheets[i].id === id) return this.sheets[i]
			}
			return null
		},
		getName(id) {
			for (var i = 0; i < this.sheets.length; i++) {
				if (this.sheets[i].id === id) return this.sheets[i].name
			}
			return ''
		},
		getCell(id, coord) {
			if (coord.x < 0 || coord.y < 0)
				return ''
			return this.sheets[this.getSheetIndexWithID(id)]?.grid[coord.y][coord.x] || ''
		},
		setCell(id, coord, newValue) {
			try {
				this.sheets[this.getSheetIndexWithID(id)].grid[coord.y][coord.x] = newValue
				this.saveState()
			} catch {
				console.warn("Failed to save '" + newValue + "' to sheet " + id.toString() + ' at cell ' + coord.x.toString() + ', ' + coord.y.toString())
			}
		},

		//Key is AA (with speffz), coord is { x: 0, y: 0 }
		coordToKey(id, coord) {
			if (!this.isValidSheetID(id) || coord.x < 0 || coord.x > 23 || coord.y < 0 || coord.y > 23)
				return ''
			const sheet = this.getSheet(id)
			if(sheet.type == 1) // Corners
				return scheme()[coord.y] + scheme()[coord.x]
			else if (sheet.type == 2) // Edges
				return scheme()[24 + coord.y] + scheme()[24 + coord.x]
			else
				return speffzScheme[coord.y] + speffzScheme[coord.x]
		},
		keyToCoord(id, key) {
			const sheet = this.getSheet(id)
			if(sheet.type == 1) // Corners
				return { x: SchemeToSpeffzIndex(key[1], false), y: SchemeToSpeffzIndex(key[0], false) }
			else if (sheet.type == 2) // Edges
				return { x: SchemeToSpeffzIndex(key[1], true), y: SchemeToSpeffzIndex(key[0], true) }
			else
				return { x: SpeffzToSpeffzIndex(key[1]), y: SpeffzToSpeffzIndex(key[0]) }
		},

		updateSheets() {
			for (var i = 0; i < this.sheets.length; i++) {
				if (!this.sheets[i].hasOwnProperty("buffer"))
					this.sheets[i].buffer = 2
			}
			this.saveState()
		},

		saveState() {
			localStorage.setItem(
				'sheetStore',
				JSON.stringify({
					sheets: this.sheets,
				}),
			)
		},
		loadState() {
			const data = JSON.parse(localStorage.getItem('sheetStore')) || {}
			this.sheets = data.sheets || []
			this.updateSheets()
		},
	},
})
