import { defineStore } from 'pinia'
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
            const existingIDs = new Set(this.sheets.map((s) => s.id))
            let newID = 1
            while (existingIDs.has(newID)) {
                newID++
            }
            return newID
        },

        newSheet() {
            this.sheets.push({
                name: 'Untitled',
                id: this.getNewSheetID(),
                type: 0,
                xHeadings: DEFAULT_SHEET_XHEADINGS,
                yHeadings: DEFAULT_SHEET_YHEADINGS,
                grid: { ...DEFAULT_SHEET_GRID },
            })

            this.saveState()
            this.loadState()
        },
        deleteSheet(id) {
            //Should only be allowed to delete at current sheet
            this.sheets.splice(this.getSheetIndexWithID(id), 1)
            this.saveState()
            this.loadState()
        },
        getSheetsOfType(type) {
            //Returns the whole sheet because why not
            return this.sheets.filter((sheet) => {
                //Ignore the sheet if it is empty
                var empty = true
                for (var x = 0; x < 24; x++) {
                    for (var y = 0; y < 24; y++) {
                        if (sheet.grid[y][x] !== '') {
                            empty = false
                            break
                        }
                    }
                    if (!empty) break
                }
                if (empty) return false
                return sheet.type === type
            })
        },
        isValidSheetID(id) {
            for (var i = 0; i < this.sheets.length; i++) {
                if (this.sheets[i].id === id) return true
            }
            return false
        },
        getXHeadings(id) {
            //Headings stay the same no matter the pair order
            return this.sheets[this.getSheetIndexWithID(id)].xHeadings.split('')
        },
        getYHeadings(id) {
            return this.sheets[this.getSheetIndexWithID(id)].yHeadings.split('')
        },
        getFilledCellCount(id) {
            const grid = this.sheets[this.getSheetIndexWithID(id)].grid
            const rows = Object.values(grid)
            return rows
                .reduce(function (a, b) {
                    return a.concat(b)
                })
                .filter((val) => val != '').length
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
        getCell(id, absoluteCoord) {
            return (
                this.sheets[this.getSheetIndexWithID(id)]?.grid[absoluteCoord.y][absoluteCoord.x] ||
                ''
            )
        },
        setCell(id, absoluteCoord, newValue) {
            try {
                this.sheets[this.getSheetIndexWithID(id)].grid[absoluteCoord.y][absoluteCoord.x] =
                    newValue
                this.saveState()
            } catch {
                console.warn(
                    "Failed to save '" +
                        newValue +
                        "' to sheet " +
                        sheetIndex +
                        ' at cell ' +
                        absoluteCoord.x +
                        ', ' +
                        absoluteCoord.y,
                )
            }
        },
        coordToKey(id, coord) {
            //Expect it to be already absolute
            return this.getXHeadings(id)[coord.x] + this.getYHeadings(id)[coord.y]
        },
        keyToCoord(id, key) {
            const sheetIndex = this.getSheetIndexWithID(id)
            if (getSettingsStore().sheets_pairorder == 1) {
                key = key.split('').reverse().join('')
            }
            return {
                x: this.getXHeadings(sheetIndex).indexOf(key[0]),
                y: this.getYHeadings(sheetIndex).indexOf(key[1]),
            }
        },
        absoluteToVisual(absoluteCoord) {
            var visualCoord = { ...absoluteCoord }
            if (getSettingsStore().sheets_pairorder == 1) {
                visualCoord.x = absoluteCoord.y
                visualCoord.y = absoluteCoord.x
            }
            return visualCoord
        },
        visualToAbsolute(visualCoord) {
            var absoluteCoord = { ...visualCoord }
            if (getSettingsStore().sheets_pairorder == 1) {
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
