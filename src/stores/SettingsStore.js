import { defineStore } from 'pinia'

export const defaults = {
    sheets_pairorder: {
        name: 'Letter pair order',
        options: [{ id: 0, name: 'Row then column' }, { id: 1, name: 'Column then row' }],
        default: 0,
    },
    sheets_notationtype: {
        name: 'Notation Type',
        options: [{ id: 0, name: 'Algorithm notation' }, { id: 1, name: 'Commutator notation' }],
        default: 0,
    },
    sheets_extraximages: {
        name: 'Include sh/ch in X images',
        default: true,
    },
    sheets_greyoutinvalidpairs: {
        name: 'Grey out invalid pairs',
        default: true,
    },
    cards_learningtoduethreshold: {
        name: 'Revisions of a card before spaced repetition',
        default: 5,
        min: 2,
        max: 20,
    },
    cards_dailymaximumnewcards: {
        name: 'Daily maximum new cards',
        default: 20,
        min: 1,
        max: 500,
    },
    memo_startingmemolength: {
        name: 'Initial memo attempt length',
        default: 4,
        min: 1,
        max: 20,
    },
    memo_includeimpossiblepairs: {
        name: 'Include impossible pairs in \'All Pairs\'',
        default: false,
    },
    timer_spaceholdingtime: {
        name: 'Time keeping space down before starting',
        default: 0.3,
        min: 0,
        max: 2,
    }
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
        },
    },
})
