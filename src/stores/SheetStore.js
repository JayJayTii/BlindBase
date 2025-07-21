import { defineStore } from "pinia";

export const useSheetStore = defineStore("sheetStore", {
	state: () => {
		return {
            sheetTypes: [ "Corners", "Edges", "Images"],
			sheets: [],
		};
	},
    actions: {
        addSheetType(newType) {
            this.sheetTypes.push(newType);
            this.saveState();
        },

        saveState() {
            localStorage.setItem('sheetStore', JSON.stringify({
                sheetTypes: this.sheetTypes,
                sheets: this.sheets
            }));
        },
        loadState() {
            const data = JSON.parse(localStorage.getItem('sheetStore'));
            if (data) {
                this.sheetTypes = data.sheetTypes || [];
                this.sheets = data.sheets || [];
            }
        }
    },
    getters: {
        getSheetTypes: (state) => state.sheetTypes,

    }
})