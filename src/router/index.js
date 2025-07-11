import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from "@/views/HomeView.vue";
import SheetsView from "@/views/SheetsView.vue";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        '/': HomeView,
        '/sheets': SheetsView
    ]
})

export default router