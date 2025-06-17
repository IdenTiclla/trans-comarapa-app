# Diagramas de Estados - Trans Comarapa

Esta carpeta contiene todos los diagramas de estados y documentación relacionada con las transiciones de tickets y paquetes en el sistema Trans Comarapa.

## 📁 Archivos Incluidos

### 🎫 Diagramas de Tickets
- **[`ticket_states.mmd`](./ticket_states.mmd)** - Diagrama Mermaid de estados de tickets
  - Estados: `pending`, `confirmed`, `completed`, `cancelled`
  - Flujos: Venta directa y reserva previa
  - Transiciones automáticas y manuales

### 📦 Diagramas de Paquetes
- **[`package_states.mmd`](./package_states.mmd)** - Diagrama Mermaid de estados de paquetes
  - Estados: `registered`, `in_transit`, `arrived`, `delivered`, `lost`, `cancelled`
  - Flujo completo desde registro hasta entrega
  - Manejo de excepciones (pérdidas, cancelaciones)

### 🚌 Diagramas de Viajes
- **[`trip_states.mmd`](./trip_states.mmd)** - Diagrama Mermaid de estados de viajes
  - Estados: `scheduled`, `boarding`, `in_progress`, `completed`, `cancelled`, `delayed`
  - Flujo operativo desde programación hasta finalización
  - Gestión de retrasos y cancelaciones

### 📚 Documentación Técnica
- **[`states_documentation.md`](./states_documentation.md)** - Documentación completa del sistema de estados
  - Especificaciones técnicas de cada estado
  - Roles y permisos por transición
  - Arquitectura de auditoría
  - Flujos de trabajo y casos de uso
  - Métricas y reportes

## 🎯 Casos de Uso

### Para Desarrolladores
- Consultar estados válidos antes de implementar funcionalidades
- Entender transiciones automáticas vs manuales
- Revisar permisos requeridos para cambios de estado
- Implementar validaciones de negocio

### Para Product Managers
- Entender flujos operativos del negocio
- Identificar puntos de mejora en procesos
- Definir nuevos requirements basados en estados
- Analizar métricas de eficiencia

### Para Operaciones
- Capacitar personal en flujos de trabajo
- Entender responsabilidades por estado
- Identificar puntos críticos del proceso
- Mejorar experiencia del cliente

## 🔧 Cómo Visualizar

### Mermaid Diagrams
Los archivos `.mmd` se pueden visualizar en:
- **GitHub/GitLab**: Vista automática en el repositorio
- **VS Code**: Con extensión Mermaid Preview
- **Mermaid Live Editor**: https://mermaid.live/
- **Notion, Confluence**: Soporte nativo para Mermaid

### Ejemplo de Visualización
```bash
# Instalar mermaid-cli globalmente
npm install -g @mermaid-js/mermaid-cli

# Generar imagen PNG del diagrama
mmdc -i ticket_states.mmd -o ticket_states.png
mmdc -i package_states.mmd -o package_states.png
mmdc -i trip_states.mmd -o trip_states.png
```

## 🚀 Próximos Pasos

### Mejoras Planificadas
- [ ] Implementar estado `arrived` para paquetes en el backend
- [ ] Agregar notificaciones automáticas por cambio de estado
- [ ] Dashboard de métricas en tiempo real
- [ ] API webhooks para tracking externo

### Estados Futuros Considerados
- **Tickets**: `on_board` (cliente subió al bus)
- **Paquetes**: `damaged` (paquete dañado durante transporte)
- **Ambos**: `refunded` (reembolso procesado)

## 📞 Contacto

Para preguntas sobre los diagramas de estado o propuestas de mejoras:
- **Equipo de Desarrollo**: developer@transcomarapa.com
- **Documentación**: docs@transcomarapa.com

---

> **Última actualización**: Diciembre 2024  
> **Versión del sistema**: v1.0  
> **Estado**: ✅ Activo y mantenido