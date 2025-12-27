<template>
  <section id="servicios" class="py-16 sm:py-20 md:py-24 bg-comarapa-gray">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-10 sm:mb-12 md:mb-16">
        <div class="inline-flex items-center gap-2 bg-comarapa-light/20 px-3 sm:px-4 py-2 rounded-full mb-4">
          <svg class="h-4 w-4 sm:h-5 sm:w-5 text-comarapa-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <span class="text-comarapa-dark font-medium text-sm sm:text-base">Nuestros Servicios</span>
        </div>
        <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-comarapa-dark mb-4 sm:mb-6">
          Soluciones Integrales de Transporte
        </h2>
        <p class="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Servicios completos para todas tus necesidades de viaje y envío
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-12 md:mb-16">
        <!-- Transporte de Pasajeros -->
        <div class="comarapa-card p-4 sm:p-6 md:p-8 bg-gradient-to-br from-comarapa-dark/5 to-comarapa-medium/5">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mb-6 sm:mb-8 text-center sm:text-left">
            <div class="bg-gradient-to-br from-comarapa-dark to-comarapa-medium rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg flex-shrink-0">
              <svg class="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-comarapa-dark">Transporte de Pasajeros</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <ul class="space-y-3 sm:space-y-4">
              <li v-for="item in passengerServicesLeft" :key="item" class="flex items-start gap-2 sm:gap-3">
                <svg class="h-4 w-4 sm:h-5 sm:w-5 text-comarapa-medium mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm sm:text-base text-gray-700">{{ item }}</span>
              </li>
            </ul>
            <ul class="space-y-3 sm:space-y-4">
              <li v-for="item in passengerServicesRight" :key="item" class="flex items-start gap-2 sm:gap-3">
                <svg class="h-4 w-4 sm:h-5 sm:w-5 text-comarapa-medium mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm sm:text-base text-gray-700">{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Envío de Encomiendas -->
        <div class="comarapa-card p-4 sm:p-6 md:p-8 bg-gradient-to-br from-comarapa-light/10 to-green-100/50">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mb-6 sm:mb-8 text-center sm:text-left">
            <div class="bg-gradient-to-br from-comarapa-medium to-comarapa-light rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg flex-shrink-0">
              <svg class="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-comarapa-dark">Envío de Encomiendas</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <ul class="space-y-3 sm:space-y-4">
              <li v-for="item in packageServicesLeft" :key="item" class="flex items-start gap-2 sm:gap-3">
                <svg class="h-4 w-4 sm:h-5 sm:w-5 text-comarapa-medium mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm sm:text-base text-gray-700">{{ item }}</span>
              </li>
            </ul>
            <ul class="space-y-3 sm:space-y-4">
              <li v-for="item in packageServicesRight" :key="item" class="flex items-start gap-2 sm:gap-3">
                <svg class="h-4 w-4 sm:h-5 sm:w-5 text-comarapa-medium mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm sm:text-base text-gray-700">{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Viajes Personalizados -->
      <div class="comarapa-card p-4 sm:p-6 md:p-8">
        <div class="text-center mb-8 sm:mb-10 md:mb-12">
          <div class="bg-gradient-to-br from-comarapa-dark to-comarapa-light rounded-xl sm:rounded-2xl p-3 sm:p-4 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
            <svg class="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
            </svg>
          </div>
          <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-comarapa-dark mb-3 sm:mb-4">Viajes Personalizados</h3>
          <p class="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Servicios especiales para eventos y ocasiones importantes
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
          <div v-for="service in customServices" :key="service.title"
               class="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <component :is="service.icon" :class="`h-5 w-5 sm:h-6 sm:w-6 ${service.color}`" />
              <h4 class="text-base sm:text-lg font-bold text-gray-900">{{ service.title }}</h4>
            </div>
            <ul class="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
              <li v-for="item in service.items" :key="item">• {{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { h } from 'vue'

const passengerServicesLeft = [
  "Buses cómodos y climatizados",
  "Asientos reclinables",
  "Viajes nocturnos y diurnos",
  "Ruta completa con 23 localidades"
]

const passengerServicesRight = [
  "Conductores profesionales",
  "Viajes seguros y confiables",
  "Seguro de viajero incluido",
  "Salidas todos los dias",
]

const packageServicesLeft = [
  "Servicio rapido y eficiente",
  "Entrega en todas las localidades de la ruta",
  "Seguimiento en tiempo real",
  "Servicio express y regular",
]

const packageServicesRight = [
  "Paquetes de todos los tamaños",
  "Documentos y correspondencia",
  "Productos perecederos",
  "Cuidado especial"
]

// Icon components
const BriefcaseIcon = {
  render() {
    return h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
    ])
  }
}

const HeartIcon = {
  render() {
    return h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' })
    ])
  }
}

const PartyIcon = {
  render() {
    return h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' })
    ])
  }
}

const GraduationIcon = {
  render() {
    return h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l9-5-9-5-9 5 9 5z' }),
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' })
    ])
  }
}

const ChurchIcon = {
  render() {
    return h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' })
    ])
  }
}

const ShieldIcon = {
  render() {
    return h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' })
    ])
  }
}

const customServices = [
  { 
    icon: BriefcaseIcon, 
    title: "Empresariales", 
    color: "text-blue-600", 
    items: ["Delegaciones empresariales", "Reuniones de trabajo", "Eventos corporativos", "Transporte ejecutivo"] 
  },
  { 
    icon: HeartIcon, 
    title: "Familiares", 
    color: "text-red-600", 
    items: ["Excursiones turísticas", "Reuniones familiares", "Celebraciones y bodas", "Viajes grupales"] 
  },
  { 
    icon: PartyIcon, 
    title: "Especiales", 
    color: "text-yellow-600", 
    items: ["Fiestas patronales", "Carnavales y ferias", "Eventos religiosos", "Peregrinaciones"] 
  },
  { 
    icon: GraduationIcon, 
    title: "Educativos", 
    color: "text-green-600", 
    items: ["Transporte escolar", "Viajes educativos", "Graduaciones", "Paseos de promoción"] 
  },
  { 
    icon: ChurchIcon, 
    title: "Religiosos", 
    color: "text-purple-600", 
    items: ["Grupos religiosos", "Retiros espirituales", "Eventos de iglesia", "Misiones"] 
  },
  { 
    icon: ShieldIcon, 
    title: "Adicionales", 
    color: "text-indigo-600", 
    items: ["Servicios especiales", "Atención personalizada", "Flexibilidad de horarios", "Tarifas preferenciales"] 
  }
]
</script>


