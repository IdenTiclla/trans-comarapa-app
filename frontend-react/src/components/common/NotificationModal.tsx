import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  type?: NotificationType
  buttonText?: string
  onClose?: () => void
}

const ICON_CLASSES: Record<NotificationType, string> = {
  success: 'bg-green-100 text-green-600',
  error: 'bg-red-100 text-red-600',
  warning: 'bg-yellow-100 text-yellow-600',
  info: 'bg-blue-100 text-blue-600',
}

const ICONS: Record<NotificationType, React.ReactNode> = {
  success: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export default function NotificationModal({
  open,
  onOpenChange,
  title,
  message,
  type = 'info',
  buttonText = 'Aceptar',
  onClose,
}: NotificationModalProps) {
  const handleClose = () => {
    onClose?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className={cn('flex items-center justify-center h-12 w-12 rounded-full mb-4', ICON_CLASSES[type])}>
            {ICONS[type]}
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleClose}>{buttonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
