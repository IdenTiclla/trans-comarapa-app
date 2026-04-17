import { useEffect } from 'react'

/**
 * Generic keyboard shortcuts hook.
 * Only fires when `enabled` is true and the focused element is not an input/textarea.
 *
 * @param shortcuts Map of key (lowercase) → handler
 * @param enabled   When false, no shortcuts are registered
 */
export function useKeyboardShortcuts(
    shortcuts: Record<string, () => void>,
    enabled: boolean
): void {
    useEffect(() => {
        if (!enabled) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA'
            ) return

            const key = e.key.toLowerCase()
            const handler = shortcuts[key]
            if (handler) {
                handler()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [shortcuts, enabled])
}
