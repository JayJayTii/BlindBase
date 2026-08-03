<script setup>
	import { ref, onMounted, onUnmounted } from 'vue'
	import CardSelection from "@/components/cards/CardSelection.vue"
	import CardPractice from "@/components/cards/CardPractice.vue"

	const sheetID = ref(-1)

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
		<div v-if="sheetID == -1">
			<CardSelection :sheetID="sheetID"
						   :updateStatsKey="updateStatsKey"
						   @beginPractice="sheetID = $event" />
		</div>
		<div v-else>
			<CardPractice :sheetID="sheetID"
						  :updateStatsKey="updateStatsKey"
						  @quitPractice="sheetID = -1" />
		</div>
	</div>
	<div style="position: fixed; right: 10px; bottom: calc(var(--footer-height) + 10px); font-size:0.8rem;">
		Inspired by <a href="https://apps.ankiweb.net/" target="_blank">Anki</a>
	</div>
</template>