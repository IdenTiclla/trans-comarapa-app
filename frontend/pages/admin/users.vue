<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Administración de Usuarios</h1>
      <p class="text-gray-600 mt-1">Gestiona los usuarios del sistema</p>
    </div>

    <!-- Tabla de usuarios -->
    <UserTable 
      :users="users" 
      :loading="loading" 
      :error="error" 
      :roles="availableRoles"
      :pagination="pagination"
      :current-page="currentPage"
      @refresh="fetchUsers"
      @create="showCreateForm"
      @view="showUserDetails"
      @edit="showEditForm"
      @delete="confirmDelete"
      @activate="confirmActivate"
      @deactivate="confirmDeactivate"
      @page-change="handlePageChange"
      @filter-change="handleFilterChange"
      @search="handleSearch"
    />

    <!-- Modal para crear/editar usuario -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <UserForm 
          :user="selectedUser" 
          :roles="availableRoles" 
          :loading="formLoading" 
          :is-editing="isEditing"
          @submit="handleFormSubmit"
          @cancel="closeForm"
        />
      </div>
    </Teleport>

    <!-- Modal para ver detalles de usuario -->
    <Teleport to="body">
      <div v-if="showDetails" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <UserDetail 
          :user="selectedUser" 
          :loading="detailLoading" 
          :error="detailError"
          @close="closeDetails"
          @edit="showEditForm"
          @delete="confirmDelete"
          @activate="confirmActivate"
          @deactivate="confirmDeactivate"
          @refresh="refreshUserDetails"
        />
      </div>
    </Teleport>

    <!-- Diálogo de confirmación -->
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
import { ref, onMounted, computed } from 'vue'
import UserTable from '~/components/admin/UserTable.vue'
import UserForm from '~/components/admin/UserForm.vue'
import UserDetail from '~/components/admin/UserDetail.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'
import Notification from '~/components/ui/Notification.vue'
import userManagementService from '~/services/userManagementService'

// Estado para la tabla de usuarios
const users = ref([])
const loading = ref(false)
const error = ref(null)
const availableRoles = ref([])

// Estado para la paginación
const pagination = ref({
  total: 0,
  skip: 0,
  limit: 10,
  pages: 1
})
const currentPage = ref(1)

// Estado para filtros
const filters = ref({
  search: '',
  role: '',
  is_active: undefined
})

// Estado para el formulario
const showForm = ref(false)
const selectedUser = ref(null)
const formLoading = ref(false)
const isEditing = ref(false)

// Estado para los detalles del usuario
const showDetails = ref(false)
const detailLoading = ref(false)
const detailError = ref(null)

// Estado para el diálogo de confirmación
const showConfirmDialog = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const confirmDialogType = ref('danger')
const confirmDialogConfirmText = ref('Confirmar')
const confirmAction = ref(null)

// Estado para notificaciones
const notification = ref({
  show: false,
  title: '',
  message: '',
  type: 'info'
})

// Cargar roles disponibles
const fetchRoles = async () => {
  try {
    const response = await userManagementService.getRoles()
    availableRoles.value = response.roles || []
  } catch (error) {
    console.error('Error al cargar roles:', error)
    showNotification('Error', 'No se pudieron cargar los roles disponibles', 'error')
  }
}

// Cargar usuarios
const fetchUsers = async () => {
  loading.value = true
  error.value = null
  
  try {
    const params = {
      skip: (currentPage.value - 1) * pagination.value.limit,
      limit: pagination.value.limit,
      ...filters.value
    }
    
    const response = await userManagementService.getUsers(params)
    
    users.value = response.items || []
    pagination.value = {
      total: response.total || 0,
      skip: response.skip || 0,
      limit: response.limit || 10,
      pages: Math.ceil((response.total || 0) / (response.limit || 10))
    }
  } catch (err) {
    error.value = err.message || 'Error al cargar usuarios'
    console.error('Error al cargar usuarios:', err)
  } finally {
    loading.value = false
  }
}

// Cargar detalles de un usuario
const fetchUserDetails = async (userId) => {
  detailLoading.value = true
  detailError.value = null
  
  try {
    const user = await userManagementService.getUserById(userId)
    selectedUser.value = user
  } catch (err) {
    detailError.value = err.message || 'Error al cargar detalles del usuario'
    console.error(`Error al cargar detalles del usuario ${userId}:`, err)
  } finally {
    detailLoading.value = false
  }
}

// Mostrar formulario para crear usuario
const showCreateForm = () => {
  selectedUser.value = null
  isEditing.value = false
  showForm.value = true
}

// Mostrar formulario para editar usuario
const showEditForm = (user) => {
  selectedUser.value = user
  isEditing.value = true
  showForm.value = true
  
  // Si estamos mostrando los detalles, cerrarlos
  if (showDetails.value) {
    showDetails.value = false
  }
}

