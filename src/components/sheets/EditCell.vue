<script setup>
    import { computed, watch, nextTick, ref } from 'vue'
    import { getRecommendations } from "@/helpers/Recommendations"
    import List from "@/components/List.vue"
    import { useSheetStore } from "@/stores/SheetStore"
    const sheetStore = useSheetStore()
    import { useSettingsStore } from "@/stores/SettingsStore"
    const settingsStore = useSettingsStore()

    const props = defineProps({
        sheetID: Number,
        selectedCell: Object,
        focusCellKey: Boolean,
    })
    const emit = defineEmits(['cellKeyChanged'])

    //Key of the selected cell e.g. AB, XP, DL
    const selectedCellKey = computed({
        get: () => sheetStore.coordToKey(props.sheetID, props.selectedCell),
        set: (newKey) => {
            const newCoord = sheetStore.keyToCoord(props.sheetID, newKey)
            emit('cellKeyChanged', newCoord)
        }
    })
    //Value of the selected cell (i.e. an algorithm)
    const selectedCellValue = computed({
        get: () => sheetStore.getCell(props.sheetID, props.selectedCell),
        set: (newValue) => sheetStore.setCell(props.sheetID, props.selectedCell, newValue)
    })

    //Filter any cell key input to only letters and 2 characters long
    const selectedCellInput = ref(selectedCellKey.value)
    watch(selectedCellInput, (newValue, oldValue) => {
        const inputChar = [...newValue].filter(char => !oldValue.includes(char))[0]
        if (!inputChar) { //Return if the change was not a character (e.g. backspace)
            return
        }

        //Regex to check against letters
        if (!/^[a-xA-X]$/.test(inputChar)) {
            selectedCellInput.value = oldValue
            return
        }
        //If it was 2 letters, replace with the new character
        //Also put to uppercase
        let updatedInput = newValue.length === 3 ? inputChar.toUpperCase() : newValue.toUpperCase()
        if (selectedCellInput.value === updatedInput)
            return //This is triggered to prevent infinite recursion
        
        selectedCellInput.value = updatedInput //This triggers this same function, hence why we need to prevent recursion

        if (updatedInput.length == 2) //If the length is correct, finally update the whole system to this new key
            selectedCellKey.value = updatedInput
    })

    //Get recommendations for this cell if a sheet is selected
    const options = sheetStore.isValidSheetID(props.sheetID)
                    ? getRecommendations(sheetStore.getSheet(props.sheetID).type, sheetStore.coordToKey(props.sheetID, props.selectedCell))
                    : []

    function OptionClicked(index) {
        selectedCellValue.value = options[index]
    }


    //DRAGGABLE PANEL https://www.w3schools.com/howto/howto_js_draggable.asp
    nextTick(() => { dragElement(document.getElementById("EditCell")) })
    function dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        // the header is where you move the DIV from:

        if(!document.getElementById(elmnt.id + "Header"))
            return

        document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
        const startPositionStr = localStorage.getItem("EditCellPosition")
        if(startPositionStr) {
            const startPosition = JSON.parse(startPositionStr)
            setElementPosition(elmnt, startPosition.x, startPosition.y)
        }


        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            const left = elmnt.offsetLeft - pos1;
            const top = elmnt.offsetTop - pos2

            localStorage.setItem("EditCellPosition", JSON.stringify({x: left, y: top}))
            
            setElementPosition(elmnt, left, top)
        }

        function setElementPosition(elmnt, left, top) {
            const elmntHeight = parseInt(window.getComputedStyle(elmnt).height, 10)
            const elmntWidth = parseInt(window.getComputedStyle(elmnt).width, 10)

            // set the element's new position:
            var newTop = top
            const navbarHeight = parseFloat(window.getComputedStyle(document.body).getPropertyValue('--navbar-height'))
            if(newTop < navbarHeight)
                newTop = navbarHeight
            if(newTop + elmntHeight > window.innerHeight)
                newTop = window.innerHeight - elmntHeight

            var newLeft = left
            if(newLeft < 0)
                newLeft = 0
            if(newLeft + elmntWidth + 1 >= window.innerWidth)
                newLeft = window.innerWidth - elmntWidth - 1;
            
            elmnt.style.setProperty("top", (newTop) + "px");
            elmnt.style.setProperty("left", (newLeft) + "px");
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }




    const cellValueInputBox = ref(null)
    const cellKeyInputBox = ref(null)
    nextTick(() => {
        if (props.focusCellKey) {
            if (cellKeyInputBox.value)
                cellKeyInputBox.value.focus()
        } else {
            if (cellValueInputBox.value)
                cellValueInputBox.value.focus()
        }
    })
</script>

<template>
    <div id="EditCell" class="Panel" v-if="sheetStore.isValidSheetID(props.sheetID)">
        <div id="EditCellHeader" class="PanelHeader"> Edit cell:  </div>
        <!------CELL KEY------>
        <div class="SheetEditingRow">
            <input v-model="selectedCellInput" class="editCurCellKey" ref="cellKeyInputBox" />
        </div>

        <!------CELL VALUE------>
        <div class="SheetEditingRow">
            <input v-model="selectedCellValue"
                   ref="cellValueInputBox"
                   maxlength="70"
                   :key="settingsStore.settings.sheets_pairorder"
                   style="width:100%;" />
        </div>

        <!------RECOMMENDATIONS------>
        <div class="SheetEditingRow">Recommendations:</div>
        <div v-if="sheetStore.getSheet(props.sheetID).type != 0" style="height:100%;overflow-y:auto;">
            <List :data="options"
                  :selectedIndex="-1"
                  @onItemClick="OptionClicked" />
        </div>
        <div v-else class="CellOptions" style="color:var(--info-300);text-align:center;">
            Select a type for this sheet to show algorithm recommendations.
        </div>
    </div>
</template>

<style>
    .editCurCellKey {
        font-size: 2rem;
        text-align: center;
        width: min(100%, 4ch);
        text-transform: uppercase;
    }


    #EditCell {
        position: absolute;
        z-index: 5;
        right: 0;
        bottom: 0;
        height: 300px;
        width: 250px;
    }

    #EditCellHeader {
        z-index: 10;
        cursor: move;
    }
</style>