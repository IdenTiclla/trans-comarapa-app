<template>
  <div class="space-y-3">
    <div class="flex items-center space-x-4 mb-2">
      <label :for="`${role}-client-type-existing`" class="flex items-center">
        <input 
          type="radio" 
          :id="`${role}-client-type-existing`" 
          :name="`${role}-client-type`" 
          value="existing" 
          v-model="clientType"
          class="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
        />
        <span class="ml-2 text-sm text-gray-700">Cliente Existente</span>
      </label>
      <label :for="`${role}-client-type-new`" class="flex items-center">
        <input 
          type="radio" 
          :id="`${role}-client-type-new`" 
          :name="`${role}-client-type`" 
          value="new" 
          v-model="clientType"
          class="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
        />
        <span class="ml-2 text-sm text-gray-700">Nuevo Cliente</span>
      </label>
    </div>

    <!-- Buscar Cliente Existente -->
    <div v-if="clientType === 'existing'" class="space-y-2">
      <div>
        <label :for="`${role}-client-search`" class="block text-sm font-medium text-gray-700">Buscar Cliente</label>
        <input 
          type="text" 
          :id="`${role}-client-search`" 
          v-model="clientSearchTerm"
          @input="debouncedSearch"
          placeholder="Nombre, CI o teléfono..."
          class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      <div v-if="clientStore.isLoading && clientSearchTerm" class="text-sm text-gray-500">Buscando...</div>
      <ul v-if="clientStore.searchResults && clientStore.searchResults.length > 0 && clientType === 'existing' && clientSearchTerm" class="border border-gray-300 rounded-md max-h-40 overflow-y-auto">
        <li 
          v-for="client in clientStore.searchResults" 
          :key="client.id" 
          @click="selectClient(client)"
          class="p-2 hover:bg-gray-100 cursor-pointer text-sm"
        >
          {{ client.name }} ({{ client.doc_id || 'N/A' }}) - {{ client.phone || 'N/A' }}
        </li>
      </ul>
      <div v-if="selectedClient && clientType === 'existing'" class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
        <p><span class="font-medium">Seleccionado:</span> {{ selectedClient.name }}</p>
        <p v-if="selectedClient.doc_id"><span class="font-medium">CI:</span> {{ selectedClient.doc_id }}</p>
        <p v-if="selectedClient.phone"><span class="font-medium">Teléfono:</span> {{ selectedClient.phone }}</p>
        <button @click="clearSelection" class="text-xs text-red-500 hover:text-red-700 mt-1">Limpiar selección</button>
      </div>
    </div>

    <!-- Registrar Nuevo Cliente -->
    <div v-if="clientType === 'new'" class="space-y-3 border border-gray-200 p-3 rounded-md bg-gray-50">
      <div>
        <label :for="`${role}-new-client-name`" class="block text-sm font-medium text-gray-700">Nombre Completo</label>
        <input type="text" :id="`${role}-new-client-name`" v-model="newClientDetails.name" required class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
      </div>
      <div>
        <label :for="`${role}-new-client-doc_id`" class="block text-sm font-medium text-gray-700">Documento de Identidad (CI)</label>
        <input type="text" :id="`${role}-new-client-doc_id`" v-model="newClientDetails.doc_id" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
      </div>
      <div>
        <label :for="`${role}-new-client-phone`" class="block text-sm font-medium text-gray-700">Teléfono</label>
        <input type="tel" :id="`${role}-new-client-phone`" v-model="newClientDetails.phone" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
      </div>
      <div>
        <label :for="`${role}-new-client-address`" class="block text-sm font-medium text-gray-700">Dirección (Opcional)</label>
        <input type="text" :id="`${role}-new-client-address`" v-model="newClientDetails.address" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
      </div>
    </div>
    <div v-if="clientStore.error && (clientType === 'existing' && clientSearchTerm || clientType === 'new')" class="text-sm text-red-600 mt-1">
      Error: {{ clientStore.error }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import { debounce } from 'lodash-es';

const props = defineProps({
  role: { type: String, required: true }, // 'sender' or 'receiver' to make IDs unique
  clientStore: { type: Object, required: true }, // Pass the useClientStore instance
  selectedClientId: { type: [Number, String], default: null },
  clientDetails: { 
    type: Object, 
    default: () => ({ name: '', phone: '', address: '', doc_id: '' }) 
  }
});

const emit = defineEmits([
  'update:selectedClientId',
  'update:clientDetails',
  'searchClients' // To trigger search in parent if needed, though store is passed
]);

const clientType = ref('existing'); // 'existing' or 'new'
const clientSearchTerm = ref('');
const selectedClient = ref(null); // Local representation of selected existing client

// Use reactive for newClientDetails to ensure deep reactivity for v-model
const newClientDetails = reactive({
  name: props.clientDetails?.name || '',
  phone: props.clientDetails?.phone || '',
  address: props.clientDetails?.address || '',
  doc_id: props.clientDetails?.doc_id || ''
});

const debouncedSearch = debounce(() => {
  if (clientSearchTerm.value.length >= 2) {
    props.clientStore.searchClients(clientSearchTerm.value);
  } else {
    props.clientStore.clearSearchResults();
  }
}, 500);

const selectClient = (client) => {
  selectedClient.value = client;
  clientSearchTerm.value = client.name; // Populate search bar for visual feedback
  emit('update:selectedClientId', client.id);
  props.clientStore.clearSearchResults(); 
};

const clearSelection = () => {
  selectedClient.value = null;
  clientSearchTerm.value = '';
  emit('update:selectedClientId', null);
  props.clientStore.clearSearchResults(); 
};

// Watchers to sync props with internal state and emit changes
watch(clientType, (newType) => {
  if (newType === 'new') {
    emit('update:selectedClientId', null); // Clear existing selection if switching to new
    selectedClient.value = null;
    // Optionally reset newClientDetails or prefill from existing if logic desires
  } else {
    // When switching back to existing, clear new client details from parent model
    emit('update:clientDetails', { name: '', phone: '', address: '', doc_id: '' });
  }
});

watch(newClientDetails, (details) => {
  if (clientType.value === 'new') {
    emit('update:clientDetails', { ...details });
  }
}, { deep: true });

// Initialize from props
if (props.selectedClientId) {
    clientType.value = 'existing';
    // Try to find client in store or fetch if necessary - for simplicity, assume it might be pre-filled
    // Or parent can pass the full client object to pre-populate `selectedClient` if available
} else if (props.clientDetails && props.clientDetails.name) {
    clientType.value = 'new';
    Object.assign(newClientDetails, props.clientDetails);
}

// Expose methods if parent needs to call them (optional)
// defineExpose({ clearSelection });

</script> 