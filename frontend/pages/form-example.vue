<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Formulario de Ejemplo</h1>

    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Componentes de Formulario Avanzados</h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Sección de información personal -->
        <div>
          <h3 class="text-md font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200">Información Personal</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="formData.firstName"
              label="Nombre"
              placeholder="Ingrese su nombre"
              required
              :error="errors.firstName"
              left-icon="UserIcon"
            />

            <FormInput
              v-model="formData.lastName"
              label="Apellido"
              placeholder="Ingrese su apellido"
              required
              :error="errors.lastName"
            />

            <FormInput
              v-model="formData.email"
              label="Correo Electrónico"
              type="email"
              placeholder="ejemplo@correo.com"
              required
              :error="errors.email"
              help-text="Nunca compartiremos su correo electrónico."
            />

            <FormInput
              v-model="formData.phone"
              label="Teléfono"
              type="tel"
              placeholder="(XXX) XXX-XXXX"
              :error="errors.phone"
              clearable
            />
          </div>
        </div>

        <!-- Sección de detalles adicionales -->
        <div>
          <h3 class="text-md font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200">Detalles Adicionales</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormDatePicker
              v-model="formData.birthDate"
              label="Fecha de Nacimiento"
              placeholder="Seleccionar fecha"
              :error="errors.birthDate"
              :max-date="new Date()"
            />

            <FormSearchSelect
              v-model="formData.country"
              :options="countries"
              label="País"
              placeholder="Seleccionar país"
              :error="errors.country"
              searchable
              clearable
            />

            <FormSelect
              v-model="formData.gender"
              :options="genderOptions"
              label="Género"
              placeholder="Seleccionar género"
              :error="errors.gender"
            />

            <FormSelect
              v-model="formData.languages"
              :options="languageOptions"
              label="Idiomas"
              placeholder="Seleccionar idiomas"
              multiple
              :size="3"
              :error="errors.languages"
              help-text="Mantenga presionado Ctrl para seleccionar varios."
            />
          </div>

          <div class="mt-4">
            <FormTextarea
              v-model="formData.bio"
              label="Biografía"
              placeholder="Cuéntanos sobre ti..."
              :rows="4"
              :maxlength="500"
              show-char-count
              :error="errors.bio"
            />
          </div>
        </div>

        <!-- Sección de preferencias -->
        <div>
          <h3 class="text-md font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200">Preferencias</h3>

          <FormRadio
            v-model="formData.contactPreference"
            :options="contactOptions"
            group-label="Preferencia de contacto"
            :error="errors.contactPreference"
          />

          <div class="mt-4">
            <FormCheckbox
              v-model="formData.newsletter"
              label="Suscribirse al boletín informativo"
              :error="errors.newsletter"
              help-text="Recibirás actualizaciones mensuales sobre nuestros servicios."
            />
          </div>

          <div class="mt-4">
            <FormCheckbox
              v-model="formData.termsAccepted"
              label="Acepto los términos y condiciones"
              required
              :error="errors.termsAccepted"
            />
          </div>
        </div>

        <!-- Sección de documentos -->
        <div>
          <h3 class="text-md font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200">Documentos</h3>

          <FormFileUpload
            v-model="formData.profilePicture"
            label="Foto de Perfil"
            accept="image/*"
            :max-size="MAX_PROFILE_SIZE"
            :error="errors.profilePicture"
            help-text="Sube una foto de perfil (opcional)."
          />

          <div class="mt-4">
            <FormFileUpload
              v-model="formData.documents"
              label="Documentos Adicionales"
              accept=".pdf,.doc,.docx"
              multiple
              :max-files="3"
              :max-size="MAX_DOCUMENT_SIZE"
              :error="errors.documents"
              help-text="Puedes subir hasta 3 documentos (PDF, DOC, DOCX)."
            />
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="resetForm"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </span>
            <span v-else>Enviar</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Resultado del formulario -->
    <div v-if="formSubmitted" class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Datos Enviados</h2>

      <div class="bg-gray-50 p-4 rounded-md">
        <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ JSON.stringify(submittedData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineComponent, h } from 'vue'
import FormInput from '~/components/forms/FormInput.vue'
import FormSelect from '~/components/forms/FormSelect.vue'
import FormTextarea from '~/components/forms/FormTextarea.vue'
import FormCheckbox from '~/components/forms/FormCheckbox.vue'
import FormRadio from '~/components/forms/FormRadio.vue'
import FormSearchSelect from '~/components/forms/FormSearchSelect.vue'
import FormDatePicker from '~/components/forms/FormDatePicker.vue'
import FormFileUpload from '~/components/forms/FormFileUpload.vue'

// Constantes para tamaños máximos de archivos
const MAX_PROFILE_SIZE = 2 * 1024 * 1024 // 2MB
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024 // 5MB

