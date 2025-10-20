<script setup>
    import { computed } from 'vue'
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
                <input v-model="settingsStore.settings.sheets_extraximages" type="checkbox"  @change="SettingUpdated"/>
            </div>
            <div id="Sheets Grey Out Invalid Pairs">
                {{ defaults.sheets_greyoutinvalidpairs.name }}:
                <input v-model="settingsStore.settings.sheets_greyoutinvalidpairs" type="checkbox"  @change="SettingUpdated"/>
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
