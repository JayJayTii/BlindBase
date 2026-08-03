<script setup>
	import { h, ref, computed } from 'vue'
	import { ElSelect, ElOption } from 'element-plus'
	import { getSolveTimeString, calculateMean, formatTime } from "@/helpers/timer.js"
	import { useTimerStore } from "@/stores/TimerStore"

	const props = defineProps({
		solveIndex: Number,
		sessionID: Number,
	})
	const emit = defineEmits(['selectSolve'])

	const solves = computed({
		get: () => useTimerStore().getSession(props.sessionID)?.solves || []
	})

	function SolveClicked(index) {
		emit('selectSolve', index)
	}

	const section = ref(0)
	const data = computed({
		get: () => {
			//iterating in reverse so the end is at the top of the table
			return solves.value.map((solve, index) => ({
					index: solves.value.length - index - 1,
					value: solves.value[solves.value.length - index - 1]}))
		}
	})

	const rowEventHandlers = {
		onClick: ({ rowData, event }) => {
			SolveClicked(rowData.index)
		}
	};
	function getRowClass({ rowData }) {
		if (rowData.index == props.solveIndex)
			return ['table-row','row-selected']
		return 'table-row'
	}

	const columns = [
		{
			title: 'Solve',
			cellRenderer: ({ rowData }) => {
				return rowData.index + 1
			},
			key: 0,
			width: 60,
		},
		{
			headerCellRenderer: () => {
				return h(
					ElSelect,
					{
						modelValue: section.value,
						'onUpdate:modelValue': v => (section.value = v),
						size: 'small',
						style: 'width: 100px;'
					},
					() => [
						h(ElOption, { label: 'Full', value: 0 }),
						h(ElOption, { label: 'Memo', value: 1 }),
						h(ElOption, { label: 'Exec', value: 2 })
					]
				)
			},
			cellRenderer: ({ rowData }) => {
				switch (section.value) {
					case 0: // Full
						return getSolveTimeString(rowData.value)
					case 1: // Memo
						return formatTime(rowData.value[1])
					case 2:
						return formatTime(rowData.value[0] - rowData.value[1])
				}
			},
			key: 1,
			width: 100,
		},
		{
			title: 'Mo3',
			cellRenderer: ({ rowData }) => {
				if (rowData.index < 2)
					return ''
				let mean = 0
				switch (section.value) {
					case 0: // Full
						mean = calculateMean(solves.value.slice(rowData.index - 2, rowData.index + 1), 0)
						return formatTime(mean[0]) + (mean[1] ? " (DNF)" : "")
					case 1: // Memo
						mean = calculateMean(solves.value.slice(rowData.index - 2, rowData.index + 1), 1)
						return formatTime(mean[0])
					case 2:
						mean = calculateMean(solves.value.slice(rowData.index - 2, rowData.index + 1), 2)
						return formatTime(mean[0])
				}
			},
			key: 2,
			width: 100,
		}
	]
</script>

<template>
	<div :key="solves.length" style="border-radius: 4px; border: 1px solid var(--el-border-color);">
		<el-auto-resizer style="height: 100%;">
			<template #default="{ height, width }">
				<el-table-v2 :columns="columns"
							 :data="data"
							 :row-event-handlers="rowEventHandlers"
							 :header-height="20"
							 :row-class="getRowClass"
							 :row-height="30"
							 :width="width"
							 :height="height">
					<template #empty>
						<div />
					</template>
				</el-table-v2>
			</template>
		</el-auto-resizer>
	</div>
</template>

<style>
	.row-selected {
		background-color: var(--el-color-primary-light-5);
	}
	.row-selected:hover {
		background-color: var(--el-color-primary-light-5);
	}
	.table-row {
		cursor: pointer;
	}

</style>