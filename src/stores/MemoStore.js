import { defineStore } from 'pinia'

export const modes = ['Endless', 'One mistake', 'Multiblind']

export const useMemoStore = defineStore('memoStore', {
    state: () => {
        return {
            highscores: [], //Ordered by mode
        }
    },
    actions: {
        GetHighscore(index) {
            //Fill highscores with 0 if there have been new modes added
            while (this.highscores.length <= index) {
                this.highscores.push(0)
                this.saveState()
            }
            return this.highscores[index]
        },
        SetHighscore(index, value) {
            while (this.highscores.length <= index) {
                this.highscores.push(0)
                this.saveState()
            }
            this.highscores[index] = value
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
            } catch {
                this.highscores = modes.map((mode) => 0)
            }
        },
    },
    getters: {},
})
