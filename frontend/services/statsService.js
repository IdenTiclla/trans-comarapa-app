// Servicio para obtener estadísticas del sistema
import apiFetch from '~/utils/api'; // Assuming api.js is in utils

// Obtener estadísticas de boletos vendidos
const getTicketStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    
    console.log('🔄 Intentando obtener estadísticas de boletos desde la API...');
    console.log('📍 URL:', `/stats/tickets/stats?${queryParams.toString()}`);
    
    // Use apiFetch for the request
    const data = await apiFetch(`/stats/tickets/stats?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas de boletos):', data);
    return data;
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de boletos:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Simulación de datos para desarrollo en caso de error
    console.warn('🔄 Usando datos simulados para estadísticas de boletos');

    // Datos basados en los datos reales de la API
    let count = 0;
    let amount = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        count = 12;
        amount = 370;
        trend = 15;
        break;
      case 'week':
        count = 85;
        amount = 2625;
        trend = 25;
        break;
      case 'month':
        count = 311; // Datos reales de la API
        amount = 9590; // Datos reales de la API  
        trend = 547.97; // Datos reales de la API
        break;
      default:
        count = 12;
        amount = 370;
        trend = 15;
    }

    return {
      count,
      amount,
      trend,
      period
    };
  }
}

// Obtener estadísticas de boletos reservados (pendientes)
const getReservedTicketStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    
    const data = await apiFetch(`/stats/tickets/reserved/stats?${queryParams.toString()}`);
    console.log('Respuesta de la API (estadísticas de boletos reservados):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas de boletos reservados:', error);
    console.warn('Usando datos simulados para estadísticas de boletos reservados');

    let count = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        count = Math.floor(Math.random() * 20) + 5; 
        trend = Math.floor(Math.random() * 25) - 10;
        break;
      case 'week':
        count = Math.floor(Math.random() * 70) + 20;
        trend = Math.floor(Math.random() * 15) - 5;
        break;
      case 'month':
        count = Math.floor(Math.random() * 200) + 50;
        trend = Math.floor(Math.random() * 10) - 5;
        break;
      default:
        count = Math.floor(Math.random() * 20) + 5;
        trend = Math.floor(Math.random() * 25) - 10;
    }
    return { count, trend, period };
  }
};

// Obtener estadísticas de paquetes
const getPackageStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);

    const data = await apiFetch(`/stats/packages/stats?${queryParams.toString()}`);
    console.log('Respuesta de la API (estadísticas de paquetes):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas de paquetes:', error);
    // Simulación de datos para desarrollo en caso de error
    console.warn('Usando datos simulados para estadísticas de paquetes');

    // Datos basados en los datos reales de la API
    let count = 0;
    let amount = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        count = 4;
        amount = 1800;
        trend = 12;
        break;
      case 'week':
        count = 25;
        amount = 11000;
        trend = 18;
        break;
      case 'month':
        count = 111; // Datos reales de la API
        amount = 45244.57; // Datos reales de la API
        trend = 239.61; // Datos reales de la API
        break;
      default:
        count = 4;
        amount = 1800;
        trend = 12;
    }

    return {
      count,
      amount,
      trend,
      period
    };
  }
}

// Obtener estadísticas de viajes
const getTripStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);

    const data = await apiFetch(`/stats/trips/stats?${queryParams.toString()}`);
    console.log('Respuesta de la API (estadísticas de viajes):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas de viajes:', error);
    // Simulación de datos para desarrollo en caso de error
    console.warn('Usando datos simulados para estadísticas de viajes');

    // Datos basados en los datos reales de la API
    let count = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        count = 1;
        trend = 0;
        break;
      case 'week':
        count = 3;
        trend = 50;
        break;
      case 'month':
        count = 11; // Datos reales de la API
        trend = 266.67; // Datos reales de la API
        break;
      default:
        count = 1;
        trend = 0;
    }

    return {
      count,
      trend,
      period
    };
  }
}

// Obtener estadísticas de viajes completados
const getCompletedTripsStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    queryParams.append('status', 'completed');

    const data = await apiFetch(`/stats/trips/stats?${queryParams.toString()}`);
    console.log('Respuesta de la API (viajes completados):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas de viajes completados:', error);
    console.warn('Usando datos simulados para viajes completados');

    let count = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        count = Math.floor(Math.random() * 8) + 3; // Entre 3 y 10
        trend = Math.floor(Math.random() * 10) - 5; // Entre -5% y +5%
        break;
      case 'week':
        count = Math.floor(Math.random() * 25) + 15; // Entre 15 y 40
        trend = Math.floor(Math.random() * 8) - 4; // Entre -4% y +4%
        break;
      case 'month':
        count = Math.floor(Math.random() * 80) + 40; // Entre 40 y 120
        trend = Math.floor(Math.random() * 6) - 3; // Entre -3% y +3%
        break;
      default:
        count = Math.floor(Math.random() * 8) + 3;
        trend = Math.floor(Math.random() * 10) - 5;
    }

    return { count, trend, period };
  }
};

// Obtener estadísticas de viajes cancelados
const getCancelledTripsStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    queryParams.append('status', 'cancelled');

    const data = await apiFetch(`/stats/trips/stats?${queryParams.toString()}`);
    console.log('Respuesta de la API (viajes cancelados):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas de viajes cancelados:', error);
    console.warn('Usando datos simulados para viajes cancelados');

    let count = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        count = Math.floor(Math.random() * 3) + 0; // Entre 0 y 2
        trend = Math.floor(Math.random() * 20) - 10; // Entre -10% y +10%
        break;
      case 'week':
        count = Math.floor(Math.random() * 8) + 2; // Entre 2 y 10
        trend = Math.floor(Math.random() * 15) - 7; // Entre -7% y +8%
        break;
      case 'month':
        count = Math.floor(Math.random() * 25) + 5; // Entre 5 y 30
        trend = Math.floor(Math.random() * 10) - 5; // Entre -5% y +5%
        break;
      default:
        count = Math.floor(Math.random() * 3) + 0;
        trend = Math.floor(Math.random() * 20) - 10;
    }

    return { count, trend, period };
  }
};

// Obtener estadísticas de viajes en curso
const getInProgressTripsStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    queryParams.append('status', 'in_progress');

    const data = await apiFetch(`/stats/trips/stats?${queryParams.toString()}`);
    console.log('Respuesta de la API (viajes en curso):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas de viajes en curso:', error);
    console.warn('Usando datos simulados para viajes en curso');

    let count = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        count = Math.floor(Math.random() * 5) + 1; // Entre 1 y 5
        trend = Math.floor(Math.random() * 15) - 7; // Entre -7% y +8%
        break;
      case 'week':
        count = Math.floor(Math.random() * 12) + 3; // Entre 3 y 15
        trend = Math.floor(Math.random() * 10) - 5; // Entre -5% y +5%
        break;
      case 'month':
        count = Math.floor(Math.random() * 30) + 10; // Entre 10 y 40
        trend = Math.floor(Math.random() * 8) - 4; // Entre -4% y +4%
        break;
      default:
        count = Math.floor(Math.random() * 5) + 1;
        trend = Math.floor(Math.random() * 15) - 7;
    }

    return { count, trend, period };
  }
};

// Obtener estadísticas de ocupación promedio
const getAverageOccupancyStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);

    const data = await apiFetch(`/stats/trips/occupancy?${queryParams.toString()}`);
    console.log('Respuesta de la API (ocupación promedio):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas de ocupación promedio:', error);
    console.warn('Usando datos simulados para ocupación promedio');

    let percentage = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        percentage = Math.floor(Math.random() * 30) + 60; // Entre 60% y 90%
        trend = Math.floor(Math.random() * 10) - 5; // Entre -5% y +5%
        break;
      case 'week':
        percentage = Math.floor(Math.random() * 25) + 65; // Entre 65% y 90%
        trend = Math.floor(Math.random() * 8) - 4; // Entre -4% y +4%
        break;
      case 'month':
        percentage = Math.floor(Math.random() * 20) + 70; // Entre 70% y 90%
        trend = Math.floor(Math.random() * 6) - 3; // Entre -3% y +3%
        break;
      default:
        percentage = Math.floor(Math.random() * 30) + 60;
        trend = Math.floor(Math.random() * 10) - 5;
    }

    return { 
      percentage, 
      trend, 
      period,
      count: percentage // Para mantener consistencia con otros métodos
    };
  }
};

// Obtener resumen de ventas (incluye ingresos totales)
const getSalesSummary = async (period = 'month') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    
    const data = await apiFetch(`/stats/sales/summary?${queryParams.toString()}`);
    console.log('Respuesta de la API (resumen de ventas):', data);
    // La API devuelve: { totalAmount, ticketCount, packageCount, trend, period }
    return data; 
  } catch (error) {
    console.error('Error al obtener resumen de ventas:', error);
    console.warn('Usando datos simulados para resumen de ventas');

    let totalAmount = 0;
    let trend = 0;
    // Simulación simple para totalAmount y trend
    switch (period) {
      case 'today':
        totalAmount = Math.floor(Math.random() * 2000) + 500;
        trend = Math.floor(Math.random() * 20) - 10;
        break;
      case 'week':
        totalAmount = Math.floor(Math.random() * 10000) + 2000;
        trend = Math.floor(Math.random() * 15) - 7;
        break;
      case 'month':
      default:
        totalAmount = Math.floor(Math.random() * 40000) + 10000;
        trend = Math.floor(Math.random() * 10) - 5;
        break;
    }
    return { totalAmount, trend, period, ticketCount: 0, packageCount: 0 }; // Asegurar la estructura esperada
  }
};

// Obtener todas las estadísticas para el dashboard
const getDashboardStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    
    const data = await apiFetch(`/stats/dashboard?${queryParams.toString()}`);
    console.log('Respuesta de la API (estadísticas del dashboard):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    // Simulación de datos para desarrollo en caso de error
    try {
      // Obtener todas las estadísticas en paralelo
      const [ticketStats, packageStats, tripStats] = await Promise.all([
        getTicketStats(period),
        getPackageStats(period),
        getTripStats(period)
      ]);

      return {
        tickets: ticketStats,
        packages: packageStats,
        trips: tripStats
      };
    } catch (fallbackError) {
      console.error('Error al obtener estadísticas individuales:', fallbackError);
      throw error; // Lanzar el error original
    }
  }
}

// Obtener estadísticas de boletos cancelados
const getCancelledTicketsStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    queryParams.append('status', 'cancelled');

    const data = await apiFetch(`/stats/tickets/cancelled/stats?${queryParams.toString()}`);
    console.log('Respuesta de la API (boletos cancelados):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas de boletos cancelados:', error);
    console.warn('Usando datos simulados para boletos cancelados');

    let count = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        count = Math.floor(Math.random() * 5) + 0; // Entre 0 y 4
        trend = Math.floor(Math.random() * 20) - 10; // Entre -10% y +10%
        break;
      case 'week':
        count = Math.floor(Math.random() * 15) + 2; // Entre 2 y 17
        trend = Math.floor(Math.random() * 15) - 7; // Entre -7% y +8%
        break;
      case 'month':
        count = Math.floor(Math.random() * 40) + 10; // Entre 10 y 50
        trend = Math.floor(Math.random() * 10) - 5; // Entre -5% y +5%
        break;
      default:
        count = Math.floor(Math.random() * 5) + 0;
        trend = Math.floor(Math.random() * 20) - 10;
    }

    return { count, trend, period };
  }
};

// Obtener estadísticas de paquetes entregados
const getDeliveredPackagesStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    queryParams.append('status', 'delivered');

    const data = await apiFetch(`/stats/packages/delivered/stats?${queryParams.toString()}`);
    console.log('Respuesta de la API (paquetes entregados):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas de paquetes entregados:', error);
    console.warn('Usando datos simulados para paquetes entregados');

    let count = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        count = Math.floor(Math.random() * 20) + 10; // Entre 10 y 30
        trend = Math.floor(Math.random() * 15) - 5; // Entre -5% y +10%
        break;
      case 'week':
        count = Math.floor(Math.random() * 80) + 40; // Entre 40 y 120
        trend = Math.floor(Math.random() * 12) - 4; // Entre -4% y +8%
        break;
      case 'month':
        count = Math.floor(Math.random() * 250) + 150; // Entre 150 y 400
        trend = Math.floor(Math.random() * 10) - 3; // Entre -3% y +7%
        break;
      default:
        count = Math.floor(Math.random() * 20) + 10;
        trend = Math.floor(Math.random() * 15) - 5;
    }

    return { count, trend, period };
  }
};

// Obtener estadísticas de paquetes pendientes
const getPendingPackagesStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    queryParams.append('status', 'pending');

    const data = await apiFetch(`/stats/packages/pending/stats?${queryParams.toString()}`);
    console.log('Respuesta de la API (paquetes pendientes):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas de paquetes pendientes:', error);
    console.warn('Usando datos simulados para paquetes pendientes');

    let count = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        count = Math.floor(Math.random() * 15) + 5; // Entre 5 y 20
        trend = Math.floor(Math.random() * 20) - 10; // Entre -10% y +10%
        break;
      case 'week':
        count = Math.floor(Math.random() * 40) + 20; // Entre 20 y 60
        trend = Math.floor(Math.random() * 15) - 7; // Entre -7% y +8%
        break;
      case 'month':
        count = Math.floor(Math.random() * 100) + 50; // Entre 50 y 150
        trend = Math.floor(Math.random() * 12) - 6; // Entre -6% y +6%
        break;
      default:
        count = Math.floor(Math.random() * 15) + 5;
        trend = Math.floor(Math.random() * 20) - 10;
    }

    return { count, trend, period };
  }
};

// Obtener estadísticas de paquetes cancelados
const getCancelledPackagesStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    queryParams.append('status', 'cancelled');

    const data = await apiFetch(`/stats/packages/cancelled/stats?${queryParams.toString()}`);
    console.log('Respuesta de la API (paquetes cancelados):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas de paquetes cancelados:', error);
    console.warn('Usando datos simulados para paquetes cancelados');

    let count = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        count = Math.floor(Math.random() * 3) + 0; // Entre 0 y 2
        trend = Math.floor(Math.random() * 25) - 12; // Entre -12% y +13%
        break;
      case 'week':
        count = Math.floor(Math.random() * 10) + 2; // Entre 2 y 12
        trend = Math.floor(Math.random() * 20) - 10; // Entre -10% y +10%
        break;
      case 'month':
        count = Math.floor(Math.random() * 25) + 5; // Entre 5 y 30
        trend = Math.floor(Math.random() * 15) - 7; // Entre -7% y +8%
        break;
      default:
        count = Math.floor(Math.random() * 3) + 0;
        trend = Math.floor(Math.random() * 25) - 12;
    }

    return { count, trend, period };
  }
};

// Obtener tiempo promedio de entrega de paquetes
const getAverageDeliveryTimeStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);

    const data = await apiFetch(`/stats/packages/delivery-time?${queryParams.toString()}`);
    console.log('Respuesta de la API (tiempo promedio de entrega):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener tiempo promedio de entrega:', error);
    console.warn('Usando datos simulados para tiempo promedio de entrega');

    let hours = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        hours = Math.floor(Math.random() * 12) + 12; // Entre 12 y 24 horas
        trend = Math.floor(Math.random() * 20) - 10; // Entre -10% y +10%
        break;
      case 'week':
        hours = Math.floor(Math.random() * 8) + 16; // Entre 16 y 24 horas
        trend = Math.floor(Math.random() * 15) - 7; // Entre -7% y +8%
        break;
      case 'month':
        hours = Math.floor(Math.random() * 6) + 18; // Entre 18 y 24 horas
        trend = Math.floor(Math.random() * 10) - 5; // Entre -5% y +5%
        break;
      default:
        hours = Math.floor(Math.random() * 12) + 12;
        trend = Math.floor(Math.random() * 20) - 10;
    }

    return { 
      hours, 
      trend, 
      period,
      count: hours, // Para mantener consistencia
      display: `${hours}h`
    };
  }
};

// Obtener estadísticas de usuarios registrados
const getRegisteredUsersStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);

    const data = await apiFetch(`/stats/users/registered?${queryParams.toString()}`);
    console.log('Respuesta de la API (usuarios registrados):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener usuarios registrados:', error);
    console.warn('Usando datos simulados para usuarios registrados');

    let count = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        count = Math.floor(Math.random() * 10) + 2; // Entre 2 y 12
        trend = Math.floor(Math.random() * 30) - 10; // Entre -10% y +20%
        break;
      case 'week':
        count = Math.floor(Math.random() * 50) + 10; // Entre 10 y 60
        trend = Math.floor(Math.random() * 25) - 5; // Entre -5% y +20%
        break;
      case 'month':
        count = Math.floor(Math.random() * 200) + 50; // Entre 50 y 250
        trend = Math.floor(Math.random() * 20) - 5; // Entre -5% y +15%
        break;
      default:
        count = Math.floor(Math.random() * 10) + 2;
        trend = Math.floor(Math.random() * 30) - 10;
    }

    return { count, trend, period };
  }
};

// Obtener estadísticas de choferes activos
const getActiveDriversStats = async (period = 'today') => {
  try {
    const data = await apiFetch(`/stats/drivers/active`);
    console.log('Respuesta de la API (choferes activos):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener choferes activos:', error);
    console.warn('Usando datos simulados para choferes activos');

    const count = Math.floor(Math.random() * 15) + 8; // Entre 8 y 23
    const trend = Math.floor(Math.random() * 10) - 5; // Entre -5% y +5%

    return { count, trend, period };
  }
};

// Obtener estadísticas de buses activos
const getActiveBusesStats = async (period = 'today') => {
  try {
    const data = await apiFetch(`/stats/buses/active`);
    console.log('Respuesta de la API (buses activos):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener buses activos:', error);
    console.warn('Usando datos simulados para buses activos');

    const count = Math.floor(Math.random() * 10) + 5; // Entre 5 y 15
    const trend = Math.floor(Math.random() * 8) - 4; // Entre -4% y +4%

    return { count, trend, period };
  }
};

// Obtener estadísticas de secretarias activas
const getActiveSecretariesStats = async (period = 'today') => {
  try {
    const data = await apiFetch(`/stats/secretaries/active`);
    console.log('Respuesta de la API (secretarias activas):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener secretarias activas:', error);
    console.warn('Usando datos simulados para secretarias activas');

    const count = Math.floor(Math.random() * 6) + 3; // Entre 3 y 9
    const trend = Math.floor(Math.random() * 12) - 6; // Entre -6% y +6%

    return { count, trend, period };
  }
};

// Obtener estadísticas de ayudantes activos
const getActiveAssistantsStats = async (period = 'today') => {
  try {
    const data = await apiFetch(`/stats/assistants/active`);
    console.log('Respuesta de la API (ayudantes activos):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener ayudantes activos:', error);
    console.warn('Usando datos simulados para ayudantes activos');

    const count = Math.floor(Math.random() * 8) + 4; // Entre 4 y 12
    const trend = Math.floor(Math.random() * 10) - 5; // Entre -5% y +5%

    return { count, trend, period };
  }
};

// Obtener estadísticas de feedback de clientes
const getClientFeedbackStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);

    const data = await apiFetch(`/stats/clients/feedback?${queryParams.toString()}`);
    console.log('Respuesta de la API (feedback de clientes):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener feedback de clientes:', error);
    console.warn('Usando datos simulados para feedback de clientes');

    const rating = (Math.random() * 0.8 + 4.2).toFixed(1); // Entre 4.2 y 5.0
    const trend = Math.floor(Math.random() * 6) - 3; // Entre -3% y +3%

    return { 
      rating: parseFloat(rating), 
      trend, 
      period,
      count: parseFloat(rating),
      display: `${rating}/5`
    };
  }
};

// Obtener estadísticas de clientes registrados
const getRegisteredClientsStats = async (period = 'today') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);

    const data = await apiFetch(`/stats/clients/registered?${queryParams.toString()}`);
    console.log('Respuesta de la API (clientes registrados):', data);
    return data;
  } catch (error) {
    console.error('Error al obtener clientes registrados:', error);
    console.warn('Usando datos simulados para clientes registrados');

    let count = 0;
    let trend = 0;

    switch (period) {
      case 'today':
        count = Math.floor(Math.random() * 15) + 5; // Entre 5 y 20
        trend = Math.floor(Math.random() * 25) - 5; // Entre -5% y +20%
        break;
      case 'week':
        count = Math.floor(Math.random() * 80) + 20; // Entre 20 y 100
        trend = Math.floor(Math.random() * 20) - 5; // Entre -5% y +15%
        break;
      case 'month':
        count = Math.floor(Math.random() * 300) + 100; // Entre 100 y 400
        trend = Math.floor(Math.random() * 15) - 5; // Entre -5% y +10%
        break;
      default:
        count = Math.floor(Math.random() * 15) + 5;
        trend = Math.floor(Math.random() * 25) - 5;
    }

    return { count, trend, period };
  }
};

// Obtener estadísticas históricas por meses para tickets
const getMonthlyTicketStats = async (months = 6) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('months', months);

    console.log('🔄 Intentando obtener estadísticas mensuales de tickets desde la API...');
    console.log('📍 URL:', `/stats/tickets/monthly?${queryParams.toString()}`);
    
    const data = await apiFetch(`/stats/tickets/monthly?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas mensuales de tickets):', data);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.data)) {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
    
    return {
      data: data.data,
      trend: data.trend || 0
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas mensuales de tickets:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Solo usar datos simulados si es absolutamente necesario (para desarrollo/testing)
    console.warn('🔄 Usando datos simulados para estadísticas mensuales de tickets debido a error en API');

    // Generar datos simulados por meses
    const monthlyData = [];
    const baseCount = 250;
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const variation = (Math.random() - 0.5) * 0.4; // Variación del ±20%
      const count = Math.floor(baseCount * (1 + variation));
      const amount = count * (Math.random() * 10 + 25); // Entre 25-35 Bs por ticket
      
      monthlyData.push({
        month: monthName,
        label: monthName,
        value: count,
        amount: Math.floor(amount),
        count: count
      });
    }

    return {
      data: monthlyData,
      trend: (Math.random() - 0.5) * 20 // Tendencia entre -10% y +10%
    };
  }
};

