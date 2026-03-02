<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>
      
      <div class="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900">
            {{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormInput
                label="Nombre *"
                v-model="form.firstname"
                type="text"
                required
              />
            </div>
            <div>
              <FormInput
                label="Apellido *"
                v-model="form.lastname"
                type="text"
                required
              />
            </div>
            <div>
              <FormInput
                label="CI"
                v-model="form.document_id"
                type="text"
              />
            </div>
            <div>
              <FormInput
                label="Teléfono"
                v-model="form.phone"
                type="tel"
              />
            </div>
            <div>
              <FormInput
                label="Email"
                v-model="form.email"
                type="email"
              />
            </div>
            <div>
              <FormInput
                label="Ciudad"
                v-model="form.city"
                type="text"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-6">
            <button type="button" @click="$emit('close')" 
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" :disabled="isSubmitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {{ isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import FormInput from '~/components/forms/FormInput.vue'

const props = defineProps({
  show: Boolean,
  client: Object,
  isEditing: Boolean
})

const emit = defineEmits(['close', 'save'])

const form = reactive({
  firstname: '',
  lastname: '',
  document_id: '',
  phone: '',
  email: '',
  city: '',
  state: ''
})

const isSubmitting = ref(false)

watch(() => props.client, (newClient) => {
  if (newClient && props.isEditing) {
    Object.assign(form, newClient)
  } else {
    Object.keys(form).forEach(key => form[key] = '')
  }
}, { immediate: true })

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    emit('save', { ...form })
  } finally {
    isSubmitting.value = false
  }
}
</script> 