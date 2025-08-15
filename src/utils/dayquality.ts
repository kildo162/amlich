import { CHI } from './lunar'

// Trực theo tháng âm và chi ngày
// Công thức tham khảo: trucIndex = (chiDayIndex - chiMonthIndex + 12) % 12
// Trong đó: chiMonthIndex cho tháng âm n là chi của tháng: Tháng 1 -> Dần (index 2)
// nên chiMonthIndex = (lunarMonth + 1) % 12 khi CHI[0] = Tý

export const TRUC = ['Kiến','Trừ','Mãn','Bình','Định','Chấp','Phá','Nguy','Thành','Thu','Khai','Bế'] as const
export type TrucName = typeof TRUC[number]

export function getTruc(chiDayIndex: number, lunarMonth: number): TrucName {
  const chiMonthIndex = (lunarMonth + 1) % 12
  const idx = (chiDayIndex - chiMonthIndex + 12) % 12
  return TRUC[idx]
}

// Gợi ý việc nên/kiêng theo Trực (tóm lược)
const MAP: Record<TrucName, { good: string[]; bad: string[]; rate: 'tốt'|'xấu'|'trung bình' } > = {
  'Kiến': { good: ['Khởi công', 'Mở hàng', 'Xuất hành'], bad: ['An táng','Động thổ lớn'], rate: 'tốt' },
  'Trừ': { good: ['Trừ phục','Chữa bệnh','Dọn dẹp'], bad: ['Cưới hỏi','Khai trương'], rate: 'trung bình' },
  'Mãn': { good: ['Cầu tài','Cầu phúc','Thăng chức'], bad: ['Mai táng'], rate: 'tốt' },
  'Bình': { good: ['Gặp gỡ','Hòa giải'], bad: ['Tranh chấp','Kiện tụng'], rate: 'trung bình' },
  'Định': { good: ['Ký kết','Cưới hỏi','An cư'], bad: ['Khởi kiện'], rate: 'tốt' },
  'Chấp': { good: ['Nhập học','Bắt đầu công việc'], bad: ['Khai trương lớn'], rate: 'trung bình' },
  'Phá': { good: ['Phá dỡ','Dọn kho'], bad: ['Hôn lễ','Mở hàng'], rate: 'xấu' },
  'Nguy': { good: ['Cúng lễ','Cầu an'], bad: ['Xuất hành','Khai trương'], rate: 'xấu' },
  'Thành': { good: ['Hoàn thiện','Khánh thành','Cưới hỏi'], bad: ['Khởi tố'], rate: 'tốt' },
  'Thu': { good: ['Thu nợ','Thu hoạch'], bad: ['Khai trương','Mở hàng'], rate: 'trung bình' },
  'Khai': { good: ['Khai trương','Mở kho','Xuất hành'], bad: ['An táng'], rate: 'tốt' },
  'Bế': { good: ['Đóng sổ','Kết thúc dự án'], bad: ['Bắt đầu việc lớn'], rate: 'xấu' },
}

export function dayQuality(chiDayIndex: number, lunarMonth: number) {
  const name = getTruc(chiDayIndex, lunarMonth)
  return { name, ...MAP[name] }
}
