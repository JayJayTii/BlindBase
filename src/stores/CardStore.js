import { defineStore } from "pinia";

export const useCardStore = defineStore("cardStore", {
	state: () => {
        return {
            cards: [],
		};
	},
    actions: {
        saveState() {
            localStorage.setItem('cardStore', JSON.stringify({
                cards = this.cards,
            }));
        },
        loadState() {
            try {
                const data = JSON.parse(localStorage.getItem('cardStore'));
                this.cards = data.cards;
            }
            catch {
            }
        }
    },
    getters: {

    }
})