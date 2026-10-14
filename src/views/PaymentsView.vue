<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Wallet, Search, CheckCircle2, RotateCcw, X, CreditCard } from 'lucide-vue-next'
import { readData } from '../services/storage'
import { money, dateTime } from '../services/fareService'
import { recordPayment, refundPayment } from '../services/bookingService'
const tick = ref(0), search = ref(''), method = ref({}), error = ref(''), success = ref('')
const data = computed(() => { tick.value; return readData() })
const payments = computed(() => data.value.payments.filter(p => { const b = data.value.bookings.find(x => x.id === p.bookingId); return [b?.code, b?.passengerName, b?.pickup, b?.destination, p.method, p.status].some(x => String(x || '').toLowerCase().includes(search.value.toLowerCase())) }))
const eligible = computed(() => data.value.bookings.filter(b => b.status === 'Completed' && !data.value.payments.some(p => p.bookingId === b.id && p.status === 'Paid')))
const paid = computed(() => data.value.payments.filter(p => p.status === 'Paid').reduce((s, p) => s + Number(p.amount), 0))
const refresh = () => tick.value++
onMounted(() => window.addEventListener('taxigo:data-updated', refresh))
onUnmounted(() => window.removeEventListener('taxigo:data-updated', refresh))
function pay(b) {
  error.value = ''
  success.value = ''
  try {
    const m = method.value[b.id] || 'Cash'
    recordPayment(b.id, m)
    success.value = `Payment recorded for ${b.code}.`
  } catch (e) { error.value = e.message }
}
function refund(p) {
  error.value = ''
  success.value = ''
  if (!confirm('Mark this payment as refunded? This only updates the demo record.')) return
  try { refundPayment(p.id); success.value = 'Payment marked as refunded.' } catch (e) { error.value = e.message }
}
</script>
<template><div class="page-heading"><div><div class="eyebrow">FINANCIAL RECORDS</div><h1>Payments</h1><p>Record ride payments and review payment history. No money is processed.</p></div><div class="heading-chip"><Wallet :size="17"/> Demo ledger</div></div><div v-if="success" class="alert alert-success">{{success}}<button @click="success=''"><X :size="16"/></button></div><div v-if="error" class="alert alert-error">{{error}}<button @click="error=''"><X :size="16"/></button></div><div class="mini-stats"><div class="mini-stat"><span>Recorded payments</span><strong>{{data.payments.length}}</strong></div><div class="mini-stat"><span>Paid revenue</span><strong class="text-green">{{money(paid)}}</strong></div><div class="mini-stat"><span>Unpaid completed rides</span><strong class="text-amber">{{eligible.length}}</strong></div><div class="mini-stat"><span>Refunded</span><strong>{{data.payments.filter(p=>p.status==='Refunded').length}}</strong></div></div><section class="panel payment-queue"><div class="panel-heading"><div><h3>Ready for payment</h3><p>Only completed rides can be marked as paid.</p></div><span class="queue-count">{{eligible.length}} unpaid</span></div><div v-for="b in eligible" :key="b.id" class="payment-ready-row"><div class="payment-ready-icon"><CreditCard :size="19"/></div><div class="assignment-trip"><strong>{{b.code}} · {{b.passengerName}}</strong><span>{{b.pickup}} → {{b.destination}}</span><small>{{dateTime(b.scheduledAt)}}</small></div><strong class="payment-amount">{{money(b.fare)}}</strong><select v-model="method[b.id]" class="payment-method"><option>Cash</option><option>E-wallet</option></select><button class="btn btn-primary btn-small" @click="pay(b)"><CheckCircle2 :size="15"/> Record paid</button></div><div v-if="!eligible.length" class="empty-inline">No completed rides are awaiting payment.</div></section><div class="list-toolbar"><div class="search-field"><Search :size="17"/><input v-model="search" placeholder="Search payment history…"/></div><span class="results-count">{{payments.length}} records</span></div><section class="panel data-panel"><div class="table-wrap"><table><thead><tr><th>PAYMENT</th><th>BOOKING / PASSENGER</th><th>METHOD</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody><tr v-for="p in payments" :key="p.id"><td><strong class="booking-code">{{p.id.slice(-8).toUpperCase()}}</strong></td><td><strong>{{data.bookings.find(b=>b.id===p.bookingId)?.code||'Unknown booking'}}</strong><small class="cell-sub">{{data.bookings.find(b=>b.id===p.bookingId)?.passengerName||'—'}}</small></td><td>{{p.method}}</td><td>{{dateTime(p.paidAt||p.createdAt)}}</td><td><strong>{{money(p.amount)}}</strong></td><td><span class="status-pill" :class="p.status.toLowerCase()">{{p.status}}</span></td><td><button v-if="p.status==='Paid'" class="mini-action danger-action" title="Refund payment" @click="refund(p)"><RotateCcw :size="15"/></button><span v-else class="muted">—</span></td></tr><tr v-if="!payments.length"><td colspan="7"><div class="empty-state"><Wallet :size="30"/><strong>No payment records</strong><p>Payment history will appear here.</p></div></td></tr></tbody></table></div></section></template>