<script setup>
    import { useMemoStore, modes } from '@/stores/MemoStore'
    const memoStore = useMemoStore()
    memoStore.loadState()

    const props = defineProps({
        mode: Number,
        length: Number,
        pairSelect: Number,
        cubes: Number,
    })
    const emit = defineEmits(['quitRun'])
</script>

<template>
    <div class="MemoHeader">
        <img src="@/assets/arrow-left-long.svg"
             @click="emit('quitRun')"
             class="BackButton"
             style="width:70px;height:50px;margin-left:10px;"/>
        <div>Mode: {{ modes[props.mode] }}</div>
        <div v-if="props.mode !== 2">Length: {{ props.length }}</div>
        <div v-else>Cubes: {{ props.cubes }}</div>
        <div v-if="props.pairSelect === 0">Highscore: {{ memoStore.GetHighscore(props.mode) }}</div>
    </div>
</template>

<style>
    .MemoHeader {
        display: grid;
        grid-template-columns: repeat(4, 24vw);
        max-width: 100%;
        font-size: 1.5rem;
        justify-self: start;
        margin-top: 10px;
    }
</style>