import { apiFetch } from '@/lib/api'

export const activityService = {
    async getRecentActivities(): Promise<unknown[]> {
        try {
            const data = await apiFetch<{ activities?: unknown[] }>('/activities/recent')
            return data.activities || []
        } catch {
            return []
        }
    },
}
