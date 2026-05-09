import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const SIZE_CLASS = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-xl',
    lg: 'sm:max-w-3xl',
    xl: 'sm:max-w-5xl',
} as const

export type AppModalSize = keyof typeof SIZE_CLASS

interface AppModalProps {
    open: boolean
    onClose: () => void
    size?: AppModalSize
    header?: ReactNode
    footer?: ReactNode
    children: ReactNode
    bodyClassName?: string
    contentClassName?: string
    closeOnBackdrop?: boolean
    ariaLabel?: string
}

export function AppModal({
    open,
    onClose,
    size = 'md',
    header,
    footer,
    children,
    bodyClassName,
    contentClassName,
    closeOnBackdrop = true,
    ariaLabel,
}: AppModalProps) {
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 modal-overlay-bokeh"
                aria-hidden="true"
                onClick={closeOnBackdrop ? onClose : undefined}
            />
            <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={ariaLabel}
                    className={cn(
                        'relative z-10 w-full bg-card rounded-lg text-left overflow-hidden shadow-xl transform transition-all border border-border',
                        SIZE_CLASS[size],
                        contentClassName,
                    )}
                >
                    {header}
                    <div className={cn('px-6 py-4', bodyClassName)}>{children}</div>
                    {footer && (
                        <div className="bg-muted/50 px-6 py-4 border-t border-border">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

interface AppModalPrimaryHeaderProps {
    icon?: ReactNode
    title: string
    subtitle?: string
    actions?: ReactNode
    onClose: () => void
    closeAriaLabel?: string
}

export function AppModalPrimaryHeader({
    icon,
    title,
    subtitle,
    actions,
    onClose,
    closeAriaLabel = 'Cerrar',
}: AppModalPrimaryHeaderProps) {
    return (
        <div className="bg-primary px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {icon && (
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-foreground/15 text-primary-foreground shrink-0">
                            {icon}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-primary-foreground truncate">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-xs text-primary-foreground/80">{subtitle}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {actions}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        aria-label={closeAriaLabel}
                        className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
