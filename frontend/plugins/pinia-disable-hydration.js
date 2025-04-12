// Este plugin deshabilita la hidratación de Pinia para evitar errores

export default defineNuxtPlugin((nuxtApp) => {
  // Deshabilitar la hidratación de Pinia
  if (process.client && nuxtApp.$pinia) {
    // Configurar Pinia para no hidratar el estado
    nuxtApp.$pinia.use(({ store }) => {
      // Marcar el store para no ser hidratado
      store.$hydrate = () => {
        console.log('Hidratación de Pinia deshabilitada para evitar errores');
      };
    });
  }
});
