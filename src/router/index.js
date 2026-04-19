import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SheetsView from '@/views/SheetsView.vue'
import CardsView from '@/views/CardsView.vue'
import MemoView from '@/views/MemoView.vue'
import ExecView from '@/views/ExecView.vue'
import TimerView from '@/views/TimerView.vue'
import ReconsView from '@/views/ReconsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import DonateView from '@/views/DonateView.vue'
import NotFoundView from '@/views/NotFound.vue'

//These are all of the pages of the application.
const router = createRouter({
    history: createWebHistory(),
    routes: [ 
        {  
            path: '/',
            name: 'Home',
            component: HomeView,
            meta: {
                tool: false,
            },
        },
        {
            path: '/sheets',
            name: 'Sheets',
            component: SheetsView,
            meta: { 
                tool: true,
                description: 'Create and edit your own algsheets',
            },
        },
        {
            path: '/cards',
            name: 'Cards',
            component: CardsView,
            meta: {
                tool: true,
                description: 'Revise your algorithms with flashcards',
            },
        },
        {
            path: '/memo',
            name: 'Memo',
            component: MemoView,
            meta: {
                tool: true,
                description: 'Improve your long-term memorisation',
            },
        },
        {
            path: '/exec',
            name: 'Exec',
            component: ExecView,
            meta: {
                tool: true,
                description: 'Execute your algorithms with targeted practice',
            },
        },
        {
            path: '/timer',
            name: 'Timer',
            component: TimerView,
            meta: {
                tool: true,
                description: 'Put your skills to use in full solves',
            },
        },
        {
            path: '/recons/:pathMatch(.*)*',
            name: 'Recons',
            component: ReconsView,
            meta: {
                tool: true,
                description: 'Create reconstructions of your best solves',
            },
        },
        {
            path: '/settings',
            name: 'Settings',
            component: SettingsView,
            meta: {
                tool: false,
            },
        },
        {
            path: '/donate',
            name: 'Donate',
            component: DonateView,
            meta: {
                tool: false,
            },
        },
        {   //Catch-all route
            path: '/:catchAll(.*)*',
            name: '404 Not Found',
            component: NotFoundView,
            meta: { tool: false },
        },
    ],
})

export default router