import { defineStore } from "pinia";

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
                "xHeadings":DEFAULT_SHEET_XHEADINGS,
                "yHeadings":DEFAULT_SHEET_YHEADINGS,
                "grid":DEFAULT_SHEET_GRID,
            });

            this.saveState();
        },
        deleteSheet(index) { //Should only be allowed to delete at current sheet
            this.sheets.splice(index, 1);
            this.saveState();
        },
        isValidSheetIndex(index) {
            return index < this.sheets.length && index >= 0;
        },
        getVisualXHeadings(sheetIndex) {
            return this.sheets[sheetIndex].xHeadings.split(''); //For the future when pair order swapping is done
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