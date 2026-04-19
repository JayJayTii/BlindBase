import 'element-plus/theme-chalk/dark/css-vars.css'
import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import './assets/main.css'
import App from './App.vue'
import router from './router'


const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.use(createPinia())
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

//Could be redirected from 404.html to work around Single-Page Application limitations
const redirectPath = sessionStorage.redirect 
if (redirectPath) {
    sessionStorage.removeItem('redirect')
    router.replace(redirectPath)
}

app.mount('#app')

//https://stackoverflow.com/questions/51639850/how-to-change-page-titles-when-using-vue-router
router.afterEach((to, from) => {
    // Use next tick to handle router history correctly
    // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
    nextTick(() => {
        document.title = to.name + ' | BlindBase'
    })
})
