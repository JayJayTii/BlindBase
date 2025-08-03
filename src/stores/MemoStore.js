import { defineStore } from "pinia";

export const modes = ["Endless", "One mistake"]
export const useMemoStore = defineStore("memoStore", {
	state: () => {
        return {
            highscores: [], //Ordered by mode
		};
	},
    actions: {
        saveState() {
            localStorage.setItem('memoStore', JSON.stringify({
                highscores: this.highscores
            }));
        },
        loadState() {
            try {
                const data = JSON.parse(localStorage.getItem('memoStore'));
                this.highscores = data.highscores;
            }
            catch {
                this.highscores = modes.map((mode) => 0)
            }
        }
    },
    getters: {
    }
})