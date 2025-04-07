<template>
  <div>
    <h1 class="text-3xl font-bold mb-4">Nuestros Servicios</h1>
    <p class="mb-6">
      En Trans Comarapa ofrecemos una variedad de servicios de transporte para satisfacer sus necesidades.
    </p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-3">Transporte de Pasajeros</h2>
        <p class="mb-3">
          Ofrecemos servicios de transporte de pasajeros con comodidad y seguridad.
          Nuestras unidades cuentan con asientos reclinables, aire acondicionado y entretenimiento a bordo.
        </p>
        <ul class="list-disc pl-5 mb-3">
          <li>Servicio diario a múltiples destinos</li>
          <li>Unidades modernas y confortables</li>
          <li>Conductores profesionales</li>
          <li>Reservas en línea</li>
        </ul>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-3">Transporte de Carga</h2>
        <p class="mb-3">
          Transportamos su carga de manera segura y puntual a su destino.
          Contamos con vehículos adecuados para diferentes tipos de carga.
        </p>
        <ul class="list-disc pl-5 mb-3">
          <li>Carga general</li>
          <li>Paquetería</li>
          <li>Carga refrigerada</li>
          <li>Seguimiento en tiempo real</li>
        </ul>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-3">Servicios Especiales</h2>
        <p class="mb-3">
          Ofrecemos servicios especiales para eventos, turismo y necesidades específicas.
        </p>
        <ul class="list-disc pl-5 mb-3">
          <li>Transporte para eventos</li>
          <li>Tours turísticos</li>
          <li>Servicios corporativos</li>
          <li>Transporte escolar</li>
        </ul>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-3">Alquiler de Vehículos</h2>
        <p class="mb-3">
          Alquile nuestros vehículos para sus necesidades específicas de transporte.
        </p>
        <ul class="list-disc pl-5 mb-3">
          <li>Alquiler por día, semana o mes</li>
          <li>Diferentes tipos de vehículos disponibles</li>
          <li>Servicio con o sin conductor</li>
          <li>Tarifas competitivas</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Nuestros Servicios'
})
</script>