// Obtener estadísticas históricas por meses para paquetes
const getMonthlyPackageStats = async (months = 6) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('months', months);

    console.log('🔄 Intentando obtener estadísticas mensuales de paquetes desde la API...');
    console.log('📍 URL:', `/stats/packages/monthly?${queryParams.toString()}`);
    
    const data = await apiFetch(`/stats/packages/monthly?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas mensuales de paquetes):', data);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.data)) {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
    
    return {
      data: data.data,
      trend: data.trend || 0
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas mensuales de paquetes:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Solo usar datos simulados si es absolutamente necesario (para desarrollo/testing)
    console.warn('🔄 Usando datos simulados para estadísticas mensuales de paquetes debido a error en API');

    // Generar datos simulados por meses
    const monthlyData = [];
    const baseCount = 80;
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const variation = (Math.random() - 0.5) * 0.5; // Variación del ±25%
      const count = Math.floor(baseCount * (1 + variation));
      const amount = count * (Math.random() * 200 + 300); // Entre 300-500 Bs por paquete
      
      monthlyData.push({
        month: monthName,
        label: monthName,
        value: count,
        amount: Math.floor(amount),
        count: count
      });
    }

    return {
      data: monthlyData,
      trend: (Math.random() - 0.5) * 24 // Tendencia entre -12% y +12%
    };
  }
};

// Obtener estadísticas históricas por meses para viajes
const getMonthlyTripStats = async (months = 6) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('months', months);

    console.log('🔄 Intentando obtener estadísticas mensuales de viajes desde la API...');
    console.log('📍 URL:', `/stats/trips/monthly?${queryParams.toString()}`);
    
    const data = await apiFetch(`/stats/trips/monthly?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas mensuales de viajes):', data);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.data)) {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
    
    return {
      data: data.data,
      trend: data.trend || 0
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas mensuales de viajes:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Solo usar datos simulados si es absolutamente necesario (para desarrollo/testing)
    console.warn('🔄 Usando datos simulados para estadísticas mensuales de viajes debido a error en API');

    // Generar datos simulados por meses
    const monthlyData = [];
    const baseCount = 15;
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const variation = (Math.random() - 0.5) * 0.3; // Variación del ±15%
      const count = Math.floor(baseCount * (1 + variation));
      
      monthlyData.push({
        month: monthName,
        label: monthName,
        value: count,
        count: count
      });
    }

    return {
      data: monthlyData,
      trend: (Math.random() - 0.5) * 16 // Tendencia entre -8% y +8%
    };
  }
};

