import { defineStore } from "pinia";

const SHEETS_PAIRORDER = {
    name: "Letter pair order",
    options: [
        { id: 0, name: "Row then column" },
        { id: 1, name: "Column then row" }],
};

const DEFAULT_SHEETS_PAIRORDER = 0;
export const useSettingsStore = defineStore("settingsStore", {
    state: () => {
        return {
            sheets_pairorder_definition: SHEETS_PAIRORDER,
            sheets_pairorder: DEFAULT_SHEETS_PAIRORDER,
        };
    },
    actions: {
        saveState() {
            localStorage.setItem('settingsStore', JSON.stringify({
                sheets_pairorder: this.sheets_pairorder,
            }));
        },
        loadState() {
            try {
                const data = JSON.parse(localStorage.getItem('settingsStore'));
                this.sheets_pairorder = data.sheets_pairorder;
            }
            catch {

            }
        }
    },
})