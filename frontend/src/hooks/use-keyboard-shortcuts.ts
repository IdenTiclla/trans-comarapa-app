import { useEffect } from 'react'

function shouldIgnoreShortcut(el: Element | null): boolean {
    if (!el) return false

    const tag = el.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
    if ((el as HTMLElement).isContentEditable) return true

    const role = el.getAttribute('role')
    if (role === 'textbox' || role === 'combobox' || role === 'searchbox') return true

    return false
}

export function useKeyboardShortcuts(
    shortcuts: Record<string, () => void>,
    enabled: boolean
): void {
    useEffect(() => {
        if (!enabled) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return

            if (shouldIgnoreShortcut(document.activeElement)) return

            const key = e.key.toLowerCase()
            const handler = shortcuts[key]
            if (handler) {
                e.preventDefault()
                handler()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [shortcuts, enabled])
}
