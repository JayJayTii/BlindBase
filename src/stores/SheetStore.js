import { defineStore } from 'pinia'
import { isEmpty, getXHeadings, getYHeadings } from '@/helpers/sheets.js'
import { useSettingsStore } from './SettingsStore'

export function getSettingsStore() {
    return useSettingsStore()
}

const DEFAULT_SHEET_TYPES = [
    { name: 'None', id: 0 },
    { name: 'Corners', id: 1 },
    { name: 'Edges', id: 2 },
    { name: 'Images', id: 3 },
]
const DEFAULT_SHEET_XHEADINGS = 'ABCDEFGHIJKLMNOPQRSTUVWX'
const DEFAULT_SHEET_YHEADINGS = 'ABCDEFGHIJKLMNOPQRSTUVWX'
//Always stored as top row: AA AB AC. down to bottom row: "XV XW XX" (Y axis then X axis).
const DEFAULT_SHEET_GRID = Array.from({ length: DEFAULT_SHEET_YHEADINGS.length }, () =>
    Array.from({ length: DEFAULT_SHEET_XHEADINGS.length }, () => ''),
)

export const useSheetStore = defineStore('sheetStore', {
    state: () => {
        return {
            sheetTypes: DEFAULT_SHEET_TYPES,
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
            this.sheets.push({
                name: 'Untitled',
                id: this.getNewSheetID(),
                type: 0,
                xHeadings: DEFAULT_SHEET_XHEADINGS,
                yHeadings: DEFAULT_SHEET_YHEADINGS,
                grid: JSON.parse(JSON.stringify(DEFAULT_SHEET_GRID)),
            })

            this.saveState()
            this.loadState()
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
        getFilledCellCount(id) {
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
        getCell(id, coord) {
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

        //Key is AA, coord is { x: 0, y: 0 }
        coordToKey(id, coord) {
            if (!this.isValidSheetID(id))
                return ''
            const sheet = this.getSheet(id)
            return getXHeadings(sheet)[coord.x] + getYHeadings(sheet)[coord.y]
        },
        keyToCoord(id, key) {
            const sheet = this.getSheet(id)
            return {
                x: getXHeadings(sheet).indexOf(key[0]),
                y: getYHeadings(sheet).indexOf(key[1]),
            }
        },

        //Absolute coords are the actual place in the stored alg-sheet object
        //Visual coords take into account the setting for "Letter Pair Order", so the rows and columns could be swapped
        //Coord conversions are duplicated for clarity
        absoluteToVisual(absoluteCoord) {
            var visualCoord = { ...absoluteCoord }
            if (getSettingsStore().settings.sheets_pairorder == 1) {
                visualCoord.x = absoluteCoord.y
                visualCoord.y = absoluteCoord.x
            }
            return visualCoord
        },
        visualToAbsolute(visualCoord) {
            var absoluteCoord = { ...visualCoord }
            if (getSettingsStore().settings.sheets_pairorder == 1) {
                absoluteCoord.x = visualCoord.y
                absoluteCoord.y = visualCoord.x
            }
            return absoluteCoord
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
            try {
                const data = JSON.parse(localStorage.getItem('sheetStore'))
                this.sheets = data.sheets
            } catch {
                this.sheets = []
            }
        },
    },
    getters: {
        getSheetTypes: (state) => state.sheetTypes,
        getSheetNames: (state) => state.sheets.map((sheet) => sheet.name),
    },
})
