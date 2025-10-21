import { defineStore } from 'pinia'
import { useSheetStore } from './SheetStore'
import { useSettingsStore } from './SettingsStore'
import { getCardType } from '@/helpers/cards.js'

export function getSheetStore() {
    return useSheetStore()
}

export const useCardStore = defineStore('cardStore', {
    state: () => {
        return {
            cards: [],
            dailyStats: { date: new Date().setHours(0, 0, 0, 0), dailyNewCards: 0 },
        }
    },
    actions: {
        createCard(sheetID, absoluteCoord) {
            //Push card to array and save
            const newCard = {
                algorithm: getSheetStore().getCell(sheetID, absoluteCoord),
                reference: { sheetID: sheetID, coord: absoluteCoord },
                creationTime: new Date().toISOString(),
                nextPracticeTime: new Date().toISOString(),
                successCount: 0,
                failCount: 0,
            }
            this.cards.push(newCard)
            this.saveState()
        },
        deleteCard(sheetID, absoluteCoord) {
            //Filter out if the card matches the given reference, then save
            this.cards = this.cards.filter(
                (card) =>
                    !(
                        card.reference.sheetID == sheetID &&
                        card.reference.coord.x == absoluteCoord.x &&
                        card.reference.coord.y == absoluteCoord.y
                    ),
            )
            this.saveState()
        },
        completeCard(updatedCard) {
            //If it was new, increment dailyNewCards (successCount already incremented before this is called)
            if (updatedCard.successCount + updatedCard.failCount === 1) {
                this.dailyStats.dailyNewCards += 1
            }
            //Loop through all cards, if it matches this card, then replace it with the updated version
            this.cards = this.cards.map((card) => {
                if (
                    card.reference.sheetID == updatedCard.reference.sheetID &&
                    card.reference.coord.x == updatedCard.reference.coord.x &&
                    card.reference.coord.y == updatedCard.reference.coord.y
                ) {
                    return updatedCard
                }
                return card
            })
            this.saveState()
        },

        getCardsForSheet(sheetID) {
            return this.cards.filter((card) => card.reference.sheetID === sheetID)
        },
        getCardsOfType(sheetID, type) {
            //Only include cards which match the sheetID, match the type, and are due for practice
            const now = new Date().toISOString()
            const cards = this.cards.filter(
                (card) =>
                    card.reference.sheetID === sheetID &&
                    getCardType(card) === type &&
                    card.nextPracticeTime < now
            )
            //Take daily new card limit into account
            if (type === "New") {
                const dailyNewCardsRemaining = Math.max(0, useSettingsStore().settings.cards_dailymaximumnewcards - this.dailyStats.dailyNewCards)
                return cards.slice(0, dailyNewCardsRemaining)
            }
            return cards
        },
        getCardsToPracticeCount(sheetID) {
            //A better way would be to just get the length of cards for a sheet which
            //are due for practice, but this runs into issues with new card limits
            return (
                this.getCardsOfType(sheetID, "New").length +
                this.getCardsOfType(sheetID, "Learning").length +
                this.getCardsOfType(sheetID, "Due").length
            )
        },

        checkCards() {
            //Remove any cards if their contents have been edited in the sheet
            this.cards = this.cards.map(card => {
                card.algorithm = getSheetStore().getCell(card.reference.sheetID, card.reference.coord)
                return card
            })
            /*this.cards = this.cards.filter(
                (card) =>
                    card.algorithm.toUpperCase() ===
                    getSheetStore().getCell(card.reference.sheetID, card.reference.coord).toUpperCase(),
            )*/
            this.saveState()
        },
        checkDailyStats() {
            //Reset daily limit for new cards if it is a new day!
            if (new Date().setHours(0, 0, 0, 0) === this.dailyStats.date) return

            this.dailyStats.date = new Date().setHours(0, 0, 0, 0)
            this.dailyStats.dailyNewCards = 0
            this.saveState()
        },

        saveState() {
            localStorage.setItem(
                'cardStore',
                JSON.stringify({
                    cards: this.cards,
                    dailyStats: this.dailyStats,
                }),
            )
        },
        loadState() {
            try {
                const data = JSON.parse(localStorage.getItem('cardStore'))
                this.cards = data.cards
                this.dailyStats = data.dailyStats
            } catch {}
            this.checkCards()
            this.checkDailyStats()
        },
    },
    getters: {},
})
