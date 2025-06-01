<template>
  <div class="bg-white overflow-hidden shadow rounded-lg p-5">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
        <div v-if="!isLoading">
          <p class="text-2xl font-semibold text-gray-900">{{ formattedCurrentValue }}</p>
          <p class="text-sm text-gray-500">
            {{ period }} 
            <span :class="trendColor">{{ formattedTrend }}</span>
          </p>
        </div>
        <div v-else>
          <p class="text-2xl font-semibold text-gray-400">Cargando...</p>
          <p class="text-sm text-gray-400">Obteniendo datos...</p>
        </div>
      </div>
      
      <!-- Period Selector -->
      <div v-if="showPeriodSelector">
        <select 
          v-model="selectedPeriod" 
          @change="$emit('periodChanged', selectedPeriod)"
          class="border-gray-300 rounded-md shadow-sm text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="6">Últimos 6 meses</option>
          <option value="12">Último año</option>
          <option value="3">Últimos 3 meses</option>
        </select>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="mt-4 h-40 relative">
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <span class="text-gray-500 text-sm mt-2">Cargando datos...</span>
        </div>
      </div>
      
      <div v-else-if="error" class="absolute inset-0 flex items-center justify-center bg-red-50 rounded">
        <div class="text-center">
          <span class="text-red-500 text-sm">{{ error }}</span>
        </div>
      </div>
      
      <div v-else-if="!chartData || chartData.length === 0" class="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
        <span class="text-gray-500 text-sm">No hay datos disponibles</span>
      </div>
      
      <!-- Bar Chart -->
      <svg v-else class="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">
        <!-- Grid lines -->
        <defs>
          <linearGradient :id="`gradient-${gradientId}`" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :style="`stop-color:${barColor};stop-opacity:0.8`" />
            <stop offset="100%" :style="`stop-color:${barColor};stop-opacity:0.3`" />
          </linearGradient>
          <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <!-- Y-axis values -->
        <g class="text-xs fill-gray-400">
          <text x="15" y="25" text-anchor="end">{{ formatValue(maxValue) }}</text>
          <text x="15" y="75" text-anchor="end">{{ formatValue(maxValue / 2) }}</text>
          <text x="15" y="125" text-anchor="end">0</text>
        </g>
        
        <!-- Bars -->
        <g v-for="(point, index) in chartData" :key="index">
          <!-- Bar with gradient -->
          <rect
            :x="getBarX(index)"
            :y="getBarY(point.value)"
            :width="barWidth"
            :height="getBarHeight(point.value)"
            :fill="`url(#gradient-${gradientId})`"
            :stroke="barColor"
            stroke-width="1"
            rx="2"
            ry="2"
            class="transition-all duration-300 hover:opacity-90 drop-shadow-sm"
          >
            <!-- Tooltip -->
            <title>{{ point.label }}: {{ formatValue(point.value) }}</title>
          </rect>
          
          <!-- Value on top of bar (for higher values) -->
          <text 
            v-if="point.value > maxValue * 0.7"
            :x="getBarX(index) + barWidth / 2" 
            :y="getBarY(point.value) - 5" 
            text-anchor="middle"
            class="text-xs fill-gray-600 font-medium"
          >
            {{ formatShortValue(point.value) }}
          </text>
          
          <!-- Value inside bar (for lower values) -->
          <text 
            v-else-if="getBarHeight(point.value) > 15"
            :x="getBarX(index) + barWidth / 2" 
            :y="getBarY(point.value) + 12" 
            text-anchor="middle"
            class="text-xs fill-white font-medium"
          >
            {{ formatShortValue(point.value) }}
          </text>
        </g>
        
        <!-- Month labels -->
        <g class="text-xs fill-gray-500">
          <text 
            v-for="(point, index) in chartData" 
            :key="`label-${index}`"
            :x="getBarX(index) + barWidth / 2" 
            y="155" 
            text-anchor="middle"
            class="text-xs font-medium"
          >
            {{ point.label }}
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  chartData: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  valueFormatter: {
    type: Function,
    default: (value) => value?.toLocaleString() || '0'
  },
  lineColor: {
    type: String,
    default: '#3b82f6' // Mantener por compatibilidad
  },
  barColor: {
    type: String,
    default: null // Se usará lineColor si no se especifica
  },
  period: {
    type: String,
    default: 'Últimos 6 meses'
  },
  trend: {
    type: Number,
    default: 0
  },
  showPeriodSelector: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['periodChanged'])

const selectedPeriod = ref(6)

// Computed values
const formattedCurrentValue = computed(() => {
  if (!props.chartData || props.chartData.length === 0) return '0'
  const latestValue = props.chartData[props.chartData.length - 1]?.value || 0
  return props.valueFormatter(latestValue)
})

const formattedTrend = computed(() => {
  const trend = props.trend || 0
  const sign = trend >= 0 ? '+' : ''
  return `${sign}${trend.toFixed(1)}%`
})

const trendColor = computed(() => {
  return props.trend >= 0 ? 'text-green-600' : 'text-red-600'
})

// Use barColor if provided, otherwise use lineColor
const barColor = computed(() => {
  return props.barColor || props.lineColor
})

// Generate unique ID for gradient
const gradientId = computed(() => {
  return Math.random().toString(36).substr(2, 9)
})

// Chart calculations
const maxValue = computed(() => {
  if (!props.chartData || props.chartData.length === 0) return 100
  const max = Math.max(...props.chartData.map(d => d.value))
  // Add 10% padding to the top
  return max * 1.1
})

const minValue = computed(() => {
  return 0 // Always start bars from 0
})

// Bar chart specific calculations
const barWidth = computed(() => {
  if (!props.chartData || props.chartData.length === 0) return 30
  const totalWidth = 360 // 400 - 40 (padding)
  const spacing = 8
  const availableWidth = totalWidth - (spacing * (props.chartData.length - 1))
  return Math.max(15, Math.min(50, availableWidth / props.chartData.length))
})

// Helper functions
const getBarX = (index) => {
  if (!props.chartData || props.chartData.length === 0) return 0
  const totalWidth = 360
  const spacing = 8
  const totalBarWidth = barWidth.value * props.chartData.length
  const totalSpacing = spacing * (props.chartData.length - 1)
  const startX = 20 + (totalWidth - totalBarWidth - totalSpacing) / 2
  
  return startX + index * (barWidth.value + spacing)
}

const getBarY = (value) => {
  const height = 120 // Chart area height
  const padding = 20
  const normalizedValue = value / maxValue.value
  return padding + height - (normalizedValue * height)
}

const getBarHeight = (value) => {
  const height = 120 // Chart area height
  const normalizedValue = value / maxValue.value
  return Math.max(2, normalizedValue * height) // Minimum height of 2px
}

const formatValue = (value) => {
  return props.valueFormatter(value)
}

const formatShortValue = (value) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toString()
}
</script>

<style scoped>
/* Animaciones suaves para las barras */
svg rect {
  transition: all 0.3s ease;
}

svg rect:hover {
  filter: brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.15));
  transform: translateY(-1px);
}

svg text {
  pointer-events: none;
}

/* Mejoras visuales */
.drop-shadow-sm {
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
}
</style> 