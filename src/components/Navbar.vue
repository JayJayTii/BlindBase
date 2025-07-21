<template>
    <div class="navbar">
        <RouterLink to="/">
            <img src="@/assets/logo.png" height="100%"/>
        </RouterLink>
    </div>
</template>

<style>
    .navbar {
        width: 100%;
        height: 7vh;
        background-color: hsl(140, 50%, 15%);
        padding: 3px;
        justify-content: left;
        align-content: center;
        display:flex;
        flex-direction: row;
    }

</style>