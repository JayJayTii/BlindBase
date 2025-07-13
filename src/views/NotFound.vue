<template>
    <div class="not-found">
        <h1>404 - Page Not Found</h1>
        <p>Sorry, the page you're looking for doesn't exist.</p>
        <router-link to="/">Go back home</router-link>
    </div>
</template>

<script>export default {
  name: 'NotFound'
}</script>

<style scoped>
    .not-found {
        text-align: left;
        padding: 2rem;
    }
</style>