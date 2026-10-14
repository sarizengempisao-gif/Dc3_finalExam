import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import { routes } from './router'
import { ensureSeedData, currentSession } from './services/storage'

ensureSeedData()
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})
router.beforeEach((to) => {
  const user = currentSession()
  if (to.meta.publicOnly && user) return user.role === 'admin' ? '/admin/dashboard' : '/passenger/bookings'
  if (to.meta.requiresAuth && !user) return '/login'
  if (to.meta.role && user?.role !== to.meta.role) return user?.role === 'admin' ? '/admin/dashboard' : user ? '/passenger/bookings' : '/login'
  return true
})
createApp(App).use(router).mount('#app')