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
    }
}

export const useSettingsStore = defineStore('settingsStore', {
    state: () => {
        return {}
    },
    actions: {
        saveState() {
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
            const stored = data.settings
            //Fill in any missing settings with defaults
            for (const [key, value] of Object.entries(defaults)) {
                if (!(stored.hasOwnProperty(key)))
                    stored[key] = value.default
            }
            this.settings = stored
            this.saveState()
        },
    },
})