// Mostrar detalles de usuario
const showUserDetails = async (user) => {
  selectedUser.value = user
  showDetails.value = true
  
  // Cargar detalles completos del usuario
  await fetchUserDetails(user.id)
}

// Refrescar detalles del usuario
const refreshUserDetails = async () => {
  if (selectedUser.value && selectedUser.value.id) {
    await fetchUserDetails(selectedUser.value.id)
  }
}

// Cerrar formulario
const closeForm = () => {
  showForm.value = false
  selectedUser.value = null
}

// Cerrar detalles
const closeDetails = () => {
  showDetails.value = false
  selectedUser.value = null
}

// Manejar envío del formulario
const handleFormSubmit = async (userData) => {
  formLoading.value = true
  
  try {
    if (isEditing.value && selectedUser.value) {
      // Actualizar usuario existente
      await userManagementService.updateUser(selectedUser.value.id, userData)
      showNotification('Usuario actualizado', 'El usuario ha sido actualizado correctamente', 'success')
    } else {
      // Crear nuevo usuario
      await userManagementService.createUser(userData)
      showNotification('Usuario creado', 'El usuario ha sido creado correctamente', 'success')
    }
    
    // Cerrar formulario y recargar usuarios
    closeForm()
    await fetchUsers()
  } catch (err) {
    console.error('Error al guardar usuario:', err)
    showNotification('Error', err.message || 'Error al guardar usuario', 'error')
  } finally {
    formLoading.value = false
  }
}

// Confirmar eliminación de usuario
const confirmDelete = (user) => {
  selectedUser.value = user
  confirmDialogTitle.value = 'Eliminar Usuario'
  confirmDialogMessage.value = `¿Estás seguro de que deseas eliminar al usuario ${user.firstname} ${user.lastname}? Esta acción no se puede deshacer.`
  confirmDialogType.value = 'danger'
  confirmDialogConfirmText.value = 'Eliminar'
  confirmAction.value = 'delete'
  showConfirmDialog.value = true
  
  // Si estamos mostrando los detalles, cerrarlos
  if (showDetails.value) {
    showDetails.value = false
  }
}

// Confirmar activación de usuario
const confirmActivate = (user) => {
  selectedUser.value = user
  confirmDialogTitle.value = 'Activar Usuario'
  confirmDialogMessage.value = `¿Estás seguro de que deseas activar al usuario ${user.firstname} ${user.lastname}?`
  confirmDialogType.value = 'success'
  confirmDialogConfirmText.value = 'Activar'
  confirmAction.value = 'activate'
  showConfirmDialog.value = true
}

// Confirmar desactivación de usuario
const confirmDeactivate = (user) => {
  selectedUser.value = user
  confirmDialogTitle.value = 'Desactivar Usuario'
  confirmDialogMessage.value = `¿Estás seguro de que deseas desactivar al usuario ${user.firstname} ${user.lastname}?`
  confirmDialogType.value = 'warning'
  confirmDialogConfirmText.value = 'Desactivar'
  confirmAction.value = 'deactivate'
  showConfirmDialog.value = true
}

// Manejar acción confirmada
const handleConfirmAction = async () => {
  if (!selectedUser.value) return
  
  try {
    switch (confirmAction.value) {
      case 'delete':
        await userManagementService.deleteUser(selectedUser.value.id)
        showNotification('Usuario eliminado', 'El usuario ha sido eliminado correctamente', 'success')
        break
      case 'activate':
        await userManagementService.activateUser(selectedUser.value.id)
        showNotification('Usuario activado', 'El usuario ha sido activado correctamente', 'success')
        break
      case 'deactivate':
        await userManagementService.deactivateUser(selectedUser.value.id)
        showNotification('Usuario desactivado', 'El usuario ha sido desactivado correctamente', 'success')
        break
    }
    
    // Recargar usuarios
    await fetchUsers()
  } catch (err) {
    console.error(`Error al ${confirmAction.value} usuario:`, err)
    showNotification('Error', err.message || `Error al ${confirmAction.value} usuario`, 'error')
  }
}

// Manejar cambio de página
const handlePageChange = (page) => {
  currentPage.value = page
  fetchUsers()
}

// Manejar cambio de filtros
const handleFilterChange = (newFilters) => {
  filters.value = { ...filters.value, ...newFilters }
  currentPage.value = 1 // Resetear a la primera página
  fetchUsers()
}

// Manejar búsqueda
const handleSearch = (searchTerm) => {
  filters.value.search = searchTerm
  currentPage.value = 1 // Resetear a la primera página
  fetchUsers()
}

// Mostrar notificación
const showNotification = (title, message, type = 'info') => {
  notification.value = {
    show: true,
    title,
    message,
    type
  }
}

// Cerrar notificación
const closeNotification = () => {
  notification.value.show = false
}

// Inicializar
onMounted(async () => {
  await fetchRoles()
  await fetchUsers()
})

// Definir metadatos de la página
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  meta: {
    requiredRoles: ['admin']
  }
})
</script>
