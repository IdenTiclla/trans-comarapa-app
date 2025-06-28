export const usePersonData = () => {
  /**
   * Obtener nombre efectivo del usuario/persona
   * Prioriza datos de person, con fallback a campos legacy para compatibilidad
   */
  const getEffectiveName = (user) => {
    if (!user) return 'Usuario Anónimo'
    
    // Prioridad optimizada: person > legacy
    const firstName = user.person?.firstname || user.firstname || ''
    const lastName = user.person?.lastname || user.lastname || ''
    
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName || user.username || 'Usuario Anónimo'
  }
  
  const getEffectiveFirstName = (user) => {
    if (!user) return ''
    return user.person?.firstname || user.firstname || ''
  }
  
  const getEffectiveLastName = (user) => {
    if (!user) return ''
    return user.person?.lastname || user.lastname || ''
  }
  
  const getEffectivePhone = (user) => {
    if (!user) return ''
    return user.person?.phone || user.phone || ''
  }
  
  const getInitials = (user) => {
    const firstName = getEffectiveFirstName(user)
    const lastName = getEffectiveLastName(user)
    
    const first = firstName ? firstName.charAt(0).toUpperCase() : ''
    const last = lastName ? lastName.charAt(0).toUpperCase() : ''
    
    return `${first}${last}` || user?.username?.charAt(0).toUpperCase() || 'U'
  }
  
  const getPersonType = (user) => {
    return user?.person?.type || user?.role?.toLowerCase() || 'user'
  }
  
  const hasPersonData = (user) => {
    return !!(user?.person)
  }
  
  const isLegacyUser = (user) => {
    return !!(user?.firstname || user?.lastname) && !user?.person
  }
  
  /**
   * Construir objeto de persona para formularios
   */
  const buildPersonForm = (user) => {
    return {
      firstname: getEffectiveFirstName(user),
      lastname: getEffectiveLastName(user),
      phone: getEffectivePhone(user),
      birth_date: user?.person?.birth_date || user?.birth_date || null,
      bio: user?.person?.bio || user?.bio || '',
      avatar_url: user?.person?.avatar_url || user?.avatar_url || null
    }
  }
  
  return {
    getEffectiveName,
    getEffectiveFirstName,
    getEffectiveLastName,
    getEffectivePhone,
    getInitials,
    getPersonType,
    hasPersonData,
    isLegacyUser,
    buildPersonForm
  }
}