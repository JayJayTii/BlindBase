<script setup>
    import { ref, nextTick } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    const router = useRouter()
    const routes = router.getRoutes().filter((route) => route.meta.tool)
</script>

<template>
    <!--Navbar sticks to the top of the screen-->
    <div style="position: sticky; top: 0px; z-index: 20;">
        <div class="Navbar">
            <div class="Navbar-left">
                <a href="/"><img src="@/assets/logo.png" /></a>
            </div>
            <div class="Navbar-center">
                <a v-for="route in routes" :class="useRoute().name == route.name ? 'selectedRouteHeader' : 'unselectedRouteHeader'" :href="route.path.split(':')[0]">
                    {{route.name}}
                </a>
            </div>
            <div class="Navbar-right">
                <a href="/settings/"><img src="@/assets/icons/settings.svg" style="height:45px;" /></a>
            </div>
        </div>
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
            display: flex;
            align-items: center;
            justify-content: center;
            height: var(--navbar-height);
            width: 100px;
        }


    .unselectedRouteHeader {
        color: var(--grey-100);
        text-decoration: none;
        height: var(--navbar-height);
        text-align: center;
        font-size: 20px;
    }
        .unselectedRouteHeader:hover {
            background-color: var(--brand-800);
        }

    .selectedRouteHeader {
        background-color: var(--grey-100);
        color: var(--grey-900);
        text-decoration: none;
        font-weight: bold;
        height: var(--navbar-height);
        text-align: center;
        font-size: 20px;
    }
</style>
