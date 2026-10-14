<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CarTaxiFront, ArrowRight, ShieldCheck, CarFront } from 'lucide-vue-next'
import { login } from '../services/auth'
const router = useRouter(), email = ref('admin@taxigo.local'), password = ref('Admin123!'), error = ref(''), busy = ref(false)
async function submit() {
  error.value=''; busy.value=true
  try { const user = login(email.value, password.value); await router.push(user.role==='admin'?'/admin/dashboard':'/passenger/bookings') }
  catch(e) { error.value=e.message } finally { busy.value=false }
}
function useDemo(role) { email.value=role==='admin'?'admin@taxigo.local':'passenger@taxigo.local'; password.value=role==='admin'?'Admin123!':'Passenger123!' }
</script>
<template>
  <div class="auth-layout"><section class="auth-visual"><div class="auth-brand"><div class="brand-mark"><CarTaxiFront/></div><strong>TaxiGo</strong></div><div class="visual-copy"><div class="eyebrow light"><span></span> SMARTER RIDE OPERATIONS</div><h1>Every ride,<br/>beautifully <em>managed.</em></h1><p>A simple, connected workspace for bookings, drivers, vehicles, and payments.</p><div class="visual-stats"><div><strong>01</strong><span>Book a ride</span></div><div><strong>02</strong><span>Assign a driver</span></div><div><strong>03</strong><span>Complete the trip</span></div></div></div><div class="visual-footer"><ShieldCheck :size="16"/> Educational demo · Local browser storage</div><div class="visual-decoration deco-one"></div><div class="visual-decoration deco-two"></div></section>
    <section class="auth-main"><div class="auth-card"><div class="auth-mobile-brand"><div class="brand-mark"><CarTaxiFront/></div><strong>TaxiGo</strong></div><div class="auth-icon"><CarFront :size="23"/></div><div class="eyebrow">WELCOME BACK</div><h2>Sign in to TaxiGo</h2><p class="muted auth-intro">Enter your account details to continue.</p><form @submit.prevent="submit" class="form-stack"><label>Email address<input v-model.trim="email" type="email" required autocomplete="username" placeholder="you@example.com"/></label><label>Password<input v-model="password" type="password" required autocomplete="current-password" placeholder="Enter your password"/></label><p v-if="error" class="form-error">{{ error }}</p><button class="btn btn-primary btn-full" type="submit" :disabled="busy">{{ busy?'Signing in…':'Sign in' }} <ArrowRight :size="17"/></button></form><div class="auth-divider"><span>DEMO ACCOUNTS</span></div><div class="demo-buttons"><button class="demo-account" @click="useDemo('admin')"><span class="demo-avatar admin-avatar">A</span><span><strong>Administrator</strong><small>Manage the full system</small></span><ArrowRight :size="16"/></button><button class="demo-account" @click="useDemo('passenger')"><span class="demo-avatar">P</span><span><strong>Passenger</strong><small>Create and track bookings</small></span><ArrowRight :size="16"/></button></div><p class="auth-switch">New to TaxiGo? <RouterLink to="/register">Create a passenger account</RouterLink></p><p class="tiny-note">Demo only: credentials and records are stored locally, not securely.</p></div></section></div>
</template>