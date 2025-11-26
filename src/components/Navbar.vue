<script setup>
    import { ref } from 'vue'
    import SettingsView from '@/views/SettingsView.vue'
    import HelpView from '@/views/HelpView.vue'
    import { useRouter } from 'vue-router'
    const router = useRouter()

    const showSettings = ref(false)
    const showHelp = ref(!localStorage.getItem("openedBefore"))
    localStorage.setItem("openedBefore", true)

    function toggleSettings() {
        showHelp.value = false
        showSettings.value = !showSettings.value
    }
    function toggleHelp() {
        showSettings.value = false
        showHelp.value = !showHelp.value
    }

    function homeClicked() {
        router.push(`/`)
    }
</script>

<template>
    <!--Navbar sticks to the top of the screen-->
    <div class="Navbar">
        <img src="@/assets/logo.png" style="height:5vh;" @click="homeClicked" class="HomeButton" title="Home" />

        <img src="@/assets/help.svg" title="Help" @click="toggleHelp" class="HelpButton" />
        <div v-if="showHelp" @click="toggleHelp" id="settingsBackdrop"></div>
        <HelpView v-if="showHelp" id="help" style="position:fixed;" @closeHelp="showHelp = false" />

        <img src="@/assets/settings.svg" title="Settings" @click="toggleSettings" class="SettingsButton" />
        <div v-if="showSettings" @click="toggleSettings" id="settingsBackdrop"></div>
        <SettingsView v-if="showSettings" id="settings" style="position:fixed;" />
    </div>
</template>

<style>
    .Navbar {
        position: fixed;
        width: 100%;
        height: var(--navbar-height);
        background-color: var(--brand-700);
        z-index: 20;
    }

    .HomeButton {
        position: fixed;
        top: 0.5vh;
        cursor: pointer;
    }

    .HelpButton {
        position: fixed;
        cursor: pointer;
        top: 0.5vh;
        height: 6vh;
        right: 6vh;
    }
    .SettingsButton {
        position: fixed;
        cursor: pointer;
        top: 0.5vh;
        height: 6vh;
        right: 0px;
    }

    #settingsBackdrop {
        position: fixed;
        top: var(--navbar-height);
        left: 0;
        width: 100vw;
        height: 93vh;
        background: rgba(0, 0, 0, 0.7);
        z-index: 99;
    }

    #settings {
        position: absolute;
        top: var(--navbar-height);
        right: 0vw;
    }
    #help {
        position: absolute;
        left: 50%;
        top: calc(var(--navbar-height) + 4vh);
        max-height: calc(92vh - var(--navbar-height));
        transform: translate(-50%, 0%);
    }
</style>
