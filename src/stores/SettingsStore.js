import { defineStore } from 'pinia'

//Data here is used in the Settings View
export const defaults = {
    sheets_pairorder: {
        name: 'Algsheet letter pair format',
        options: [{ id: 0, name: 'row-column' }, { id: 1, name: 'column-row' }],
        default: 0,
    },
    sheets_notationtype: {
        name: 'Notation Type',
        options: [{ id: 0, name: 'Algorithm notation' }, { id: 1, name: 'Commutator notation' }],
        default: 0,
    },
    cards_dailymaximumnewcards: {
        name: 'Daily new flashcards',
        default: 20,
        min: 1,
        max: 500,
    },
    memo_startingmemolength: {
        name: 'Starting length of memo',
        default: 4,
        min: 1,
        max: 20,
    },
    timer_spaceholdingtime: {
        name: 'Hold space down for ___ seconds',
        default: 0.3,
        min: 0,
        max: 2,
    },
    misc_widemovetype: {
        name: 'Wide move notation',
        default: 0,
        options: [{ id: 0, name: 'Rw' }, { id: 1, name: 'r' }],
    },
    misc_defaultcornerbuffer: {
        name: 'Default corner buffer',
        default: 2,
        options: [{ id: 0, name: "UBL" }, { id: 1, name: "UBR" }, { id: 2, name: "UFR" }, { id: 3, name: "UFL" }, { id: 4, name: "LUB" }, { id: 5, name: "LUF" }, { id: 6, name: "LDF" }, { id: 7, name: "LDB" }, { id: 8, name: "FUL" }, { id: 9, name: "FUR" }, { id: 10, name: "FDR" }, { id: 11, name: "FDL" }, { id: 12, name: "RUF" }, { id: 13, name: "RUB" }, { id: 14, name: "RDB" }, { id: 15, name: "RDF" }, { id: 16, name: "BUR" }, { id: 17, name: "BUL" }, { id: 18, name: "BDL" }, { id: 19, name: "BDR" }, { id: 20, name: "DFL" }, { id: 21, name: "DFR" }, { id: 22, name: "DBR" }, { id: 23, name: "DBL" }]
    },
    misc_defaultedgebuffer: {
        name: 'Default edge buffer',
        default: 2,
        options: [{ id: 0, name: "UB" }, { id: 1, name: "UR" }, { id: 2, name: "UF" }, { id: 3, name: "UL" }, { id: 4, name: "LU" }, { id: 5, name: "LF" }, { id: 6, name: "LD" }, { id: 7, name: "LB" }, { id: 8, name: "FU" }, { id: 9, name: "FR" }, { id: 10, name: "FD" }, { id: 11, name: "FL" }, { id: 12, name: "RU" }, { id: 13, name: "RB" }, { id: 14, name: "RD" }, { id: 15, name: "RF" }, { id: 16, name: "BU" }, { id: 17, name: "BL" }, { id: 18, name: "BD" }, { id: 19, name: "BR" }, { id: 20, name: "DF" }, { id: 21, name: "DR" }, { id: 22, name: "DB" }, { id: 23, name: "DL" }]
    },
    misc_theme: {
        name: 'Theme',
        default: 0,
        options: [{ id: 0, name: "Light" }, {id: 1, name: "Dark"}]
    },
}

export const useSettingsStore = defineStore('settingsStore', {
    state: () => {
        return {}
    },
    actions: {
        ValidateValues(data) {
            const out = { ...data }
            //Fill in any missing settings with defaults
            for (const [key, value] of Object.entries(defaults)) {
                if (!(out.hasOwnProperty(key)))
                    out[key] = value.default
                else {
                    //Bound any number values
                    if (defaults[key].hasOwnProperty("min") && out[key] < defaults[key].min)
                        out[key] = defaults[key].min
                    if (defaults[key].hasOwnProperty("max") && out[key] > defaults[key].max)
                        out[key] = defaults[key].max
                }
            }
            return out
        },

        saveState() {
            this.settings = this.ValidateValues(this.settings)
            localStorage.setItem(
                'settingsStore',
                JSON.stringify({
                    settings: this.settings
                }),
            )
        },
        loadState() {
            const data = JSON.parse(localStorage.getItem('settingsStore')) || {settings: {}}
            if (!data.hasOwnProperty("settings"))
                data.settings = {}
            
            this.settings = this.ValidateValues(data.settings)
            this.saveState()

            if(this.settings.misc_theme == 1)
                document.documentElement.classList.add('dark')
        },
        loadIfNecessary() {
            if (this.data != {})
                return
            this.loadState()
        }
    },
})
