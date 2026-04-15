<script setup>
    import { ref, nextTick } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    const router = useRouter()
    const currentRoute = useRoute()
    const routes = ['Home', 'Sheets', 'Cards', 'Memo', 'Exec', 'Timer', 'Recons', 'Settings']
</script>

<template>
    <!--Navbar sticks to the top of the screen-->
    <el-menu style="width: 100%;" :default-active="routes.indexOf(currentRoute.name).toString()" 
             :ellipsis="false" mode="horizontal">
        <el-menu-item index="0" @click="router.push('/')">
            <el-icon>
                <img src="@/assets/logo.png" style="height: 30px;" />
            </el-icon>
        </el-menu-item>
        
        <el-menu-item index="1" @click="router.push('/sheets')">
            Sheets
        </el-menu-item>
        <el-menu-item index="2" @click="router.push('/cards')">
            Cards
        </el-menu-item>
        <el-menu-item index="3" @click="router.push('/memo')">
            Memo
        </el-menu-item>
        <el-menu-item index="4" @click="router.push('/exec')">
            Exec
        </el-menu-item>
        <el-menu-item index="5" @click="router.push('/timer')">
            Timer
        </el-menu-item>
        <el-menu-item index="6" @click="router.push('/recons')">
            Recons
        </el-menu-item>
        <el-menu-item index="7" @click="router.push('/settings')" style="margin-left: auto;">
            <el-icon :size="30" style="width: 40px;"><Setting /></el-icon>
        </el-menu-item>
    </el-menu>
</template>

<style>
    .el-menu .el-menu-item {
        width: 100px;
        font-size: 1rem;
    }
</style>
