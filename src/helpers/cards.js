export function getCardType(card) {
    return card.successCount >= 5 ? 'Due' : card.successCount > 0 ? 'Learning' : 'New'
}