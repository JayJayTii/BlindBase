import { useSettingsStore } from '@/stores/SettingsStore.js'

//Cards are split into "New", "Learning", and "Due", getCardType categorises a card
const cardsLearningToDueThreshold = 5
export function getCardType(card) {
    return card.successCount >= cardsLearningToDueThreshold
        ? 'Due' : card.successCount > 0 ? 'Learning' : 'New'
}