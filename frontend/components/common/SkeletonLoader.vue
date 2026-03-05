<template>
  <!-- Card Skeleton (Used for Clients intuitively or Packages Grid) -->
  <div v-if="type === 'card'" class="animate-pulse w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-full">
    <div class="flex items-center space-x-4 mb-4">
      <div class="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
      <div class="flex-1">
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div class="space-y-3">
      <div class="h-3 bg-gray-200 rounded w-full"></div>
      <div class="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
    <div v-if="withActions" class="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
      <div class="h-8 bg-gray-200 rounded w-16"></div>
      <div class="h-8 bg-gray-200 rounded w-16"></div>
    </div>
  </div>

  <!-- List Item Skeleton (Used for Table alternative views) -->
  <div v-else-if="type === 'list'" class="animate-pulse w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200">
    <div class="flex items-center space-x-4">
      <div class="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
      <div class="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="h-4 bg-gray-200 rounded"></div>
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded hidden md:block"></div>
        <div class="h-4 bg-gray-200 rounded hidden md:block"></div>
      </div>
    </div>
  </div>

  <!-- Table Row Skeleton -->
  <tr v-else-if="type === 'table-row'" class="animate-pulse w-full bg-white border-b border-gray-200">
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center space-x-4">
        <div class="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div class="space-y-2 flex-1 w-32">
          <div class="h-4 bg-gray-200 rounded"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
      <div class="h-3 bg-gray-200 rounded w-24"></div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="h-4 bg-gray-200 rounded w-24 mb-2"></div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="h-6 w-16 rounded-full bg-gray-200"></div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-right">
      <div class="flex justify-end space-x-2">
        <div class="h-8 w-8 bg-gray-200 rounded"></div>
        <div class="h-8 w-8 bg-gray-200 rounded"></div>
        <div class="h-8 w-8 bg-gray-200 rounded"></div>
      </div>
    </td>
  </tr>

  <!-- Detail Box Skeleton (for info cards in details pages) -->
  <div v-else-if="type === 'detail'" class="animate-pulse w-full bg-white shadow-md rounded-xl border border-gray-100 p-6">
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1">
        <div class="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div class="h-6 bg-gray-200 rounded-full w-20 flex-shrink-0"></div>
    </div>
    <div class="space-y-2">
      <div class="h-4 bg-gray-200 rounded w-full"></div>
      <div class="h-4 bg-gray-200 rounded w-5/6"></div>
      <div class="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
  
  <!-- Generic Text Block Skeleton -->
  <div v-else-if="type === 'text'" class="animate-pulse w-full space-y-3">
    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
    <div class="h-4 bg-gray-200 rounded w-full"></div>
    <div class="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'card',
    validator: (v) => ['card', 'list', 'table-row', 'detail', 'text'].includes(v)
  },
  withActions: {
    type: Boolean,
    default: true
  }
})
</script>
