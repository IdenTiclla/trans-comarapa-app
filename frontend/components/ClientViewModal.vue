<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75" @click="$emit('close')"></div>
      
      <div class="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-xl relative">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900">
            {{ client?.firstname }} {{ client?.lastname }}
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">CI</label>
              <p class="text-gray-900">{{ client?.document_id || 'No registrado' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Teléfono</label>
              <p class="text-gray-900">{{ client?.phone || 'No registrado' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Email</label>
              <p class="text-gray-900">{{ client?.email || 'No registrado' }}</p>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Ciudad</label>
              <p class="text-gray-900">{{ client?.city || 'No registrada' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Departamento</label>
              <p class="text-gray-900">{{ client?.state || 'No registrado' }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <button @click="$emit('edit', client)" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Editar Cliente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  client: Object
})

defineEmits(['close', 'edit'])
</script> 