# Find and Pay for Parking - Prototipo de Alta Fidelidad

## Descripción

Prototipo funcional de una aplicación web para encontrar y reservar espacios de parqueo en la ciudad. Incluye todas las pantallas principales del flujo de usuario desde el registro hasta la confirmación de reserva.

## Características

- Pantalla de login y registro
- Mapa interactivo con marcadores de parqueaderos
- Sistema de reserva con modal
- Proceso de pago simulado
- Pantalla de confirmación
- Panel administrativo

## Tecnologías

- HTML5
- CSS3
- JavaScript vanilla

## Instalación y Uso

1. Clona o descarga el repositorio
2. Abre el archivo `demo.html` en tu navegador
3. Navega por las diferentes pantallas usando los botones

## Estructura del Proyecto

```
├── demo.html          # Archivo principal con todo el código
├── index.html         # Versión con archivos separados
├── styles.css         # Estilos CSS
├── script.js          # JavaScript
└── README.md          # Este archivo
```

## Flujo de Usuario Detallado

### 1. Autenticación (Login/Registro)
- **Acción del usuario**: El usuario llega a la aplicación y ve un modal de login/registro sobre el mapa.
- **Interacciones**:
  - Cambiar entre pestañas "Iniciar Sesión" y "Registrarse" usando los botones de pestaña.
  - Ingresar datos en los campos de formulario (email, contraseña, nombre, teléfono).
  - Hacer clic en "Iniciar Sesión" o "Crear Cuenta" para proceder (con validación automática de campos completos).
- **Resultado**: El modal se oculta automáticamente tras validación exitosa, revelando el mapa interactivo.

### 2. Exploración del Mapa
- **Acción del usuario**: Visualización del mapa interactivo con marcadores.
- **Interacciones**:
  - Hacer clic en marcadores del mapa para ver información del parqueadero.
  - Usar la lista lateral para seleccionar parqueaderos.
  - Hacer clic en "Reservar" en cualquier parqueadero.
- **Resultado**: Apertura del modal de reserva.

### 3. Reserva de Espacio
- **Acción del usuario**: Selección de parámetros de reserva en el modal.
- **Interacciones**:
  - Seleccionar fecha y hora de llegada/salida.
  - Elegir duración y vehículo.
  - Revisar el resumen de precios.
  - Hacer clic en "Confirmar Reserva" o "Cancelar".
- **Resultado**: Navegación a la pantalla de pago.

### 4. Proceso de Pago
- **Acción del usuario**: Selección y confirmación del método de pago.
- **Interacciones**:
  - Revisar el resumen de la reserva.
  - Seleccionar método de pago (tarjeta, PSE, billetera digital).
  - Hacer clic en "Pagar $X" para procesar.
- **Resultado**: Pantalla de confirmación tras simulación de pago.

### 5. Confirmación
- **Acción del usuario**: Revisión de la reserva exitosa.
- **Interacciones**:
  - Ver detalles de la reserva y código QR.
  - Descargar comprobante o ver historial.
  - Seguir los próximos pasos indicados.
- **Resultado**: Fin del flujo principal.

### 6. Panel Administrativo (Opcional)
- **Acción del usuario**: Acceso desde el menú de usuario.
- **Interacciones**:
  - Navegar por secciones (Dashboard, Usuarios, Espacios, etc.).
  - Ver estadísticas y tablas de datos.
- **Resultado**: Gestión del sistema.

## Botones y Acciones del Usuario

| Pantalla | Botón/Acción | Descripción |
|----------|-------------|-------------|
| Login | "Iniciar Sesión" | Valida campos y autentica al usuario, navega al mapa |
| Login | "Crear Cuenta" | Valida campos y registra nuevo usuario, navega al mapa |
| Mapa | Marcadores del mapa | Muestra información del parqueadero |
| Mapa | "Reservar" | Abre modal de reserva |
| Modal | "Confirmar Reserva" | Navega a pantalla de pago |
| Modal | "Cancelar" | Cierra el modal |
| Pago | "Pagar $X" | Procesa el pago y muestra confirmación |
| Pago | "←" (atrás) | Regresa a la pantalla anterior |
| Confirmación | "Descargar Comprobante" | Simula descarga del ticket |
| Confirmación | "Ver Historial" | Muestra mensaje de funcionalidad en desarrollo |
| Admin | Menú lateral | Navega entre secciones administrativas |

## Enlace al Prototipo

Accede al prototipo funcional en: [https://gabrielsanchez73.github.io/find-and-pay-for-parking/](https://gabrielsanchez73.github.io/find-and-pay-for-parking/)

*Nota: Asegúrate de que GitHub Pages esté habilitado en Settings > Pages del repositorio.*

## Datos de Prueba

- **Login**: usuario@ejemplo.com / •••••••• (8 puntos)
- **Registro**: María González / maria@ejemplo.com / +57 300 123 4567 / ••••••••
- Parqueaderos: Centro ($2,500/h), Plaza ($3,000/h), Norte ($2,000/h), Express ($4,000/h - Ocupado)
- Ubicaciones: Calles de Bogotá, Colombia
- Reserva: Fecha 2024-01-15, Llegada 14:30, Salida 16:30 (2 horas)

## Criterios que cumple el prototipo de alto nivel

El prototipo desarrollado cumple con los criterios formales de un prototipo de alto nivel, ya que:

Representa la interfaz con fidelidad visual, siguiendo los lineamientos de diseño definidos.

Muestra navegación real entre pantallas con animaciones suaves y flujos principales del sistema.

Implementa interacciones avanzadas que permiten validar el comportamiento esperado del usuario durante la búsqueda, reserva y pago del parqueadero, incluyendo validaciones lógicas, estados de carga y feedback auditivo.

Cubre los requerimientos funcionales principales (RF-03 a RF-07) y los casos de uso centrales definidos en la Fase 1.

Simula estados dinámicos, validaciones robustas y transiciones fluidas, lo cual supera significativamente las capacidades de un prototipo estático en herramientas como Figma.

Incluye elementos de UX avanzados: tooltips contextuales, sonidos de feedback, responsividad completa y micro-interacciones.

Está documentado mediante capturas, descripción detallada del flujo, ilustración de interacciones y especificación técnica completa.

Se implementó con HTML5, CSS3 y JavaScript vanilla, cumpliendo la definición formal de prototipo de alta fidelidad según estándares IEEE y las pautas vistas en clase.

Por este motivo, el prototipo publicado en GitHub Pages se considera un prototipo funcional de alto nivel en total cumplimiento con el criterio de la actividad, excediendo los requisitos mínimos con características de UX profesional.

## Notas Técnicas

- Prototipo completamente funcional sin dependencias externas
- Diseño responsive optimizado para dispositivos móviles, tablets y desktop
- Simulación de datos en tiempo real con estados dinámicos
- Validaciones avanzadas de formularios (campos obligatorios, lógica de fechas/horas)
- Navegación automática entre pantallas con animaciones suaves
- Estados de carga visuales (spinners) durante procesos asíncronos
- Interactividad mejorada: tooltips en mapa, sonidos de feedback
- Transiciones fluidas y micro-animaciones para mejor UX

## Autor

Desarrollado como prototipo de alta fidelidad para proyecto académico.
