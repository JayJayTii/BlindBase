<script setup>
    import { ref, nextTick } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    const router = useRouter()
    const currentRoute = useRoute()
    const routes = router.getRoutes().filter((route) => route.meta.tool)
</script>

<template>
    <!--Navbar sticks to the top of the screen-->
    <div class="Navbar">
        <div class="Navbar-left">
            <div @click="router.push('/')" class="clickable" style="padding-top: 5px;">
                <img src="@/assets/logo.png" style="height: calc(var(--navbar-height) - 10px);" />
            </div>
        </div>
        <div class="Navbar-center">
            <div v-for="route in routes" 
                 :class="['clickable', 'routeHeader', currentRoute.name == route.name ? 'selectedRouteHeader' : 'unselectedRouteHeader']" 
                 @click="router.push(currentRoute.name == route.name ? '/' : route.path.split(':')[0])">
                {{route.name}}
            </div>
        </div>
        <div class="Navbar-right">
            <div @click="router.push('/settings/')" :class="['clickable', currentRoute.name == 'Settings' ? 'selected' : '']">
                <img src="@/assets/icons/settings.svg" style="margin-top: 5px; height: calc(var(--navbar-height) - 10px);"/>
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
        .Navbar-center .routeHeader {
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

    .clickable {
        cursor: pointer;
        user-select: none;
    }
    .selected {
        filter: invert(1);
        background-color: var(--grey-900);
    }
</style>
