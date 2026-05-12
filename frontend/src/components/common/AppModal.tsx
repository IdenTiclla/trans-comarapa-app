import { type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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
    ariaLabel,
}: AppModalProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
            <DialogContent
                showCloseButton={false}
                aria-label={ariaLabel}
                className={cn(
                    'w-full overflow-hidden p-0 gap-0',
                    SIZE_CLASS[size],
                    contentClassName,
                )}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogTitle className="sr-only">{ariaLabel ?? 'Modal'}</DialogTitle>
                <DialogDescription className="sr-only">Diálogo de la aplicación</DialogDescription>
                {header}
                <div className={cn('px-6 py-4', bodyClassName)}>{children}</div>
                {footer && (
                    <div className="bg-muted/50 px-6 py-4 border-t border-border">
                        {footer}
                    </div>
                )}
            </DialogContent>
        </Dialog>
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
        <div className="border-b border-border bg-primary px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
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
                <div className="flex shrink-0 items-center justify-end gap-2">
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
