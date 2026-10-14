import { readData, writeData, uid, addActivity } from './storage'
import { estimateFare } from './fareService'
const ACTIVE = ['Confirmed', 'In Progress']
export function createBooking(input, user) {
  const data = readData()
  if (!input.pickup?.trim() || !input.destination?.trim()) throw new Error('Pickup and destination are required.')
  if (input.pickup.trim().toLowerCase() === input.destination.trim().toLowerCase()) throw new Error('Pickup and destination must be different.')
  const at = new Date(input.scheduledAt)
  if (Number.isNaN(at.getTime()) || at.getTime() < Date.now() - 60000) throw new Error('Choose a valid future date and time.')
  const pax = Number(input.passengers)
  if (!Number.isInteger(pax) || pax < 1 || pax > 7) throw new Error('Passenger count must be between 1 and 7.')
  const km = Number(input.estimatedKm)
  const fare = estimateFare(data.settings, km)
  const id = uid('booking')
  const booking = { id, code: `TG-${String(Date.now()).slice(-6)}`, passengerId: user.id, passengerName: user.name, pickup: input.pickup.trim(), destination: input.destination.trim(), scheduledAt: at.toISOString(), passengers: pax, estimatedKm: km, fare, status: 'Pending', driverId: null, vehicleId: null, createdAt: new Date().toISOString() }
  data.bookings.unshift(booking)
  writeData(data)
  addActivity(`Booking ${booking.code} created by ${user.name}`)
  return booking
}
export function updateBooking(id, input, user) {
  const data = readData(), b = data.bookings.find(x => x.id === id)
  if (!b) throw new Error('Booking was not found.')
  if (user.role !== 'admin' && b.passengerId !== user.id) throw new Error('You cannot edit another passenger’s booking.')
  if (['Completed', 'Cancelled', 'In Progress'].includes(b.status)) throw new Error('This booking can no longer be edited.')
  if (!input.pickup?.trim() || !input.destination?.trim()) throw new Error('Pickup and destination are required.')
  if (input.pickup.trim().toLowerCase() === input.destination.trim().toLowerCase()) throw new Error('Pickup and destination must be different.')
  const at = new Date(input.scheduledAt)
  if (Number.isNaN(at.getTime()) || at.getTime() < Date.now() - 60000) throw new Error('Choose a valid future date and time.')
  const pax = Number(input.passengers), km = Number(input.estimatedKm)
  if (!Number.isInteger(pax) || pax < 1 || pax > 7) throw new Error('Passenger count must be between 1 and 7.')
  b.pickup = input.pickup.trim(); b.destination = input.destination.trim(); b.scheduledAt = at.toISOString()
  b.passengers = pax; b.estimatedKm = km; b.fare = estimateFare(data.settings, km)
  writeData(data); addActivity(`Booking ${b.code} updated`)
  return b
}
export function cancelBooking(id, user) {
  const data = readData(), b = data.bookings.find(x => x.id === id)
  if (!b) throw new Error('Booking was not found.')
  if (user.role !== 'admin' && b.passengerId !== user.id) throw new Error('You cannot cancel another passenger’s booking.')
  if (['Completed', 'Cancelled'].includes(b.status)) throw new Error('This booking is already closed.')
  if (data.payments.some(p => p.bookingId === id && p.status === 'Paid')) throw new Error('A paid booking cannot be cancelled. Handle the refund first.')
  b.status = 'Cancelled'; b.driverId = null; b.vehicleId = null
  writeData(data); addActivity(`Booking ${b.code} cancelled`)
}
export function assignResources(id, driverId, vehicleId) {
  const data = readData(), b = data.bookings.find(x => x.id === id)
  if (!b) throw new Error('Booking was not found.')
  if (!['Pending', 'Confirmed'].includes(b.status)) throw new Error('Only pending or confirmed bookings can be assigned.')
  const driver = data.drivers.find(d => d.id === driverId), vehicle = data.vehicles.find(v => v.id === vehicleId)
  if (!driver || driver.status === 'Inactive') throw new Error('Select an active driver.')
  if (!vehicle || vehicle.status === 'Maintenance') throw new Error('Select a vehicle that is not in maintenance.')
  if (Number(vehicle.capacity) < Number(b.passengers)) throw new Error('This vehicle does not have enough passenger capacity.')
  const conflicts = data.bookings.filter(other => other.id !== b.id && ACTIVE.includes(other.status))
  if (conflicts.some(x => x.driverId === driverId)) throw new Error('That driver is assigned to another active ride.')
  if (conflicts.some(x => x.vehicleId === vehicleId)) throw new Error('That vehicle is assigned to another active ride.')
  b.driverId = driverId; b.vehicleId = vehicleId; b.status = 'Confirmed'
  writeData(data); addActivity(`Booking ${b.code} assigned to ${driver.name} / ${vehicle.plate}`)
}
export function transitionBooking(id, nextStatus) {
  const data = readData(), b = data.bookings.find(x => x.id === id)
  if (!b) throw new Error('Booking was not found.')
  const allowed = { Pending: ['Confirmed', 'Cancelled'], Confirmed: ['In Progress', 'Cancelled'], 'In Progress': ['Completed'], Completed: [], Cancelled: [] }
  if (!allowed[b.status]?.includes(nextStatus)) throw new Error(`Cannot change booking from ${b.status} to ${nextStatus}.`)
  if (nextStatus === 'Confirmed' && (!b.driverId || !b.vehicleId)) throw new Error('Assign a driver and vehicle before confirming.')
  if (nextStatus === 'In Progress') {
    if (!b.driverId || !b.vehicleId) throw new Error('Assign a driver and vehicle first.')
    const d = data.drivers.find(x => x.id === b.driverId), v = data.vehicles.find(x => x.id === b.vehicleId)
    if (!d || d.status === 'Inactive' || !v || v.status === 'Maintenance') throw new Error('Assigned resources are no longer available.')
    if (data.bookings.some(x => x.id !== id && x.status === 'In Progress' && (x.driverId === b.driverId || x.vehicleId === b.vehicleId))) throw new Error('Assigned resources are already on a ride.')
  }
  if (nextStatus === 'Cancelled' && data.payments.some(p => p.bookingId === id && p.status === 'Paid')) throw new Error('A paid booking cannot be cancelled. Handle the refund first.')
  b.status = nextStatus
  if (['Completed', 'Cancelled'].includes(nextStatus)) { b.driverId = null; b.vehicleId = null }
  writeData(data); addActivity(`Booking ${b.code} changed to ${nextStatus}`)
}
export function recordPayment(bookingId, method) {
  const data = readData(), b = data.bookings.find(x => x.id === bookingId)
  if (!b || b.status !== 'Completed') throw new Error('Only completed bookings can be paid.')
  if (data.payments.some(p => p.bookingId === bookingId && p.status === 'Paid')) throw new Error('This booking already has a paid payment.')
  if (!['Cash', 'E-wallet'].includes(method)) throw new Error('Select a valid payment method.')
  const old = data.payments.find(p => p.bookingId === bookingId)
  if (old) { old.amount = b.fare; old.method = method; old.status = 'Paid'; old.paidAt = new Date().toISOString() }
  else data.payments.unshift({ id: uid('payment'), bookingId, amount: b.fare, method, status: 'Paid', createdAt: new Date().toISOString(), paidAt: new Date().toISOString() })
  writeData(data); addActivity(`Payment recorded for ${b.code}`)
}
export function refundPayment(paymentId) {
  const data = readData(), p = data.payments.find(x => x.id === paymentId)
  if (!p || p.status !== 'Paid') throw new Error('Only paid payments can be refunded.')
  p.status = 'Refunded'; p.refundedAt = new Date().toISOString()
  writeData(data); addActivity(`Payment for ${p.bookingId} refunded`)
}