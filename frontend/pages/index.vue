<template>
  <div v-if="!authStore.isAuthenticated || initialCheckDone">
    <!-- Only render content if not authenticated OR if initial auth check and redirection attempt is complete -->
    <h1 class="text-3xl font-bold mb-4">Bienvenido a Trans Comarapa</h1>
    <p class="mb-4">
      Somos una empresa de transporte comprometida con brindar el mejor servicio a nuestros clientes.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-bold mb-2">Transporte Seguro</h2>
        <p>Contamos con una flota moderna y conductores profesionales para garantizar su seguridad.</p>
        <div class="mt-4">
          <AppButton @click="showAlert('Transporte Seguro')">Más información</AppButton>
        </div>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-bold mb-2">Puntualidad</h2>
        <p>Nos comprometemos a cumplir con los horarios establecidos para su comodidad.</p>
        <div class="mt-4">
          <AppButton variant="secondary" @click="showAlert('Puntualidad')">Más información</AppButton>
        </div>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-bold mb-2">Cobertura</h2>
        <p>Llegamos a múltiples destinos para satisfacer sus necesidades de transporte.</p>
        <div class="mt-4">
          <AppButton variant="success" @click="showAlert('Cobertura')">Más información</AppButton>
        </div>
      </div>
    </div>

    <div class="mt-8 text-center">
      <h2 class="text-2xl font-bold mb-4">¿Listo para viajar con nosotros?</h2>
      <AppButton variant="primary" class="mr-2" @click="navigateTo('/services')">Ver servicios</AppButton>
      <AppButton variant="secondary" class="mr-2" @click="navigateTo('/about')">Conocer más</AppButton>
      <AppButton v-if="!authStore.isAuthenticated" variant="success" @click="navigateTo('/login')">Iniciar sesión</AppButton>
      <!-- The below button is effectively replaced by the automatic redirect if authenticated -->
      <!-- <AppButton v-else variant="success" @click="redirectToDashboard">Ir a mi Dashboard</AppButton> -->
    </div>
  </div>
  <div v-else>
    <!-- Optional: Show a brief loading state while checking auth & redirecting -->
    <p class="text-center py-10">Cargando...</p>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { onMounted, ref } from 'vue';
import { navigateTo, useNuxtApp } from '#app';

definePageMeta({
  title: 'Inicio',
  // No specific middleware here; auth.global.ts handles protected routes.
  // This page will manage its own redirection for authenticated users.
});

const authStore = useAuthStore();
const { $router } = useNuxtApp(); // For checking current route
const initialCheckDone = ref(false); // To prevent flash of unstyled content

const redirectToDashboard = () => {
  const role = authStore.userRole;
  if (role === 'secretary') {
    navigateTo('/dashboards/dashboard-secretary');
  } else if (role === 'admin') {
    // Assuming an admin dashboard might exist or will be created
    // Check if route exists before navigating to prevent errors if dashboard not created yet
    if ($router.hasRoute('dashboards-dashboard-admin')) {
        navigateTo('/dashboards/dashboard-admin');
    } else {
        navigateTo('/'); // Fallback or a generic profile page
        console.warn("Admin dashboard route not found, staying on index or redirect to a generic profile page.")
    }
  } else if (role === 'driver') {
    if ($router.hasRoute('dashboards-dashboard-driver')) {
        navigateTo('/dashboards/dashboard-driver');
    } else {
        navigateTo('/'); 
        console.warn("Driver dashboard route not found, staying on index or redirect to a generic profile page.")
    }
  } else if (role === 'assistant') {
     if ($router.hasRoute('dashboards-dashboard-assistant')) {
        navigateTo('/dashboards/dashboard-assistant');
    } else {
        navigateTo('/'); 
        console.warn("Assistant dashboard route not found, staying on index or redirect to a generic profile page.")
    }
  } else if (role === 'client') {
     if ($router.hasRoute('dashboards-dashboard-client')) {
        navigateTo('/dashboards/dashboard-client');
    } else {
        navigateTo('/'); 
        console.warn("Client dashboard route not found, staying on index or redirect to a generic profile page.")
    }
  } else {
    // Fallback for any other authenticated role or if role is undefined
    // Potentially redirect to a generic profile page or stay on index if it's a safe landing.
    // For now, if role is unknown but authenticated, let them stay or redirect to a generic user page if one exists.
    // navigateTo('/user/profile'); // Example
    console.warn(`Unknown or undefined role: ${role}. Cannot redirect to a specific dashboard.`);
    // If they are on index, let them stay. If not, maybe redirect to index.
    if ($router.currentRoute.value.path !== '/') {
        navigateTo('/');
    }
  }
  initialCheckDone.value = true; // Mark check as done after attempting redirect
};

onMounted(async () => {
  // Initialize auth store to ensure isAuthenticated and userRole are fresh
  // No need to call authStore.init() if your auth plugin (01.auth-init.client.js) already does this reliably.
  // If the plugin handles it, authStore.isAuthenticated and authStore.userRole should be ready.
  
  // Wait for next tick to ensure router is fully ready, especially for hasRoute checks.
  await nextTick();

  if (authStore.isAuthenticated) {
    // Check if already on the target dashboard to prevent redirect loops
    const role = authStore.userRole;
    let targetDashboardPath = '/'; // Default fallback
    if (role === 'secretary') targetDashboardPath = '/dashboards/dashboard-secretary';
    else if (role === 'admin') targetDashboardPath = '/dashboards/dashboard-admin'; // Define actual paths
    else if (role === 'driver') targetDashboardPath = '/dashboards/dashboard-driver';
    else if (role === 'assistant') targetDashboardPath = '/dashboards/dashboard-assistant';
    else if (role === 'client') targetDashboardPath = '/dashboards/dashboard-client';

    if ($router.currentRoute.value.path !== targetDashboardPath || targetDashboardPath === '/') {
        redirectToDashboard();
    } else {
        initialCheckDone.value = true; // Already on correct dashboard or no specific dashboard
    }
  } else {
    initialCheckDone.value = true; // Not authenticated, allow page to render as landing page
  }
});

function showAlert(feature) {
  alert(`Has hecho clic en ${feature}. Pronto tendremos más información disponible.`);
}
</script>
