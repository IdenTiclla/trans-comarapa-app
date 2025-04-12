// Este plugin corrige el problema de hasOwnProperty en Pinia

export default defineNuxtPlugin(() => {
  // Sobrescribir el método hasOwnProperty para todos los objetos
  if (process.client) {
    // Definir una función segura para verificar propiedades
    const safeHasOwnProperty = function(prop) {
      return Object.prototype.hasOwnProperty.call(this, prop);
    };

    // Monkeypatching para Object.prototype.hasOwnProperty
    const originalHasOwnProperty = Object.prototype.hasOwnProperty;
    Object.prototype.hasOwnProperty = function(prop) {
      return originalHasOwnProperty.call(this, prop);
    };

    // Parche para objetos creados con Object.create(null)
    const originalCreate = Object.create;
    Object.create = function(proto, propertiesObject) {
      const obj = originalCreate(proto, propertiesObject);

      // Si el objeto no tiene prototipo, añadir hasOwnProperty
      if (proto === null && typeof obj.hasOwnProperty !== 'function') {
        Object.defineProperty(obj, 'hasOwnProperty', {
          value: safeHasOwnProperty,
          enumerable: false,
          configurable: true,
          writable: true
        });
      }

      return obj;
    };
  }
});
