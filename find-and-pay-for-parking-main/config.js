// URL del backend SOA — cambiar PRODUCTION_API al desplegar en Render/Railway
const PRODUCTION_API = 'https://TU-BACKEND.onrender.com/api';

const API_BASE = (function () {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  return PRODUCTION_API;
})();
