<script setup>
    import { computed, watch, ref } from "vue"

    const emit = defineEmits(['update:on-selected'])
    defineExpose({
        selectionFinished
    })

    const pieceType = ref(-1)
    const pieceTypeSelected = computed({
        get: () => pieceType.value >= 0
    })

    const mode = ref(-1)
    const modeSelected = computed({
        get: () => pieceTypeSelected.value && mode.value == 1
    })

    const pairMode = ref(-1)
    const pairModeSelected = computed({
        get: () => modeSelected.value && pairMode.value >= 0
    })

    const scrambleMode = ref(-1)
    const scrambleModeSelected = computed({
        get: () => pairModeSelected.value && scrambleMode.value >= 0
    })

    function selectionFinished() {
        return pieceType.value >= 0 && (
            mode.value == 0 ||
            mode.value == 1 && scrambleModeSelected.value)
    }


    watch(selectionFinished, () => {
        if (selectionFinished()) {
            let pairs = []
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWX"
            for (var i = 0; i < 24; i++) {
                for (var j = 0; j < 24; j++) {
                    pairs.push(letters[i] + letters[j])
                }
            }

            emit('update:on-selected', pairs)
        }
    })
</script>

<template>
    <div id="ExecSelect">
        <select style="font-size: 2rem" v-model="pieceType">
            <option value=0>Corners</option>
            <option value=1>Edges</option>
        </select>
        <div class="ExecSelectLine" v-if="pieceTypeSelected" />
        <select style="font-size: 2rem" v-model="mode" v-if="pieceTypeSelected">
            <option value="0">Full</option>
            <option value="1">One pair</option>
        </select>
        <div class="ExecSelectLine" v-if="modeSelected" />
        <select style="font-size: 2rem" v-model="pairMode" v-if="modeSelected">
            <option value="0">From all pairs</option>
            <option value="1">From sheet</option>
            <option value="2">From cards</option>
            <option value="3">From custom</option>
        </select>
        <div class="ExecSelectLine" v-if="pairModeSelected" />
        <select style="font-size: 2rem" v-model="scrambleMode" v-if="pairModeSelected">
            <option value="0">With scramble</option>
            <option value="1">No scramble</option>
        </select>
    </div>
</template>

<style>

    #ExecSelect {
        justify-self: center;
        align-items: center;
        height: 10vh;
        width: 97.5vw;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
        gap: 10px;
    }

    .ExecSelectLine{
        border-block-end: 5px solid white;
        border-radius:5px;
    }
</style>