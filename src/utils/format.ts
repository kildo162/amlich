export function pad2(n: number) { return n < 10 ? `0${n}` : String(n) }
export function fmtDateISO(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}` }
export function parseISO(s: string) { const [y,m,dd] = s.split('-').map(Number); return new Date(y, m-1, dd) }
export function getToday() { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), now.getDate()) }

// Hiển thị dd/mm/yyyy theo chuẩn Việt Nam
export function fmtDateVN(d: Date) { return `${pad2(d.getDate())}/${pad2(d.getMonth()+1)}/${d.getFullYear()}` }
export function fmtDateVNFromISO(iso: string) { return fmtDateVN(parseISO(iso)) }
