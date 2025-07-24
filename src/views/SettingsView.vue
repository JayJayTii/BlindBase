<script setup>
    import { computed } from 'vue'
    import { useSettingsStore } from ".././stores/SettingsStore";
    const settingsStore = useSettingsStore();
    settingsStore.loadState();

    const Sheets_PairOrder = computed({
        get: () => settingsStore.Sheets.pairOrder.value,
        set: (newValue) => {
            settingsStore.Sheets.pairOrder.value = newValue;
            settingsStore.saveState();
        }
    })
</script>

<template>

    <div class="Settings">
        <div class="Settings_Sheets">
            <h2>Sheets Settings</h2>
            <div class="Settings_Sheets_PairOrder">
                {{settingsStore.Sheets.pairOrder.name}}:
                <select v-model="Sheets_PairOrder">
                    <option v-for="(type,index) in settingsStore.Sheets_PairOrders" :key="index" :value="index">
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
