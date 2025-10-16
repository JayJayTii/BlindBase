<script setup>
    import { ref } from 'vue'
    import SettingsView from '@/views/SettingsView.vue'

    const showSettings = ref(false)

    function toggleSettings() {
        showSettings.value = !showSettings.value
    }
</script>

<template>
    <!--Navbar sticks to the top of the screen-->
    <div class="Navbar">
        <RouterLink to="/" class="HomeButton">
            <img src="@/assets/logo.png" style="height:5vh;" />
        </RouterLink>

        <img src="@/assets/settings.svg" @click="toggleSettings" class="SettingsButton" />
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
        top: 3px;
    }

    .SettingsButton {
        position: fixed;
        cursor: pointer;
        top: 3px;
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
</style>
