<template>
  <div class="min-h-screen bg-gray-50 py-8 animate-pulse">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header skeleton -->
      <div class="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div class="bg-gradient-to-r from-gray-300 to-gray-400 px-6 py-8">
          <div class="flex flex-col sm:flex-row items-center">
            <!-- Avatar skeleton -->
            <div class="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-gray-200"></div>
            
            <!-- User info skeleton -->
            <div class="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <div class="h-8 bg-gray-200 rounded w-48 mb-2"></div>
              <div class="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div class="flex flex-wrap justify-center sm:justify-start gap-2">
                <div class="h-6 bg-gray-200 rounded w-20"></div>
                <div class="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs skeleton -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="border-b border-gray-200">
          <div class="flex">
            <div class="h-12 bg-gray-200 rounded-t w-40 mr-1"></div>
            <div class="h-12 bg-gray-100 rounded-t w-32 mr-1"></div>
            <div class="h-12 bg-gray-100 rounded-t w-36"></div>
          </div>
        </div>

        <!-- Content skeleton -->
        <div class="p-6">
          <div class="space-y-6">
            <div class="h-6 bg-gray-200 rounded w-48"></div>
            
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div class="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div class="h-10 bg-gray-100 rounded w-full"></div>
                </div>
                <div>
                  <div class="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div class="h-10 bg-gray-100 rounded w-full"></div>
                </div>
              </div>
              
              <div>
                <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div class="h-10 bg-gray-100 rounded w-full"></div>
              </div>
              
              <div>
                <div class="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div class="h-10 bg-gray-100 rounded w-full"></div>
              </div>
              
              <div class="flex justify-end">
                <div class="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style> 