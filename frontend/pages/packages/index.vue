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
            <option value="all">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="in_transit">En Tránsito</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <!-- Add more filters as needed: date range, etc. -->
      </div>
    </div>

    <div v-if="packageStore.error" class="bg-red-50 border-red-200 text-red-700 p-4 rounded-md mb-4">
      <p>Error al cargar encomiendas: {{ packageStore.error }}</p>
    </div>
    
    <PackageCardList 
      :packages="packages"
      :is-loading="packageStore.isLoading && !packages.length"
      @view-package="viewPackage"
      @edit-package="editPackage"
      @delete-package="confirmDeletePackage"
    />

    <!-- Pagination -->
    <div v-if="!packageStore.isLoading && packages.length > 0 && packageStore.pagination.totalPages > 1" class="py-6 px-4 border-t border-gray-200 bg-white shadow sm:rounded-lg mt-6">
      <PaginationControls
        :current-page="packageStore.pagination.currentPage"
        :total-pages="packageStore.pagination.totalPages"
        :total-items="packageStore.pagination.totalItems"
        @page-changed="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePackageStore } from '~/stores/packageStore';
import AppButton from '~/components/AppButton.vue';
import PaginationControls from '~/components/PaginationControls.vue';
import PackageCardList from '~/components/PackageCardList.vue'; // Import the new component
import { debounce } from 'lodash-es';

const router = useRouter();
const packageStore = usePackageStore();

const packages = computed(() => packageStore.getAllPackages);
const searchTerm = ref(packageStore.searchTerm || '');
const statusFilter = ref('all'); // Changed default to 'all'

const fetchPackagesWithFilters = () => {
  const params = {
    page: packageStore.pagination.currentPage,
    limit: packageStore.pagination.itemsPerPage,
    filters: {},
  };
  // Always send status unless it's effectively empty or a specific "no filter" value recognized by backend.
  // Assuming 'all' is what we want to send for the "Todos" case.
  if (statusFilter.value) {
    params.filters.status = statusFilter.value;
  }
  if (searchTerm.value && searchTerm.value.length >= 2) {
     params.filters.search = searchTerm.value;
  }
  packageStore.fetchPackages(params);
};

const debouncedSearchPackages = debounce(() => {
    packageStore.pagination.currentPage = 1;
    fetchPackagesWithFilters();
}, 500);

onMounted(() => {
  searchTerm.value = '';
  statusFilter.value = 'all'; // Ensure status is 'all' for initial load
  if (packageStore.pagination.currentPage !== 1) {
    packageStore.pagination.currentPage = 1;
  }
  fetchPackagesWithFilters();
});

watch([() => packageStore.pagination.currentPage, () => packageStore.pagination.itemsPerPage], () => {
  fetchPackagesWithFilters();
}, { immediate: false });

watch(statusFilter, () => {
  applyFilters();
});

const applyFilters = () => {
  packageStore.pagination.currentPage = 1;
  fetchPackagesWithFilters();
};

const handlePageChange = (page) => {
  packageStore.pagination.currentPage = page;
  // fetchPackagesWithFilters will be called by the watcher on currentPage
};

const goToNewPackage = () => {
  router.push('/packages/new');
};

const viewPackage = (id) => {
  router.push(`/packages/${id}`);
};

const editPackage = (id) => {
  router.push(`/packages/${id}/edit`);
};

const confirmDeletePackage = async (id) => {
  if (window.confirm('¿Está seguro de que desea eliminar esta encomienda?')) {
    await packageStore.deleteExistingPackage(id);
    // The store action should refetch or update the list.
    // If not, call fetchPackagesWithFilters() here.
  }
};

// formatDate, getStatusClass, getStatusText are no longer needed here
// as they are handled within PackageCard.vue

definePageMeta({
  // middleware: ['auth']
});

</script> 