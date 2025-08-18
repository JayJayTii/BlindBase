<script setup>
import { ref } from 'vue'
import SettingsView from '@/views/SettingsView.vue'

const showSettings = ref(false)

function toggleSettings() {
    showSettings.value = !showSettings.value
}
</script>

<template>
    <div class="navbarBackground">
        <RouterLink to="/" class="HomeButton">
            <img src="@/assets/logo.png" style="height:5vh;" />
        </RouterLink>

        <img src="@/assets/settings.svg" @click="toggleSettings" class="SettingsButton" />
        <div v-if="showSettings" @click="toggleSettings" id="settingsBackdrop"></div>
        <SettingsView v-if="showSettings" id="settings" style="position:fixed;" />
    </div>
    <div class="navbar"></div>
</template>

<style>
:root {
    --navbar-height: 7vh;
}

    .navbarBackground {
        position: fixed;
        width: 100%;
        height: var(--navbar-height);
        background-color: var(--brand-700);
        z-index: 20;
    }

    .HomeButton {
        position: fixed;
        top: 3px;
    }

    .SettingsButton {
        position: fixed;
        cursor: pointer;
        top: 3px;
        height: 6vh;
        right: 0px;
    }

.navbar {
    width: 100%;
    height: var(--navbar-height);
}

#settingsBackdrop {
    position: fixed;
    top: var(--navbar-height);
    left: 0;
    width: 100vw;
    height: 93vh;
    background: rgba(256, 256, 256, 0.1); /* semi-transparent */
    z-index: 99;
}

#settings {
    position: absolute;
    top: var(--navbar-height);
    right: 0vw;
}
</style>
