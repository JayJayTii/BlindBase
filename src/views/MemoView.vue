<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useSheetStore } from '../stores/SheetStore'
import { useCardStore } from '../stores/CardStore'
import { useMemoStore, modes } from '../stores/MemoStore'
const sheetStore = useSheetStore()
sheetStore.loadState()
const cardStore = useCardStore()
cardStore.loadState()
const memoStore = useMemoStore()
memoStore.loadState()

const mode = ref(0)
const stage = ref(0)
const length = ref(4)

function SetStage(index) {
    stage.value = index
    switch (index) {
        case 0:
            break
        case 1:
            updatePossiblePairs()
            testSequence = GenerateSequence()
            break
        case 3:
            userSequence.value = Array(cubes.value).fill('')
            //nextTick(() => { sequenceInput.value[0].focus() })
            break
        case 4:
            FormatUserSequence()
            break
    }
}

//Stage 0 (choose settings)
const pairSelect = ref(0)
const pairSelectSheet = ref({})
const possiblePairs = ref([])
const cubes = ref(2)
function GetLearnedCards() {
    const out = cardStore.cards.filter((card) => card.successCount > 0)
    return out.filter((card) => sheetStore.getSheet(card.reference.sheetID).type === 3) //Filter for image sheets
}
function GetSheetsWithLearnedCards() {
    const out = [
        ...new Set(
            cardStore.cards
                .filter((card) => card.successCount > 0)
                .map((card) => card.reference.sheetID),
        ),
    ].map((sheetID) => sheetStore.getSheet(sheetID))
    return out.filter((sheet) => sheet.type === 3) //Filter for image sheets
}
function PairSelectUpdated() {
    if (pairSelect.value === 1) {
        //All pairs in sheet
        pairSelectSheet.value = sheetStore.getSheetsOfType(3)[0]
    } else if (pairSelect.value === 2) {
        //All cards for a sheet
        pairSelectSheet.value = GetSheetsWithLearnedCards()[0]
    }
}
function ModeUpdated() {
    if (mode.value === 2) {
        //Multiblind
        if (cubes.value < 2) cubes.value = 2
    }
}
function updatePossiblePairs() {
    if (pairSelect.value === 0) {
        //All possible pairs
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('') //This is incorrect but good enough for now
        possiblePairs.value = []
        letters.forEach((char1) => {
            letters.forEach((char2) => {
                possiblePairs.value.push(char1 + char2)
            })
        })
    }
    if (pairSelect.value === 1) {
        //All pairs in a sheet
        possiblePairs.value = []
        for (var y = 0; y < 24; y++) {
            for (var x = 0; x < 24; x++) {
                if (pairSelectSheet.value.grid[y][x] === '') continue
                possiblePairs.value.push(
                    pairSelectSheet.value.xHeadings[x] + pairSelectSheet.value.yHeadings[y],
                )
            }
        }
    }
    if (pairSelect.value === 2) {
        //All cards for a sheet
        possiblePairs.value = []
        const relevantCards = GetLearnedCards().filter(
            (card) => card.reference.sheetID === pairSelectSheet.value.id,
        )
        //Each card only has a coordinate, map it to the key in the sheet
        possiblePairs.value = relevantCards.map(
            (card) =>
                pairSelectSheet.value.xHeadings[card.reference.coord.x] +
                pairSelectSheet.value.yHeadings[card.reference.coord.y],
        )
    }
}
function StartRun() {
    if (mode.value !== 2) {
        length.value = 4
        cubes.value = 1
    } else {
        length.value = 10
    }
    SetStage(1)
}

//Stage 1 (show sequence)
var testSequence = []
function GenerateSequence() {
    var sequenceArr = []
    for (var cube = 0; cube < cubes.value; cube++) {
        var newSequence = ''
        for (var key = 0; key < length.value; key++) {
            const nextKey =
                possiblePairs.value[Math.floor(Math.random() * possiblePairs.value.length)]
            newSequence += nextKey + ' '
        }
        newSequence = newSequence.trim()
        sequenceArr.push(newSequence)
    }
    return sequenceArr
}

//Stage 2 (distraction)

//Stage 3 (enter memo)
const sequenceInput = ref(null)
const userSequence = ref([])

