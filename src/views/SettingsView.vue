<script setup>
	import { computed, ref } from 'vue'
	import { ElMessage, ElMessageBox } from 'element-plus'
    import { useCardStore } from '@/stores/CardStore.js'
    import { cornerScheme, edgeScheme } from '@/helpers/letter_scheme.js'
	import { defaults, useSettingsStore } from '.././stores/SettingsStore'
    const settingsStore = useSettingsStore()
    settingsStore.loadState()
    
	const exportDialogVisible = ref(false)
	const importDialogVisible = ref(false)

    function SettingUpdated() {
        settingsStore.saveState()
    }
    
	function UpdateTheme() {
        if(settingsStore.settings.misc_theme == 1)
		    document.documentElement.classList.add('dark')
        else
		    document.documentElement.classList.remove('dark')
	}

    function ImportAll() {
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
            }
			catch (error) {
				ElMessageBox.alert('Failed to import data, please make sure that it was previously exported from BlindBase and that it is a .json file.', 'Import Data', {
					confirmButtonText: 'OK',
				})
                return
            }
			ElMessageBox.alert('Data successfully imported!', 'Import Data', {
				confirmButtonText: 'OK',
                callback: (action) => { window.location.reload(); },
            })
        }
        input.click()
    }

    function ExportAll() {
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

	const showHelp = (setting) => {
		ElMessageBox.alert(
			setting.description,
			setting.name
		)
	}
</script>

<template>
    <div style="display:flex;flex-direction:column;width: 100%; align-items:center;">
        <el-text style="font-size: 5rem; font-weight: 600;">
            Settings
        </el-text>
        <div class="Settings">
            <div>{{ defaults.misc_defaultcornerbuffer.name }}
            </div>
            <div>
                <el-select v-model="settingsStore.settings.misc_defaultcornerbuffer"
                           @change="SettingUpdated"
                           style="width: 100px;"
                           :options="defaults.misc_defaultcornerbuffer.options"
                           :props="{value: 'id',label: 'name', options: defaults.misc_defaultcornerbuffer.options}">
                </el-select>
            </div>

            <div>
                {{ defaults.misc_defaultedgebuffer.name }}
            </div>
            <div>
                <el-select v-model="settingsStore.settings.misc_defaultedgebuffer"
                           @change="SettingUpdated"
                           style="width: 100px;"
                           :options="defaults.misc_defaultedgebuffer.options"
                           :props="{value: 'id',label: 'name', options: defaults.misc_defaultedgebuffer.options}">
                </el-select>
            </div>

            <div>
                {{ defaults.sheets_pairorder.name }}
                <el-icon class="settings-help" @click="showHelp(defaults.sheets_pairorder)"><QuestionFilled /></el-icon>
            </div>
            <div>
                <el-select v-model="settingsStore.settings.sheets_pairorder"
                           @change="SettingUpdated"
                           style="width: 180px;"
                           :options="defaults.sheets_pairorder.options"
                           :props="{value: 'id',label: 'name', options: defaults.sheets_pairorder.options}">
                </el-select>
            </div>

            <div>
                {{ defaults.cards_dailymaximumnewcards.name }}
                <el-icon class="settings-help" @click="showHelp(defaults.cards_dailymaximumnewcards)"><QuestionFilled /></el-icon>
            </div>
            <div>
                <el-input v-model="settingsStore.settings.cards_dailymaximumnewcards"
                          type="number"
                          :min="defaults.cards_dailymaximumnewcards.min"
                          :max="defaults.cards_dailymaximumnewcards.max"
                          @change="SettingUpdated"
                          style="width: 70px;" />
            </div>

            <div>
                {{ defaults.memo_startingmemolength.name }}
                <el-icon class="settings-help" @click="showHelp(defaults.memo_startingmemolength)"><QuestionFilled /></el-icon>
            </div>
            <div>
                <el-input v-model="settingsStore.settings.memo_startingmemolength"
                          type="number"
                          :min="defaults.memo_startingmemolength.min"
                          :max="defaults.memo_startingmemolength.max"
                          @change="SettingUpdated"
                          style="width: 70px;" />
            </div>

            <div>
                {{ defaults.timer_spaceholdingtime.name }}
                <el-icon class="settings-help" @click="showHelp(defaults.timer_spaceholdingtime)"><QuestionFilled /></el-icon>
            </div>
            <div>
                <el-input v-model="settingsStore.settings.timer_spaceholdingtime"
                          type="number"
                          :min="defaults.timer_spaceholdingtime.min"
                          :max="defaults.timer_spaceholdingtime.max"
                          step="0.1"
                          @change="SettingUpdated"
                          style="width: 70px;" />
            </div>

            <div>
                {{ defaults.misc_widemovetype.name }}
            </div>
            <div>
                <el-select v-model="settingsStore.settings.misc_widemovetype"
                           @change="SettingUpdated"
                           style="width: 100px;"
                           :options="defaults.misc_widemovetype.options"
                           :props="{value: 'id',label: 'name', options: defaults.misc_widemovetype.options}">
                </el-select>
            </div>

            <div>
                {{ defaults.misc_theme.name }}
            </div>
            <div>
                <el-select v-model="settingsStore.settings.misc_theme"
                           @change="SettingUpdated(); UpdateTheme()"
                           style="width: 100px;"
                           :options="defaults.misc_theme.options"
                           :props="{value: 'id',label: 'name', options: defaults.misc_theme.options}">
                </el-select>
            </div>
        </div>
        <div style="display: flex; flex-direction: row; margin-top: 20px;justify-content: space-between; width: min(400px, 100%); ">
            <div>
                <el-button @click="exportDialogVisible = true" type="primary">
                    <h2>Export Data</h2>
                </el-button>
            </div>
            <div>
                <el-button @click="importDialogVisible = true" type="danger">
                    <h2>Import Data</h2>
                </el-button>
            </div>
        </div>
    </div>

    <el-dialog v-model="exportDialogVisible" title="Export Data" width="500">
        <span>A copy of your data will be downloaded, which you can import later or on another device.</span>
        <template #footer>
            <div>
                <el-button @click="exportDialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="exportDialogVisible = false; ExportAll()">
                    Export
                </el-button>
            </div>
        </template>
    </el-dialog>
    <el-dialog v-model="importDialogVisible" title="Import Data" width="500">
        <span style="font-size: 1rem;">This will delete and overwrite anything saved on BlindBase. <br /> It might be worth exporting your data first, just in case.</span>
        <template #footer>
            <div>
                <el-button @click="importDialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="importDialogVisible = false; ImportAll()">
                    Import
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style>
    .Settings {
        width: min(600px, 100%);
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

	.settings-help {
        transform: translate(0px, 3px);
        opacity: 0.5;
        cursor: pointer;
	}
        .settings-help:hover {
            opacity: 1;
        }
</style>
