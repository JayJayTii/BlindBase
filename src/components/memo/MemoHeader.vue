<script setup>
    import { useMemoStore } from '@/stores/MemoStore'
    const memoStore = useMemoStore()
    memoStore.loadState()

    const props = defineProps({
        runData: Object,
        length: Number,
    })
    const emit = defineEmits(['quitRun'])

    function getPairSelectString() {
        switch (props.runData.pairSelect) {
            case 0: //From all pairs
                return "From all pairs"
            case 1: //From sheet
                return "From sheet: \'" + props.runData.pairSelectSheet.name + "\'"
            case 2: //From card deck
                return "From card deck: \'" + props.runData.pairSelectSheet.name + "\'"
        }
    }
</script>

<template>
    <div class="MemoHeader">
        <img src="@/assets/arrow-left-long.svg"
             @click="emit('quitRun')"
             class="CustomButton"
             style="width:80px;height:3rem;margin-left:10px;"/>
        <div>Mode: {{ props.runData.mode }}</div>
        <div>{{getPairSelectString()}}</div>
        <div>
            <div v-if="props.runData.mode !== 'Multiblind'">Length: {{ props.length }}</div>
            <div v-else>Cubes: {{ props.runData.cubes }}</div>
        </div>

        
        <div v-if="props.runData.pairSelect === 0">Highscore: {{ memoStore.GetHighscore(props.runData.mode) }}</div>
    </div>
</template>

<style>
    .MemoHeader {
        display: grid;
        grid-template-columns: repeat(5, auto);
        gap:100px;
        width: 100%;
        font-size: 1.5rem;
        justify-self: center;
        margin-top: 10px;
    }
</style>