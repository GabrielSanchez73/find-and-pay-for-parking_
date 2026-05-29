# ParkingControl — Guia de integracion SOA

## Arquitectura final

```
[GitHub Pages]                    [Render / Railway]              [MySQL]
 index.html  ──fetch HTTPS──►  parkingcontrol-backend  ◄──►  parking_db
 demo.html        JWT              Express REST API
 config.js                         Sequelize ORM
 script.js
```

| Capa | Tecnologia | Rol |
|------|-----------|-----|
| Frontend | HTML + CSS + JS vanilla | UI estatica en GitHub Pages |
| API Gateway (opcional) | WSO2 | Proxy SOA futuro |
| Backend | Node.js + Express | Servicios REST autenticados |
| Auth | JWT + bcrypt | Login y autorizacion |
| Datos | MySQL + Sequelize | Persistencia real |

---

## Estructura del proyecto

```
find-and-pay-for-parking-main/
├── index.html          # Entrada principal (GitHub Pages)
├── demo.html           # Version alternativa con pantallas SPA
├── config.js           # URL del backend (local vs produccion)
├── script.js           # Logica conectada al API real
├── styles.css          # Estilos (sin cambios)
└── README.md

parkingcontrol-backend/
├── .env
├── server.js
├── package.json
├── middleware/auth.js
├── models/index.js
├── routes/
│   ├── auth.js
│   ├── disponibilidad.js
│   ├── ingreso.js
│   └── salida.js
└── database/schema.sql
```

---

## Archivos modificados y que hacen

### `config.js` (nuevo)
Define `API_BASE`:
- Local: `http://localhost:3000/api`
- Produccion: cambiar `PRODUCTION_API` por la URL de Render/Railway

### `script.js` (reescrito)
| Eliminado | Reemplazado por |
|-----------|-----------------|
| `simulateLogin()` | `processLogin()` → `loginReal()` |
| `simulateRegister()` | `processRegister()` → `registerReal()` |
| `simulateRealTimeData()` | `cargarDisponibilidadReal()` + `iniciarActualizacionAutomatica()` |
| `Math.random()` en disponibilidad | GET `/disponibilidad/resumen` |
| `setTimeout` en pago | `registrarSalida()` real |
| `sessionStorage` | `localStorage` (JWT persiste en GitHub Pages) |

### `index.html` / `demo.html`
- Emojis visuales eliminados (reemplazados por texto: P, TC, PS, BD)
- Script inline eliminado → carga `config.js` + `script.js`
- Contadores de disponibilidad en el mapa
- Credenciales de prueba actualizadas

### `parkingcontrol-backend/server.js`
- CORS configurado para GitHub Pages y localhost

---

## Flujos funcionales

### Autenticacion
1. Usuario ingresa email/password
2. `POST /api/auth/login` → recibe JWT
3. Token guardado en `localStorage` (`parking_jwt`)
4. Datos de usuario en `localStorage` (`parking_user`)
5. Al recargar, `restaurarSesion()` valida el token contra el API

### Disponibilidad
1. Tras login, `cargarDisponibilidadReal()` cada 30 segundos
2. `GET /api/disponibilidad/resumen` (Bearer token)
3. Actualiza contadores y colores de marcadores del mapa

### Reserva (= Ingreso SOA)
1. Usuario elige parqueadero → modal de reserva
2. "Confirmar Reserva" → `POST /api/ingreso` con placa y espacioId
3. Backend marca espacio como OCUPADO y genera ticketId

### Pago (= Salida SOA)
1. "Pagar" → `POST /api/salida` con ticketId
2. Backend calcula minutos, tarifa y totalPagar
3. Libera espacio como DISPONIBLE
4. Muestra confirmacion con total real

---

## Endpoints utilizados

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login JWT |
| POST | `/api/auth/register` | No | Registro |
| GET | `/api/disponibilidad/resumen` | Si | Conteo disponibles/ocupados |
| GET | `/api/disponibilidad` | Si | Lista espacios disponibles |
| POST | `/api/ingreso` | Si | Registrar entrada vehiculo |
| GET | `/api/ingreso/:placa` | Si | Consultar vehiculo activo |
| POST | `/api/salida` | Si | Registrar salida y cobro |
| GET | `/api/health` | No | Health check |

### Ejemplos de respuestas JSON

