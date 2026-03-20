<script setup>

</script>

<template>
    <div class="Footer">
        <a href="https://www.youtube.com/@BlindBase" target="_blank">YouTube</a>
        <a href="https://github.com/JayJayTii/BlindBase" target="_blank">GitHub</a>
        <a href="https://www.worldcubeassociation.org/persons/2018TUPP02" target="_blank">Created by James Tuppenney</a>
        <a href="/donate/">Donate</a>
    </div>
</template>

<style>
    .Footer {
        display: grid;
        grid-template-columns: repeat(4, auto);
        justify-content: center;
        height: var(--footer-height);
        z-index: 20;
        gap: 60px;
        border: 2px solid var(--grey-700);
        background-color: var(--grey-800);
        color: var(--grey-100);
    }
</style>