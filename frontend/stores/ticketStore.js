/**
 * Ticket store - Composition API style.
 * 
 * Migrated from Options API to Composition API for consistency.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as ticketService from '~/services/ticketService'

export const useTicketStore = defineStore('tickets', () => {
  // ── State ────────────────────────────────────────────────
  const tickets = ref([])
  const currentTicket = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // ── Getters ──────────────────────────────────────────────
  const ticketCount = computed(() => tickets.value.length)

  // ── Actions ──────────────────────────────────────────────
  async function fetchTickets(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const response = await ticketService.getAllTickets(params)
      tickets.value = response
    } catch (err) {
      error.value = err.data?.detail || err.message || 'Failed to fetch tickets'
      tickets.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTicketById(id) {
    isLoading.value = true
    error.value = null
    try {
      currentTicket.value = await ticketService.getTicketById(id)
    } catch (err) {
      error.value = err.data?.detail || err.message || 'Failed to fetch ticket'
      currentTicket.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function createNewTicket(ticketData) {
    isLoading.value = true
    error.value = null
    try {
      const newTicket = await ticketService.createTicket(ticketData)
      await fetchTickets()
      return newTicket
    } catch (err) {
      error.value = err.data?.detail || err.message || 'Failed to create ticket'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateExistingTicket(id, ticketData) {
    isLoading.value = true
    error.value = null
    try {
      const updatedTicket = await ticketService.updateTicket(id, ticketData)
      await fetchTickets()
      if (currentTicket.value?.id === id) {
        currentTicket.value = updatedTicket
      }
      return updatedTicket
    } catch (err) {
      error.value = err.data?.detail || err.message || 'Failed to update ticket'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteExistingTicket(id) {
    isLoading.value = true
    error.value = null
    try {
      await ticketService.deleteTicket(id)
      await fetchTickets()
      if (currentTicket.value?.id === id) {
        currentTicket.value = null
      }
    } catch (err) {
      error.value = err.data?.detail || err.message || 'Failed to delete ticket'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTicketsByTrip(tripId) {
    isLoading.value = true
    error.value = null
    try {
      tickets.value = await ticketService.getTicketsByTripId(tripId)
    } catch (err) {
      error.value = err.data?.detail || err.message || 'Failed to fetch tickets for trip'
      tickets.value = []
    } finally {
      isLoading.value = false
    }
  }

  function clearCurrentTicket() {
    currentTicket.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    tickets,
    currentTicket,
    isLoading,
    error,
    // Getters
    ticketCount,
    // Actions
    fetchTickets,
    fetchTicketById,
    createNewTicket,
    updateExistingTicket,
    deleteExistingTicket,
    fetchTicketsByTrip,
    clearCurrentTicket,
    clearError,
  }
})