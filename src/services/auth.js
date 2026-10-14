import { readData, writeData, setSession, clearSession, uid, addActivity } from './storage'
export function login(email, password) {
  const normalized = email.trim().toLowerCase()
  const user = readData().users.find(u => u.email.toLowerCase() === normalized && u.password === password)
  if (!user) throw new Error('Email or password is incorrect.')
  setSession(user)
  addActivity(`${user.name} signed in`)
  return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' }
}
export function register({ name, email, password, phone }) {
  const data = readData()
  const normalized = email.trim().toLowerCase()
  if (name.trim().length < 2) throw new Error('Enter your full name (at least 2 characters).')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('Enter a valid email address.')
  if (data.users.some(u => u.email.toLowerCase() === normalized)) throw new Error('An account with this email already exists.')
  if (password.length < 8) throw new Error('Password must be at least 8 characters.')
  if (!/^[0-9+()\-\s]{7,20}$/.test(phone.trim())) throw new Error('Enter a valid contact number.')
  const user = { id: uid('user'), name: name.trim(), email: normalized, password, phone: phone.trim(), role: 'passenger', createdAt: new Date().toISOString() }
  data.users.push(user)
  writeData(data)
  setSession(user)
  addActivity(`${user.name} registered`)
  return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
}
export function logout() { clearSession() }