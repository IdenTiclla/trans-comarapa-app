<template>
  <div ref="loginPageRef" class="force-center-login">
    <div ref="loginContentRef" class="login-content-wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const loginPageRef = ref(null)
const loginContentRef = ref(null)

const forceCenter = () => {
  if (loginPageRef.value && loginContentRef.value) {
    // Forzar estilos directamente en el DOM
    const pageEl = loginPageRef.value
    const contentEl = loginContentRef.value
    
    // Estilos para el contenedor principal
    pageEl.style.position = 'fixed'
    pageEl.style.top = '0'
    pageEl.style.left = '0'
    pageEl.style.width = '100vw'
    pageEl.style.height = '100vh'
    pageEl.style.backgroundColor = '#f3f4f6'
    pageEl.style.zIndex = '999999'
    pageEl.style.display = 'flex'
    pageEl.style.alignItems = 'center'
    pageEl.style.justifyContent = 'center'
    pageEl.style.padding = '20px'
    pageEl.style.boxSizing = 'border-box'
    
    // Estilos para el contenido
    contentEl.style.display = 'block'
    contentEl.style.width = 'auto'
    contentEl.style.maxWidth = '400px'
    
    // Forzar reflow
    pageEl.offsetHeight
    contentEl.offsetHeight
    
    // Resetear body
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    document.documentElement.style.height = '100vh'
    document.body.style.height = '100vh'
  }
}

onMounted(async () => {
  await nextTick()
  forceCenter()
  
  // Forzar centrado múltiples veces para asegurar que funcione
  setTimeout(forceCenter, 50)
  setTimeout(forceCenter, 100)
  setTimeout(forceCenter, 200)
  
  // Observer para detectar cambios en el DOM
  const observer = new MutationObserver(() => {
    forceCenter()
  })
  
  if (loginPageRef.value) {
    observer.observe(loginPageRef.value, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    })
  }
})
</script>

<style>
/* Estilos de respaldo por si falla el JavaScript */
.force-center-login {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background-color: #f3f4f6 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 999999 !important;
  padding: 20px !important;
  box-sizing: border-box !important;
}

.login-content-wrapper {
  display: block !important;
  width: auto !important;
  max-width: 400px !important;
}

/* Reseteos globales más agresivos */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  height: 100vh !important;
  overflow: hidden !important;
}

/* Ocultar todo lo demás cuando está el login */
body:has(.force-center-login) > *:not(#__nuxt) {
  display: none !important;
}

body:has(.force-center-login) #__nuxt > *:not(.force-center-login) {
  display: none !important;
}
</style>
