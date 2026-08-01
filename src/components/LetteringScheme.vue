<script setup>
	import { ref, reactive } from 'vue'
	import { ElMessage } from 'element-plus'
	import { FaceletCube } from '@/helpers/FaceletCube/FaceletCube.js'
	import { SolvingOrientationToTurns } from '@/helpers/solving_orientation.js'
	import { useSettingsStore } from '.././stores/SettingsStore'
	const settingsStore = useSettingsStore()
	settingsStore.loadState()

	import LetteringSchemeFacelet from '@/components/LetteringSchemeFacelet.vue'

	const scheme = ref(settingsStore.settings.lettering_scheme.split(''))

	const cube = reactive({})

	function updateSolvingOrientation() {
		cube.value = new FaceletCube()
		cube.value.TurnSequence({ turns: SolvingOrientationToTurns[settingsStore.settings.solving_orientation] })
	}
	updateSolvingOrientation()

	function faceletChanged(index, letter) {
		scheme.value[index] = letter;
	}

	function tryClose(save) {
		// I absolutely do NOT want an invalid lettering scheme floating around
		if (save) {
			for (var i = 0; i < 2; i++) {
				const seen = []

				for (var j = 0; j < 24; j++) {
					const letter = scheme.value[24 * i + j]
					if (seen.includes(letter) || !/^[A-Z]$/.test(letter)) {
						ElMessage("Invalid lettering scheme")
						return false
					}

					seen.push(letter)
				}
			}

			settingsStore.settings.lettering_scheme = scheme.value.join("")
			settingsStore.saveState()
		}
		
		scheme.value = settingsStore.settings.lettering_scheme.split('')
		return true
	}

	function speffz() {
		scheme.value = "ABCDEFGHIJKLMNOPQRSTUVWXABCDEFGHIJKLMNOPQRSTUVWX".split('')
	}

	function random() {
		function shuffleArray(array) {
			for (var i = array.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
		}
		const corners = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
		corners.splice(Math.floor(Math.random() * corners.length), 1);
		corners.splice(Math.floor(Math.random() * corners.length), 1);
		shuffleArray(corners)

		const edges = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
		edges.splice(Math.floor(Math.random() * edges.length), 1);
		edges.splice(Math.floor(Math.random() * edges.length), 1);
		shuffleArray(edges)

		scheme.value = corners.concat(edges)
	}

	function clear() {
		scheme.value = Array.from({ length: 48 }, () => '')
	}

	defineExpose({
		updateSolvingOrientation, tryClose, speffz, random, clear
	})
</script>

<template>
	<div class="FaceletCubeVis" :key="scheme">
		<div />
		<!--WHITE-->
		<div class="FaceletCubeVisSide">
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(0)"  :index="0"  :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(0)  "  :index="24" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(1)"  :index="1"  :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(3)  "  :index="27" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCenterFaceletSticker(0)"  :index="-1" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(1)  "  :index="25" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(3)"  :index="3"  :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(2)  "  :index="26" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(2)"  :index="2"  :scheme="scheme" @change="faceletChanged" />
		</div>																										 
		<div />																										 
		<div />																										 
		<!--ORANGE-->																								 
		<div class="FaceletCubeVisSide">
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(4)"  :index="4"  :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(4)  "  :index="28" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(5)"  :index="5"  :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(7)  "  :index="31" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCenterFaceletSticker(1)"  :index="-1" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(5)  "  :index="29" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(7)"  :index="7"  :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(6)  "  :index="30" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(6)"  :index="6"  :scheme="scheme" @change="faceletChanged" />
		</div>																										 
		<!--GREEN-->																								 
		<div class="FaceletCubeVisSide">
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(8) " :index="8"  :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(8)   " :index="32" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(9) " :index="9"  :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(11)  " :index="35" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCenterFaceletSticker(2) " :index="-1" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(9)   " :index="33" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(11)" :index="11" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(10)  " :index="34" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(10)" :index="10" :scheme="scheme" @change="faceletChanged" />
		</div>
		<!--RED-->
		<div class="FaceletCubeVisSide">
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(12)" :index="12" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(12)  " :index="36" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(13)" :index="13" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(15)  " :index="39" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCenterFaceletSticker(3) " :index="-1" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(13)  " :index="37" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(15)" :index="15" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(14)  " :index="38" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(14)" :index="14" :scheme="scheme" @change="faceletChanged" />
		</div>
		<!--BLUE-->
		<div class="FaceletCubeVisSide">
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(16)" :index="16" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(16)  " :index="40" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(17)" :index="17" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(19)  " :index="43" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCenterFaceletSticker(4) " :index="-1" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(17)  " :index="41" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(19)" :index="19" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(18)  " :index="42" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(18)" :index="18" :scheme="scheme" @change="faceletChanged" />
		</div>
		<div />
		<!--YELLOW-->
		<div class="FaceletCubeVisSide">
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(20)" :index="20" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(20)  " :index="44" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(21)" :index="21" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(23)  " :index="47" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCenterFaceletSticker(5) " :index="-1" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(21)  " :index="45" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(23)" :index="23" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getEdgeFaceletSticker(22)  " :index="46" :scheme="scheme" @change="faceletChanged" />
			<LetteringSchemeFacelet :color="cube.value.getCornerFaceletSticker(22)" :index="22" :scheme="scheme" @change="faceletChanged" />
		</div>
	</div>
</template>

<style>
	.FaceletCubeVis {
		aspect-ratio: 4/3;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		gap: 1px;
	}

	.FaceletCubeVisSide {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		background-color: black;
		border: 1px solid black;
		border-radius: 3px;
		aspect-ratio: 1;
		gap: 3px;
		padding: 3px;
	}
</style>