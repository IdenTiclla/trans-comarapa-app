import { defineStore } from 'pinia';
import * as assistantService from '~/services/assistantService';

export const useAssistantStore = defineStore('assistants', {
  state: () => ({
    assistants: [],
    currentAssistant: null,
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchAssistants(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        this.assistants = await assistantService.getAllAssistants(params);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch assistants';
        this.assistants = [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchAssistantById(id) {
      this.isLoading = true;
      this.error = null;
      try {
        this.currentAssistant = await assistantService.getAssistantById(id);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch assistant';
        this.currentAssistant = null;
      } finally {
        this.isLoading = false;
      }
    },

    async createNewAssistant(assistantData) {
      this.isLoading = true;
      this.error = null;
      try {
        const newAssistant = await assistantService.createAssistant(assistantData);
        await this.fetchAssistants(); // Refresh list
        return newAssistant;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to create assistant';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateExistingAssistant(id, assistantData) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedAssistant = await assistantService.updateAssistant(id, assistantData);
        await this.fetchAssistants(); // Refresh list
        if (this.currentAssistant && this.currentAssistant.id === id) {
          this.currentAssistant = updatedAssistant;
        }
        return updatedAssistant;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to update assistant';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteExistingAssistant(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await assistantService.deleteAssistant(id);
        await this.fetchAssistants(); // Refresh list
        if (this.currentAssistant && this.currentAssistant.id === id) {
          this.currentAssistant = null;
        }
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to delete assistant';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    clearCurrentAssistant() {
      this.currentAssistant = null;
    }
  },
  getters: {
    // assistantCount: (state) => state.assistants.length,
  }
}); 