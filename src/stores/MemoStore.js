import { defineStore } from 'pinia'

export const modes = ['Corners', 'Edges', 'One mistake', 'Multiblind']
export const modesDesc = ['Memorise with a distraction in the middle', 'Memorise then recall', 'Length resets if you get anything wrong', 'Memorise multiple cubes\' worth of memo']

export const useMemoStore = defineStore('memoStore', {
    state: () => {
        return {}
    },
    actions: {
        GetHighscore(modeName) {
            return this.highscores[modeName]
        },
        SetHighscore(modeName, value) {
            this.highscores[modeName] = value
            this.saveState()
        },

        ValidateValues(data) {
            const out = { ...data }
            //Fill in any missing highscores
            for (const mode of modes){
                if (!(out.hasOwnProperty(mode)))
                    out[mode] = 0
            }
            return out
        },

        saveState() {
            localStorage.setItem(
                'memoStore',
                JSON.stringify({
                    highscores: this.highscores,
                }),
            )
        },
        loadState() {
            try {
                const data = JSON.parse(localStorage.getItem('memoStore'))
                this.highscores = data.highscores
            } catch {}
            if (!this.hasOwnProperty("highscores"))
                this.highscores = {}
            this.highscores = this.ValidateValues(this.highscores)
            this.saveState()
        },
    },
    getters: {},
})
