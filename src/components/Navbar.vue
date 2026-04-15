<script setup>
    import { ref, nextTick } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import Logo from '@/components/Icons/Logo.vue'
    const router = useRouter()
    const currentRoute = useRoute()
    const routes = ['Home', 'Sheets', 'Cards', 'Memo', 'Exec', 'Timer', 'Recons', 'Settings']
</script>

<template>
    <el-menu style="width: 100%;" :default-active="routes.indexOf(currentRoute.name).toString()" 
             :ellipsis="false" mode="horizontal">
        <el-menu-item index="0" @click="router.push('/')">
            <el-icon :size="35" style="width: auto;">
                <Logo style="width: 100%;"/>
            </el-icon>
        </el-menu-item>
        
        <el-menu-item index="1" @click="router.push('/sheets')">
            Sheets
        </el-menu-item>
        <el-menu-item index="2" @click="router.push('/cards')">
            Flashcards
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
        <el-menu-item index="6" style="width:150px;" @click="router.push('/recons')">
            Reconstructions
        </el-menu-item>
        <el-menu-item index="7" @click="router.push('/settings')" style="margin-left: auto; width: 70px;">
            <el-icon :size="35" style="width: auto; margin-left: 5px;"><Setting style="width: 100%;"/></el-icon>
        </el-menu-item>
    </el-menu>
</template>

<style>
    .el-menu .el-menu-item {
        width: 100px;
        font-size: 1rem;
    }
</style>
