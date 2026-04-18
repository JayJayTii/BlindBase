<script setup>
    import { ref, computed } from 'vue'
    import { getSolveTimeString } from "@/helpers/timer.js"
    import { useTimerStore } from "@/stores/TimerStore"
	const timerStore = useTimerStore()
	import { calculateMean, formatTime } from '@/helpers/timer.js'

    const props = defineProps({
        solveIndex: Number,
        sessionID: Number,
    })
    const emit = defineEmits(['selectSolve'])

	const solves = computed({
		get: () => timerStore.getSession(props.sessionID)?.solves || []
    })

    function SolveClicked(index) {
        emit('selectSolve', index)
    }

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
            title: 'No.',
			cellRenderer: ({ rowData }) => {
				return rowData.index + 1
			},
            key: 0,
            width: 60,
        },
		{
			title: 'Time',
			cellRenderer: ({ rowData }) => {
				const result = getSolveTimeString(rowData.value)
				return result
            },
            key: 1,
			width: 100,
		},
		{
			title: 'Mo3',
			cellRenderer: ({ rowData }) => {
                if (rowData.index < 2)
                    return ''
				const mean = calculateMean(solves.value.slice(rowData.index - 2, rowData.index + 1), 1)
                return formatTime(mean[0]) + (mean[1] ? " (DNF)" : "")
			},
			key: 2,
			width: 100,
		}
	]
</script>

<template>
    <div :key="solves.length">
        <el-auto-resizer>
            <template #default="{ height, width }">
                <el-table-v2 :columns="columns"
                             :data="data"
                             :row-event-handlers="rowEventHandlers"
                             :header-height="20"
                             :row-class="getRowClass"
                             :row-height="30"
                             :width="width"
                             :height="height">
                    <template #empty><div /></template>
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
        cursor: pointer
    }

</style>