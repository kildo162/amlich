export type Holiday = { m: number; d: number; name: string }

export const SOLAR_HOLIDAYS: Holiday[] = [
  { m: 1, d: 1, name: 'Tết Dương lịch' },
  { m: 2, d: 3, name: 'Thành lập Đảng Cộng sản Việt Nam' },
  { m: 2, d: 14, name: 'Valentine' },
  { m: 2, d: 27, name: 'Ngày Thầy thuốc Việt Nam' },
  { m: 3, d: 8, name: 'Quốc tế Phụ nữ' },
  { m: 3, d: 26, name: 'Thành lập Đoàn TNCS Hồ Chí Minh' },
  { m: 4, d: 30, name: 'Giải phóng miền Nam' },
  { m: 5, d: 1, name: 'Quốc tế Lao động' },
  { m: 5, d: 7, name: 'Chiến thắng Điện Biên Phủ' },
  { m: 5, d: 19, name: 'Sinh nhật Chủ tịch Hồ Chí Minh' },
  { m: 6, d: 1, name: 'Quốc tế Thiếu nhi' },
  { m: 6, d: 21, name: 'Ngày Báo chí Cách mạng Việt Nam' },
  { m: 6, d: 28, name: 'Ngày Gia đình Việt Nam' },
  { m: 7, d: 27, name: 'Thương binh - Liệt sĩ' },
  { m: 8, d: 19, name: 'Cách mạng Tháng Tám' },
  { m: 9, d: 2, name: 'Quốc khánh Việt Nam' },
  { m: 10, d: 10, name: 'Giải phóng Thủ đô Hà Nội' },
  { m: 10, d: 20, name: 'Phụ nữ Việt Nam' },
  { m: 10, d: 13, name: 'Doanh nhân Việt Nam' },
  { m: 11, d: 20, name: 'Nhà giáo Việt Nam' },
  { m: 12, d: 19, name: 'Toàn quốc kháng chiến' },
  { m: 12, d: 22, name: 'Thành lập Quân đội Nhân dân Việt Nam' },
  { m: 12, d: 24, name: 'Giáng sinh' }
]

export const LUNAR_HOLIDAYS: Holiday[] = [
  { m: 1, d: 1, name: 'Tết Nguyên Đán' },
  { m: 1, d: 2, name: 'Mùng 2 Tết' },
  { m: 1, d: 3, name: 'Mùng 3 Tết' },
  { m: 1, d: 10, name: 'Vía Thần Tài' },
  { m: 1, d: 15, name: 'Rằm tháng Giêng' },
  { m: 1, d: 15, name: 'Tết Nguyên Tiêu' },
  { m: 3, d: 3, name: 'Tết Hàn Thực' },
  { m: 3, d: 10, name: 'Giỗ Tổ Hùng Vương' },
  { m: 4, d: 15, name: 'Phật Đản' },
  { m: 5, d: 5, name: 'Tết Đoan Ngọ' },
  { m: 7, d: 7, name: 'Thất Tịch' },
  { m: 7, d: 15, name: 'Vu Lan' },
  { m: 7, d: 15, name: 'Xá tội vong nhân (Trung Nguyên)' },
  { m: 8, d: 15, name: 'Tết Trung Thu' },
  { m: 9, d: 9, name: 'Trùng Cửu' },
  { m: 10, d: 15, name: 'Tết Hạ Nguyên' },
  { m: 12, d: 23, name: 'Ông Công Ông Táo' }
]

export function getSolarHoliday(month: number, day: number) {
  return SOLAR_HOLIDAYS.find(h => h.m === month && h.d === day) || null
}

export function getLunarHoliday(month: number, day: number) {
  return LUNAR_HOLIDAYS.find(h => h.m === month && h.d === day) || null
}

export function searchHolidays(keyword: string) {
  type Result = { type: 'dương' | 'âm'; m: number; d: number; name: string }
  const norm = (s: string) => s
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/đ/gi, (m) => m === 'Đ' ? 'D' : 'd')
    .toLowerCase()
    .trim()

  const qRaw = keyword.trim()
  const q = norm(qRaw)
  if (!q) return [] as Result[]

  const results: Result[] = []

  // Match date-like query: 2/9, 02-09, 15/8 al, 2-9 dl
  const dateRe = /^(\d{1,2})[\/-](\d{1,2})(?:\s*(al|am|dl|duong|duonglich|amlich|a|d))?$/
  const m = q.match(dateRe)
  if (m) {
    const d = Math.max(1, Math.min(31, parseInt(m[1], 10)))
    const mon = Math.max(1, Math.min(12, parseInt(m[2], 10)))
    const tag = m[3] as string | undefined
    const wantLunar = !!tag && /^(al|am|amlich|a)$/.test(tag)
    const wantSolar = !!tag && /^(dl|duong|duonglich|d)$/.test(tag)
    if (!tag || wantSolar) {
      const sh = SOLAR_HOLIDAYS.filter(h => h.m === mon && h.d === d).map(h => ({ type: 'dương' as const, ...h }))
      results.push(...sh)
    }
    if (!tag || wantLunar) {
      const lh = LUNAR_HOLIDAYS.filter(h => h.m === mon && h.d === d).map(h => ({ type: 'âm' as const, ...h }))
      results.push(...lh)
    }
  }

  // Name contains (diacritics-insensitive)
  const nameHas = (name: string) => norm(name).includes(q)
  results.push(
    ...SOLAR_HOLIDAYS.filter(h => nameHas(h.name)).map(h => ({ type: 'dương' as const, ...h })),
    ...LUNAR_HOLIDAYS.filter(h => nameHas(h.name)).map(h => ({ type: 'âm' as const, ...h })),
  )

  // Deduplicate
  const seen = new Set<string>()
  const uniq: Result[] = []
  for (const r of results) {
    const key = `${r.type}-${r.m}-${r.d}-${r.name}`
    if (!seen.has(key)) { seen.add(key); uniq.push(r) }
  }
  return uniq
}
