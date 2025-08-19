export const NOTES_VISIBILITY_KEY = 'amlich.showNotes'
export const NOTES_VISIBILITY_CHANGED_EVENT = 'amlich:notesVisibilityChanged'

export function getShowNotes(): boolean {
  try {
    const v = localStorage.getItem(NOTES_VISIBILITY_KEY)
    return v ? v === '1' : true
  } catch {
    return true
  }
}

export function setShowNotes(v: boolean) {
  try {
    localStorage.setItem(NOTES_VISIBILITY_KEY, v ? '1' : '0')
  } catch {}
  try {
    const ev = new CustomEvent(NOTES_VISIBILITY_CHANGED_EVENT, { detail: { value: v } })
    window.dispatchEvent(ev)
  } catch {}
}
