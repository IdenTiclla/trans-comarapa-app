import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    appName: 'Trans Comarapa',
    isLoading: false,
    notifications: []
  }),
  
  getters: {
    getAppName: (state) => state.appName,
    getIsLoading: (state) => state.isLoading,
    getNotifications: (state) => state.notifications
  },
  
  actions: {
    setLoading(value) {
      this.isLoading = value
    },
    
    addNotification(notification) {
      this.notifications.push({
        id: Date.now(),
        ...notification
      })
    },
    
    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    }
  }
})
