<script setup>
    import { nextTick, watch, computed, ref, onMounted, onUnmounted } from "vue"
    import { allLetterPairs, isPossiblePair } from '@/helpers/pairs.js'
    import { cornerBuffers, edgeBuffers } from '@/helpers/letter_scheme.js'
    import SheetGrid from '@/components/SheetGrid.vue'
    import { useMemoStore, modes, modesDesc } from '@/stores/MemoStore.js'
    const memoStore = useMemoStore()
    import { useSheetStore } from '@/stores/SheetStore'
    const sheetStore = useSheetStore()
    import { useCardStore } from '@/stores/CardStore'
    const cardStore = useCardStore()
    import { useSettingsStore } from '@/stores/SettingsStore'
    useSettingsStore().loadState()

    const emit = defineEmits(['restartRun', 'cancelRun'])

    const modeValue = ref("Corners")
    const mode = computed({
        get: () => modeValue.value,
        set: (newValue) => {
            modeValue.value = newValue
            if (newValue === "Multiblind" && cubes.value < 2)
                cubes.value = 2
            
			//Always clear custom pair settings
			if (mode.value == "Corners")
				buffer.value = useSettingsStore().settings.misc_defaultcornerbuffer
			else if (mode.value == "Edges")
				buffer.value = useSettingsStore().settings.misc_defaultedgebuffer
            generateCustomPairSheet()
            highlightedCells.value = []
            editingCustomPairs.value = false
            RestartRun()
        }
    })
    const modeSelected = computed({
        get: () => mode.value != ""
    })

    const cubesValue = ref(2)
    const cubes = computed({
        get: () => cubesValue.value,
        set: (newValue) => {
            cubesValue.value = newValue
            if(mode.value === "Multiblind") {
                if (newValue < 2)
                    cubesValue.value = 2
                else if (newValue > 200)
                    cubesValue.value = 200
                RestartRun()
            }
        }
    })

    const pairSelectValues = [{ value: 'From all pairs', tooltip: 'All letter pairs' },
        { value: 'From sheet', tooltip: 'All letter pairs in an images sheet' },
        { value: 'From cards', tooltip: 'Flashcards in an images card deck' },
        { value: 'From custom', tooltip: 'Select from a grid of letter pairs' }]
    const pairSelectValue = ref("From all pairs")
    const pairSelect = computed({
        get: () => pairSelectValue.value,
        set: (newValue) => {
            pairSelectValue.value = newValue
            if (newValue === "From sheet")
                pairSelectSheet.value = sheetStore.getSheetsOfType(3)[0]
            else if (newValue === "From cards")
                pairSelectSheet.value = GetSheetsWithLearnedCards()[0]
            else if (newValue === "From custom") {
                if (mode.value == "Corners")
					buffer.value = useSettingsStore().settings.misc_defaultcornerbuffer
				else if (mode.value == "Edges")
					buffer.value = useSettingsStore().settings.misc_defaultedgebuffer

                highlightedCells.value = []
                generateCustomPairSheet()
            }
            editingCustomPairs.value = false
            RestartRun()
        }
    })

    //Includes both "From sheet" and "From cards" because they both take from alg-sheets
    const pairSelectSheetValue = ref(null)
    const pairSelectSheet = computed({
        get: () => pairSelectSheetValue.value,
        set: (newValue) => {
            pairSelectSheetValue.value = newValue
            RestartRun()
        }
    })

    const pairSelectFinished = computed({
        get: () =>  pairSelect.value == "From all pairs"
                    || pairSelect.value == "From sheet" && pairSelectSheet.value
                    || pairSelect.value == "From cards" && pairSelectSheet.value
                    || pairSelect.value == "From custom" && highlightedCells.value.length > 0
    })

    function GetSheetsWithLearnedCards() {
        //All unique sheet with learning or due cards
        const IDs = Array.from(new Set(cardStore.cards.filter((card) => card.successCount > 0).map((card) => card.sheetID)))
        //Convert those IDs to sheets and filter for image sheets
        const sheets = IDs.map((sheetID) => sheetStore.getSheet(sheetID)).filter((sheet) => sheet.type === 3)
        return sheets
    }
    function GetLearnedCards() {
        const out = cardStore.cards.filter((card) => card.successCount > 0)
        //Filter for image sheets
        return out.filter((card) => sheetStore.getSheet(card.sheetID).type === 3) 
    }

    const editingCustomPairs = ref(false)

    const bufferValue = ref(-1)
    const buffer = computed({
        get: () => bufferValue.value,
        set: (newValue) => {
            bufferValue.value = newValue
            highlightedCells.value = []
            editingCustomPairs.value = false
            generateCustomPairSheet()
        }
    })

    const gridRef = ref(null)
    const highlightedCells = ref([])
    let possibleCustomPairs = 0
    const customSheet = ref({}) //Contains all the possible letter pairs that the user can select to practice from
    function generateCustomPairSheet() {
        let grid = Array.from({ length: 24 }, () => Array.from({ length: 24 }, () => ''))
        customSheet.value = {
            xHeadings: 'ABCDEFGHIJKLMNOPQRSTUVWX',
            yHeadings: 'ABCDEFGHIJKLMNOPQRSTUVWX',
			type: 0,
            buffer: buffer.value,
        }
        possibleCustomPairs = 0
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWX"
        for (var y = 0; y < 24; y++) {
            for (var x = 0; x < 24; x++) {
                if(mode.value == "Corners")
					grid[y][x] = (Number(buffer.value) == -1 || isPossiblePair(1, letters[y] + letters[x], buffer.value)) ? (letters[y] + letters[x]) : ""
                else if (mode.value == "Edges")
					grid[y][x] = (Number(buffer.value) == -1 || isPossiblePair(2, letters[y] + letters[x], buffer.value)) ? (letters[y] + letters[x]) : ""
                else
					grid[y][x] = (letters[y] + letters[x])

                if (grid[y][x] != '')
                    possibleCustomPairs++
            }
        }
        customSheet.value.grid = grid
    }

    function onCustomPairsClicked(values, create) {
        if(create)
            highlightedCells.value = highlightedCells.value.concat(values);
        else {
            const newHighlightedCells = []
            for (const cell of highlightedCells.value) {
                if(!values.some((cellDiff) => cellDiff.x == cell.x && cellDiff.y == cell.y))
                    newHighlightedCells.push(cell)
            }
            highlightedCells.value = newHighlightedCells
        }
        gridRef.value.changeHighlightedCells(highlightedCells.value)
	}
	const handleCustomPairClose = (done) => {
		RestartRun()
		done()
	}
	
    function getPossiblePairs() {
		let possiblePairs = []
		let letters = "ABCDEFGHIJKLMNOPQRSTUVWX"
		const flipped = useSettingsStore().settings.sheets_pairorder === 1
        switch (pairSelect.value) {
			case "From all pairs":
				return allLetterPairs

            case "From sheet":
                for (var y = 0; y < 24; y++) {
                    for (var x = 0; x < 24; x++) {
                        if (pairSelectSheet.value.grid[y][x] == '')
							continue
						possiblePairs.push(letters[y] + letters[x])
                    }
                }
                return possiblePairs

			case "From cards": // Get learned cards from selected sheet, then convert to letter pair
                return GetLearnedCards()
                    .filter(card => card.sheetID === pairSelectSheet.value.id)
                    .map(card => (letters[card.coord.y] + letters[card.coord.x]))

            case "From custom": // Convert highlighted cell coords to letter pairs
                return highlightedCells.value.map(coord => letters[coord.y] + letters[coord.x])
        }
    }

    function RestartRun() {
        if(!pairSelectFinished.value) {
            emit('cancelRun')
            return
        }
        if (mode.value !== "Multiblind")
            cubes.value = 1
        const possiblePairs = getPossiblePairs()
        emit('restartRun', {
            mode: mode.value,
            cubes: Number(cubes.value),
            pairSelect: pairSelect.value,
            pairSelectSheet: pairSelectSheet.value,
            possiblePairs: possiblePairs,
        })
    }
    RestartRun()

    async function editCustomPairButtonClicked() {
        editingCustomPairs.value = !editingCustomPairs.value
        await nextTick()
        if (gridRef.value)
			gridRef.value.changeHighlightedCells(highlightedCells.value)
    }
