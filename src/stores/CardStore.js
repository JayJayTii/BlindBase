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
        createCard(sheetID, absoluteCoord) {
            const newCard = ({
                algorithm: getSheetStore().getCell(sheetID, absoluteCoord),
                reference: { sheetID: sheetID, coord: absoluteCoord },
                creationTime: new Date().toISOString(),
                nextPracticeTime: new Date().toISOString(),
                successCount: 0,
                failCount: 0
            });
            this.cards.push(newCard);
            this.saveState();
        },
        deleteCard(sheetID, absoluteCoord) {
            this.cards = this.cards.filter((card) => !(card.reference.sheetID == sheetID &&
                                        card.reference.coord.x == absoluteCoord.x &&
                                        card.reference.coord.y == absoluteCoord.y));
            this.saveState();
        },
        getCardType(card) {
            return card.successCount >= 5 ? "Due"
                : card.successCount > 0 ? "Learning"
                    : "New";
        },
        cardComplete(updatedCard) {
            if (updatedCard.successCount + updatedCard.failCount === 1) {
                this.dailyStats.dailyNewCards += 1;
            }
            this.cards = this.cards.map((card) => {
                if (card.reference.sheetID == updatedCard.reference.sheetID
                    && card.reference.coord.x == updatedCard.reference.coord.x
                    && card.reference.coord.y == updatedCard.reference.coord.y) {
                    return updatedCard;
                }
                return card;
            })
            this.saveState();
        },

        getSheetsWithCards(sheetID) {
            //do this haha
        },
        getCardsForSheet(sheetID) {
            return this.cards.filter(card => card.reference.sheetID === sheetID);
        },
        getNewCards(sheetID) {
            const now = new Date().toISOString();
            const newCards = this.cards.filter(card =>
                card.nextPracticeTime < now &&
                card.successCount === 0 &&
                card.reference.sheetID === sheetID);
            const dailyNewCardsRemaining = 20 - this.dailyStats.dailyNewCards;
            return newCards.slice(0, dailyNewCardsRemaining);
        },
        getLearningCards(sheetID) {
            const now = new Date().toISOString();
            return this.cards.filter(card =>
                card.nextPracticeTime < now &&
                card.successCount > 0 &&
                card.successCount < 5 &&
                card.reference.sheetID === sheetID);
        },
        getDueCards(sheetID) {
            const now = new Date().toISOString();
            return this.cards.filter(card =>
                card.nextPracticeTime < now &&
                card.successCount >= 5 &&
                card.reference.sheetID === sheetID);
        },
        getCardsToPracticeCount(sheetID) {
            return this.getNewCards(sheetID).length
                + this.getLearningCards(sheetID).length
                + this.getDueCards(sheetID).length;
        },

        checkCards() {
            this.cards = this.cards.filter((card) =>
                card.algorithm === getSheetStore().getCell(card.reference.sheetID, card.reference.coord));
            this.saveState();
        },
        checkDailyStats() {
            if (new Date().setHours(0, 0, 0, 0) === this.dailyStats.date)
                return

            this.dailyStats.date = new Date().setHours(0, 0, 0, 0);
            this.dailyStats.dailyNewCards = 0;
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