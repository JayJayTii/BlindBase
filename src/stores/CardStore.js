import { defineStore } from "pinia";
import { useSheetStore } from "./SheetStore";

export function getSheetStore() {
    return useSheetStore();
}

export const useCardStore = defineStore("cardStore", {
	state: () => {
        return {
            cards: [],
		};
	},
    actions: {
        createCard(sheetIndex, absoluteCoord) {
            const newCard = ({
                algorithm: getSheetStore().getCell(sheetIndex, absoluteCoord),
                reference: { sheet: sheetIndex.value, coord: absoluteCoord },
                creationTime: new Date(),
                nextPracticeTime: new Date(),
                practiceCount: 0,
                successCount: 0,
                failCount: 0
            });
            this.cards.push(newCard);
            this.saveState();
        },
        deleteCard(sheetIndex, absoluteCoord) {
            this.cards = this.cards.filter((card) => !(card.reference.sheet == sheetIndex &&
                                        card.reference.coord.x == absoluteCoord.x &&
                                        card.reference.coord.y == absoluteCoord.y));
            this.saveState();
        },

        getCardsForSheet(sheetIndex) {
            return this.cards.filter(card => card.reference.sheet === sheetIndex);
        },

        saveState() {
            localStorage.setItem('cardStore', JSON.stringify({
                cards: this.cards,
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