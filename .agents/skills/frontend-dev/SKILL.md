---
name: Frontend Development conventions
description: Core conventions and architecture rules for Vue 3/Nuxt 3 frontend development in this project.
---

# Frontend Architecture & Conventions

This skill defines the strict architectural rules that must be followed when working on the frontend of the `trans-comarapa-app` project.

## 1. Vue & Nuxt 3

- **Composition API**: ALL components and stores must be written using the Vue 3 Composition API with `<script setup>`.
- **Logic extraction**: Extract complex logic into Composables (`frontend/composables/`) using the `useFeatureName` naming convention, to maintain components clean and readable.

## 2. State Management (Pinia)

- **Composition API only**: Pinia stores must be strictly written using the Setup Store syntax (Composition API), **NOT** the Options API syntax.

**Correct Store Eje:**
```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEntityStore = defineStore('entity', () => {
  // State
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const activeItems = computed(() => items.value.filter(i => i.active))

  // Actions
  const fetchItems = async () => {
    isLoading.value = true
    try {
      // Async operation...
    } catch (err) {
      error.value = err
    } finally {
      isLoading.value = false
    }
  }

  return { 
    items, 
    isLoading, 
    error,
    activeItems,
    fetchItems
  }
})
```

## 3. Communication & Services

- **Services Layer**: API Calls should be contained within `frontend/services/` (e.g., `ticketService.js`, `packageService.js`). 
- **Stores**: Stores import services to trigger API calls and manage global data states (isLoading, errors).
- **Direct Calls**: Do NOT execute `$fetch` or `useFetch` directly from components or composables. Direct them to the store or, if stateless, to the service.

## 4. UI & Styling

- **TailwindCSS**: CSS logic must use utility classes with Tailwind CSS. Avoid explicit generic `<style>` tags unless strictly necessary for scoped edge cases.
- **Components**: Reusable UI blocks like buttons and inputs must be extracted into their own components (e.g. `AppButton.vue`) and placed inside `frontend/components/common/`. Do NOT repeat complex style definitions; use the base component and its props instead (e.g. `variant`, `size`).
- **Error Feedback**: Use standard application mechanisms for displaying errors (e.g. the global notification compossables or the global `error.vue` page).

## 5. Security & Middleware

- Ensure routes are correctly covered by `middleware/auth.global.ts` when access controls or roles are required. Avoid duplicating middleware checks in individual pages if they can be handled globally.

## 6. Code Reusability & Best Practices

To ensure long-term maintainability, adhere to the following clean code and reusability guidelines:

- **DRY (Don't Repeat Yourself)**: If you find yourself writing the same logic in more than one component, extract it:
  - **Stateful logic & API calls**: Extract to a Composable (`composables/`).
  - **Stateless formatting/logic**: Extract to a pure function in `utils/` (e.g., date formatters, currency formatters).
  - **UI Elements**: Extract repeated UI patterns into modular Vue components in `components/common/`.
- **Early Returns**: Flatten your code by returning early from functions when conditions are not met, avoiding deep `if-else` nesting.
- **Descriptive Naming**: Use clear, self-documenting variable and function names. A Boolean variable should generally start with `is`, `has`, `should`, or `can` (e.g., `isSubmitting`, `hasPermission`).
- **Props and Emits Validation**: Always validate component props defining types and defaults. Define explicit emits using `defineEmits`.
- **Avoid Magic Numbers/Strings**: Extract hardcoded values into constant variables or configuration objects (e.g., status strings).
