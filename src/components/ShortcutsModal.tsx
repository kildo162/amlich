import { useEffect, useRef } from 'react'

export default function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)
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
    const t = setTimeout(() => { dialogRef.current?.focus() }, 0)
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(t); prevFocusRef.current?.focus?.() }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-x-0 top-10 mx-auto max-w-2xl px-3">
        <div ref={dialogRef} tabIndex={-1} className="card p-4 sm:p-6 outline-none">
          <div className="flex items-start justify-between mb-3">
            <h2 id="shortcuts-title" className="text-lg sm:text-xl font-semibold">Phím tắt</h2>
            <button className="btn-outline" onClick={onClose} aria-label="Đóng">Đóng</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-200">
            <div>
              <h3 className="font-medium mb-1">Điều hướng</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>T: Hôm nay</li>
                <li>M: Xem tháng</li>
                <li>D: Xem ngày</li>
                <li>←/→: Lùi/Tiến ngày (ở Xem ngày) hoặc tháng (ở Xem tháng)</li>
                <li>PageUp/PageDown: Lùi/Tiến tháng</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-1">Khác</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>/: Tập trung ô tìm kiếm ngày lễ</li>
                <li>?: Mở bảng phím tắt</li>
                <li>N: Bật/tắt ghi chú văn hóa (Nên làm/Kiêng kỵ)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
