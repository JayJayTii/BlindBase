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
    })

    const selectedCellValue = computed({
        get: () => sheetStore.getCell(props.sheetID, props.selectedCell),
        set: (newValue) => sheetStore.setCell(props.sheetID, props.selectedCell, newValue)
    })

    const notationType = computed({
        get: () => settingsStore.settings.sheets_notationtype == 1 ? true : false,
        set: (newValue) => {
                settingsStore.settings.sheets_notationtype = (newValue ? 1 : 0)
                settingsStore.saveState()
                getOptions()
            }
    })
    //Get recommendations for this cell if a sheet is selected
    let options = []
    function getOptions() {
		options = getRecommendations(sheetStore.getSheet(props.sheetID).type, sheetStore.coordToKey(props.sheetID, props.selectedCell), sheetStore.getSheet(props.sheetID).buffer)
    }
    getOptions()

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
        if (cellValueInputBox.value)
            cellValueInputBox.value.focus()
    })
</script>

<template>
    <div id="EditCell" class="Panel" v-if="sheetStore.isValidSheetID(props.sheetID)">
        <div id="EditCellHeader" class="PanelHeader"> Editing {{sheetStore.coordToKey(props.sheetID, props.selectedCell)}}:  </div>

        <!------CELL VALUE------>
        <div class="SheetEditingRow" style="padding-top: 10px;">
            <input v-model="selectedCellValue"
                   ref="cellValueInputBox"
                   maxlength="70"
                   :key="settingsStore.settings.sheets_pairorder"
                   style="width:100%;" />
        </div>

        <!------RECOMMENDATIONS------>
        <div style="display: flex; justify-content:space-between; align-items: center;">
            <div>Recommendations:</div>
            <div v-if="sheetStore.getType(props.sheetID) == 1 || sheetStore.getType(props.sheetID) == 2" style="display:flex;flex-direction:row;align-items:center; font-size: 10px;gap:2px;">
                Comm:
                <input type="checkbox" v-model="notationType" />
            </div>
        </div>
        <div v-if="sheetStore.getSheet(props.sheetID).type != 0" style="overflow-y:auto;">
            <List :data="options"
                  :selectedIndex="-1"
                  @onItemClick="OptionClicked" />
            <p class="credit">Recommendations from <a :href="sheetStore.getSheet(props.sheetID).type != 3 ? 'https://v2.blddb.net/' : 'https://bestsiteever.net/colpi/'" target="_blank">{{sheetStore.getSheet(props.sheetID).type != 3 ? "v2.blddb.net" : "bestsiteever.net/colpi"}}</a></p>
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

    .credit {
        font-size: 10px;
        text-align: end;
        position: sticky;
        bottom: 0px;
        background-color: var(--panel-color);
    }

    #EditCell {
        overflow: hidden;
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