const LOCAL_API = 'http://localhost:3000/api';
const PRODUCTION_API = 'https://find-and-pay-for-parking.onrender.com/api';

const API_BASE =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? LOCAL_API
    : PRODUCTION_API;
