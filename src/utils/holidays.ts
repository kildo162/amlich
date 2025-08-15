export type Holiday = { m: number; d: number; name: string }

export const SOLAR_HOLIDAYS: Holiday[] = [
  { m: 1, d: 1, name: 'Tết Dương lịch' },
  { m: 2, d: 14, name: 'Valentine' },
  { m: 3, d: 8, name: 'Quốc tế Phụ nữ' },
  { m: 4, d: 30, name: 'Giải phóng miền Nam' },
  { m: 5, d: 1, name: 'Quốc tế Lao động' },
  { m: 6, d: 1, name: 'Quốc tế Thiếu nhi' },
  { m: 9, d: 2, name: 'Quốc khánh Việt Nam' },
  { m: 10, d: 20, name: 'Phụ nữ Việt Nam' },
  { m: 11, d: 20, name: 'Nhà giáo Việt Nam' },
  { m: 12, d: 24, name: 'Giáng sinh' }
]

export const LUNAR_HOLIDAYS: Holiday[] = [
  { m: 1, d: 1, name: 'Tết Nguyên Đán' },
  { m: 1, d: 2, name: 'Mùng 2 Tết' },
  { m: 1, d: 3, name: 'Mùng 3 Tết' },
  { m: 1, d: 10, name: 'Vía Thần Tài' },
  { m: 1, d: 15, name: 'Rằm tháng Giêng' },
  { m: 3, d: 3, name: 'Tết Hàn Thực' },
  { m: 3, d: 10, name: 'Giỗ Tổ Hùng Vương' },
  { m: 4, d: 15, name: 'Phật Đản' },
  { m: 5, d: 5, name: 'Tết Đoan Ngọ' },
  { m: 7, d: 7, name: 'Thất Tịch' },
  { m: 7, d: 15, name: 'Vu Lan' },
  { m: 8, d: 15, name: 'Tết Trung Thu' },
  { m: 9, d: 9, name: 'Trùng Cửu' },
  { m: 12, d: 23, name: 'Ông Công Ông Táo' }
]

export function getSolarHoliday(month: number, day: number) {
  return SOLAR_HOLIDAYS.find(h => h.m === month && h.d === day) || null
}

export function getLunarHoliday(month: number, day: number) {
  return LUNAR_HOLIDAYS.find(h => h.m === month && h.d === day) || null
}

export function searchHolidays(keyword: string) {
  const q = keyword.trim().toLowerCase()
  if (!q) return [] as { type: 'dương' | 'âm'; m: number; d: number; name: string }[]
  const solar = SOLAR_HOLIDAYS.filter(h => h.name.toLowerCase().includes(q)).map(h => ({ type: 'dương' as const, ...h }))
  const lunar = LUNAR_HOLIDAYS.filter(h => h.name.toLowerCase().includes(q)).map(h => ({ type: 'âm' as const, ...h }))
  return [...solar, ...lunar]
}
