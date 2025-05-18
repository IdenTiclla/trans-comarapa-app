<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">Gestión de Encomiendas</h1>
      <AppButton variant="primary" @click="goToNewPackage">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Nueva Encomienda
      </AppButton>
    </div>

    <!-- Filters and Search -->
    <div class="mb-4 bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700">Buscar</label>
          <input type="text" id="search" v-model="searchTerm" @input="debouncedSearchPackages" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Buscar por remitente, destinatario, ID...">
        </div>
        <div>
          <label for="status-filter" class="block text-sm font-medium text-gray-700">Estado</label>
          <select id="status-filter" v-model="statusFilter" @change="applyFilters" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="in_transit">En Tránsito</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <!-- Add more filters as needed: date range, etc. -->
      </div>
    </div>

    <div v-if="packageStore.isLoading && !packages.length" class="flex justify-center py-12">
      <p class="text-gray-500">Cargando encomiendas...</p>
    </div>
    <div v-else-if="packageStore.error" class="bg-red-50 border-red-200 text-red-700 p-4 rounded-md">
      <p>Error al cargar encomiendas: {{ packageStore.error }}</p>
    </div>
    <div v-else-if="!packages.length && !packageStore.isLoading">
      <div class="text-center py-12 bg-white rounded-lg shadow">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay encomiendas</h3>
        <p class="mt-1 text-sm text-gray-500">Empiece creando una nueva encomienda.</p>
      </div>
    </div>
    <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remitente</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatario</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="pkg in packages" :key="pkg.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ pkg.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ pkg.sender?.name || pkg.sender_details?.name || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ pkg.receiver?.name || pkg.receiver_details?.name || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{{ pkg.description }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(pkg.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ getStatusText(pkg.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(pkg.created_at) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <AppButton size="sm" variant="outline" @click="viewPackage(pkg.id)">Ver</AppButton>
              <AppButton size="sm" variant="secondary" @click="editPackage(pkg.id)">Editar</AppButton>
              <AppButton size="sm" variant="danger-outline" @click="confirmDeletePackage(pkg.id)">Eliminar</AppButton>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Pagination -->
      <div v-if="packageStore.pagination.totalPages > 1" class="py-3 px-6 border-t border-gray-200 bg-white">
        <PaginationControls
          :current-page="packageStore.pagination.currentPage"
          :total-pages="packageStore.pagination.totalPages"
          :total-items="packageStore.pagination.totalItems"
          @page-changed="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePackageStore } from '~/stores/packageStore';
import AppButton from '~/components/AppButton.vue';
import PaginationControls from '~/components/PaginationControls.vue'; // Assuming this component exists
import { debounce } from 'lodash-es'; // For debouncing search

const router = useRouter();
const packageStore = usePackageStore();

const packages = computed(() => packageStore.getAllPackages);
const searchTerm = ref(packageStore.searchTerm || '');
const statusFilter = ref(''); // Default to all statuses

const fetchPackagesWithFilters = () => {
  const params = {
    page: packageStore.pagination.currentPage,
    limit: packageStore.pagination.itemsPerPage,
    filters: {},
  };
  if (statusFilter.value) {
    params.filters.status = statusFilter.value;
  }
  if (searchTerm.value && searchTerm.value.length >= 2) {
    // If backend supports direct search text in getAll, use it, else rely on searchPackagesByTerm
    // For this example, let's assume search term is handled by a separate action or needs specific param
    // params.filters.search = searchTerm.value; // Example if supported
  }
  packageStore.fetchPackages(params);
};

const debouncedSearchPackages = debounce(() => {
    if (searchTerm.value && searchTerm.value.length >= 2) {
        packageStore.searchPackagesByTerm(searchTerm.value);
        // If searchPackagesByTerm populates a different list (e.g., searchResults),
        // you might need to adjust what `packages` computed property points to,
        // or merge/prioritize search results.
        // For now, let's assume `packages` computed will reflect the main list or search results appropriately.
    } else if (!searchTerm.value) {
        fetchPackagesWithFilters(); // Fetch all if search term is cleared
    }
}, 500);

onMounted(() => {
  fetchPackagesWithFilters();
});

watch([() => packageStore.pagination.currentPage, () => packageStore.pagination.itemsPerPage], () => {
  fetchPackagesWithFilters();
});

const applyFilters = () => {
  packageStore.pagination.currentPage = 1; // Reset to first page on filter change
  fetchPackagesWithFilters();
};

const handlePageChange = (page) => {
  packageStore.pagination.currentPage = page;
  // fetchPackagesWithFilters will be called by the watcher
};

const goToNewPackage = () => {
  router.push('/packages/new');
};

const viewPackage = (id) => {
  router.push(`/packages/${id}`); // Assuming view page is at /packages/[id]
};

const editPackage = (id) => {
  router.push(`/packages/${id}/edit`);
};

const confirmDeletePackage = async (id) => {
  if (window.confirm('¿Está seguro de que desea eliminar esta encomienda?')) {
    await packageStore.deleteExistingPackage(id);
    // The store action should refetch or update the list.
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status) => {
  const texts = {
    pending: 'Pendiente',
    in_transit: 'En Tránsito',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };
  return texts[status] || 'Desconocido';
};

definePageMeta({
  // middleware: ['auth'] // Ensure this is handled globally or add if specific roles needed
});

</script> 