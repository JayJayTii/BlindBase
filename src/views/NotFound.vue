<template>
    <div class="not-found">
        <h1>404 - Page Not Found</h1>
        <p>Sorry, the page you're looking for doesn't exist.</p>
        <router-link to="/">
            <p class="PanelHeader" style="cursor:pointer;width:20vw;" >Go back home</p>
        </router-link>
    </div>
</template>

<style scoped>
.not-found {
    text-align: left;
    padding: 2rem;
    color: var(--grey-100);
}
</style>
