import { defineStore } from "pinia";

const DEFAULT_SHEETS_PAIRORDER = [{ id: 0, name: "Row then column" }, { id: 1, name: "Column then row" }];
const DEFAULT_SHEETS = {pairOrder:{ name: "Letter pair order", value: 0 }};
export const useSettingsStore = defineStore("settingsStore", {
    state: () => {
        return {
            Sheets_PairOrders: DEFAULT_SHEETS_PAIRORDER,
            Sheets: [],
        };
    },
    actions: {
        saveState() {
            localStorage.setItem('settingsStore', JSON.stringify({
                Sheets: this.Sheets,
            }));
        },
        loadState() {
            this.Sheets_PairOrders = DEFAULT_SHEETS_PAIRORDER;
            try {
                const data = JSON.parse(localStorage.getItem('settingsStore'));
                this.Sheets = data.Sheets;
            }
            catch {
                this.Sheets = DEFAULT_SHEETS;
            }
        }
    },
    getters: {

    }
})