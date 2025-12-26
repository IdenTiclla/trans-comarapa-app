// MIDDLEWARE DESHABILITADO: La landing page ahora es pública
// La autenticación se maneja en auth.global.ts y default.global.js
// Este middleware ya no redirige desde la página de inicio

export default defineNuxtRouteMiddleware((to, from) => {
  // Deshabilitado - permitir acceso a la landing page sin redirección
  return
})