//Stage 4 (compare to correct)
function FormatUserSequence() {
    //https://stackoverflow.com/questions/6259515/how-can-i-split-a-string-into-segments-of-n-characters
    for (var i = 0; i < userSequence.value.length; i++) {
        const scrubbed = userSequence.value[i].split(' ').join('').toUpperCase()
        if (scrubbed.match(/.{1,2}/g)) {
            const formatted = scrubbed.match(/.{1,2}/g).join(' ')
            userSequence.value[i] = formatted
        } else {
            userSequence.value[i] = scrubbed
        }
    }
}
const correct = computed({
    get: () => {
        var correctCubes = 0
        for (var i = 0; i < userSequence.value.length; i++) {
            const user = userSequence.value[i].split(' ').join('').toLowerCase()
            const test = testSequence[i].split(' ').join('').toLowerCase()
            if (user === test) {
                correctCubes += 1
            }
        }
        return correctCubes
    },
})
const score = computed({
    get: () => 2 * correct.value - cubes.value,
})

function EndTurn() {
    if (pairSelect.value === 0) {
        //Only update highscore when testing all possible letter pairs
        UpdateHighscore()
    }
    if (mode.value === 0) {
        //Endless (kinda)
        length.value += correct.value ? 1 : -1
        if (length.value < 1) {
            SetStage(0)
            return
        }
    } else if (mode.value === 1) {
        //One mistake
        if (correct.value) {
            length.value += 1
        }
        else {
            SetStage(0)
        }
        return
    } else if (mode.value === 2) {
        //Multiblind
        SetStage(0)
        return
    }
    SetStage(1)
}
function UpdateHighscore() {
    if (mode.value === 2) {
        if (score.value <= memoStore.GetHighscore(mode.value)) return

        memoStore.SetHighscore(mode.value, score.value)
    } else {
        if (length.value <= memoStore.GetHighscore(mode.value)) return

        memoStore.SetHighscore(mode.value, length.value)
    }
    memoStore.saveState()
}

