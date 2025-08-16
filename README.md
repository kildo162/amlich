# Lịch Âm – Dương (Việt Nam)

Ứng dụng web hiển thị lịch Dương/Âm, chuyển đổi Âm ↔ Dương, can chi, giờ hoàng đạo, ngày tốt/xấu, ngày lễ và nhắc nhở. Hoạt động hoàn toàn offline (PWA), không phụ thuộc API ngoài. Tính toán chính xác trong giai đoạn 1900–2100.

## Tính năng chính
- Hiển thị ngày Dương tương ứng ngày Âm (có tháng nhuận), can chi năm/tháng/ngày/giờ.
- Giờ hoàng đạo/hắc đạo theo địa chi ngày.
- Đánh giá chất lượng ngày (trực), gợi ý nên làm/kiêng kỵ.
- Lịch tháng dạng lưới 7 cột (CN → T7) kèm ngày Âm và lễ.
- Trang chi tiết ngày: thông tin tổng hợp, lễ Âm/Dương, giờ hoàng đạo.
- Tìm kiếm ngày lễ (Âm + Dương).
- Chuyển đổi nhanh Âm ↔ Dương.
- Nhắc nhở sự kiện (lặp hàng năm), lưu localStorage.
- Giao diện tiếng Việt, responsive, PWA cài đặt được trên điện thoại.

## Công nghệ
- React + Vite + TypeScript
- Tailwind CSS
- Vite PWA Plugin

## Cài đặt và chạy
```bash
# Cài dependencies
npm install

# Chạy dev server
npm run dev

# Build production
npm run build

# Xem bản build
npm run preview
```

## Cấu trúc thư mục
```
src/
  components/
    Header.tsx          # Thanh điều hướng + chọn ngày + chuyển đổi nhanh
    HolidaySearch.tsx   # Tìm kiếm ngày lễ
    QuickConvert.tsx    # Chuyển đổi Âm ↔ Dương
    ReminderList.tsx    # Quản lý nhắc nhở (localStorage)
  pages/
    MonthView.tsx       # Lịch tháng
    DayView.tsx         # Trang chi tiết ngày
  utils/
    lunar.ts            # Thuật toán chuyển đổi âm dương, can chi, giờ hoàng đạo
    holidays.ts         # Dữ liệu và tiện ích ngày lễ
    dayquality.ts       # Trực, đánh giá ngày tốt/xấu
    calendar.ts         # Tiện ích ngày-tháng và ma trận lịch
    format.ts           # Định dạng ngày
    reminders.ts        # Lưu/đọc nhắc nhở từ localStorage
  App.tsx, main.tsx, index.css
```

## Hướng dẫn duy trì dữ liệu và mở rộng

### Ngày lễ (Âm + Dương)
- File: `src/utils/holidays.ts`
- Mảng `SOLAR_HOLIDAYS`: thêm/cập nhật các ngày cố định theo Dương lịch.
- Mảng `LUNAR_HOLIDAYS`: thêm/cập nhật các ngày cố định theo Âm lịch (có thể thêm các tên gọi/biệt danh song song để hỗ trợ tìm kiếm).
- Hàm `searchHolidays(keyword)`: đã hỗ trợ
  - Tìm theo tên không dấu (chuẩn hóa dấu, chữ `đ` → `d`).
  - Tìm theo định dạng ngày: `2/9`, `02-09`, `15/8 AL`, `2-9 DL`.
  - Tự động loại trùng kết quả.

Lưu ý: chỉ thêm các ngày cố định. Các ngày di động theo tuần/thứ cần logic riêng.

### Kiến thức lịch Việt
- Thành phần: `src/components/KnowledgeModal.tsx`
- Chỉnh sửa nội dung trong modal (các heading/đoạn văn). Có thể tách thành trang riêng nếu cần routing.
- Nút mở modal nằm trong `Header.tsx` (nút “📘 Kiến thức”).

### SEO cơ bản
- File: `index.html`
  - Đã thêm thẻ OpenGraph/Twitter cơ bản: `og:title`, `og:description`, `og:image`, `twitter:card`, `twitter:image`, `canonical`.
  - Ảnh chia sẻ dùng `public/icons/icon-512.svg` (có thể thay bằng PNG để hiển thị tốt hơn trên nhiều nền tảng).
- File: `src/App.tsx`
  - Cập nhật `document.title` và meta description động theo chế độ xem.

## Ghi chú kỹ thuật
- `src/utils/lunar.ts` triển khai các công thức thiên văn (kiểu NQH/astro) cho TZ +7; đủ chính xác 1900–2100.
- `vite.config.ts` dùng Node API; đã thêm `@types/node` trong devDependencies để tránh lỗi type.
- PWA: manifest và icon SVG trong `public/`, plugin tự động generate service worker.

## Kiểm thử nhanh
- Mở Month view, chọn ngày bất kỳ để vào Day view.
- So sánh âm lịch/can chi với các nguồn uy tín (một vài mốc như Tết, Rằm).
- Thêm nhắc nhở và kiểm tra mục “Sắp tới (14 ngày)”.
- Dùng chuyển đổi nhanh để kiểm tra các trường hợp tháng nhuận.

## Bản quyền và đóng góp
Mã nguồn phục vụ mục đích học tập và sử dụng cá nhân. Rất hoan nghênh vấn đề (issue) và góp ý.
