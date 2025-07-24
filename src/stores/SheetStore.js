import { defineStore } from "pinia";
import { useSettingsStore } from "./SettingsStore";

export function getSettingsStore() {
    return useSettingsStore();
}

const DEFAULT_SHEET_TYPES = [{ name: "None", id: 0 },{ name: "Corners", id: 1 }, { name: "Edges", id: 2 }, { name: "Images", id: 3 }];
const DEFAULT_SHEET_XHEADINGS = "ABCDEFGHIJKLMNOPQRSTUVWX";
const DEFAULT_SHEET_YHEADINGS = "ABCDEFGHIJKLMNOPQRSTUVWX";
//Always stored as top row: AA AB AC. down to bottom row: "XV XW XX" (Y axis then X axis).
const DEFAULT_SHEET_GRID = Array.from({ length: DEFAULT_SHEET_YHEADINGS.length }, () =>
    Array.from({ length: DEFAULT_SHEET_XHEADINGS.length }, () => "")
);

export const useSheetStore = defineStore("sheetStore", {
	state: () => {
        return {
            sheetTypes: DEFAULT_SHEET_TYPES,
            sheets: [],
		};
	},
    actions: {
        getNewSheetID() {
            const existingIDs = new Set(this.sheets.map(s => s.id));
            let newID = 1;
            while (existingIDs.has(newID)) {
                newID++;
            }
            return newID;
        },

        newSheet() {
            this.sheets.push({
                "name": "Untitled",
                "id": this.getNewSheetID(),
                "type": 0,
                "xHeadings": DEFAULT_SHEET_XHEADINGS,
                "yHeadings": DEFAULT_SHEET_YHEADINGS,
                "grid": { ...DEFAULT_SHEET_GRID },
            });

            this.saveState();
            this.loadState();
        },
        deleteSheet(index) { //Should only be allowed to delete at current sheet
            this.sheets.splice(index, 1);
            this.saveState();
            this.loadState();
        },
        isValidSheetIndex(index) {
            return index < this.sheets.length && index >= 0;
        },
        getXHeadings(sheetIndex) { //Headings stay the same no matter the pair order
            return this.sheets[sheetIndex].xHeadings.split(''); 
        },
        getYHeadings(sheetIndex) {
            return this.sheets[sheetIndex].yHeadings.split('');
        },

        getCell(sheetIndex, visualCellCoord) { //The sheetsview works in visual space (possibly flipped pair order)
            var gridCellCoord = { ...visualCellCoord };
            if (getSettingsStore().sheets_pairorder == 1) {
                gridCellCoord.x = visualCellCoord.y;
                gridCellCoord.y = visualCellCoord.x;
            }
            return this.sheets[sheetIndex]?.grid[gridCellCoord.y][gridCellCoord.x] || '';
        },
        setCell(sheetIndex, visualCellCoord, newValue) {
            var gridCellCoord = { ...visualCellCoord };
            if (getSettingsStore().sheets_pairorder == 1) {
                gridCellCoord.x = visualCellCoord.y;
                gridCellCoord.y = visualCellCoord.x;
            }
            try {
                this.sheets[sheetIndex].grid[gridCellCoord.y][gridCellCoord.x] = newValue;
                this.saveState();
            }
            catch {
                console.warn("Failed to save '" + newValue + "' to sheet " + sheetIndex + " at cell " + gridCellCoord.x + ", " + gridCellCoord.y);
            }
        },
        coordToKey(sheetIndex, coord) {
            let trueCoord = {...coord};
            if (getSettingsStore().sheets_pairorder == 1) {
                trueCoord.x = coord.y;
                trueCoord.y = coord.x;
            }
            return this.getXHeadings(sheetIndex)[trueCoord.x] +
                this.getYHeadings(sheetIndex)[trueCoord.y];
        },
        keyToCoord(sheetIndex, key) {
            if (getSettingsStore().sheets_pairorder == 1) {
                key = key.split('').reverse().join('');
            }
            return {
                x: this.getXHeadings(sheetIndex).indexOf(key[0]),
                y: this.getYHeadings(sheetIndex).indexOf(key[1])
            };
        },


        saveState() {
            localStorage.setItem('sheetStore', JSON.stringify({
                sheets: this.sheets
            }));
        },
        loadState() {
            try {
                const data = JSON.parse(localStorage.getItem('sheetStore'));
                this.sheets = data.sheets;
            }
            catch {
                this.sheets = [];
            }
        }
    },
    getters: {
        getSheetTypes: (state) => state.sheetTypes,
        getSheetNames: (state) => state.sheets.map(sheet => sheet.name),
    }
})