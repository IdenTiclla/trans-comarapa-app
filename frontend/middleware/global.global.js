// MIDDLEWARE DESHABILITADO: Funcionalidad movida a auth.global.ts para evitar duplicación
// Este middleware está deshabilitado para prevenir conflictos con auth.global.ts

export default defineNuxtRouteMiddleware((to, from) => {
  // DESHABILITADO: auth.global.ts maneja esta funcionalidad
  return
})
