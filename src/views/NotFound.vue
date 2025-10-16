<template>
    <div class="not-found">
        <h1>404 - Page Not Found</h1>
        <p style="text-align:center;">This page doesn't exist.<br />Unless you count this.<br /><br />I don't.</p>
        <router-link to="/">
            <p class="PanelHeader" style="cursor:pointer;width:20vw;" >Home</p>
        </router-link>
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
