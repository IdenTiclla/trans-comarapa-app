// Obtener la URL base de la API
export const getApiBaseUrl = () => {
  // En un entorno de producción, esto podría venir de una variable de entorno
  return 'http://localhost:8000/api/v1'
}

// Obtener el token de autenticación del almacenamiento local
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

// Manejar errores de la API
export const handleApiError = (error) => {
  console.error('Error en la API:', error)
  
  if (error.response) {
    // La solicitud fue hecha y el servidor respondió con un código de estado
    // que cae fuera del rango 2xx
    console.error('Respuesta del servidor:', error.response.data)
    console.error('Código de estado:', error.response.status)
    
    return {
      message: error.response.data.detail || 'Error en la respuesta del servidor',
      status: error.response.status
    }
  } else if (error.request) {
    // La solicitud fue hecha pero no se recibió respuesta
    console.error('No se recibió respuesta del servidor')
    
    return {
      message: 'No se pudo conectar con el servidor',
      status: 0
    }
  } else {
    // Algo sucedió al configurar la solicitud que desencadenó un error
    console.error('Error al configurar la solicitud:', error.message)
    
    return {
      message: error.message || 'Error al realizar la solicitud',
      status: 0
    }
  }
}
