<script setup>
    import { useRouter } from 'vue-router'
    const router = useRouter()
</script>

<template>
    <div class="not-found">
        <h1>404 - Page Not Found</h1>
        <p style="text-align:center;">This page doesn't exist.<br />Unless you count this.<br /><br />I don't.</p>
        <div class="CustomButton" style="width:200px;font-size:2rem;" @click="router.push(`/`)">
            Home
        </div>
    </div>
</template>

<style scoped>
    .not-found {
        display: flex;
        justify-content: center; 
        align-items: center;
        flex-direction:column;
        height:75vh;
        padding: 2rem;
        color: var(--grey-100);
    }
</style>
