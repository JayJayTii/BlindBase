import { defineStore } from "pinia";

const DEFAULT_SHEET_TYPES = ["Corners", "Edges", "Images", "None"];

export const useSheetStore = defineStore("sheetStore", {
	state: () => {
        return {
            sheetTypes: DEFAULT_SHEET_TYPES,
            sheets: [],
            curSheetIndex: 0,
		};
	},
    actions: {
        newSheet() {
            this.sheets.push({ "name": "Untitled" });
            this.curSheetIndex = this.sheets.length - 1;
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