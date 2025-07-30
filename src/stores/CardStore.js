import { defineStore } from "pinia";
import { useSheetStore } from "./SheetStore";

export function getSheetStore() {
    return useSheetStore();
}

export const useCardStore = defineStore("cardStore", {
	state: () => {
        return {
            cards: [],
            dailyStats: { date: new Date().setHours(0, 0, 0, 0), dailyNewCards: 0},
		};
	},
    actions: {
        createCard(sheetIndex, absoluteCoord) {
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
        getCardType(card) {
            return card.practiceCount > 5 ? "Due"
                : card.practiceCount > 0 ? "Learning"
                    : "New";
        },
        cardComplete(updatedCard) {
            if (updatedCard.practiceCount === 1) {
                this.dailyStats.dailyNewCards += 1;
            }
            this.cards = this.cards.map((card) => {
                if (card.reference.sheet == updatedCard.reference.sheet
                    && card.reference.coord.x == updatedCard.reference.coord.x
                    && card.reference.coord.y == updatedCard.reference.coord.y) {
                    return updatedCard;
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
            const newCards = this.cards.filter(card =>
                card.nextPracticeTime < now &&
                card.practiceCount === 0 &&
                card.reference.sheet === sheetIndex);
            const dailyNewCardsRemaining = 20 - this.dailyStats.dailyNewCards;
            return newCards.slice(0, dailyNewCardsRemaining);
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

        checkCards() {
            this.cards = this.cards.filter((card) =>
                card.algorithm === getSheetStore().getCell(card.reference.sheet, card.reference.coord));
            this.saveState();
        },
        checkDailyStats() {
            if (new Date().setHours(0, 0, 0, 0) === this.dailyStats.date)
                return

            this.dailyStats.date = new Date().setHours(0, 0, 0, 0);
            this.dailyStats.dailyNewCards = 0;
            console.log("resetting");
            this.saveState();
        },

        saveState() {
            localStorage.setItem('cardStore', JSON.stringify({
                cards: this.cards,
                dailyStats: this.dailyStats,
            }));
        },
        loadState() {
            try {
                const data = JSON.parse(localStorage.getItem('cardStore'));
                this.cards = data.cards;
                this.dailyStats = data.dailyStats;
            }
            catch {
            }
            this.checkCards(); //Remove cards that have changed
            this.checkDailyStats(); //Set new date if its the next day
        }
    },
    getters: {

    }
})