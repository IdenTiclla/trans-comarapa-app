import { reactive, ref } from 'vue'

export const validators = {
    required: (msg = 'Este campo es obligatorio') => val => {
        if (val === null || val === undefined || val === '') return msg
        if (Array.isArray(val) && val.length === 0) return msg
        if (typeof val === 'object' && Object.keys(val).length === 0) return msg
        return null
    },
    minLength: (min, msg) => val => (val && String(val).length < min) ? (msg || `Mínimo ${min} caracteres`) : null,
    maxLength: (max, msg) => val => (val && String(val).length > max) ? (msg || `Máximo ${max} caracteres`) : null,
    email: (msg = 'Correo electrónico inválido') => val => {
        if (!val) return null
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return pattern.test(String(val)) ? null : msg
    },
    numeric: (msg = 'Debe ser un valor numérico') => val => {
        if (val === null || val === undefined || val === '') return null
        return isNaN(Number(val)) ? msg : null
    },
    positive: (msg = 'Debe ser mayor a cero') => val => {
        if (val === null || val === undefined || val === '') return null
        return Number(val) <= 0 ? msg : null
    },
    minValue: (min, msg) => val => {
        if (val === null || val === undefined || val === '') return null
        return Number(val) < min ? (msg || `Mínimo permitido es ${min}`) : null
    }
}

export function useFormValidation() {
    const errors = reactive({})
    const isValid = ref(true)

    const validateField = (field, value, rules) => {
        errors[field] = null

        if (!rules || !Array.isArray(rules)) return true

        for (const rule of rules) {
            const errorMsg = rule(value)
            if (errorMsg) {
                errors[field] = errorMsg
                isValid.value = false
                return false
            }
        }

        checkOverallValidity()
        return true
    }

    const validateForm = (form, validationRules) => {
        let formIsValid = true

        Object.keys(validationRules).forEach(field => {
            const isFieldValid = validateField(field, form[field], validationRules[field])
            if (!isFieldValid) {
                formIsValid = false
            }
        })

        isValid.value = formIsValid
        return formIsValid
    }

    const checkOverallValidity = () => {
        isValid.value = !Object.values(errors).some(err => err !== null)
    }

    const clearErrors = () => {
        Object.keys(errors).forEach(key => delete errors[key])
        isValid.value = true
    }

    const clearError = (field) => {
        if (errors[field]) {
            errors[field] = null
            checkOverallValidity()
        }
    }

    return {
        errors,
        isValid,
        validateField,
        validateForm,
        clearErrors,
        clearError
    }
}
