<script setup>
    import { ref, onMounted, onUnmounted } from 'vue'
    import CardSelection from "@/components/cards/CardSelection.vue"
    import CardPractice from "@/components/cards/CardPractice.vue"
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    import { useCardStore } from "@/stores/CardStore"
    const cardStore = useCardStore()
    cardStore.loadState()

    const sheetID = ref(-1)
    const practicing = ref(false); //Whether to show CardSelection or CardPractice

    function beginPractice(id) {
        sheetID.value = id
        practicing.value = true
    }
    function quitPractice() {
        sheetID.value = -1
        practicing.value = false
    }

    //Reload stats at a regular interval, shared between components
    let intervalId
    const updateStatsKey = ref(0)
    function updateStats() {
        updateStatsKey.value += 1
    }
    onMounted(() => {
        updateStats()
        intervalId = setInterval(updateStats, 5000)
    })
    onUnmounted(() => {
        clearInterval(intervalId)
    })
</script>

<template>
    <div style="position: relative;">
        <div v-if="practicing === false">
            <CardSelection :sheetID="sheetID"
                           :updateStatsKey="updateStatsKey"
                           @beginPractice="beginPractice" />
        </div>
        <div v-else>
            <CardPractice :sheetID="sheetID"
                          :updateStatsKey="updateStatsKey"
                          @quitPractice="quitPractice" />
        </div>
    </div>
    <div style="position: absolute; bottom: calc(var(--footer-height) + 5px); right: 10px; font-size:0.8rem;">
        Inspired by <a href="https://apps.ankiweb.net/" target="_blank">Anki</a>
    </div>
</template>