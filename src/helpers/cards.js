import { useSettingsStore } from '@/stores/SettingsStore.js'

export function getCardType(card) {
    return card.successCount >= useSettingsStore().settings.cards_learningtoduethreshold
        ? 'Due' : card.successCount > 0 ? 'Learning' : 'New'
}