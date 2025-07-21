import { defineStore } from "pinia";

const DEFAULT_SHEET_TYPES = ["Corners", "Edges", "Images", "None"];

export const useSheetStore = defineStore("sheetStore", {
	state: () => {
        return {
            sheetTypes: DEFAULT_SHEET_TYPES,
			sheets: [],
		};
	},
    actions: {
        saveState() {
            localStorage.setItem('sheetStore', JSON.stringify({
                sheets: this.sheets
            }));
        },
        loadState() {
            const data = JSON.parse(localStorage.getItem('sheetStore'));
            if (data) {
                this.sheets = data.sheets || [];
            }
        }
    },
    getters: {
        getSheetTypes: (state) => state.sheetTypes,
    }
})