<script setup>
	import { watch, ref } from 'vue'
	import { ElMessage } from 'element-plus'

	const props = defineProps({
		color: String,
		index: Number,
		scheme: Array,
	})

	const emit = defineEmits(['change'])

	const letter = ref(props.scheme[props.index])
	watch(letter, (newValue, oldValue) => {
		if (!newValue) {
			emit('change', props.index, '')
			return
		}

		newValue = newValue.toUpperCase()
		if (!/^[A-Z]$/.test(newValue)) {
			letter.value = oldValue
			return
		}

		const offset = (props.index < 24 ? 0 : 24)
		for (var i = offset; i < offset + 24; i++) {
			if (i != props.index && newValue == props.scheme[i]) {
				ElMessage("'" + newValue + "' is already taken.")
				letter.value = oldValue;
				return
			}
		}

		emit('change', props.index, newValue)
	})
</script>

<template>
	<div :style="{ backgroundColor: props.color }" class="FaceletVisFacelet">
		<input v-if="index != -1" v-model="letter" class="LetteringSchemeFaceletInput" maxlength="1"/>
	</div>
</template>

<style>
	.LetteringSchemeFaceletInput {
		width: 39px;
		height: 39px;
		font-size: 30px;
		text-align: center;
		background-color: rgba(0.0, 0.0, 0.0, 0.0);
		border: none;
		text-transform: uppercase;
		color: black;
	}

	.FaceletVisFacelet {
		height: 100%;
		width: 100%;
	}
</style>