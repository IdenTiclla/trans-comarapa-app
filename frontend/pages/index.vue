<template>
  <div data-landing-layout class="min-h-screen bg-white font-inter">
    <!-- Navbar -->
    <LandingNavbar />
    
    <!-- Hero Section -->
    <LandingHero />
    
    <!-- Horarios Section -->
    <LandingSchedule />
    
    <!-- Rutas Section -->
    <LandingRouteMap />
    
    <!-- Servicios Section -->
    <LandingServices />
    
    <!-- Testimonios Section -->
    <LandingTestimonials />
    
    <!-- Oficinas Section -->
    <LandingOffices />
    
    <!-- Contacto Section -->
    <LandingContact />
    
    <!-- Footer -->
    <LandingFooter />
  </div>
</template>

<script setup>
// Importar componentes de landing
import LandingNavbar from '~/components/landing/LandingNavbar.vue'
import LandingHero from '~/components/landing/LandingHero.vue'
import LandingSchedule from '~/components/landing/LandingSchedule.vue'
import LandingRouteMap from '~/components/landing/LandingRouteMap.vue'
import LandingServices from '~/components/landing/LandingServices.vue'
import LandingTestimonials from '~/components/landing/LandingTestimonials.vue'
import LandingOffices from '~/components/landing/LandingOffices.vue'
import LandingContact from '~/components/landing/LandingContact.vue'
import LandingFooter from '~/components/landing/LandingFooter.vue'

// Definir metadata de la página - usa layout de landing
definePageMeta({
  layout: 'landing',
  title: 'Trans Comarapa - Transporte Regional',
})
</script>

<style>
/* Estilos específicos para la landing page */
.font-inter {
  font-family: 'Inter', system-ui, sans-serif;
}

/* Smooth scrolling para anchor links */
html {
  scroll-behavior: smooth;
}
</style>