function handleKeydown(event) {
    if (event.code === 'Enter') {
        if (stage.value === 0) {
            StartRun()
        }
        else if (stage.value === 4) {
            EndTurn()
        }
        else SetStage((stage.value + 1) % 5)
    }
}
onMounted(() => {
    //Cant really have enter keybind because it messes with multiblind sequence input
    //Watch me
    window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <div v-if="stage > 0"
         style="
            display: grid;
            grid-template-columns: repeat(4, 24vw);
            max-width: 100%;
            font-size: 1.5rem;
            justify-self: start;
            margin-top: 10px;
        ">
        <img src="@/assets/arrow-left-long.svg"
             @click="if (stage === 4) {UpdateHighscore();}
                SetStage(0)
            "
             class="BackButton" />
        <div>Mode: {{ modes[mode] }}</div>
        <div v-if="mode !== 2">Length: {{ length }}</div>
        <div v-else>Cubes: {{ cubes }}</div>
        <div v-if="pairSelect === 0">Highscore: {{ memoStore.GetHighscore(mode) }}</div>
    </div>
    <div v-if="stage === 0" class="MemoViewContainer">
        <div class="MemoViewHeader">
            Mode:
            <select v-model="mode" @change="ModeUpdated()" style="font-size: 2rem">
                <option v-for="(modeOption, index) in modes" :value="index">
                    {{ modeOption }}
                </option>
            </select>
            <div v-if="pairSelect === 0" style="margin-left: 20px">
                (Highscore: {{ memoStore.GetHighscore(mode) }})
            </div>
        </div>
        <div class="MemoViewHeader" v-if="mode === 2">
            Cubes:
            <input type="number"
                   v-model="cubes"
                   value="2"
                   min="2"
                   style="font-size: 2rem; width: 100px" />
        </div>
        <div class="MemoViewHeader">
            Select pairs from:
            <select v-model="pairSelect" @change="PairSelectUpdated()" style="font-size: 2rem">
                <option :value="0">All possible pairs</option>
                <option v-if="sheetStore.getSheetsOfType(3).length > 0" :value="1">
                    All pairs in a sheet
                </option>
                <option v-if="GetLearnedCards().length > 0" :value="2">
                    All cards for a sheet
                </option>
            </select>
        </div>
        <div class="MemoViewHeader" v-if="pairSelect === 1">
            Sheet:
            <select v-model="pairSelectSheet" style="font-size: 2rem">
                <option v-for="sheetOption in sheetStore.getSheetsOfType(3)" :value="sheetOption">
                    {{ sheetOption.name }}
                </option>
            </select>
        </div>
        <div class="MemoViewHeader" v-if="pairSelect === 2">
            Sheet:
            <select v-model="pairSelectSheet" style="font-size: 2rem">
                <option v-for="sheetOption in GetSheetsWithLearnedCards()" :value="sheetOption">
                    {{ sheetOption.name }}
                </option>
            </select>
        </div>
        <img src="@/assets/arrow-right-long.svg" class="NextButton" @click="StartRun()" />
    </div>
    <div v-else-if="stage === 1" class="MemoViewContainer">
        <div style="display:flex;flex-direction:column;gap:15px;">
            <div v-for="cube in testSequence" style="display:flex;flex-direction:row;gap:5px;">
                <div v-for="pair in cube.split(' ')" class="MemoPair">
                    {{pair}}
                </div>
            </div>
        </div>
        <img src="@/assets/arrow-right-long.svg"
             class="NextButton"
             @click="SetStage((stage + 1) % 5)" />
    </div>
    <div v-else-if="stage === 2" class="MemoViewContainer">
        <div style="font-size: 2rem">DISTRACTION GRAAAHHH</div>
        <img src="@/assets/arrow-right-long.svg"
             class="NextButton"
             @click="SetStage((stage + 1) % 5)" />
    </div>
    <div v-else-if="stage === 3" class="MemoViewContainer">
        <input v-for="cube in cubes"
               v-model="userSequence[cube - 1]"
               :ref="'sequenceInput' + cube"
               :style="{
                textTransform: 'uppercase',
                fontSize: '2rem',
                width: testSequence[0].length + 1 + 'ch',
            }" />

        <img src="@/assets/arrow-right-long.svg"
             class="NextButton"
             @click="SetStage((stage + 1) % 5)" />
    </div>
    <div v-else-if="stage === 4" class="MemoViewContainer">
        <div style="display:flex;align-self:center;">
            <div v-if="mode !== 2">{{ correct === 1 ? 'Correct!' : 'Incorrect' }}</div>
            <div v-else style="font-size: 2.5rem;">
                {{ correct }}/{{ cubes }} (score: {{ score < 0 ? 'DNF' : score }})
            </div>
        </div>
        <div style="font-size: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap:50px;">
                <div>
                    It was:
                    <div style="display:flex;flex-direction:column;gap:15px;">
                        <div v-for="cubeSequence in testSequence" style="display:flex;flex-direction:row;gap:5px;">
                            <div v-for="pair in cubeSequence.split(' ')" class="MemoPair">
                                {{pair}}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    You put:
                    <div style="display:flex;flex-direction:column;gap:15px;">
                        <div v-for="cubeSequence in userSequence" style="display:flex;flex-direction:row;gap:5px;">
                            <div v-if="cubeSequence.length > 0" v-for="pair in cubeSequence.split(' ')" class="MemoPair">
                                {{pair}}
                            </div>
                        </div>
                    </div>
                </div>
            <div style="height:20vh;"></div>
        </div>
        <img src="@/assets/arrow-right-long.svg"
             class="NextButton"
             @click="EndTurn()" />
    </div>
</template>

<style>
.MemoViewContainer {
    display: flex;
    flex-direction: column;
    justify-self: center;
    padding-top: 15vh;
    gap: 20px;
    font-size: 2rem;
}
.MemoViewHeader {
    display: flex;
    flex-direction: row;
    gap: 10px;
}

    .NextButton {
        background-color: var(--brand-600);
        border-radius: 5px;
        cursor: pointer;
        height: 3rem;
        width: 80px;
        position: fixed;
        left: 90%;
        top: 90%;
        transform: translate(-100%, -100%);
    }
.NextButton:hover {
    background-color: var(--brand-500);
}

    .MemoPair {
        border: 4px solid var(--brand-900);
        border-radius: 5px;
        background-color: var(--brand-700);
        width: 50px;
        height: 50px;
        justify-content: center;
        text-align: center;
        font-size: 1.5rem;
    }
</style>
