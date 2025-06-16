# Documentación - Trans Comarapa

Este directorio contiene toda la documentación técnica y diagramas del sistema de gestión de transporte Trans Comarapa.

## 📁 Estructura de Documentación

### 🏗️ Arquitectura del Sistema
- **[`architecture.md`](./architecture.md)** - Documentación de la arquitectura general
- **[`component_diagram.mmd`](./component_diagram.mmd)** - Diagrama de componentes del sistema

### 🔄 Diagramas de Estados
- **[`state-diagrams/`](./state-diagrams/)** - **📂 Carpeta dedicada a estados**
  - [`ticket_states.mmd`](./state-diagrams/ticket_states.mmd) - Estados de tickets
  - [`package_states.mmd`](./state-diagrams/package_states.mmd) - Estados de paquetes
  - [`states_documentation.md`](./state-diagrams/states_documentation.md) - Documentación técnica completa

### 📊 Diagramas de Clases y Modelos
- **[`actual_class_diagram.mmd`](./actual_class_diagram.mmd)** - Diagrama de clases actual
- **[`class_diagram.mmd`](./class_diagram.mmd)** - Diagrama de clases base
- **[`conceptual_class_diagram.mmd`](./conceptual_class_diagram.mmd)** - Diagrama conceptual
- **[`implementation_class_diagram.mmd`](./implementation_class_diagram.mmd)** - Diagrama de implementación
- **[`domain_model.mmd`](./domain_model.mmd)** - Modelo de dominio

### 🎯 Casos de Uso y Procesos
- **[`secretary_use_cases.md`](./secretary_use_cases.md)** - Casos de uso para secretarias
- **[`ticket_sale_activity_diagram.mmd`](./ticket_sale_activity_diagram.mmd)** - Diagrama de actividad de venta de tickets

### 📈 Estado del Proyecto
- **[`project-status.md`](./project-status.md)** - Estado actual del proyecto
- **[`client-existing-sales.md`](./client-existing-sales.md)** - Documentación de ventas existentes

## 🎯 Documentación Destacada

### 🔥 Para Nuevos Desarrolladores
1. **Inicio rápido**: [`architecture.md`](./architecture.md)
2. **Modelo de datos**: [`domain_model.mmd`](./domain_model.mmd)
3. **Estados del sistema**: [`state-diagrams/states_documentation.md`](./state-diagrams/states_documentation.md)

### 🔥 Para Product Managers
1. **Estado del proyecto**: [`project-status.md`](./project-status.md)
2. **Casos de uso**: [`secretary_use_cases.md`](./secretary_use_cases.md)
3. **Flujos de trabajo**: [`state-diagrams/`](./state-diagrams/)

### 🔥 Para Operaciones
1. **Casos de uso de secretaria**: [`secretary_use_cases.md`](./secretary_use_cases.md)
2. **Proceso de venta**: [`ticket_sale_activity_diagram.mmd`](./ticket_sale_activity_diagram.mmd)
3. **Estados de tickets y paquetes**: [`state-diagrams/`](./state-diagrams/)

## 🛠️ Herramientas de Visualización

### Mermaid Diagrams
La mayoría de diagramas están en formato Mermaid (`.mmd`):
- **GitHub/GitLab**: Vista automática
- **VS Code**: Extensión "Mermaid Preview"
- **Online**: [mermaid.live](https://mermaid.live/)

### Markdown
Documentación en formato Markdown (`.md`):
- Compatible con cualquier editor/visor Markdown
- Renderizado automático en GitHub/GitLab

## 📋 Checklist de Documentación

### ✅ Completado
- [x] Diagramas de estados (tickets y paquetes)
- [x] Arquitectura del sistema
- [x] Casos de uso principales
- [x] Modelo de dominio
- [x] Estado actual del proyecto

### 🚧 En Progreso
- [ ] API Documentation (OpenAPI/Swagger)
- [ ] Guías de deployment
- [ ] Testing strategies
- [ ] Performance benchmarks

### 📋 Planificado
- [ ] User manuals por rol
- [ ] Troubleshooting guides
- [ ] Security documentation
- [ ] Backup & recovery procedures

## 🔄 Mantenimiento

### Actualización de Documentación
- **Responsable**: Equipo de desarrollo
- **Frecuencia**: Con cada release mayor
- **Review**: Mensual

### Versionado
- La documentación sigue el versionado del sistema principal
- Cambios significativos se documentan en cada archivo relevante

## 📞 Contacto

Para preguntas sobre la documentación:
- **Equipo de Desarrollo**: developer@transcomarapa.com
- **Documentación**: docs@transcomarapa.com
- **Issues**: GitHub Issues del repositorio

---

> **Última actualización**: Diciembre 2024  
> **Versión del sistema**: v1.0  
> **Mantenido por**: Equipo de Desarrollo Trans Comarapa