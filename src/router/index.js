import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SheetsView from '@/views/SheetsView.vue'
import CardsView from '@/views/CardsView.vue'
import MemoView from '@/views/MemoView.vue'
import ExecView from '@/views/ExecView.vue'
import TimerView from '@/views/TimerView.vue'
import ReconsView from '@/views/ReconsView.vue'
import NotFoundView from '@/views/NotFound.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: HomeView,
            meta: {
                tool: false,
            }
        },
        {
            path: '/sheets',
            name: 'Sheets',
            component: SheetsView,
            meta: {
                tool: true,
                description: "Create and edit your own algsheets",
                iconPath: new URL('@/assets/SheetsIcon.png', import.meta.url).href
            }
        },
        {
            path: '/cards',
            name: 'Cards',
            component: CardsView,
            meta: {
                tool: true,
                description: "Revise your algorithms with flashcards",
                iconPath: new URL('@/assets/CardsIcon.png', import.meta.url).href
            }
        },
        {
            path: '/memo',
            name: 'Memo',
            component: MemoView,
            meta: {
                tool: true,
                description: "Improve your long-term memo",
                iconPath: new URL('@/assets/MemoIcon.png', import.meta.url).href
            }
        },
        { path: '/exec', name: 'Exec', component: ExecView, meta: { tool: true, description: "youre not even reading these are you" } },
        { path: '/timer', name: 'Timer', component: TimerView, meta: { tool: true, description: "colourless green ideas sleep furiously" } },
        { path: '/recons', name: 'Recons', component: ReconsView, meta: { tool: true, description: "nerd" } },
        { path: '/:catchAll(.*)*', name: 'NotFound', component: NotFoundView, meta: { tool: false } } //Catch-all route
    ],
})

export default router