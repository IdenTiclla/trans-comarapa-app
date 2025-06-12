<template>
  <div ref="loginPageRef" class="force-center-login">
    <div ref="loginContentRef" class="login-content-wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const loginPageRef = ref(null)
const loginContentRef = ref(null)
let observer = null

// Guardar los estilos originales del body para restaurarlos después
let originalBodyStyles = {}
let originalHtmlStyles = {}

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
  }
}

const applyLoginStyles = () => {
  // Guardar estilos originales antes de modificarlos
  originalBodyStyles = {
    margin: document.body.style.margin,
    padding: document.body.style.padding,
    overflow: document.body.style.overflow,
    height: document.body.style.height
  }
  
  originalHtmlStyles = {
    height: document.documentElement.style.height
  }
  
  // Aplicar estilos para el login
  document.body.style.margin = '0'
  document.body.style.padding = '0'
  document.body.style.overflow = 'hidden'
  document.documentElement.style.height = '100vh'
  document.body.style.height = '100vh'
}

const restoreOriginalStyles = () => {
  // Restaurar estilos originales del body
  document.body.style.margin = originalBodyStyles.margin || ''
  document.body.style.padding = originalBodyStyles.padding || ''
  document.body.style.overflow = originalBodyStyles.overflow || ''
  document.body.style.height = originalBodyStyles.height || ''
  
  // Restaurar estilos originales del html
  document.documentElement.style.height = originalHtmlStyles.height || ''
}

onMounted(async () => {
  await nextTick()
  
  // Aplicar estilos del login
  applyLoginStyles()
  forceCenter()
  
  // Forzar centrado múltiples veces para asegurar que funcione
  setTimeout(forceCenter, 50)
  setTimeout(forceCenter, 100)
  setTimeout(forceCenter, 200)
  
  // Observer para detectar cambios en el DOM
  observer = new MutationObserver(() => {
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

onBeforeUnmount(() => {
  // Limpiar el observer
  if (observer) {
    observer.disconnect()
    observer = null
  }
  
  // Restaurar estilos originales
  restoreOriginalStyles()
})
</script>

<style scoped>
/* Hacer los estilos más específicos y evitar que afecten otras páginas */
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
</style>

<!-- Estilos globales específicos solo para el login -->
<style>
/* Solo aplicar estos estilos cuando existe .force-center-login */
body:has(.force-center-login) {
  margin: 0 !important;
  padding: 0 !important;
  height: 100vh !important;
  overflow: hidden !important;
}

html:has(.force-center-login) {
  height: 100vh !important;
}

/* Ocultar todo lo demás cuando está el login */
body:has(.force-center-login) > *:not(#__nuxt) {
  display: none !important;
}

body:has(.force-center-login) #__nuxt > *:not(.force-center-login) {
  display: none !important;
}
</style>
