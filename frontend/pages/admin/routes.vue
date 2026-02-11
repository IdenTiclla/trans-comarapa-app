<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Rutas y Horarios</h1>
      <p class="text-gray-600 mt-1">Gestiona las rutas y sus horarios de salida</p>
    </div>

    <!-- Tabla de rutas -->
    <RouteTable
      :routes="routes"
      :loading="loading"
      :error="error"
      @refresh="fetchRoutes"
      @create="showCreateForm"
      @edit="showEditForm"
      @delete="confirmDelete"
      @manage-schedules="showScheduleManager"
    />

    <!-- Modal para crear/editar ruta -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <RouteForm
          :route="selectedRoute"
          :loading="formLoading"
          :is-editing="isEditing"
          @submit="handleFormSubmit"
          @cancel="closeForm"
        />
      </div>
    </Teleport>

    <!-- Modal para gestionar horarios -->
    <Teleport to="body">
      <div v-if="showSchedules" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <RouteScheduleManager
          :route="selectedRoute"
          @close="closeScheduleManager"
          @add="handleAddSchedule"
          @update="handleUpdateSchedule"
          @remove="handleRemoveSchedule"
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
import RouteTable from '~/components/admin/RouteTable.vue'
import RouteForm from '~/components/admin/RouteForm.vue'
import RouteScheduleManager from '~/components/admin/RouteScheduleManager.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'
import Notification from '~/components/ui/Notification.vue'
import { getRoutesWithSchedules, createRoute, updateRoute, deleteRoute, createRouteSchedule, updateRouteSchedule, deleteRouteSchedule } from '~/services/routeService'

const routes = ref([])
const loading = ref(false)
const error = ref(null)

const showForm = ref(false)
const selectedRoute = ref(null)
const formLoading = ref(false)
const isEditing = ref(false)

const showSchedules = ref(false)

const showConfirmDialog = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const confirmDialogType = ref('danger')
const confirmDialogConfirmText = ref('Confirmar')

const notification = ref({
  show: false,
  title: '',
  message: '',
  type: 'info'
})

const fetchRoutes = async () => {
  loading.value = true
  error.value = null
  try {
    routes.value = await getRoutesWithSchedules()
  } catch (err) {
    error.value = err.message || 'Error al cargar rutas'
    console.error('Error al cargar rutas:', err)
  } finally {
    loading.value = false
  }
}

const showCreateForm = () => {
  selectedRoute.value = null
  isEditing.value = false
  showForm.value = true
}

const showEditForm = (route) => {
  selectedRoute.value = { ...route }
  isEditing.value = true
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  selectedRoute.value = null
}

const syncSchedules = async (routeId, schedules, existingSchedules = []) => {
  const existingIds = existingSchedules.map(s => s.id)
  const submittedIds = schedules.filter(s => s.id).map(s => s.id)

  // Delete removed schedules
  const toDelete = existingIds.filter(id => !submittedIds.includes(id))
  for (const scheduleId of toDelete) {
    await deleteRouteSchedule(routeId, scheduleId)
  }

  // Create new schedules
  const toCreate = schedules.filter(s => !s.id || s._isNew)
  for (const schedule of toCreate) {
    await createRouteSchedule(routeId, {
      departure_time: schedule.departure_time,
      is_active: schedule.is_active
    })
  }

  // Update existing schedules (check if is_active changed)
  const toUpdate = schedules.filter(s => s.id && !s._isNew)
  for (const schedule of toUpdate) {
    const existing = existingSchedules.find(e => e.id === schedule.id)
    if (existing && existing.is_active !== schedule.is_active) {
      await updateRouteSchedule(routeId, schedule.id, {
        is_active: schedule.is_active
      })
    }
  }
}

