<template>
  <section id="oficinas" class="py-24 bg-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 bg-comarapa-light/20 px-4 py-2 rounded-full mb-4">
          <svg class="h-5 w-5 text-comarapa-dark" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span class="text-comarapa-dark font-medium">Nuestras Oficinas</span>
        </div>
        <h2 class="text-4xl md:text-5xl font-bold text-comarapa-dark mb-6">
          Te Atendemos en 4 Ubicaciones
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Encuentra nuestra oficina más cercana para reservas y consultas
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="office in offices"
          :key="office.name"
          class="comarapa-card p-6 group"
        >
          <div
            :class="office.gradientClass"
            class="rounded-xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
          >
            <svg
              class="h-8 w-8 text-white"
              :fill="office.iconFill"
              viewBox="0 0 24 24"
              :stroke="office.iconStroke"
            >
              <path
                v-if="office.iconType === 'location'"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                v-if="office.iconType === 'location'"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                v-if="office.iconType === 'map'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>

          <h3 class="text-2xl font-bold text-comarapa-dark text-center mb-4">{{ office.name }}</h3>

          <div class="space-y-3 text-center mb-6">
            <div class="flex items-center justify-center gap-2 text-gray-600">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="text-sm">{{ office.address }}</span>
            </div>
            <div class="flex items-center justify-center gap-2 text-gray-600">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span class="text-sm font-medium">{{ office.phone }}</span>
            </div>
            <div class="flex items-center justify-center gap-2 text-gray-600">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-sm">{{ office.hours }}</span>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="space-y-2">
            <!-- Botón de Google Maps -->
            <a
              :href="office.mapsUrl"
              target="_blank"
              class="w-full bg-comarapa-dark text-white px-4 py-3 rounded-lg font-semibold hover:bg-comarapa-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C7.802 0 4.403 3.403 4.403 7.602c0 1.7.6 3.252 1.6 4.502L12 24l5.997-11.896c1-.25 1.6-1.802 1.6-3.502C19.597 3.403 16.198 0 12 0zm0 10.8c-1.8 0-3.252-1.452-3.252-3.252S10.2 4.296 12 4.296s3.252 1.452 3.252 3.252S13.8 10.8 12 10.8z"/>
              </svg>
              Ver en Maps
            </a>

            <!-- Botón de WhatsApp -->
            <a
              :href="office.whatsappUrl"
              target="_blank"
              class="w-full bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

// Datos de las oficinas - modifica los mapsUrl con tus enlaces reales de Google Maps
const offices = ref([
  {
    name: 'Santa Cruz',
    address: 'Oficina 4to Anillo doble via la Guardia',
    phone: '68921188',
    hours: '6:00 AM - 09:00 PM',
    whatsappUrl: 'https://wa.me/59168921188',
    mapsUrl: 'https://maps.google.com/?q=-17.7833,-63.1821', // URL dummy - reemplazar con la real
    gradientClass: 'bg-gradient-to-br from-comarapa-dark to-comarapa-medium',
    iconType: 'location',
    iconFill: 'currentColor',
    iconStroke: 'none'
  },
  {
    name: 'Comarapa',
    address: 'Terminal de Buses mercado campesino',
    phone: '68921154',
    hours: '06:30 AM - 11:30 PM',
    whatsappUrl: 'https://wa.me/59168921154',
    mapsUrl: 'https://maps.google.com/?q=-17.9167,-64.5167', // URL dummy - reemplazar con la real
    gradientClass: 'bg-gradient-to-br from-comarapa-medium to-comarapa-light',
    iconType: 'location',
    iconFill: 'currentColor',
    iconStroke: 'none'
  },
  {
    name: 'Los Negros',
    address: 'Sobre la carretera cerca del puente',
    phone: '71651781',
    hours: '6AM - 10PM',
    whatsappUrl: 'https://wa.me/59171651781',
    mapsUrl: 'https://maps.google.com/?q=-17.8500,-64.2000', // URL dummy - reemplazar con la real
    gradientClass: 'bg-gradient-to-br from-comarapa-light to-green-400',
    iconType: 'location',
    iconFill: 'currentColor',
    iconStroke: 'none'
  },
  {
    name: 'San Isidro',
    address: 'Sobre la avenida cerca del mercado central',
    phone: '71641780',
    hours: '6AM - 00:00 AM',
    whatsappUrl: 'https://wa.me/59171641780',
    mapsUrl: 'https://maps.google.com/?q=-17.8000,-64.3000', // URL dummy - reemplazar con la real
    gradientClass: 'bg-gradient-to-br from-green-500 to-emerald-600',
    iconType: 'map',
    iconFill: 'none',
    iconStroke: 'currentColor'
  }
])
</script>


