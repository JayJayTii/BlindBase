<script setup>
    import { computed, watch, ref } from "vue"
    import { useSheetStore } from '@/stores/SheetStore'
    const sheetStore = useSheetStore()
    sheetStore.loadState()
    import { useCardStore } from '@/stores/CardStore'
    const cardStore = useCardStore()
    cardStore.loadState()


    const emit = defineEmits(['update:on-selected'])
    defineExpose({
        selectionFinished
    })

    function resetValues() {
        modeValue.value = -1
        pairMode.value = -1
        pairModeSheetID.value = -1
        scrambleMode.value = -1
    }

    const pieceTypeValue = ref(-1)
    const pieceType = computed({
        get: () => pieceTypeValue.value,
        set: (newValue) => {
            if (newValue !== pieceTypeValue.value) {
                resetValues()
            }
            pieceTypeValue.value = newValue
        }
    })
    const pieceTypeSelected = computed({
        get: () => pieceType.value >= 0
    })

    const modeValue = ref(-1)
    const mode = computed({
        get: () => modeValue.value,
        set: (newValue) => {
            if (newValue !== modeValue.value) {
                resetValues()
            }
            modeValue.value = newValue
        }
    })
    const modeSelected = computed({
        get: () => pieceTypeSelected.value && mode.value == 1
    })

    const pairMode = ref(-1)
    const pairModeSheetID = ref(-1)
    const pairModeSelected = computed({
        get: () => modeSelected.value &&
            (pairMode.value == 0 ||
            (pairMode.value == 1 && pairModeSheetID.value >= 0) ||
            (pairMode.value == 2 && pairModeSheetID.value >= 0))
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
            switch (Number(pairMode.value)) {
                case 0: //All pairs
                    const letters = "ABCDEFGHIJKLMNOPQRSTUVWX"
                    for (var i = 0; i < 24; i++) {
                        for (var j = 0; j < 24; j++) {
                            pairs.push(letters[i] + letters[j])
                        }
                    }
                    break
                case 1: //All pairs from sheet
                    const sheet = sheetStore.getSheet(pairModeSheetID.value)
                    for (var y = 0; y < sheet.yHeadings.length; y++) {
                        for (var x = 0; x < sheet.xHeadings.length; x++) {
                            if (sheet.grid[y][x] !== "") {
                                pairs.push(sheet.xHeadings.split('')[x] + sheet.yHeadings.split('')[y])
                            }
                        }
                    }
                    break
                case 2: //All pairs from cards
                    const cards = cardStore.cards
                        .filter((card) => card.reference.sheetID == pairModeSheetID.value
                            && card.successCount > 0)
                    for (var i = 0; i < cards.length; i++) {
                        pairs.push(sheetStore.coordToKey(pairModeSheetID.value, cards[i].reference.coord))
                    }
                    break
                case 3: //All pairs from custom

                    break
                default:
            }

            emit('update:on-selected', pairs)
        }
    })

    function getValidCardDecks() {
        const out = [
            ...new Set(
                cardStore.cards
                    .filter((card) => card.successCount > 0)
                    .map((card) => card.reference.sheetID),
            ),
        ].map((sheetID) => sheetStore.getSheet(sheetID))
        return out.filter((sheet) => sheet.type === Number(pieceType.value)) //Filter for image sheets
    }
</script>

<template>
    <div id="ExecSelect">
        <select style="font-size: 2rem" v-model="pieceType">
            <option value=1>Corners</option>
            <option value=2>Edges</option>
        </select>

        <div class="ExecSelectLine" v-if="pieceTypeSelected" />
        <select style="font-size: 2rem" v-model="mode" v-if="pieceTypeSelected">
            <option value="0">Full</option>
            <option value="1">One pair</option>
        </select>

        <div class="ExecSelectLine" v-if="modeSelected" />
        <select style="font-size: 2rem" v-model="pairMode" v-if="modeSelected">
            <option value="0">From all pairs</option>
            <option value="1" v-if="sheetStore.getSheetsOfType(Number(pieceType)).length > 0">From sheet</option>
            <option value="2" v-if="getValidCardDecks().length">From cards</option>
            <!--<option value="3">From custom</option>-->
        </select>

        <div class="ExecSelectLine" v-if="pairMode == 1 || pairMode == 2" />
        <select style="font-size: 2rem" v-model="pairModeSheetID" v-if="pairMode == 1">
            <option v-for="sheet in sheetStore.getSheetsOfType(Number(pieceType))"
                    :value="sheet.id">
                {{sheet.name}}
            </option>
        </select>
        <select style="font-size: 2rem" v-model="pairModeSheetID" v-if="pairMode == 2">
            <option v-for="sheet in getValidCardDecks()"
                    :value="sheet.id">
                {{sheet.name}}
            </option>
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
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
        gap: 10px;
    }

    .ExecSelectLine{
        border-block-end: 5px solid white;
        border-radius:5px;
    }
</style>