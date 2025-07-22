<script setup>
    import { ref, computed } from "vue";
    import { useSheetStore } from ".././stores/SheetStore";
    const sheetStore = useSheetStore();
    sheetStore.loadState();

    const curSheetIndex = ref(0);
    console.log(curSheetIndex)
    const isSheetSelected = computed({
        get: () => sheetStore.isValidSheetIndex(curSheetIndex.value),
    });
    const currentSheet = computed({
        get: () => sheetStore.sheets[curSheetIndex.value],
    });
    const currentSheetName = computed({
        get: () => sheetStore.sheets[curSheetIndex.value]?.name || '',
        set: (newName) => {
            if (sheetStore.sheets[curSheetIndex.value]) {
                sheetStore.sheets[curSheetIndex.value].name = newName;
                sheetStore.saveState();
            }
        }
    });
</script>


<template>
    <div class="SheetsView">
        <div class="LeftColumn">
            <div class="SheetSelect">
                <div class="header-row">
                    <h3>Select Sheet:</h3>
                    <button @click="sheetStore.newSheet()" style="justify-content:right">+</button>
                </div>
                <div v-for="(sheetName, index) in sheetStore.getSheetNames"
                     :key="index"
                     :class="['list-item', curSheetIndex === index ? 'selected' : '']"
                     @click="curSheetIndex = index; console.log(index) ">
                    {{ sheetName }}
                </div>
            </div>
            <div class="SheetSettings" v-if="isSheetSelected">
                <h1>{{currentSheetName != "" ? currentSheetName : "&nbsp;"}}</h1>
                <div class="SheetSettingsRow"> Name: <input v-model="currentSheetName" /> </div>
                <div class="SheetSettingsRow">
                    Type: <select id="SheetSettingsType">
                        <option v-for="(type,index) in sheetStore.sheetTypes">
                            {{type.name}}
                        </option>
                    </select>
                </div>
                <div class="SheetSettingsRow">
                    <button @click="sheetStore.deleteSheet()">Delete</button>
                </div>
            </div>
            <div v-else class="SheetSettings"> Select a sheet! </div>
        </div>
        <div class="SheetGridContainer" v-if="isSheetSelected">
            <div class="SheetGrid">
                <div v-for="(row,y) in 24">
                    <div v-for="(col,x) in 24" class="SheetGridCell">
                        {{ currentSheet.grid[y][x] }}
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="SheetGridContainer">
            Select a sheet!
        </div>
        <div class="RightColumn">
            Cell editing here
        </div>
    </div>
</template>

<style>
    .SheetsView {
        display: flex;
        flex-direction: row;
    }

    .LeftColumn {
        display: flex;
        flex-direction: column;
        width: 20vw;
    }

    .SheetSelect {
        height: 40vh;
        border: 3px solid #303030;
        padding: 2px;
    }
    .header-row {
        display: flex;
        justify-content: space-between;
        background-color: #303030;
        align-items: center;
    }

    .SheetSettings {
        height: 53vh;
        border: 3px solid #303030;
        padding: 2px;
        display: flex;
        flex-direction: column;
    }
    .SheetSettingsRow {
        display: flex;
        flex-direction: row;
        padding: 2px;
        gap: 5px;
    }

    .SheetGridContainer {
        width: 60vw;
        height: 93vh;
        border: 3px solid #303030;
    }
    .SheetGrid {
        display: grid;
        grid-template-columns: repeat(24, minmax(50px, max-content));
        overflow: auto;
    }
    .SheetGridCell {
        border: 1px solid #aaa;
        padding: 4px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        background-color: #303030;
        font-size: 12px;
        max-width: 100px;
        min-height: 1rem;
    }

    .RightColumn {
        width: 20vw;
        height: 93vh;
        border: 3px solid #303030;
        padding: 2px;
    }

    .list-item {
        background-color: #303030;
        cursor: pointer;
        height: 20px;
    }
    .selected {
        background-color: white;
        color: black;
        font-weight: bold;
    }

</style>
