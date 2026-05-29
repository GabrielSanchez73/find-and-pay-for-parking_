// Backend SOA — en local SIEMPRE puerto 3000 (el frontend puede usar 61904 u otro)
const PRODUCTION_API = 'https://TU-BACKEND.onrender.com/api';

const API_BASE = (function () {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  return PRODUCTION_API;
})();
