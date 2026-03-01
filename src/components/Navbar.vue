<script setup>
    import { ref } from 'vue'
    import SettingsView from '@/views/SettingsView.vue'
    import { useRouter } from 'vue-router'
    const router = useRouter()

    const showSettings = ref(false)

    function toggleSettings() {
        showSettings.value = !showSettings.value
    }
</script>

<template>
    <!--Navbar sticks to the top of the screen-->
    <div style="position: sticky; top: 0px; z-index: 20;">
        <div class="Navbar">
            <div class="Navbar-left">
                <a href="/"><img src="@/assets/logo.png" /></a>
            </div>
            <div class="Navbar-center">
                <a href="/sheets/">Sheets</a>
                <a href="/cards/">Cards</a>
                <a href="/memo/">Memo</a>
                <a href="/exec/">Exec</a>
                <a href="/timer/">Timer</a>
                <a href="/recons/">Recons</a>
            </div>
            <div class="Navbar-right">
                <a @click="toggleSettings"><img src="@/assets/icons/settings.svg" style="height:50px;" /></a>
            </div>
        </div>
        <div v-if="showSettings" @click="toggleSettings" id="settingsBackdrop"></div>
        <SettingsView v-if="showSettings" id="settings" style="position:fixed;" />
    </div>
</template>

<style>
    .Navbar {
        display: flex;
        justify-content: space-between;
        height: var(--navbar-height);
        background-color: var(--brand-700);
        padding-left: 10px;
    }
    .Navbar-left,
    .Navbar-center,
    .Navbar-right {
        display: flex;
        align-items: center;
    }
        .Navbar-center a {
            width: 100px;
            height: auto;
        }
    a {
        color: var(--grey-100);
        text-decoration: none;
        height: var(--navbar-height);
        text-align:center;
        font-size: 20px;
    }
        a:hover {
            background-color: var(--brand-800);
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
