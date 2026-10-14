<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { UserRound, Mail, Phone, ShieldCheck, Check, X, Lock } from 'lucide-vue-next'
import { currentSession, readData, updateData, setSession } from '../services/storage'
const session = currentSession()
const tick = ref(0)
const data = computed(() => { tick.value; return readData() })
const profile = computed(() => data.value.users.find(u => u.id === session?.id))
const name = ref(profile.value?.name || '')
const phone = ref(profile.value?.phone || '')
const error = ref('')
const success = ref('')
const pwdError = ref('')
const pwdSuccess = ref('')
const pwdForm = ref({ current: '', new: '', confirm: '' })
const isAdmin = computed(() => session?.role === 'admin')
const saving = ref(false)
const pwdSaving = ref(false)
const refresh = () => { tick.value++; name.value = profile.value?.name || ''; phone.value = profile.value?.phone || '' }
onMounted(() => window.addEventListener('taxigo:data-updated', refresh))
onUnmounted(() => window.removeEventListener('taxigo:data-updated', refresh))
function save() {
  error.value = ''
  success.value = ''
  if (saving.value) return
  saving.value = true
  if (name.value.trim().length < 2) { error.value = 'Name must be at least 2 characters.'; saving.value = false; return }
  if (!/^[0-9+()\-\s]{7,20}$/.test(phone.value.trim())) { error.value = 'Enter a valid contact number.'; saving.value = false; return }
  let updated
  updateData(d => { updated = d.users.find(u => u.id === session.id); if (updated) { updated.name = name.value.trim(); updated.phone = phone.value.trim() } })
  if (updated) { setSession(updated); success.value = 'Profile updated.' }
  saving.value = false
}
function changePassword() {
  pwdError.value = ''
  pwdSuccess.value = ''
  if (pwdSaving.value) return
  pwdSaving.value = true
  if (!pwdForm.value.current) { pwdError.value = 'Enter your current password.'; pwdSaving.value = false; return }
  if (pwdForm.value.new.length < 8) { pwdError.value = 'New password must be at least 8 characters.'; pwdSaving.value = false; return }
  if (pwdForm.value.new !== pwdForm.value.confirm) { pwdError.value = 'Passwords do not match.'; pwdSaving.value = false; return }
  const user = data.value.users.find(u => u.id === session.id && u.password === pwdForm.value.current)
  if (!user) { pwdError.value = 'Current password is incorrect.'; pwdSaving.value = false; return }
  updateData(d => { const u = d.users.find(x => x.id === session.id); if (u) u.password = pwdForm.value.new })
  pwdForm.value = { current: '', new: '', confirm: '' }
  pwdSuccess.value = 'Password changed successfully.'
  pwdSaving.value = false
}
</script>
<template><div class="page-heading"><div><div class="eyebrow">ACCOUNT SETTINGS</div><h1>My profile</h1><p>Manage your personal details and view your local demo account role.</p></div></div><div v-if="success" class="alert alert-success">{{success}}<button @click="success=''"><X :size="16"/></button></div><div v-if="error" class="alert alert-error">{{error}}<button @click="error=''"><X :size="16"/></button></div><div class="profile-layout"><section class="panel profile-card"><div class="profile-cover"><div class="profile-avatar">{{name.slice(0,1).toUpperCase()}}</div></div><div class="profile-card-content"><h2>{{name}}</h2><p>{{session.email}}</p><span class="role-badge"><ShieldCheck :size="14"/>{{isAdmin?'Administrator':'Passenger account'}}</span><div class="profile-facts"><div><Mail :size="17"/><span>{{session.email}}</span></div><div><Phone :size="17"/><span>{{phone||'No phone added'}}</span></div><div><UserRound :size="17"/><span>Local demo account</span></div></div></div></section><section class="panel profile-form-panel"><div class="panel-heading"><div><h3>Personal information</h3><p>Changes are saved in this browser.</p></div></div><form class="form-stack" @submit.prevent="save"><label>Full name<input v-model.trim="name" required minlength="2" maxlength="100"/></label><label>Email address<input :value="session.email" disabled/><small class="field-help">Email changes are not supported in this demo.</small></label><label>Contact number<input v-model.trim="phone" required/></label><div class="profile-security-note"><ShieldCheck :size="18"/><p>TaxiGo is a frontend-only student project. Profile and account records are not stored on a secure server.</p></div><button class="btn btn-primary" type="submit" :disabled="saving"><Check :size="16"/> {{ saving ? 'Saving…' : 'Save changes' }}</button></form></section><section class="panel profile-form-panel"><div class="panel-heading"><div><h3>Change password</h3><p>Update your login password.</p></div></div><form class="form-stack" @submit.prevent="changePassword"><label>Current password<input v-model="pwdForm.current" type="password" required autocomplete="current-password"/></label><label>New password<input v-model="pwdForm.new" type="password" required minlength="8" autocomplete="new-password"/></label><label>Confirm new password<input v-model="pwdForm.confirm" type="password" required autocomplete="new-password"/></label><div v-if="pwdError" class="form-error">{{pwdError}}</div><div v-if="pwdSuccess" class="alert alert-success inline-alert">{{pwdSuccess}}</div><button class="btn btn-primary" type="submit" :disabled="pwdSaving"><Lock :size="16"/> {{ pwdSaving ? 'Saving…' : 'Update password' }}</button></form></section></div></template>