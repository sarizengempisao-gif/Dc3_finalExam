import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import DashboardView from './views/DashboardView.vue'
import BookingsView from './views/BookingsView.vue'
import DriversView from './views/DriversView.vue'
import VehiclesView from './views/VehiclesView.vue'
import PaymentsView from './views/PaymentsView.vue'
import ReportsView from './views/ReportsView.vue'
import ProfileView from './views/ProfileView.vue'
import SettingsView from './views/SettingsView.vue'
export const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView, meta: { publicOnly: true } },
  { path: '/register', component: RegisterView, meta: { publicOnly: true } },
  { path: '/admin/dashboard', component: DashboardView, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/bookings', component: BookingsView, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/drivers', component: DriversView, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/vehicles', component: VehiclesView, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/payments', component: PaymentsView, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/reports', component: ReportsView, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/settings', component: SettingsView, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/passenger/bookings', component: BookingsView, meta: { requiresAuth: true, role: 'passenger' } },
  { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]