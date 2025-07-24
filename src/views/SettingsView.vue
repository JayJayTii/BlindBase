<script setup>
    import { computed } from 'vue'
    import { useSettingsStore } from ".././stores/SettingsStore";
    const settingsStore = useSettingsStore();
    settingsStore.loadState();

    const Sheets_PairOrder = computed({
        get: () => settingsStore.sheets_pairorder,
        set: (newValue) => {
            settingsStore.sheets_pairorder = newValue;
            settingsStore.saveState();
        }
    })
</script>

<template>

    <div class="Settings">
        <div class="Settings_Sheets">
            <h2>Sheets Settings</h2>
            <div class="Settings_Sheets_PairOrder">
                {{settingsStore.sheets_pairorder_definition.name}}:
                <select v-model="Sheets_PairOrder">
                    <option v-for="(type,index) in settingsStore.sheets_pairorder_definition.options" :key="index" :value="index">
                        {{type.name}}
                    </option>
                </select>
            </div>
        </div>
    </div>
</template>

<style>
    .Settings {
        width: 50vw;
        height: 50vh;
        background-color: #181818;
        border: 4px solid white;
        z-index: 100;
    }
</style>