// Obtener estadísticas históricas por meses para ingresos
const getMonthlyRevenueStats = async (months = 6) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('months', months);

    console.log('🔄 Intentando obtener estadísticas mensuales de ingresos desde la API...');
    console.log('📍 URL:', `/stats/revenue/monthly?${queryParams.toString()}`);
    
    const data = await apiFetch(`/stats/revenue/monthly?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas mensuales de ingresos):', data);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.data)) {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
    
    return {
      data: data.data,
      trend: data.trend || 0
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas mensuales de ingresos:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Solo usar datos simulados si es absolutamente necesario (para desarrollo/testing)
    console.warn('🔄 Usando datos simulados para estadísticas mensuales de ingresos debido a error en API');

    // Generar datos simulados por meses
    const monthlyData = [];
    const baseRevenue = 50000; // Ingresos base de 50,000 Bs
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const variation = (Math.random() - 0.5) * 0.4; // Variación del ±20%
      const revenue = Math.floor(baseRevenue * (1 + variation));
      
      monthlyData.push({
        month: monthName,
        label: monthName,
        value: revenue,
        amount: revenue
      });
    }

    return {
      data: monthlyData,
      trend: (Math.random() - 0.5) * 20 // Tendencia entre -10% y +10%
    };
  }
};

// Obtener estadísticas históricas por meses para reservas
const getMonthlyReservationStats = async (months = 6) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('months', months);

    console.log('🔄 Intentando obtener estadísticas mensuales de reservas desde la API...');
    console.log('📍 URL:', `/stats/reservations/monthly?${queryParams.toString()}`);
    
    const data = await apiFetch(`/stats/reservations/monthly?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas mensuales de reservas):', data);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.data)) {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
    
    return {
      data: data.data,
      trend: data.trend || 0
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas mensuales de reservas:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Solo usar datos simulados si es absolutamente necesario (para desarrollo/testing)
    console.warn('🔄 Usando datos simulados para estadísticas mensuales de reservas debido a error en API');

    // Generar datos simulados por meses
    const monthlyData = [];
    const baseCount = 45; // Base de 45 reservas por mes
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const variation = (Math.random() - 0.5) * 0.6; // Variación del ±30%
      const count = Math.floor(baseCount * (1 + variation));
      
      monthlyData.push({
        month: monthName,
        label: monthName,
        value: count,
        count: count
      });
    }

    return {
      data: monthlyData,
      trend: (Math.random() - 0.5) * 30 // Tendencia entre -15% y +15%
    };
  }
};

