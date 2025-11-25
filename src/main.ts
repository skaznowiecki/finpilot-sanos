import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './style.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Configure state management with Pinia and persistence plugin
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// Configure router
app.use(router)

app.mount('#app')
