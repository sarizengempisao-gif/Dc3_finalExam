export function estimateFare(settings, km) {
  const distance = Number(km)
  if (!Number.isFinite(distance) || distance <= 0 || distance > 500) throw new Error('Estimated distance must be between 0.1 and 500 km.')
  const base = Number(settings.baseFare), rate = Number(settings.ratePerKm), fee = Number(settings.serviceFee)
  if ([base, rate, fee].some(n => !Number.isFinite(n) || n < 0)) throw new Error('Fare settings must be valid non-negative amounts.')
  return Math.round((base + distance * rate + fee) * 100) / 100
}
export const money = amount => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(Number(amount) || 0)
export const dateTime = value => value ? new Date(value).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : '—' 