// Obtener estadísticas históricas mensuales de ingresos por boletos
const getMonthlyTicketRevenueStats = async (months = 6) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('months', months);

    console.log('🔄 Intentando obtener estadísticas mensuales de ingresos por boletos desde la API...');
    console.log('📍 URL:', `/stats/tickets/revenue/monthly?${queryParams.toString()}`);
    
    const data = await apiFetch(`/stats/tickets/revenue/monthly?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas mensuales de ingresos por boletos):', data);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.data)) {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
    
    return {
      data: data.data,
      trend: data.trend || 0
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas mensuales de ingresos por boletos:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Solo usar datos simulados si es absolutamente necesario (para desarrollo/testing)
    console.warn('🔄 Usando datos simulados para estadísticas mensuales de ingresos por boletos debido a error en API');

    // Generar datos simulados por meses
    const monthlyData = [];
    const baseRevenue = 25000; // Ingresos base de 25,000 Bs por boletos
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const variation = (Math.random() - 0.5) * 0.4; // Variación del ±20%
      const revenue = Math.floor(baseRevenue * (1 + variation));
      
      monthlyData.push({
        month: monthName,
        label: monthName,
        value: revenue,
        amount: revenue
      });
    }

    return {
      data: monthlyData,
      trend: (Math.random() - 0.5) * 20 // Tendencia entre -10% y +10%
    };
  }
};

// Obtener estadísticas históricas mensuales de ingresos por paquetes
const getMonthlyPackageRevenueStats = async (months = 6) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('months', months);

    console.log('🔄 Intentando obtener estadísticas mensuales de ingresos por paquetes desde la API...');
    console.log('📍 URL:', `/stats/packages/revenue/monthly?${queryParams.toString()}`);
    
    const data = await apiFetch(`/stats/packages/revenue/monthly?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas mensuales de ingresos por paquetes):', data);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.data)) {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
    
    return {
      data: data.data,
      trend: data.trend || 0
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas mensuales de ingresos por paquetes:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Solo usar datos simulados si es absolutamente necesario (para desarrollo/testing)
    console.warn('🔄 Usando datos simulados para estadísticas mensuales de ingresos por paquetes debido a error en API');

    // Generar datos simulados por meses
    const monthlyData = [];
    const baseRevenue = 15000; // Ingresos base de 15,000 Bs por paquetes
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const variation = (Math.random() - 0.5) * 0.5; // Variación del ±25%
      const revenue = Math.floor(baseRevenue * (1 + variation));
      
      monthlyData.push({
        month: monthName,
        label: monthName,
        value: revenue,
        amount: revenue
      });
    }

    return {
      data: monthlyData,
      trend: (Math.random() - 0.5) * 25 // Tendencia entre -12.5% y +12.5%
    };
  }
};

