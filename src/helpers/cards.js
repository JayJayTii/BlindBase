import { useSettingsStore } from '@/stores/SettingsStore.js'

//Cards are split into "New", "Learning", and "Due", getCardType categorises a card
export function getCardType(card) {
    return card.successCount >= useSettingsStore().settings.cards_learningtoduethreshold
        ? 'Due' : card.successCount > 0 ? 'Learning' : 'New'
}