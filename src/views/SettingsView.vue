<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '.././stores/SettingsStore'
const settingsStore = useSettingsStore()
settingsStore.loadState()

const Sheets_PairOrder = computed({
    get: () => settingsStore.sheets_pairorder,
    set: (newValue) => {
        settingsStore.sheets_pairorder = newValue
        settingsStore.saveState()
    },
})
const Sheets_NotationType = computed({
    get: () => settingsStore.sheets_notationtype,
    set: (newValue) => {
        settingsStore.sheets_notationtype = newValue
        settingsStore.saveState()
    },
})
const Sheets_ExtraXImages = computed({
    get: () => settingsStore.sheets_extraximages,
    set: (newValue) => {
        settingsStore.sheets_extraximages = newValue
        settingsStore.saveState()
    },
})
</script>

<template>
    <div class="Settings">
        <h1>Settings</h1>
        <div class="Subsettings">
            <h2>Sheets Settings</h2>
            <div class="Settings_Sheets_PairOrder">
                {{ settingsStore.sheets_pairorder_definition.name }}:
                <select v-model="Sheets_PairOrder">
                    <option
                        v-for="(type, index) in settingsStore.sheets_pairorder_definition.options"
                        :key="index"
                        :value="index"
                    >
                        {{ type.name }}
                    </option>
                </select>
            </div>
            <div class="Settings_Sheets_NotationType">
                {{ settingsStore.sheets_notationtype_definition.name }}:
                <select v-model="Sheets_NotationType">
                    <option
                        v-for="(type, index) in settingsStore.sheets_notationtype_definition
                            .options"
                        :key="index"
                        :value="index"
                    >
                        {{ type.name }}
                    </option>
                </select>
            </div>
            <div class="Settings_Sheets_ExtraXImages">
                {{ settingsStore.sheets_extraximages_definition.name }}:
                <input
                    v-model="Sheets_ExtraXImages"
                    type="checkbox"
                    class="Settings_Sheets_ExtraXImages"
                />
            </div>
            <h2>Cards Settings</h2>
        </div>
    </div>
</template>

<style>
    .Settings {
        width: 50vw;
        height: 50vh;
        background-color: var(--grey-800);
        border: 4px solid var(--grey-900);
        z-index: 100;
        color: var(--text-color);
        padding: 4px;
        overflow: auto;
    }

    .Subsettings {
        border-top: 2px solid var(--text-color);
    }
</style>