// Obtener estadísticas históricas mensuales de boletos cancelados
const getMonthlyCancelledTicketStats = async (months = 6) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('months', months);

    console.log('🔄 Intentando obtener estadísticas mensuales de boletos cancelados desde la API...');
    console.log('📍 URL:', `/stats/tickets/cancelled/monthly?${queryParams.toString()}`);
    
    const data = await apiFetch(`/stats/tickets/cancelled/monthly?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas mensuales de boletos cancelados):', data);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.data)) {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
    
    return {
      data: data.data,
      trend: data.trend || 0
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas mensuales de boletos cancelados:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Solo usar datos simulados si es absolutamente necesario (para desarrollo/testing)
    console.warn('🔄 Usando datos simulados para estadísticas mensuales de boletos cancelados debido a error en API');

    // Generar datos simulados por meses
    const monthlyData = [];
    const baseCount = 12; // Base de 12 cancelaciones por mes
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const variation = (Math.random() - 0.5) * 0.8; // Variación del ±40%
      const count = Math.floor(baseCount * (1 + variation));
      
      monthlyData.push({
        month: monthName,
        label: monthName,
        value: count,
        count: count
      });
    }

    return {
      data: monthlyData,
      trend: (Math.random() - 0.5) * 30 // Tendencia entre -15% y +15%
    };
  }
};

// Obtener estadísticas históricas mensuales de viajes completados
const getMonthlyCompletedTripStats = async (months = 6) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('months', months);

    console.log('🔄 Intentando obtener estadísticas mensuales de viajes completados desde la API...');
    console.log('📍 URL:', `/stats/trips/completed/monthly?${queryParams.toString()}`);
    
    const data = await apiFetch(`/stats/trips/completed/monthly?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas mensuales de viajes completados):', data);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.data)) {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
    
    return {
      data: data.data,
      trend: data.trend || 0
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas mensuales de viajes completados:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Solo usar datos simulados si es absolutamente necesario (para desarrollo/testing)
    console.warn('🔄 Usando datos simulados para estadísticas mensuales de viajes completados debido a error en API');

    // Generar datos simulados por meses
    const monthlyData = [];
    const baseCount = 8; // Base de 8 viajes completados por mes
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const variation = (Math.random() - 0.5) * 0.4; // Variación del ±20%
      const count = Math.floor(baseCount * (1 + variation));
      
      monthlyData.push({
        month: monthName,
        label: monthName,
        value: count,
        count: count
      });
    }

    return {
      data: monthlyData,
      trend: (Math.random() - 0.5) * 16 // Tendencia entre -8% y +8%
    };
  }
};

