// Este plugin registra todos los componentes de formulario globalmente
import { defineNuxtPlugin } from '#app'

// Importar componentes
import FormInput from '~/components/forms/FormInput.vue'
import FormSelect from '~/components/forms/FormSelect.vue'
import FormTextarea from '~/components/forms/FormTextarea.vue'
import FormCheckbox from '~/components/forms/FormCheckbox.vue'
import FormRadio from '~/components/forms/FormRadio.vue'
import FormSearchSelect from '~/components/forms/FormSearchSelect.vue'
import FormDatePicker from '~/components/forms/FormDatePicker.vue'
import FormFileUpload from '~/components/forms/FormFileUpload.vue'

export default defineNuxtPlugin((nuxtApp) => {
  // Registrar componentes globalmente
  nuxtApp.vueApp.component('FormInput', FormInput)
  nuxtApp.vueApp.component('FormSelect', FormSelect)
  nuxtApp.vueApp.component('FormTextarea', FormTextarea)
  nuxtApp.vueApp.component('FormCheckbox', FormCheckbox)
  nuxtApp.vueApp.component('FormRadio', FormRadio)
  nuxtApp.vueApp.component('FormSearchSelect', FormSearchSelect)
  nuxtApp.vueApp.component('FormDatePicker', FormDatePicker)
  nuxtApp.vueApp.component('FormFileUpload', FormFileUpload)
});
