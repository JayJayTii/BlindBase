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
            console.log(getSheetStore().getCell(sheetIndex, absoluteCoord));
            const newCard = ({
                algorithm: getSheetStore().getCell(sheetIndex, absoluteCoord),
                reference: { sheet: sheetIndex, coord: absoluteCoord },
                creationTime: new Date().toISOString(),
                nextPracticeTime: new Date().toISOString(),
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
        updateCard(newValue) {
            this.cards = this.cards.map((card) => {
                if (card.reference.sheet == newValue.reference.sheet
                    && card.reference.coord.x == newValue.reference.coord.x
                    && card.reference.coord.y == newValue.reference.coord.y) {
                    return newValue;
                }
                return card;
            })
            this.saveState();
        },

        getCardsForSheet(sheetIndex) {
            return this.cards.filter(card => card.reference.sheet === sheetIndex);
        },
        getNewCards(sheetIndex) {
            const now = new Date().toISOString();
            return this.cards.filter(card =>
                card.nextPracticeTime < now &&
                card.practiceCount === 0 &&
                card.reference.sheet === sheetIndex);
        },
        getLearningCards(sheetIndex) {
            const now = new Date().toISOString();
            return this.cards.filter(card =>
                card.nextPracticeTime < now &&
                card.practiceCount > 0 &&
                card.practiceCount < 5 &&
                card.reference.sheet === sheetIndex);
        },
        getDueCards(sheetIndex) {
            const now = new Date().toISOString();
            return this.cards.filter(card =>
                card.nextPracticeTime < now &&
                card.practiceCount >= 5 &&
                card.reference.sheet === sheetIndex);
        },
        getCardsToPracticeCount(sheetIndex) {
            return this.getNewCards(sheetIndex).length
                + this.getLearningCards(sheetIndex).length
                + this.getDueCards(sheetIndex).length;
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