<script setup>
    import { computed, inject } from 'vue'
    import { useCardStore } from '@/stores/CardStore.js'
    import { cornerScheme, edgeScheme } from '@/helpers/letter_scheme.js'
    import { defaults, useSettingsStore } from '.././stores/SettingsStore'
    const settingsStore = useSettingsStore()
    settingsStore.loadState()
    
    const confirmDialog = inject('confirmDialog')

    function SettingUpdated() {
        settingsStore.saveState()
    }

    async function ImportAll() {
        if (!(await confirmDialog.value.open('Do you want to import BlindBase data? This will delete and overwrite anything currently saved on BlindBase, it might be worth exporting your data first, just in case.'))) {
            return;
        }
        //https://stackoverflow.com/questions/16215771/how-to-open-select-file-dialog-via-js
        var input = document.createElement('input')
        input.type = 'file'
        input.onchange = async e => {
            var file = e.target.files[0]
            const content = await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.readAsText(file, 'UTF-8')
                reader.onload = e => resolve(e.target.result)
                reader.onerror = reject
            })
            
            
            try {
                const jsonData = JSON.parse(content);
                for(var key of Object.keys(jsonData)) {
                    localStorage.setItem(key, JSON.stringify(jsonData[key]));
                }
                window.location.reload();
            }
            catch (error) {
                alert("Failed to import data, please make sure that it was previously exported from BlindBase and that it is a .json file.")
            }
            alert("Successfully imported!")
            window.location.reload();
        }
        input.click()
    }

    async function ExportAll() {
        if (!(await confirmDialog.value.open('Export all data stored in BlindBase? Nothing will be deleted from BlindBase, a copy of your data will be downloaded.'))) {
            return;
        }
        var keys = Object.keys(localStorage).filter(key => key.includes('Store'));
        var jsonString = '{';
        for (var i = 0; i < keys.length; i++ ) {
            jsonString += '\"' + keys[i] + '\": ';
            jsonString += localStorage.getItem(keys[i]);
            if(i < keys.length - 1)
                jsonString += ',';
        }
        jsonString += '}';
    
        const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(jsonString);
    
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "BlindBase_Data.json")
        document.body.appendChild(link)
        link.click();
        document.body.removeChild(link)
    }
</script>

<template>
    <div style="display:flex;flex-direction:column;width: 100%; align-items:center;">
        <h1 style="font-size: 3rem;color:var(--grey-100);">Settings</h1>
        <div class="Settings">
            <div>{{ defaults.misc_defaultcornerbuffer.name }}</div>
            <div>
                <select v-model="settingsStore.settings.misc_defaultcornerbuffer" @change="SettingUpdated">
                    <option v-for="(type, index) in defaults.misc_defaultcornerbuffer.options"
                            :key="index"
                            :value="index">
                        {{ type.name + " (" + cornerScheme[index] + ")" }}
                    </option>
                </select>
            </div>

            <div>{{ defaults.misc_defaultedgebuffer.name }}</div>
            <div>
                <select v-model="settingsStore.settings.misc_defaultedgebuffer" @change="SettingUpdated">
                    <option v-for="(type, index) in defaults.misc_defaultedgebuffer.options"
                            :key="index"
                            :value="index">
                        {{ type.name + " (" + edgeScheme[index] + ")" }}
                    </option>
                </select>
            </div>

            <div>{{ defaults.sheets_pairorder.name }}</div>
            <div>
                <select v-model="settingsStore.settings.sheets_pairorder" @change="SettingUpdated">
                    <option v-for="(type, index) in defaults.sheets_pairorder.options"
                            :key="index"
                            :value="index">
                        {{ type.name }}
                    </option>
                </select>
            </div>

            <div>{{ defaults.cards_dailymaximumnewcards.name }}</div>
            <div>
                <input v-model="settingsStore.settings.cards_dailymaximumnewcards"
                       type="number"
                       :min="defaults.cards_dailymaximumnewcards.min"
                       :max="defaults.cards_dailymaximumnewcards.max"
                       @change="SettingUpdated"
                       style="width: 6ch;" />
            </div>

            <div>{{ defaults.timer_spaceholdingtime.name }}</div>
            <div>
                <input v-model="settingsStore.settings.timer_spaceholdingtime"
                       type="number"
                       :min="defaults.timer_spaceholdingtime.min"
                       :max="defaults.timer_spaceholdingtime.max"
                       step="0.1"
                       @change="SettingUpdated"
                       style="width:6ch;" />
            </div>

            <div>{{ defaults.misc_widemovetype.name }}</div>
            <div>
                <select v-model="settingsStore.settings.misc_widemovetype" @change="SettingUpdated">
                    <option v-for="(type, index) in defaults.misc_widemovetype.options"
                            :key="index"
                            :value="type.id">
                        {{ type.name }}
                    </option>
                </select>
            </div>
        </div>
        <div style="display: flex; flex-direction: row; margin-top: 20px;justify-content: space-between; width: min(400px, 100%); ">
            <div>
                <button @click="ImportAll"><h2>Import Data</h2></button>
            </div>
            <div>
                <button @click="ExportAll"><h2>Export Data</h2></button>
            </div>
        </div>
    </div>
    <div style="min-height: 80px;"></div>
</template>

<style>
    .Settings {
        width: min(600px, 100%);
        border-radius: 10px;
        color: var(--text-color);
        padding: 4px;
        overflow: hidden;
        display: grid;
        grid-template-columns: 2fr 1fr;
        font-size: 1.3rem;
        padding: 20px;
        gap: 10px;
    }

		.Settings * {
			font-size: inherit;
		}
		.Settings > :nth-child(even) {
            text-align: end;
		}


    .Subsettings {
        border-bottom: 2px solid var(--text-color);
    }
</style>