// Componente de icono de usuario
const UserIcon = defineComponent({
  name: 'UserIcon',
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      class: 'h-5 w-5',
      viewBox: '0 0 20 20',
      fill: 'currentColor'
    }, [
      h('path', {
        'fill-rule': 'evenodd',
        d: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z',
        'clip-rule': 'evenodd'
      })
    ])
  }
})

// Datos del formulario
const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: null,
  country: null,
  gender: '',
  languages: [],
  bio: '',
  contactPreference: '',
  newsletter: false,
  termsAccepted: false,
  profilePicture: null,
  documents: []
})

// Errores del formulario
const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: '',
  country: '',
  gender: '',
  languages: '',
  bio: '',
  contactPreference: '',
  newsletter: '',
  termsAccepted: '',
  profilePicture: '',
  documents: ''
})

// Estado del formulario
const isSubmitting = ref(false)
const formSubmitted = ref(false)
const submittedData = ref(null)

// Opciones para los selectores
const genderOptions = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_to_say', label: 'Prefiero no decirlo' }
]

const languageOptions = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
  { value: 'fr', label: 'Francés' },
  { value: 'de', label: 'Alemán' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Portugués' },
  { value: 'zh', label: 'Chino' },
  { value: 'ja', label: 'Japonés' }
]

const contactOptions = [
  { value: 'email', label: 'Correo Electrónico' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'sms', label: 'SMS' },
  { value: 'none', label: 'No contactar', disabled: false }
]

const countries = [
  { value: 'ar', label: 'Argentina' },
  { value: 'bo', label: 'Bolivia' },
  { value: 'br', label: 'Brasil' },
  { value: 'cl', label: 'Chile' },
  { value: 'co', label: 'Colombia' },
  { value: 'cr', label: 'Costa Rica' },
  { value: 'cu', label: 'Cuba' },
  { value: 'ec', label: 'Ecuador' },
  { value: 'sv', label: 'El Salvador' },
  { value: 'gt', label: 'Guatemala' },
  { value: 'hn', label: 'Honduras' },
  { value: 'mx', label: 'México' },
  { value: 'ni', label: 'Nicaragua' },
  { value: 'pa', label: 'Panamá' },
  { value: 'py', label: 'Paraguay' },
  { value: 'pe', label: 'Perú' },
  { value: 'do', label: 'República Dominicana' },
  { value: 'uy', label: 'Uruguay' },
  { value: 've', label: 'Venezuela' },
  { value: 'es', label: 'España' },
  { value: 'us', label: 'Estados Unidos' }
]

// Validar el formulario
const validateForm = () => {
  let isValid = true

  // Limpiar errores previos
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  // Validar nombre
  if (!formData.firstName.trim()) {
    errors.firstName = 'El nombre es requerido'
    isValid = false
  }

  // Validar apellido
  if (!formData.lastName.trim()) {
    errors.lastName = 'El apellido es requerido'
    isValid = false
  }

  // Validar email
  if (!formData.email.trim()) {
    errors.email = 'El correo electrónico es requerido'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'El correo electrónico no es válido'
    isValid = false
  }

  // Validar teléfono (opcional)
  if (formData.phone && !/^\d{7,15}$/.test(formData.phone.replace(/\D/g, ''))) {
    errors.phone = 'El número de teléfono no es válido'
    isValid = false
  }

  // Validar términos y condiciones
  if (!formData.termsAccepted) {
    errors.termsAccepted = 'Debes aceptar los términos y condiciones'
    isValid = false
  }

  return isValid
}

// Manejar envío del formulario
const handleSubmit = async () => {
  if (!validateForm()) {
    // Desplazarse al primer error
    const firstErrorElement = document.querySelector('.text-red-600')
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  isSubmitting.value = true

  try {
    // Simular una petición a la API
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mostrar los datos enviados
    submittedData.value = { ...formData }
    formSubmitted.value = true

    // Desplazarse al resultado
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      })
    }, 100)

  } catch (error) {
    console.error('Error al enviar el formulario:', error)
    alert('Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo.')
  } finally {
    isSubmitting.value = false
  }
}

// Resetear el formulario
const resetForm = () => {
  // Restablecer datos
  Object.keys(formData).forEach(key => {
    if (Array.isArray(formData[key])) {
      formData[key] = []
    } else if (typeof formData[key] === 'boolean') {
      formData[key] = false
    } else {
      formData[key] = null
    }
  })

  // Restablecer campos específicos
  formData.firstName = ''
  formData.lastName = ''
  formData.email = ''
  formData.phone = ''
  formData.bio = ''

  // Limpiar errores
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  // Ocultar resultado
  formSubmitted.value = false
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
