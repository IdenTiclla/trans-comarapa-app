<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Administracion de Buses</h1>
      <p class="text-gray-600 mt-1">Gestiona los buses de la flota</p>
    </div>

    <!-- Tabla de buses -->
    <BusTable
      :buses="buses"
      :loading="loading"
      :error="error"
      @refresh="fetchBuses"
      @create="showCreateForm"
      @edit="showEditForm"
      @delete="confirmDelete"
    />

    <!-- Modal para crear/editar bus -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <BusForm
          :bus="selectedBus"
          :loading="formLoading"
          :is-editing="isEditing"
          :existing-seats="selectedBusSeats"
          @submit="handleFormSubmit"
          @cancel="closeForm"
        />
      </div>
    </Teleport>

    <!-- Dialogo de confirmacion -->
    <ConfirmDialog
      v-model="showConfirmDialog"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      :type="confirmDialogType"
      :confirm-text="confirmDialogConfirmText"
      @confirm="handleConfirmAction"
    />

    <!-- Notificaciones -->
    <Teleport to="body">
      <Notification
        v-if="notification.show"
        :title="notification.title"
        :message="notification.message"
        :type="notification.type"
        @close="closeNotification"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BusTable from '~/components/admin/BusTable.vue'
import BusForm from '~/components/admin/BusForm.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'
import Notification from '~/components/ui/Notification.vue'
import { getAllBuses, createBus, updateBus, deleteBus, createBusWithSeats, getBusSeats, updateBusSeats } from '~/services/busService'

// Estado para la tabla de buses
const buses = ref([])
const loading = ref(false)
const error = ref(null)

// Estado para el formulario
const showForm = ref(false)
const selectedBus = ref(null)
const selectedBusSeats = ref([])
const formLoading = ref(false)
const isEditing = ref(false)

// Estado para el dialogo de confirmacion
const showConfirmDialog = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const confirmDialogType = ref('danger')
const confirmDialogConfirmText = ref('Confirmar')

// Estado para notificaciones
const notification = ref({
  show: false,
  title: '',
  message: '',
  type: 'info'
})

// Cargar buses
const fetchBuses = async () => {
  loading.value = true
  error.value = null

  try {
    buses.value = await getAllBuses()
  } catch (err) {
    error.value = err.message || 'Error al cargar buses'
    console.error('Error al cargar buses:', err)
  } finally {
    loading.value = false
  }
}

// Mostrar formulario para crear bus
const showCreateForm = () => {
  selectedBus.value = null
  selectedBusSeats.value = []
  isEditing.value = false
  showForm.value = true
}

// Mostrar formulario para editar bus
const showEditForm = async (bus) => {
  selectedBus.value = { ...bus }
  isEditing.value = true

  // Cargar asientos del bus
  try {
    selectedBusSeats.value = await getBusSeats(bus.id)
  } catch (err) {
    console.error('Error al cargar asientos:', err)
    selectedBusSeats.value = []
  }

  showForm.value = true
}

// Cerrar formulario
const closeForm = () => {
  showForm.value = false
  selectedBus.value = null
  selectedBusSeats.value = []
}

// Manejar envio del formulario
const handleFormSubmit = async (busData) => {
  formLoading.value = true

  try {
    if (isEditing.value && selectedBus.value) {
      // Modo edicion
      const { seats, seatsModified, ...busBasicData } = busData

      // Actualizar datos basicos del bus
      await updateBus(selectedBus.value.id, busBasicData)

      // Si se modificaron los asientos (viene del paso 2), actualizarlos
      if (seatsModified && seats && seats.length > 0) {
        await updateBusSeats(selectedBus.value.id, seats)
        showNotification('Bus actualizado', `El bus ha sido actualizado correctamente con ${seats.length} asientos`, 'success')
      } else {
        showNotification('Bus actualizado', 'El bus ha sido actualizado correctamente', 'success')
      }
    } else {
      // Modo crear: usar createBusWithSeats si hay asientos, sino createBus
      if (busData.seats && busData.seats.length > 0) {
        await createBusWithSeats(busData)
        showNotification('Bus creado', `El bus ha sido creado correctamente con ${busData.seats.length} asientos`, 'success')
      } else {
        await createBus(busData)
        showNotification('Bus creado', 'El bus ha sido creado correctamente', 'success')
      }
    }

    closeForm()
    await fetchBuses()
  } catch (err) {
    console.error('Error al guardar bus:', err)
    const errorMessage = err.data?.detail || err.message || 'Error al guardar bus'
    showNotification('Error', errorMessage, 'error')
  } finally {
    formLoading.value = false
  }
}

// Confirmar eliminacion de bus
const confirmDelete = (bus) => {
  selectedBus.value = bus
  confirmDialogTitle.value = 'Eliminar Bus'
  confirmDialogMessage.value = `¿Estas seguro de que deseas eliminar el bus con placa ${bus.license_plate}? Esta accion no se puede deshacer.`
  confirmDialogType.value = 'danger'
  confirmDialogConfirmText.value = 'Eliminar'
  showConfirmDialog.value = true
}

// Manejar accion confirmada
const handleConfirmAction = async () => {
  if (!selectedBus.value) return

  try {
    await deleteBus(selectedBus.value.id)
    showNotification('Bus eliminado', 'El bus ha sido eliminado correctamente', 'success')
    await fetchBuses()
  } catch (err) {
    console.error('Error al eliminar bus:', err)
    const errorMessage = err.data?.detail || err.message || 'Error al eliminar bus'
    showNotification('Error', errorMessage, 'error')
  }
}

// Mostrar notificacion
const showNotification = (title, message, type = 'info') => {
  notification.value = {
    show: true,
    title,
    message,
    type
  }
}

// Cerrar notificacion
const closeNotification = () => {
  notification.value.show = false
}

// Inicializar
onMounted(async () => {
  await fetchBuses()
})

// Definir metadatos de la pagina
definePageMeta({
  layout: 'default',
  middleware: ['role'],
  meta: {
    requiredRoles: ['admin']
  }
})
</script>
