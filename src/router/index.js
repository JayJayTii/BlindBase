import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SheetsView from '@/views/SheetsView.vue'
import CardsView from '@/views/CardsView.vue'
import MemoView from '@/views/MemoView.vue'
import ExecView from '@/views/ExecView.vue'
import TimerView from '@/views/TimerView.vue'
import ReconsView from '@/views/ReconsView.vue'
import NotFoundView from '@/views/NotFound.vue'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/',        name: 'Home',   component: HomeView, meta: { tool: false }},
        { path: '/sheets', name: 'Sheets', component: SheetsView, meta: { tool: true, description: "Create and edit algsheets" } },
        { path: '/cards', name: 'Cards', component: CardsView, meta: { tool: true, description: "Memo cards? idk i havent even made this yet" } },
        { path: '/memo', name: 'Memo', component: MemoView, meta: { tool: true, description: "ah yes this one makes you remember better" } },
        { path: '/exec', name: 'Exec', component: ExecView, meta: { tool: true, description: "youre not even reading these are you"} },
        { path: '/timer', name: 'Timer', component: TimerView, meta: { tool: true, description: "colourless green ideas sleep furiously" } },
        { path: '/recons', name: 'Recons', component: ReconsView, meta: { tool: true, description: "nerd" } },
        { path: '/:catchAll(.*)*', name: 'NotFound', component: NotFoundView, meta: { tool: false } } //Catch-all route
    ],
})

export default router
