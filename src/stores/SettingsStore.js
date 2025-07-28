import { defineStore } from "pinia";

const SHEETS_PAIRORDER = {
    name: "Letter pair order",
    options: [
        { id: 0, name: "Row then column" },
        { id: 1, name: "Column then row" }],
    default: 0,
};
const SHEETS_NOTATIONTYPE = {
    name: "Notation Type",
    options: [
        { id: 0, name: "Algorithm notation" },
        { id: 1, name: "Commutator notation" }],
    default: 0,
};
const SHEETS_EXTRAXIMAGES = {
    name: "Include sh/ch in X images",
    default: true,
};

export const useSettingsStore = defineStore("settingsStore", {
    state: () => {
        return {
            sheets_pairorder_definition: SHEETS_PAIRORDER,
            sheets_pairorder: SHEETS_PAIRORDER.default,
            sheets_notationtype_definition: SHEETS_NOTATIONTYPE,
            sheets_notationtype: SHEETS_NOTATIONTYPE.default,
            sheets_extraximages_definition: SHEETS_EXTRAXIMAGES,
            sheets_extraximages: SHEETS_EXTRAXIMAGES.default,
        };
    },
    actions: {
        saveState() {
            localStorage.setItem('settingsStore', JSON.stringify({
                sheets_pairorder: this.sheets_pairorder,
                sheets_notationtype: this.sheets_notationtype,
                sheets_extraximages: this.sheets_extraximages,
            }));
        },
        loadState() {
            try {
                const data = JSON.parse(localStorage.getItem('settingsStore'));
                this.sheets_pairorder = data.sheets_pairorder;
                this.sheets_notationtype = data.sheets_notationtype;
                this.sheets_extraximages = data.sheets_extraximages;
            }
            catch {
            }
        }
    },
})