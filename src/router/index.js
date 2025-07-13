import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from "@/views/HomeView.vue";
import SheetsView from "@/views/SheetsView.vue";
import NotFoundView from "@/views/NotFound.vue";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', name: 'Home', component: HomeView },
        { path: '/sheets', name: 'Sheets', component: SheetsView },
        { path: '/:catchAll(.*)*', name: 'NotFound', component: NotFoundView } // catch-all route
    ]
})

export default router