import './assets/main.css'

import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

createApp(App).use(router).use(createPinia()).mount('#app')

//https://stackoverflow.com/questions/51639850/how-to-change-page-titles-when-using-vue-router
router.afterEach((to, from) => {
    // Use next tick to handle router history correctly
    // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
    nextTick(() => {
        document.title = to.name + ' | BlindBase'
    })
})
