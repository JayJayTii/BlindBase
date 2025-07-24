<script setup>
    import { ref } from 'vue'
    import SettingsView from '@/views/SettingsView.vue'

    const showSettings = ref(false);

    function toggleSettings() {
        showSettings.value = !showSettings.value;
    }
</script>

<template>
    <div class="navbar">
        <RouterLink to="/">
            <img src="@/assets/logo.png" height="100%" />
        </RouterLink>

        <img src="@/assets/settings.svg" 
             @click="toggleSettings" 
             style="cursor:pointer"/>
        <div v-if="showSettings" @click="toggleSettings" id="settingsBackdrop"></div>
        <SettingsView v-if="showSettings" id="settings" />
    </div>
</template>

<style>
    :root {
        --navbar-height: 7vh;
    }

    .navbar {
        width: 100%;
        height: var(--navbar-height);
        background-color: var(--brand-800);
        padding: 3px;
        align-content: center;
        display: flex;
        justify-content: space-between;
        flex-direction: row;
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