const handleFormSubmit = async (routeData) => {
  formLoading.value = true
  try {
    const { schedules, ...routeFields } = routeData

    if (isEditing.value && selectedRoute.value) {
      await updateRoute(selectedRoute.value.id, routeFields)
      // Sync schedules
      if (schedules) {
        await syncSchedules(selectedRoute.value.id, schedules, selectedRoute.value.schedules || [])
      }
      showNotification('Ruta actualizada', 'La ruta y sus horarios han sido actualizados correctamente', 'success')
    } else {
      const newRoute = await createRoute(routeFields)
      // Create schedules for the new route
      if (schedules && schedules.length > 0 && newRoute?.id) {
        for (const schedule of schedules) {
          await createRouteSchedule(newRoute.id, {
            departure_time: schedule.departure_time,
            is_active: schedule.is_active
          })
        }
      }
      showNotification('Ruta creada', 'La ruta y sus horarios han sido creados correctamente', 'success')
    }
    closeForm()
    await fetchRoutes()
  } catch (err) {
    console.error('Error al guardar ruta:', err)
    const errorMessage = err.data?.detail || err.message || 'Error al guardar ruta'
    showNotification('Error', errorMessage, 'error')
  } finally {
    formLoading.value = false
  }
}

const confirmDelete = (route) => {
  selectedRoute.value = route
  confirmDialogTitle.value = 'Eliminar Ruta'
  confirmDialogMessage.value = `¿Estas seguro de que deseas eliminar la ruta ${route.origin_location?.name} → ${route.destination_location?.name}? Esta accion no se puede deshacer.`
  confirmDialogType.value = 'danger'
  confirmDialogConfirmText.value = 'Eliminar'
  showConfirmDialog.value = true
}

const handleConfirmAction = async () => {
  if (!selectedRoute.value) return
  try {
    await deleteRoute(selectedRoute.value.id)
    showNotification('Ruta eliminada', 'La ruta ha sido eliminada correctamente', 'success')
    await fetchRoutes()
  } catch (err) {
    console.error('Error al eliminar ruta:', err)
    const errorMessage = err.data?.detail || err.message || 'Error al eliminar ruta'
    showNotification('Error', errorMessage, 'error')
  }
}

const showScheduleManager = (route) => {
  selectedRoute.value = route
  showSchedules.value = true
}

const closeScheduleManager = () => {
  showSchedules.value = false
  selectedRoute.value = null
}

const handleAddSchedule = async (routeId, data) => {
  try {
    await createRouteSchedule(routeId, data)
    await fetchRoutes()
    // Update selectedRoute with fresh data
    selectedRoute.value = routes.value.find(r => r.id === routeId)
    showNotification('Horario agregado', 'El horario ha sido agregado correctamente', 'success')
  } catch (err) {
    const errorMessage = err.data?.detail || err.message || 'Error al agregar horario'
    showNotification('Error', errorMessage, 'error')
    throw err
  }
}

const handleUpdateSchedule = async (routeId, scheduleId, data) => {
  try {
    await updateRouteSchedule(routeId, scheduleId, data)
    await fetchRoutes()
    selectedRoute.value = routes.value.find(r => r.id === routeId)
    showNotification('Horario actualizado', 'El horario ha sido actualizado correctamente', 'success')
  } catch (err) {
    const errorMessage = err.data?.detail || err.message || 'Error al actualizar horario'
    showNotification('Error', errorMessage, 'error')
    throw err
  }
}

const handleRemoveSchedule = async (routeId, scheduleId) => {
  try {
    await deleteRouteSchedule(routeId, scheduleId)
    await fetchRoutes()
    selectedRoute.value = routes.value.find(r => r.id === routeId)
    showNotification('Horario eliminado', 'El horario ha sido eliminado correctamente', 'success')
  } catch (err) {
    const errorMessage = err.data?.detail || err.message || 'Error al eliminar horario'
    showNotification('Error', errorMessage, 'error')
    throw err
  }
}

const showNotification = (title, message, type = 'info') => {
  notification.value = { show: true, title, message, type }
}

const closeNotification = () => {
  notification.value.show = false
}

onMounted(async () => {
  await fetchRoutes()
})

definePageMeta({
  layout: 'default',
  middleware: ['role'],
  meta: {
    requiredRoles: ['admin']
  }
})
</script>
