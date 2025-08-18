<script setup>
    import { ref, onMounted, onUnmounted } from 'vue'
    import CardSelection from "@/components/cards/CardSelection.vue"
    import CardPractice from "@/components/cards/CardPractice.vue"

    const sheetID = ref(-1)

    const practicing = ref(false);

    function sheetEditClicked(id) {
        sheetID.value = (sheetID.value === id) ? -1 : id
    }
    function beginPractice(id) {
        sheetID.value = id
        practicing.value = true
    }
    function quitPractice() {
        sheetID.value = -1
        practicing.value = false
    }

    //Reload stats at a regular interval
    let intervalId
    const updateStatsKey = ref(0)
    function updateStats() {
        updateStatsKey.value += 1;
    }
    onMounted(() => {
        updateStats()
        intervalId = setInterval(updateStats, 500)
    })
    onUnmounted(() => {
        clearInterval(intervalId)
    })
</script>

<template>
    <div v-if="practicing === false">
        <CardSelection :sheetID="sheetID"
                       :updateStatsKey="updateStatsKey"
                       @sheetEditClicked="sheetEditClicked"
                       @beginPractice="beginPractice"/>
    </div>
    <div v-else>
        <CardPractice :sheetID="sheetID"
                      :updateStatsKey="updateStatsKey"
                      @quitPractice="quitPractice"/>
    </div>
</template>