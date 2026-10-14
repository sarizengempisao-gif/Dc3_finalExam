<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LayoutDashboard, CalendarDays, Users, CarFront, Wallet, BarChart3, UserRound, LogOut, Menu, X, CarTaxiFront, RotateCcw, Bell, Settings } from 'lucide-vue-next'
import { currentSession, readData, clearSession, ensureSeedData } from './services/storage'
const route = useRoute(), router = useRouter()
const user = ref(currentSession()), dataVersion = ref(0), mobileOpen = ref(false)
const refresh = () => { user.value = currentSession(); dataVersion.value++ }
onMounted(() => { window.addEventListener('taxigo:data-updated', refresh); window.addEventListener('taxigo:session-updated', refresh) })
onUnmounted(() => { window.removeEventListener('taxigo:data-updated', refresh); window.removeEventListener('taxigo:session-updated', refresh) })
const isAdmin = computed(() => user.value?.role === 'admin')
const authPage = computed(() => ['/login', '/register'].includes(route.path))
const links = computed(() => isAdmin.value ? [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/admin/drivers', label: 'Drivers', icon: Users },
  { to: '/admin/vehicles', label: 'Vehicles', icon: CarFront },
  { to: '/admin/payments', label: 'Payments', icon: Wallet },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/profile', label: 'Profile', icon: UserRound }
] : [
  { to: '/passenger/bookings', label: 'My bookings', icon: CalendarDays },
  { to: '/profile', label: 'Profile', icon: UserRound }
])
function signOut() { clearSession(); router.push('/login'); mobileOpen.value = false }
function resetDemo() {
  if (!isAdmin.value || !window.confirm('Reset all local TaxiGo data to the original demo data? This cannot be undone.')) return
  ensureSeedData(true); user.value = null; router.push('/login')
}
</script>
<template>
  <RouterView v-if="authPage" />
  <div v-else class="app-shell">
    <div v-if="mobileOpen" class="mobile-scrim" @click="mobileOpen=false"></div>
    <aside class="sidebar" :class="{ 'sidebar-open': mobileOpen }">
      <div class="brand"><div class="brand-mark"><CarTaxiFront :size="23"/></div><div><strong>TaxiGo</strong><small>RIDE MANAGEMENT</small></div><button class="icon-button mobile-close" @click="mobileOpen=false" aria-label="Close menu"><X/></button></div>
      <div class="workspace"><span class="workspace-dot"></span><div><strong>{{ isAdmin ? 'Operations' : 'Passenger portal' }}</strong><small>{{ isAdmin ? 'Administrator workspace' : 'Your ride space' }}</small></div></div>
      <div class="nav-caption">WORKSPACE</div>
      <nav class="nav-list">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="nav-link" :class="{ active: route.path === link.to }" @click="mobileOpen=false"><component :is="link.icon" :size="18"/><span>{{ link.label }}</span><span v-if="link.to.includes('bookings') && isAdmin" class="nav-count">{{ readData().bookings.filter(b=>b.status==='Pending').length }}</span></RouterLink>
      </nav>
      <div class="sidebar-bottom">
        <div class="help-card"><div class="help-icon"><Bell :size="17"/></div><strong>Demo environment</strong><p>Your records are saved in this browser only.</p></div>
        <button v-if="isAdmin" class="nav-link reset-link" @click="resetDemo"><RotateCcw :size="18"/> <span>Reset demo data</span></button>
        <button class="nav-link logout-link" @click="signOut"><LogOut :size="18"/><span>Sign out</span></button>
        <div class="user-mini"><div class="avatar">{{ user?.name?.slice(0,1).toUpperCase() }}</div><div class="user-mini-info"><strong>{{ user?.name }}</strong><small>{{ isAdmin ? 'Administrator' : 'Passenger' }}</small></div><span class="online-dot"></span></div>
      </div>
    </aside>
    <main class="main-panel">
      <header class="topbar"><button class="icon-button mobile-menu" @click="mobileOpen=true" aria-label="Open menu"><Menu/></button><div class="breadcrumb">Workspace <span>/</span> <strong>{{ links.find(l=>l.to===route.path)?.label || 'Profile' }}</strong></div><div class="topbar-right"><div class="secure-label"><span></span> Local demo mode</div><div class="top-avatar">{{ user?.name?.slice(0,1).toUpperCase() }}</div></div></header>
      <div class="page-content"><RouterView :key="route.fullPath" /></div>
      <footer class="footer"><span>© {{ new Date().getFullYear() }} TaxiGo</span><span>Student capstone · Vue 3 + LocalStorage</span></footer>
    </main>
  </div>
</template>