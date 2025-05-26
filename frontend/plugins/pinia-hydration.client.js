export default defineNuxtPlugin(() => {
  // Plugin para manejar la hidratación de Pinia correctamente
  const { $pinia } = useNuxtApp()
  
  if (process.client && $pinia) {
    // Sobrescribir el método shouldHydrate para evitar errores con objetos que no tienen hasOwnProperty
    const originalShouldHydrate = $pinia._s.get('auth')?.shouldHydrate
    
    if ($pinia._s.has('auth')) {
      const authStore = $pinia._s.get('auth')
      if (authStore) {
        // Asegurar que todos los objetos en el estado tengan el prototipo correcto
        const cleanState = (obj) => {
          if (obj === null || typeof obj !== 'object') return obj
          
          // Si es un array, limpiar cada elemento
          if (Array.isArray(obj)) {
            return obj.map(cleanState)
          }
          
          // Si es un objeto, crear uno nuevo con Object.create(null) para evitar problemas de prototipo
          const cleaned = {}
          for (const key in obj) {
            if (obj.hasOwnProperty && obj.hasOwnProperty(key)) {
              cleaned[key] = cleanState(obj[key])
            } else if (Object.prototype.hasOwnProperty.call(obj, key)) {
              cleaned[key] = cleanState(obj[key])
            }
          }
          return cleaned
        }
        
        // Limpiar el estado del store de autenticación
        if (authStore.$state) {
          authStore.$state = cleanState(authStore.$state)
        }
      }
    }
  }
}) 