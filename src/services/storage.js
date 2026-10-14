const KEY = 'taxigo.data.v1'
const SESSION = 'taxigo.session.v1'
const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
export { uid, SESSION, toLocalDateTimeString }

function toLocalDateTimeString(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function isoOffset(days = 0, hours = 0) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(d.getHours() + hours, 0, 0, 0)
  return toLocalDateTimeString(d)
}
const seed = () => {
  const adminId = 'user_admin_demo'
  const passengerId = 'user_passenger_demo'
  const drivers = [
    { id: 'driver_1', name: 'Marco Santos', phone: '09171234567', license: 'N01-23-456789', status: 'Available', createdAt: new Date().toISOString() },
    { id: 'driver_2', name: 'Andrea Reyes', phone: '09181234567', license: 'N02-34-567890', status: 'Available', createdAt: new Date().toISOString() },
    { id: 'driver_3', name: 'Joshua Cruz', phone: '09191234567', license: 'N03-45-678901', status: 'Inactive', createdAt: new Date().toISOString() }
  ]
  const vehicles = [
    { id: 'vehicle_1', plate: 'ABC-1234', model: 'Toyota Vios', type: 'Sedan', capacity: 4, status: 'Available', createdAt: new Date().toISOString() },
    { id: 'vehicle_2', plate: 'XYZ-5678', model: 'Mitsubishi Mirage', type: 'Hatchback', capacity: 4, status: 'Available', createdAt: new Date().toISOString() },
    { id: 'vehicle_3', plate: 'UV-9087', model: 'Toyota Avanza', type: 'MPV', capacity: 7, status: 'Maintenance', createdAt: new Date().toISOString() }
  ]
  const bookings = [
    { id: 'booking_demo_1', code: 'TG-1001', passengerId, passengerName: 'Alex Passenger', pickup: 'Mactan-Cebu International Airport', destination: 'SM City Cebu', scheduledAt: isoOffset(1), passengers: 2, estimatedKm: 12, fare: 240, status: 'Pending', driverId: null, vehicleId: null, createdAt: new Date().toISOString() },
    { id: 'booking_demo_2', code: 'TG-1002', passengerId, passengerName: 'Alex Passenger', pickup: 'Cebu IT Park', destination: 'Ayala Center Cebu', scheduledAt: isoOffset(-1), passengers: 1, estimatedKm: 5, fare: 135, status: 'Completed', driverId: 'driver_2', vehicleId: 'vehicle_2', createdAt: new Date().toISOString() }
  ]
  return {
    users: [
      { id: adminId, name: 'TaxiGo Administrator', email: 'admin@taxigo.local', password: 'Admin123!', role: 'admin', phone: '09170000000', createdAt: new Date().toISOString() },
      { id: passengerId, name: 'Alex Passenger', email: 'passenger@taxigo.local', password: 'Passenger123!', role: 'passenger', phone: '09171112222', createdAt: new Date().toISOString() }
    ],
    drivers, vehicles, bookings,
    payments: [{ id: 'payment_demo_1', bookingId: 'booking_demo_2', amount: 135, method: 'Cash', status: 'Paid', createdAt: new Date().toISOString(), paidAt: new Date().toISOString() }],
    settings: { baseFare: 50, ratePerKm: 15, serviceFee: 10 },
    activity: [{ id: uid('activity'), message: 'Welcome to TaxiGo demo data', createdAt: new Date().toISOString() }]
  }
}
export function ensureSeedData(force = false) {
  if (force || !localStorage.getItem(KEY)) {
    localStorage.setItem(KEY, JSON.stringify(seed()))
    localStorage.removeItem(SESSION)
  }
}
export function readData() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (value && Array.isArray(value.users) && Array.isArray(value.bookings)) return value
  } catch { /* recover below */ }
  const fresh = seed()
  localStorage.setItem(KEY, JSON.stringify(fresh))
  return fresh
}
export function writeData(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
  window.dispatchEvent(new CustomEvent('taxigo:data-updated'))
  return data
}
export function updateData(mutator) {
  const data = readData()
  mutator(data)
  return writeData(data)
}
export function addActivity(message) {
  updateData(d => {
    d.activity.unshift({ id: uid('activity'), message, createdAt: new Date().toISOString() })
    d.activity = d.activity.slice(0, 30)
  })
}
export function currentSession() {
  try { return JSON.parse(localStorage.getItem(SESSION) || 'null') } catch { return null }
}
export function setSession(user) {
  const safe = { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' }
  localStorage.setItem(SESSION, JSON.stringify(safe))
  window.dispatchEvent(new CustomEvent('taxigo:session-updated'))
}
export function clearSession() {
  localStorage.removeItem(SESSION)
  window.dispatchEvent(new CustomEvent('taxigo:session-updated'))
}