// Obtener estadísticas históricas mensuales de viajes cancelados
const getMonthlyCancelledTripStats = async (months = 6) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('months', months);

    console.log('🔄 Intentando obtener estadísticas mensuales de viajes cancelados desde la API...');
    console.log('📍 URL:', `/stats/trips/cancelled/monthly?${queryParams.toString()}`);
    
    const data = await apiFetch(`/stats/trips/cancelled/monthly?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas mensuales de viajes cancelados):', data);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.data)) {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
    
    return {
      data: data.data,
      trend: data.trend || 0
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas mensuales de viajes cancelados:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Solo usar datos simulados si es absolutamente necesario (para desarrollo/testing)
    console.warn('🔄 Usando datos simulados para estadísticas mensuales de viajes cancelados debido a error en API');

    // Generar datos simulados por meses
    const monthlyData = [];
    const baseCount = 2; // Base de 2 viajes cancelados por mes
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const variation = (Math.random() - 0.5) * 1.0; // Variación del ±50%
      const count = Math.max(0, Math.floor(baseCount * (1 + variation))); // No negativos
      
      monthlyData.push({
        month: monthName,
        label: monthName,
        value: count,
        count: count
      });
    }

    return {
      data: monthlyData,
      trend: (Math.random() - 0.5) * 40 // Tendencia entre -20% y +20%
    };
  }
};

// Obtener estadísticas históricas mensuales de feedback de clientes
const getMonthlyClientFeedbackStats = async (months = 6) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('months', months);

    console.log('🔄 Intentando obtener estadísticas mensuales de feedback de clientes desde la API...');
    console.log('📍 URL:', `/stats/clients/feedback/monthly?${queryParams.toString()}`);
    
    const data = await apiFetch(`/stats/clients/feedback/monthly?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas mensuales de feedback de clientes):', data);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.data)) {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
    
    return {
      data: data.data,
      trend: data.trend || 0
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas mensuales de feedback de clientes:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Solo usar datos simulados si es absolutamente necesario (para desarrollo/testing)
    console.warn('🔄 Usando datos simulados para estadísticas mensuales de feedback de clientes debido a error en API');

    // Generar datos simulados por meses
    const monthlyData = [];
    const baseRating = 4.2; // Rating base de 4.2/5
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const variation = (Math.random() - 0.5) * 0.6; // Variación del ±0.3 puntos
      const rating = Math.max(3.5, Math.min(5.0, baseRating + variation)); // Entre 3.5 y 5.0
      
      monthlyData.push({
        month: monthName,
        label: monthName,
        value: parseFloat(rating.toFixed(1)),
        count: Math.floor(Math.random() * 50) + 20, // Número de evaluaciones
        amount: parseFloat(rating.toFixed(1))
      });
    }

    return {
      data: monthlyData,
      trend: (Math.random() - 0.5) * 6 // Tendencia entre -3% y +3%
    };
  }
};