**Login exitoso:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "rol": "ADMINISTRADOR",
  "nombre": "Admin ParkingControl",
  "email": "admin@parking.com"
}
```

**Disponibilidad resumen:**
```json
{ "disponibles": 5, "ocupados": 2, "reservados": 0, "total": 7 }
```

**Ingreso:**
```json
{
  "ticketId": 1,
  "placa": "ABC123",
  "espacio": "A01",
  "zona": "A",
  "horaIngreso": "2026-05-28T15:00:00.000Z",
  "operador": "Admin ParkingControl"
}
```

**Salida:**
```json
{
  "ticketId": 1,
  "placa": "ABC123",
  "espacio": "A01",
  "horaIngreso": "2026-05-28T15:00:00.000Z",
  "horaSalida": "2026-05-28T16:05:00.000Z",
  "minutosTotal": 65,
  "horas": 2,
  "valorHora": 3000,
  "totalPagar": 6000,
  "moneda": "COP"
}
```

---

## Correr localmente

### 1. MySQL
```bash
mysql -u root -p < parkingcontrol-backend/database/schema.sql
```

Crear usuario si no existe:
```sql
CREATE USER 'parking_user'@'localhost' IDENTIFIED BY 'P@rking2026!';
GRANT ALL ON parking_db.* TO 'parking_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend
```bash
cd parkingcontrol-backend
npm install
npm start
```
Verificar: http://localhost:3000/api/health

### 3. Frontend
Abrir con servidor local (evita problemas CORS con file://):
```bash
cd find-and-pay-for-parking-main
npx serve .
```
Abrir: http://localhost:3000 o http://localhost:8080

`config.js` detecta localhost y apunta a `http://localhost:3000/api`.

---

## Publicar en GitHub Pages

1. Subir carpeta `find-and-pay-for-parking-main/` al repo
2. Settings → Pages → Source: branch `main`, folder `/root` o `/docs`
3. URL resultante: `https://TU-USUARIO.github.io/find-and-pay-for-parking/`

**Importante:** editar `config.js` antes de publicar:
```javascript
const PRODUCTION_API = 'https://TU-BACKEND.onrender.com/api';
```

---

## Desplegar backend en Render (gratis)

1. Crear cuenta en https://render.com
2. New → Web Service → conectar repo GitHub
3. Root Directory: `parkingcontrol-backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Variables de entorno:
   - `PORT` = 10000 (Render lo asigna)
   - `DATABASE_URL` = URL de MySQL remoto (ver abajo)
   - `JWT_SECRET` = parkingcontrol_jwt_secret_2026
   - `JWT_EXPIRES` = 8h
   - `FRONTEND_URL` = https://TU-USUARIO.github.io

7. Copiar URL del servicio (ej. `https://parkingcontrol-api.onrender.com`)
8. Actualizar `PRODUCTION_API` en `config.js`

### MySQL remoto (gratis)
Opciones: **PlanetScale** (limitado), **Railway MySQL**, **Aiven free tier**, **FreeSQLDatabase**.

En Railway:
1. New Project → Add MySQL
2. Copiar `MYSQL_URL` como `DATABASE_URL` en Render
3. Ejecutar `schema.sql` contra la BD remota
4. Agregar `DB_SSL=true` si el proveedor lo requiere

---

## Demo para el profesor

### Que abrir
- **Visual (siempre funciona):** https://gabrielsanchez73.github.io/find-and-pay-for-parking/
- **Funcional completo:** requiere backend desplegado + `config.js` actualizado

### Pasos de la demo
1. Abrir la URL de GitHub Pages
2. Login: `admin@parking.com` / `parking123`
3. Ver contadores de disponibilidad en el mapa (datos reales del backend)
4. Clic en un parqueadero → "Confirmar Reserva" (registra ingreso real)
5. Pantalla de pago → "Pagar" (registra salida y muestra total calculado)
6. Verificar que los contadores de disponibilidad se actualizan

### Credenciales
| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@parking.com | parking123 |
| Operador | operador@parking.com | parking123 |

---

## Limitaciones actuales

| Funcional | Simulado |
|-----------|----------|
| Login JWT real | Metodos de pago (TC/PSE/Nequi) |
| Disponibilidad en tiempo real | Mapa geografico real (SVG estatico) |
| Ingreso/salida con tarifas | Busqueda por ubicacion |
| Registro de usuarios | Panel admin (estadisticas hardcodeadas) |
| Persistencia MySQL | Descarga real de PDF |
| CORS cross-origin | Pasarela de pagos bancaria |
| | Notificaciones push |
| | WSO2 API Gateway (preparado en .env) |

### Para produccion real faltaria
- HTTPS obligatorio en todo el stack
- Refresh tokens y revocacion JWT
- Rate limiting y validacion de entrada robusta
- Pasarela de pagos (PayU, Wompi, Stripe)
- Geolocalizacion con mapas reales (Google Maps / OSM)
- Tests automatizados
- CI/CD y monitoreo
- WSO2 como API Gateway delante de los microservicios
