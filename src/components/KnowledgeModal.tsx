import { useEffect, useRef } from 'react'

export default function KnowledgeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  useEffect(() => {
    if (!open) return
    prevFocusRef.current = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const root = dialogRef.current
        if (!root) return
        const focusables = root.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (e.shiftKey) {
          if (active === first) { e.preventDefault(); last.focus() }
        } else {
          if (active === last) { e.preventDefault(); first.focus() }
        }
      }
    }
    window.addEventListener('keydown', onKey)
    // Move focus to the title for orientation when opened (fallback to container)
    const t = setTimeout(() => { (titleRef.current ?? dialogRef.current)?.focus?.() }, 0)
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(t); prevFocusRef.current?.focus?.() }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="knowledge-title" aria-describedby="knowledge-desc">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-x-0 top-10 mx-auto max-w-3xl px-3">
        <div ref={dialogRef} tabIndex={-1} className="card p-4 sm:p-6 outline-none">
          <div className="flex items-start justify-between mb-3">
            <h2 id="knowledge-title" ref={titleRef} tabIndex={-1} className="text-lg sm:text-xl font-semibold">Kiến thức Lịch Việt</h2>
            <button className="btn-outline" onClick={onClose} aria-label="Đóng">Đóng</button>
          </div>
          <p id="knowledge-desc" className="sr-only">Hộp thoại thông tin về lịch Việt, giải thích các khái niệm và cách sử dụng ứng dụng.</p>
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-200">
            <div>
              <h3 className="text-base font-semibold mb-1">Âm lịch, Dương lịch và Can Chi</h3>
              <p>
                Lịch Việt sử dụng đồng thời <strong>Âm lịch</strong> (theo chu kỳ Mặt Trăng) và <strong>Dương lịch</strong> (Gregorian).
                Hệ <em>Can Chi</em> (10 Thiên Can × 12 Địa Chi) tạo thành chu kỳ 60 ngày/năm.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1">Tháng nhuận (Âm lịch)</h3>
              <p>
                Mỗi năm âm có thể có <strong>tháng nhuận</strong> để đồng bộ với dương lịch. Tháng nhuận lặp lại tháng trước đó
                (ví dụ: 7 nhuận). Trong ứng dụng, ngày nhuận được hiển thị cùng nhãn “(nhuận)”.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1">Hoàng đạo / Hắc đạo</h3>
              <p>
                Dựa trên tương quan Can Chi và tháng âm, ngày/giờ được phân loại <strong>Hoàng đạo</strong> (tốt) hoặc
                <strong> Hắc đạo</strong> (xấu). Ứng dụng đánh dấu nhanh trên lịch (dấu chấm xanh/đỏ) và liệt kê chi tiết ở chế độ xem ngày.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1">Ngày rằm, mùng 1, lễ tết</h3>
              <p>
                <em>Mùng 1</em> và <em>Rằm (15)</em> là các mốc quen thuộc trong tháng âm. Nhiều lễ truyền thống (Tết Nguyên Đán, Rằm tháng Giêng,
                Vu Lan, Trung Thu, v.v.) được hiển thị trong cả chế độ xem tháng và ngày.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1">Tìm kiếm lễ</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Gõ tên (không cần dấu): “quoc khanh”, “ram”, “gio to”…</li>
                <li>Tìm theo ngày: “2/9”, “15-8 AL”, “10/3 AL”, “24/12 DL”…</li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1">Chia sẻ và nhắc nhở</h3>
              <p>
                Bạn có thể chia sẻ ngày đang xem hoặc tạo nhắc nhở cho những ngày quan trọng. Nhắc nhở có thể lặp lại hằng năm.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
