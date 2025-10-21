<script setup>
    import { computed } from 'vue'
    import { useCardStore } from '@/stores/CardStore.js'
    import { defaults, useSettingsStore } from '.././stores/SettingsStore'
    const settingsStore = useSettingsStore()
    settingsStore.loadState()

    function SettingUpdated() {
        settingsStore.saveState()
    }
</script>

<template>
    <div class="Settings">
        <h1>Settings</h1>
        <div class="Subsettings">
            <h2>Sheets Settings</h2>
            <div id="Sheets pair order">
                {{ defaults.sheets_pairorder.name }}:
                <select v-model="settingsStore.settings.sheets_pairorder" @change="SettingUpdated">
                    <option v-for="(type, index) in defaults.sheets_pairorder.options"
                            :key="index"
                            :value="index">
                        {{ type.name }}
                    </option>
                </select>
            </div>
            <div id="Sheets Notation Type">
                {{ defaults.sheets_notationtype.name }}:
                <select v-model="settingsStore.settings.sheets_notationtype" @change="SettingUpdated">
                    <option v-for="(type, index) in defaults.sheets_notationtype
                            .options"
                            :key="index"
                            :value="index">
                        {{ type.name }}
                    </option>
                </select>
            </div>
            <div id="Sheets Extra X Images">
                {{ defaults.sheets_extraximages.name }}:
                <input v-model="settingsStore.settings.sheets_extraximages" type="checkbox" @change="SettingUpdated" />
            </div>
            <div id="Sheets Grey Out Invalid Pairs">
                {{ defaults.sheets_greyoutinvalidpairs.name }}:
                <input v-model="settingsStore.settings.sheets_greyoutinvalidpairs" type="checkbox" @change="SettingUpdated" />
            </div>
        </div>
        <div class="Subsettings">
            <h2>Cards Settings</h2>
            <div id="Cards Learning To Due Threshold">
                {{ defaults.cards_learningtoduethreshold.name }}:
                <input v-model="settingsStore.settings.cards_learningtoduethreshold"
                       type="number"
                       :min="defaults.cards_learningtoduethreshold.min"
                       :max="defaults.cards_learningtoduethreshold.max"
                       @change="SettingUpdated" />
            </div>
            <div id="Cards Daily Maximum New Cards">
                {{ defaults.cards_dailymaximumnewcards.name }}:
                <input v-model="settingsStore.settings.cards_dailymaximumnewcards"
                       type="number"
                       :min="defaults.cards_dailymaximumnewcards.min"
                       :max="defaults.cards_dailymaximumnewcards.max"
                       @change="SettingUpdated" />
                ({{useCardStore().dailyStats.dailyNewCards}} new cards done today)
            </div>
        </div>
    </div>
</template>

<style>
    .Settings {
        width: min(500px, calc(100vw - 15px));
        height: 50vh;
        background-color: var(--grey-800);
        border: 4px solid var(--grey-900);
        border-radius: 10px;   
        z-index: 100;
        color: var(--text-color);
        padding: 4px;
        overflow: auto;
    }

    .Subsettings {
        border-top: 2px solid var(--text-color);
    }
</style>
