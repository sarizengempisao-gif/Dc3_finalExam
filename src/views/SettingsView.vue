<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Settings, Save, Check, X } from 'lucide-vue-next'
import { readData, updateData, addActivity, currentSession } from '../services/storage'
import { money } from '../services/fareService'
const session = currentSession()
const tick = ref(0)
const data = computed(() => { tick.value; return readData() })
const s = computed(() => data.value.settings)
const baseFare = ref(s.value?.baseFare ?? 50)
const ratePerKm = ref(s.value?.ratePerKm ?? 15)
const serviceFee = ref(s.value?.serviceFee ?? 10)
const error = ref('')
const success = ref('')
const saving = ref(false)
const refresh = () => { tick.value++; baseFare.value = s.value?.baseFare ?? 50; ratePerKm.value = s.value?.ratePerKm ?? 15; serviceFee.value = s.value?.serviceFee ?? 10 }
onMounted(() => window.addEventListener('taxigo:data-updated', refresh))
onUnmounted(() => window.removeEventListener('taxigo:data-updated', refresh))
async function save() {
  error.value = ''
  success.value = ''
  const bf = Number(baseFare.value)
  const rp = Number(ratePerKm.value)
  const sf = Number(serviceFee.value)
  if (!Number.isFinite(bf) || bf < 0) { error.value = 'Base fare must be a valid non-negative number.'; return }
  if (!Number.isFinite(rp) || rp < 0) { error.value = 'Rate per km must be a valid non-negative number.'; return }
  if (!Number.isFinite(sf) || sf < 0) { error.value = 'Service fee must be a valid non-negative number.'; return }
  saving.value = true
  try {
    updateData(d => {
      d.settings = { baseFare: bf, ratePerKm: rp, serviceFee: sf }
    })
    addActivity(`Fare settings updated by ${session?.name}`)
    success.value = 'Fare settings saved.'
  } catch (e) { error.value = e.message }
  finally { saving.value = false }
}
function exampleFare(km) {
  try { return money(bf + km * rp + sf) } catch { return '—' }
}
const bf = baseFare.value, rp = ratePerKm.value, sf = serviceFee.value
</script>
<template>
  <div class="page-heading">
    <div>
      <div class="eyebrow">CONFIGURATION</div>
      <h1>Fare settings</h1>
      <p>Adjust the pricing parameters. Changes apply to new bookings immediately.</p>
    </div>
  </div>
  <div v-if="success" class="alert alert-success">{{success}}<button @click="success=''"><X :size="16"/></button></div>
  <div v-if="error" class="alert alert-error">{{error}}<button @click="error=''"><X :size="16"/></button></div>
  <section class="panel settings-panel">
    <div class="panel-heading"><div><h3>Pricing parameters</h3><p>All amounts in PHP.</p></div></div>
    <form class="form-stack" @submit.prevent="save">
      <label>Base fare<input v-model.number="baseFare" type="number" min="0" step="1" required/></label>
      <label>Rate per estimated km<input v-model.number="ratePerKm" type="number" min="0" step="0.5" required/></label>
      <label>Service fee<input v-model.number="serviceFee" type="number" min="0" step="1" required/></label>
      <div class="fare-examples">
        <strong>Fare examples</strong>
        <table class="example-table">
          <thead><tr><th>Distance</th><th>Estimated fare</th></tr></thead>
          <tbody>
            <tr v-for="km in [1, 5, 10, 20, 50]" :key="km"><td>{{ km }} km</td><td>{{ money(bf + km * rp + sf) }}</td></tr>
          </tbody>
        </table>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" @click="refresh">Reset to current</button>
        <button type="submit" class="btn btn-primary" :disabled="saving"><Save :size="16"/> {{ saving ? 'Saving…' : 'Save changes' }}</button>
      </div>
    </form>
  </section>
</template>