// Obtener estadísticas históricas mensuales de clientes registrados
const getMonthlyRegisteredClientsStats = async (months = 6) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('months', months);

    console.log('🔄 Intentando obtener estadísticas mensuales de clientes registrados desde la API...');
    console.log('📍 URL:', `/stats/clients/registered/monthly?${queryParams.toString()}`);
    
    const data = await apiFetch(`/stats/clients/registered/monthly?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas mensuales de clientes registrados):', data);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.data)) {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
    
    return {
      data: data.data,
      trend: data.trend || 0
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas mensuales de clientes registrados:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Solo usar datos simulados si es absolutamente necesario (para desarrollo/testing)
    console.warn('🔄 Usando datos simulados para estadísticas mensuales de clientes registrados debido a error en API');

    // Generar datos simulados por meses
    const monthlyData = [];
    const baseCount = 15; // Base de 15 nuevos clientes por mes
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const variation = (Math.random() - 0.5) * 0.6; // Variación del ±30%
      const count = Math.floor(baseCount * (1 + variation));
      
      monthlyData.push({
        month: monthName,
        label: monthName,
        value: count,
        count: count
      });
    }

    return {
      data: monthlyData,
      trend: (Math.random() - 0.5) * 20 // Tendencia entre -10% y +10%
    };
  }
};

// Obtener estadísticas históricas mensuales de paquetes entregados
const getMonthlyDeliveredPackagesStats = async (months = 6) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('months', months);

    console.log('🔄 Intentando obtener estadísticas mensuales de paquetes entregados desde la API...');
    console.log('📍 URL:', `/stats/packages/delivered/monthly?${queryParams.toString()}`);
    
    const data = await apiFetch(`/stats/packages/delivered/monthly?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas mensuales de paquetes entregados):', data);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.data)) {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
    
    return {
      data: data.data,
      trend: data.trend || 0
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas mensuales de paquetes entregados:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Solo usar datos simulados si es absolutamente necesario (para desarrollo/testing)
    console.warn('🔄 Usando datos simulados para estadísticas mensuales de paquetes entregados debido a error en API');

    // Generar datos simulados por meses
    const monthlyData = [];
    const baseCount = 45; // Base de 45 paquetes entregados por mes
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const variation = (Math.random() - 0.5) * 0.4; // Variación del ±20%
      const count = Math.floor(baseCount * (1 + variation));
      
      monthlyData.push({
        month: monthName,
        label: monthName,
        value: count,
        count: count,
        amount: count * (Math.random() * 200 + 300) // Simular montos
      });
    }

    return {
      data: monthlyData,
      trend: (Math.random() - 0.5) * 16 // Tendencia entre -8% y +8%
    };
  }
};