</script>

<template>
    <div id="MemoSelect">
        <!-- MODE -->
        <el-select v-model="mode" size="large" style="width: 130px;">
            <el-tooltip v-for="(mode, index) in modes" :content="modesDesc[index]" placement="right">
                <el-option :value="mode">{{ mode }}</el-option>
            </el-tooltip>
        </el-select>
        <el-divider class="MemoSelectLine" v-if="modeSelected" />

        <!-- MULTIBLIND => CUBES -->
        <el-input v-if="mode === 'Multiblind'"
                  type="number" v-model="cubes"
                  min="2" max="200"
                  size="large" style="width: 70px;" />
        <el-divider class="MemoSelectLine" v-if="mode === 'Multiblind'" />

        <!-- MODE => FROM [___] -->
        <div v-if="modeSelected">
            <el-select v-model="pairSelect" size="large" style="width: 150px;">
                <el-tooltip v-for="option in pairSelectValues" :content="option.tooltip" placement="right">
                    <el-option :value="option.value">{{option.value}}</el-option>
                </el-tooltip>
            </el-select>
        </div>

        <!-- MODE => FROM SHEET => [____] -->
        <el-divider class="MemoSelectLine" v-if="pairSelect != '' && pairSelect != 'From all pairs'" />
        <div v-if="pairSelect == 'From sheet'">
            <div v-if="sheetStore.getSheetsOfType(3).length > 0">
                <el-select v-model="pairSelectSheet" size="large" style="width: 250px;">
                    <el-option v-for="sheetOption in sheetStore.getSheetsOfType(3)" :label="sheetOption.name" :value="sheetOption">{{ sheetOption.name }}</el-option>
                </el-select>
            </div>
            <div v-else>
                No valid sheets
            </div>
        </div>
        <!-- MODE => FROM CARDS => [____] -->
        <div v-if="pairSelect == 'From cards'">
            <div v-if="GetLearnedCards().length > 0">
                <el-select v-model="pairSelectSheet" size="large" style="width: 250px">
                    <el-option v-for="sheetOption in GetSheetsWithLearnedCards()" :label="sheetOption.name" :value="sheetOption">{{ sheetOption.name }}</el-option>
                </el-select>
            </div>
            <div v-else>
                No valid card decks
            </div>
        </div>

        <!-- CORNERS => FROM CUSTOM => CORNER BUFFER -->
        <el-select v-if="pairSelect == 'From custom' && mode == 'Corners'"
                   v-model="buffer" size="large" style="width: 80px;">
            <el-option label="*" :value="-1">*</el-option>
            <el-option v-for="(buffer, index) in cornerBuffers" :label="buffer" :value="index">{{ buffer }}</el-option>
        </el-select>
        <!-- EDGES => FROM CUSTOM => EDGE BUFFER -->
        <el-select v-if="pairSelect == 'From custom' && mode == 'Edges'"
                   v-model="buffer" size="large" style="width: 80px;">
            <el-option label="*" :value="-1">*</el-option>
            <el-option v-for="(buffer, index) in edgeBuffers" :label="buffer" :value="index">{{ buffer }}</el-option>
        </el-select>
        <el-divider class="MemoSelectLine" v-if="pairSelect == 'From custom' && (mode == 'Corners' || mode == 'Edges')" />

        <el-button v-if="pairSelect == 'From custom'" type="primary" style="height: 40px;" @click="editCustomPairButtonClicked()">
            <el-icon :size="25"><Edit /></el-icon>
        </el-button>

        <el-divider class="MemoSelectLine" v-if="pairSelectFinished && pairSelect == 'From all pairs'" />
        <div v-if="pairSelectFinished && pairSelect == 'From all pairs'">
            Highscore: {{ memoStore.GetHighscore(mode) }}
        </div>
    </div>

    <hr />

    <el-drawer v-model="editingCustomPairs"
               :title="'Select letter pairs to practice: ' + highlightedCells.length.toString() + '/' + possibleCustomPairs.toString()"
               size="95%"
               direction="rtl"
               body-class="drawer-body"
               :before-close="handleCustomPairClose">
        <SheetGrid :sheet="customSheet"
                   :formatEmpty="true"
                   :fullLineSelection="true"
                   :key="customSheet.value"
                   @update:selected-cells="onCustomPairsClicked"
                   ref="gridRef"
                   style="height: 100%; width: 100%;" />
    </el-drawer>
</template>

<style>
    #MemoSelect {
        justify-self: start;
        align-items: center;
        min-height: 10vh;
        min-width: 100%;
        display: flex;
        flex-direction: row;
        gap: 10px;
        padding-inline: 20px;
    }

    .MemoSelectLine {
        border-width: 2px;
        width: 100px;
    }

    #CustomPairGrid {
        height: 75vh;
        width: 95vw;
        position: absolute;
        left: 2.5vw;
        top: 10vh;
        transform: translate(0vw, -100vh);
        z-index: 20;
        border-radius: 10px;
    }

    .AnimatedGridOpen { animation: animatedGridOpen 0.2s forwards; }
    @keyframes animatedGridOpen {
        from { transform: translate(0vw, -100vh); }
        to { transform: translate(0vw, 0vh); }
    }
    .AnimatedGridClose { animation: animatedGridClose 0.2s forwards; }
    @keyframes animatedGridClose {
        from { transform: translate(0vw, 0vh); }
        to { transform: translate(0vw, -100vh); }
    }

</style>