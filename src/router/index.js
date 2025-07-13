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
        { path: '/', name: 'Home', component: HomeView },
        { path: '/sheets', name: 'Sheets', component: SheetsView },
        { path: '/cards', name: 'Cards', component: CardsView },
        { path: '/memo', name: 'Memo', component: MemoView },
        { path: '/exec', name: 'Exec', component: ExecView },
        { path: '/timer', name: 'Timer', component: TimerView },
        { path: '/recons', name: 'Recons', component: ReconsView },
        { path: '/:catchAll(.*)*', name: 'NotFound', component: NotFoundView } //Catch-all route
    ],
})

export default router
