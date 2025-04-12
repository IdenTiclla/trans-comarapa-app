<template>
  <div class="form-control">
    <div class="flex items-start">
      <div class="flex items-center h-5">
        <input
          :id="id"
          type="checkbox"
          :checked="modelValue"
          :disabled="disabled"
          :required="required"
          :class="[
            'h-4 w-4 rounded transition-colors duration-200',
            error 
              ? 'border-red-300 text-red-600 focus:ring-red-500' 
              : 'border-gray-300 text-blue-600 focus:ring-blue-500',
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          ]"
          @change="$emit('update:modelValue', $event.target.checked)"
          @blur="$emit('blur', $event)"
          @focus="$emit('focus', $event)"
        />
      </div>
      <div class="ml-3 text-sm">
        <label 
          :for="id" 
          class="font-medium text-gray-700 cursor-pointer"
          :class="{ 
            'text-red-600': error,
            'text-gray-500 cursor-not-allowed': disabled
          }"
        >
          {{ label }}
          <span v-if="required" class="text-red-500 ml-1">*</span>
        </label>
        <p v-if="helpText && !error" class="text-gray-500">{{ helpText }}</p>
        <p v-if="error" class="text-red-600">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `checkbox-${Math.random().toString(36).substring(2, 9)}`
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])
</script>

<style scoped>
.form-control {
  margin-bottom: 1rem;
}

input[type="checkbox"] {
  cursor: pointer;
}

input[type="checkbox"]:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

input[type="checkbox"]:disabled {
  opacity: 0.5;
}
</style>
