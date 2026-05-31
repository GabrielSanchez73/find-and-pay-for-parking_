# ParkingControl SOA

Sistema de gestión de parqueaderos basado en Arquitectura Orientada a Servicios (SOA), desarrollado como proyecto académico para la asignatura **Arquitectura de Software II — UNIMINUTO 2026-1**.

---

## Arquitectura del Sistema

El sistema está organizado en cuatro capas:

```
┌─────────────────────────────────────────┐
│        CAPA DE EXPERIENCIA              │
│   Frontend SPA (HTML5 / CSS3 / JS)      │
│   GitHub Pages                          │
└────────────────┬────────────────────────┘
                 │ HTTP + JWT
┌────────────────▼────────────────────────┐
│        CAPA DE INTEGRACIÓN              │
│       WSO2 Micro Integrator 4.x         │
│    API Gateway · RBAC · Rate Limiting   │
└────────────────┬────────────────────────┘
                 │ REST/JSON · SOAP/WSDL
┌────────────────▼────────────────────────┐
│        CAPA DE SERVICIOS SOA            │
│           Node.js + Express             │
│  /auth  /disponibilidad  /ingreso       │
│  /salida  /soap/disponibilidad          │
└────────────────┬────────────────────────┘
                 │ Sequelize ORM
┌────────────────▼────────────────────────┐
│          CAPA DE DATOS                  │
│            MySQL 8.x                    │
│  usuarios · espacios · registros          │
│  tarifas                                │
└─────────────────────────────────────────┘
```

---

## Demo en vivo

| Componente | URL |
|------------|-----|
| Frontend (GitHub Pages) | https://gabrielsanchez73.github.io/find-and-pay-for-parking_/ |
| Backend API REST (render) | https://find-and-pay-for-parking.onrender.com |

Deploy MySQL en Railway

---

## Estructura del Proyecto

```
find-and-pay-for-parking_/
│
├── index.html                  # Frontend SPA principal
├── demo.html                   # Versión demo autocontenida
├── script.js                   # Lógica del frontend + llamadas al API
├── styles.css                  # Estilos
├── config.js                   # URL base del API (dev/prod)
├── .nojekyll                   # Para GitHub Pages
│
├── parkingcontrol-backend/     # Backend SOA
│   ├── server.js               # Servidor Express principal
│   ├── .env                    # Variables de entorno (no subir a git)
│   ├── middleware/
│   │   └── auth.js             # Middleware JWT + RBAC
│   ├── models/
│   │   └── index.js            # Modelos Sequelize (MySQL)
│   ├── routes/
│   │   ├── auth.js             # POST /api/auth/login
│   │   ├── disponibilidad.js   # GET  /api/disponibilidad
│   │   ├── ingreso.js          # POST /api/ingreso
│   │   └── salida.js           # POST /api/salida
│   └── database/
│       └── schema.sql          # Esquema y datos iniciales
│
├── DEPLOY.md                   # Guía de despliegue
└── README.md                   # Este archivo
```

---

## Servicios SOA

| Servicio | Endpoint | Método | Autenticación | Descripción |
|----------|----------|--------|---------------|-------------|
| Autenticación | `/api/auth/login` | POST | No | Emite token JWT con rol |
| Disponibilidad | `/api/disponibilidad` | GET | JWT | Lista espacios disponibles |
| Resumen | `/api/disponibilidad/resumen` | GET | JWT | Conteo por estado para dashboard |
| Ingreso | `/api/ingreso` | POST | JWT + OPERADOR | Registra entrada y ocupa espacio |
| Salida | `/api/salida` | POST | JWT + OPERADOR | Calcula tarifa y libera espacio |
| SOAP | `/soap/disponibilidad` | SOAP | WSO2 | Consulta institucional vía WSDL |

---

## Seguridad

- **JWT** (JSON Web Tokens) con expiración de 8 horas
- **RBAC** — roles `ADMINISTRADOR` y `OPERADOR`
- **bcrypt** para hash de contraseñas (factor 12)
- **HTTPS** en producción vía Railway
- **Transacciones atómicas** en operaciones de ingreso/salida

---

## Instalación local

### Requisitos previos

- Node.js 20.x LTS
- MySQL 8.x
- npm 10.x

### 1. Clonar el repositorio

```bash
git clone https://github.com/GabrielSanchez73/find-and-pay-for-parking_.git
cd find-and-pay-for-parking_
```

### 2. Configurar el backend

```bash
cd parkingcontrol-backend
npm install
```

### 3. Crear el archivo `.env`

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=parking_user
DB_PASS=P@rking2026!
DB_NAME=parking_db
JWT_SECRET=parkingcontrol_jwt_secret_2026
JWT_EXPIRES=8h
```

### 4. Inicializar la base de datos

```bash
mysql -u root -p < database/schema.sql
npm run fix-passwords
```

### 5. Iniciar el servidor

```bash
npm start
# → ParkingControl SOA corriendo en puerto 3000
```

### 6. Abrir el frontend

Desde la raíz del repo:

```bash
npm start
# → http://localhost:61904
```

En local, `config.js` apunta a `http://localhost:3000/api`.

---

## Pruebas

Las pruebas de integración se ejecutan con colecciones de Postman contra los endpoints del API.

### Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@parking.com | parking123 |
| Operador | operador@parking.com | parking123 |

### Escenarios principales

| Escenario | Endpoint | HTTP esperado |
|-----------|----------|---------------|
| Login correcto | POST `/api/auth/login` | 200 |
| Login incorrecto | POST `/api/auth/login` | 401 |
| Consultar disponibilidad sin token | GET `/api/disponibilidad` | 401 |
| Consultar disponibilidad con token | GET `/api/disponibilidad` | 200 |
| Registrar ingreso | POST `/api/ingreso` | 201 |
| Ingreso en espacio ocupado | POST `/api/ingreso` | 409 |
| Registrar salida | POST `/api/salida` | 200 |

---

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | HTML5, CSS3, JavaScript vanilla (SPA) |
| Backend | Node.js 20, Express 4 |
| ORM | Sequelize 6 |
| Base de datos | MySQL 8 |
| Autenticación | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| Integración SOA | WSO2 Micro Integrator 4.x |
| Despliegue backend | Railway |
| Despliegue frontend | GitHub Pages |

---

## Equipo

| Nombre | Rol |
|--------|-----|
| Gabriel Alejandro Sanchez Mora | Líder de Arquitectura / Analista |
| Jeisson Andres Villarraga Reyes | Desarrollador |
| Integrante 3 | QA / Aseguramiento de Calidad |

---

## Contexto Académico

- **Asignatura:** Arquitectura de Software II — G01
- **Universidad:** Corporación Universitaria Minuto de Dios (UNIMINUTO)
- **Docente:** Fabio Andres Hernandez Rueda
- **Periodo:** 2026-1
- **Fase:** 3 — Implementación y Mantenimiento del Servicio SOA
