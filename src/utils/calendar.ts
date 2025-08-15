import { pad2 } from './format'

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
export function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth()+1, 0)
}
export function isSameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
}
export function isSameMonth(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth()
}
export function getMonthMatrix(d: Date) {
  const first = startOfMonth(d)
  const start = new Date(first)
  // Monday start (Thứ 2)
  const dowMon = (first.getDay() + 6) % 7
  start.setDate(first.getDate() - dowMon)
  const weeks: Date[][] = []
  for (let w=0; w<6; w++) {
    const row: Date[] = []
    for (let i=0; i<7; i++) {
      const cur = new Date(start)
      cur.setDate(start.getDate() + w*7 + i)
      row.push(cur)
    }
    weeks.push(row)
  }
  return weeks
}

export function viWeekday(d: Date) {
  const map = ['CN','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7']
  return map[d.getDay()]
}
export function viDate(d: Date) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth()+1)}/${d.getFullYear()}`
}
