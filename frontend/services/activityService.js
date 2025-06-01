import { useAuthStore } from '~/stores/auth';

const BASE_URL = process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:8000/api/v1';

async function fetchRecentActivities() {
  const authStore = useAuthStore();
  const token = authStore.token;

  if (!token) {
    // Manejar el caso en que no hay token, por ejemplo, redirigir a login o lanzar un error
    console.error('No authentication token found.');
    // throw new Error('User not authenticated');
    return []; // Opcionalmente, retornar un array vacío o manejar el error de otra forma
  }

  try {
    const response = await fetch(`${BASE_URL}/activities/recent`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Podrías manejar errores específicos de HTTP aquí
      console.error('Failed to fetch recent activities:', response.statusText);
      // throw new Error(`Failed to fetch recent activities: ${response.statusText}`);
      return []; // Retornar vacío en caso de error de respuesta
    }

    const data = await response.json();
    return data.activities || []; // Asumiendo que la API devuelve { activities: [...] }
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    // throw error; // O podrías manejarlo retornando un array vacío
    return [];
  }
}

export const activityService = {
  fetchRecentActivities,
}; 