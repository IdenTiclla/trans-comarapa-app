import { describe, it, expect } from 'vitest'
import { usePersonData } from '~/composables/usePersonData'

describe('usePersonData', () => {
  const {
    getEffectiveName,
    getEffectiveFirstName,
    getEffectiveLastName,
    getEffectivePhone,
    getInitials,
    getPersonType,
    hasPersonData,
    isLegacyUser,
    buildPersonForm
  } = usePersonData()
  
  describe('getEffectiveName', () => {
    it('should handle null/undefined user', () => {
      expect(getEffectiveName(null)).toBe('Usuario Anónimo')
      expect(getEffectiveName(undefined)).toBe('Usuario Anónimo')
    })

    it('should handle legacy user structure', () => {
      const legacyUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe'
      }
      
      expect(getEffectiveName(legacyUser)).toBe('John Doe')
    })

    it('should prioritize person data over legacy fields', () => {
      const userWithPerson = {
        id: 1,
        firstname: 'John',     // Legacy
        lastname: 'Doe',       // Legacy
        username: 'johndoe',
        person: {
          id: 1,
          firstname: 'Jane',   // Person (prioritario)
          lastname: 'Smith',   // Person (prioritario)
          type: 'client'
        }
      }
      
      expect(getEffectiveName(userWithPerson)).toBe('Jane Smith')
    })

    it('should prioritize person over profile', () => {
      const userWithBoth = {
        id: 1,
        firstname: 'John',     // Legacy
        lastname: 'Doe',       // Legacy
        username: 'johndoe',
        person: {
          firstname: 'Jane',   // Person (más prioritario)
          lastname: 'Smith',
          type: 'client'
        },
        profile: {
          firstname: 'Bob',    // Profile (menos prioritario)
          lastname: 'Wilson'
        }
      }
      
      expect(getEffectiveName(userWithBoth)).toBe('Jane Smith')
    })

    it('should fallback to username when no names available', () => {
      const userWithoutNames = {
        id: 1,
        username: 'testuser'
      }
      
      expect(getEffectiveName(userWithoutNames)).toBe('testuser')
    })

    it('should handle partial names correctly', () => {
      const userWithFirstNameOnly = {
        id: 1,
        person: {
          firstname: 'John',
          lastname: null,
          type: 'client'
        },
        username: 'johnuser'
      }
      
      expect(getEffectiveName(userWithFirstNameOnly)).toBe('John')
    })
  })

  describe('getEffectiveFirstName', () => {
    it('should return empty string for null user', () => {
      expect(getEffectiveFirstName(null)).toBe('')
    })

    it('should prioritize person over legacy', () => {
      const user = {
        firstname: 'Legacy',
        person: { firstname: 'Person' }
      }
      
      expect(getEffectiveFirstName(user)).toBe('Person')
    })

    it('should fallback to legacy when no person', () => {
      const user = {
        firstname: 'Legacy'
      }
      
      expect(getEffectiveFirstName(user)).toBe('Legacy')
    })
  })

  describe('getInitials', () => {
    it('should generate initials from first and last name', () => {
      const user = {
        person: {
          firstname: 'John',
          lastname: 'Doe'
        }
      }
      
      expect(getInitials(user)).toBe('JD')
    })

    it('should handle single name', () => {
      const user = {
        person: {
          firstname: 'John',
          lastname: null
        }
      }
      
      expect(getInitials(user)).toBe('J')
    })

    it('should fallback to username initial', () => {
      const user = {
        username: 'testuser'
      }
      
      expect(getInitials(user)).toBe('T')
    })

    it('should fallback to U for null user', () => {
      expect(getInitials(null)).toBe('U')
    })

    it('should handle empty names', () => {
      const user = {
        person: {
          firstname: '',
          lastname: ''
        },
        username: 'testuser'
      }
      
      expect(getInitials(user)).toBe('T')
    })
  })

  describe('getPersonType', () => {
    it('should return person type when available', () => {
      const user = {
        person: { type: 'driver' },
        role: 'Admin'
      }
      
      expect(getPersonType(user)).toBe('driver')
    })

    it('should fallback to role when no person', () => {
      const user = {
        role: 'Admin'
      }
      
      expect(getPersonType(user)).toBe('admin')
    })

    it('should return user for null input', () => {
      expect(getPersonType(null)).toBe('user')
    })
  })

  describe('hasPersonData', () => {
    it('should return true when user has person', () => {
      const user = {
        person: { firstname: 'John' }
      }
      
      expect(hasPersonData(user)).toBe(true)
    })

    it('should return false when user has no person', () => {
      const user = {
        firstname: 'John'
      }
      
      expect(hasPersonData(user)).toBe(false)
    })

    it('should return false for null user', () => {
      expect(hasPersonData(null)).toBe(false)
    })
  })


  describe('isLegacyUser', () => {
    it('should return true for legacy user structure', () => {
      const legacyUser = {
        firstname: 'John',
        lastname: 'Doe'
      }
      
      expect(isLegacyUser(legacyUser)).toBe(true)
    })

    it('should return false when user has person data', () => {
      const userWithPerson = {
        firstname: 'John',
        lastname: 'Doe',
        person: { firstname: 'Jane' }
      }
      
      expect(isLegacyUser(userWithPerson)).toBe(false)
    })


    it('should return false when user has no legacy fields', () => {
      const modernUser = {
        person: { firstname: 'Jane' }
      }
      
      expect(isLegacyUser(modernUser)).toBe(false)
    })
  })

  describe('buildPersonForm', () => {
    it('should build form object from person data', () => {
      const user = {
        person: {
          firstname: 'John',
          lastname: 'Doe',
          phone: '123456789',
          birth_date: '1990-01-01',
          bio: 'Test bio',
          avatar_url: 'http://example.com/avatar.jpg'
        }
      }
      
      const form = buildPersonForm(user)
      
      expect(form).toEqual({
        firstname: 'John',
        lastname: 'Doe',
        phone: '123456789',
        birth_date: '1990-01-01',
        bio: 'Test bio',
        avatar_url: 'http://example.com/avatar.jpg'
      })
    })

    it('should fallback to legacy fields when no person', () => {
      const user = {
        firstname: 'Jane',
        lastname: 'Smith',
        birth_date: '1985-05-15',
        bio: 'Legacy bio'
      }
      
      const form = buildPersonForm(user)
      
      expect(form).toEqual({
        firstname: 'Jane',
        lastname: 'Smith',
        phone: '',
        birth_date: '1985-05-15',
        bio: 'Legacy bio',
        avatar_url: null
      })
    })

    it('should handle null user', () => {
      const form = buildPersonForm(null)
      
      expect(form).toEqual({
        firstname: '',
        lastname: '',
        phone: '',
        birth_date: null,
        bio: '',
        avatar_url: null
      })
    })

    it('should prioritize person over legacy fields', () => {
      const user = {
        firstname: 'Legacy',
        lastname: 'User',
        phone: '000000000',
        person: {
          firstname: 'Person',
          lastname: 'User',
          phone: '123456789'
        }
      }
      
      const form = buildPersonForm(user)
      
      expect(form.firstname).toBe('Person')
      expect(form.lastname).toBe('User')
      expect(form.phone).toBe('123456789')
    })
  })

  describe('edge cases', () => {
    it('should handle empty strings properly', () => {
      const user = {
        person: {
          firstname: '',
          lastname: '',
          phone: ''
        },
        username: 'testuser'
      }
      
      expect(getEffectiveName(user)).toBe('testuser')
      expect(getEffectiveFirstName(user)).toBe('')
      expect(getInitials(user)).toBe('T')
    })

    it('should handle whitespace-only names', () => {
      const user = {
        person: {
          firstname: '   ',
          lastname: '   '
        },
        username: 'testuser'
      }
      
      expect(getEffectiveName(user)).toBe('testuser')
    })

    it('should handle mixed empty and valid data', () => {
      const user = {
        person: {
          firstname: 'John',
          lastname: '',
          phone: null
        }
      }
      
      expect(getEffectiveName(user)).toBe('John')
      expect(getEffectivePhone(user)).toBe('')
    })
  })
})