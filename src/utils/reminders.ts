export type Reminder = {
  id: string
  title: string
  date: string // ISO yyyy-mm-dd (dương)
  repeatYearly?: boolean
}

const KEY = 'amlich.reminders.v1'

export const REMINDERS_UPDATED_EVENT = 'amlich:reminders-updated'

export function listReminders(): Reminder[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
export function saveReminders(items: Reminder[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
  // thông báo cho UI cập nhật
  try { window.dispatchEvent(new Event(REMINDERS_UPDATED_EVENT)) } catch {}
}
export function addReminder(r: Reminder) {
  const arr = listReminders(); arr.push(r); saveReminders(arr)
}
export function deleteReminder(id: string) {
  const arr = listReminders().filter(x => x.id !== id); saveReminders(arr)
}
export function upcomingWithin(days: number, baseDate = new Date()) {
  const base = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())
  const list = listReminders()
  const result: { r: Reminder, when: Date, daysLeft: number }[] = []
  for (const r of list) {
    const [y,m,d] = r.date.split('-').map(Number)
    let when = new Date(y, m-1, d)
    if (r.repeatYearly) {
      when = new Date(base.getFullYear(), m-1, d)
      if (when < base) when = new Date(base.getFullYear()+1, m-1, d)
    }
    const diff = Math.ceil((when.getTime() - base.getTime()) / 86400000)
    if (diff >= 0 && diff <= days) result.push({ r, when, daysLeft: diff })
  }
  return result.sort((a,b) => a.when.getTime() - b.when.getTime())
}