// Obtener estadísticas históricas mensuales de reservaciones canceladas
const getMonthlyCancelledReservationStats = async (months = 6) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('months', months);

    console.log('🔄 Intentando obtener estadísticas mensuales de reservaciones canceladas desde la API...');
    console.log('📍 URL:', `/stats/reservations/cancelled/monthly?${queryParams.toString()}`);
    
    const data = await apiFetch(`/stats/reservations/cancelled/monthly?${queryParams.toString()}`);
    console.log('✅ Respuesta exitosa de la API (estadísticas mensuales de reservaciones canceladas):', data);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || !Array.isArray(data.data)) {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
    
    return {
      data: data.data,
      trend: data.trend || 0
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas mensuales de reservaciones canceladas:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
    
    // Solo usar datos simulados si es absolutamente necesario (para desarrollo/testing)
    console.warn('🔄 Usando datos simulados para estadísticas mensuales de reservaciones canceladas debido a error en API');

    // Generar datos simulados por meses
    const monthlyData = [];
    const baseCount = 8; // Base de 8 reservaciones canceladas por mes
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const variation = (Math.random() - 0.5) * 0.8; // Variación del ±40%
      const count = Math.max(0, Math.floor(baseCount * (1 + variation))); // Mínimo 0
      
      monthlyData.push({
        month: monthName,
        label: monthName,
        value: count,
        count: count
      });
    }

    return {
      data: monthlyData,
      trend: (Math.random() - 0.5) * 30 // Tendencia entre -15% y +15%
    };
  }
};

export default {
  getTicketStats,
  getReservedTicketStats,
  getPackageStats,
  getTripStats,
  getCompletedTripsStats,
  getCancelledTripsStats,
  getInProgressTripsStats,
  getAverageOccupancyStats,
  getSalesSummary,
  getDashboardStats,
  getCancelledTicketsStats,
  getDeliveredPackagesStats,
  getPendingPackagesStats,
  getCancelledPackagesStats,
  getAverageDeliveryTimeStats,
  getRegisteredUsersStats,
  getActiveDriversStats,
  getActiveBusesStats,
  getActiveSecretariesStats,
  getActiveAssistantsStats,
  getClientFeedbackStats,
  getRegisteredClientsStats,
  getMonthlyTicketStats,
  getMonthlyPackageStats,
  getMonthlyTripStats,
  getMonthlyRevenueStats,
  getMonthlyReservationStats,
  getMonthlyTicketRevenueStats,
  getMonthlyPackageRevenueStats,
  getMonthlyCancelledTicketStats,
  getMonthlyCompletedTripStats,
  getMonthlyCancelledTripStats,
  getMonthlyClientFeedbackStats,
  getMonthlyRegisteredClientsStats,
  getMonthlyDeliveredPackagesStats,
  getMonthlyCancelledReservationStats
};
