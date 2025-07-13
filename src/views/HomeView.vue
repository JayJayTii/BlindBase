<script setup>
    import { useRouter } from 'vue-router'

    const router = useRouter()
    const routes = router.getRoutes().filter(route => !['Home', 'NotFound'].includes(route.name))
</script>

<template>
    <div>
        <nav>
            <RouterLink v-for="route in routes"
                        :key="route.path"
                        :to="route.path">
                {{ route.name }} tool
            </RouterLink>
        </nav>

        <p>HELLOOOO THIS IS THE HOME PAGE JUST IMAGINE</p>

    </div>
</template>

<style>
</style>
