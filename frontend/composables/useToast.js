import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export const useToast = () => {
    const removeToast = (id) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index > -1) {
            toasts.value.splice(index, 1)
        }
    }

    const addToast = (type, title, message = '', duration = 4000) => {
        const id = nextId++
        toasts.value.push({ id, type, title, message })

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }

    return {
        toasts,
        removeToast,
        success: (title, message, duration) => addToast('success', title, message, duration),
        error: (title, message, duration) => addToast('error', title, message, duration),
        info: (title, message, duration) => addToast('info', title, message, duration),
        warning: (title, message, duration) => addToast('warning', title, message, duration)
    }
}
