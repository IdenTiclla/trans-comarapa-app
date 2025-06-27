import apiFetch from '~/utils/api'

const getPerson = async (personId) => {
  try {
    return await apiFetch(`/persons/${personId}`)
  } catch (error) {
    console.error('Error obteniendo persona:', error)
    throw error
  }
}

const updatePerson = async (personId, personData) => {
  try {
    return await apiFetch(`/persons/${personId}`, {
      method: 'PUT',
      body: personData
    })
  } catch (error) {
    console.error('Error actualizando persona:', error)
    throw error
  }
}

const listPersons = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    
    if (filters.skip) params.append('skip', filters.skip)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.person_type) params.append('person_type', filters.person_type)
    
    const url = `/persons${params.toString() ? '?' + params.toString() : ''}`
    return await apiFetch(url)
  } catch (error) {
    console.error('Error listando personas:', error)
    throw error
  }
}

const getPersonByUserId = async (userId) => {
  try {
    return await apiFetch(`/persons/by-user/${userId}`)
  } catch (error) {
    console.error('Error obteniendo persona por user ID:', error)
    throw error
  }
}

export default {
  getPerson,
  updatePerson,
  listPersons,
  getPersonByUserId
}