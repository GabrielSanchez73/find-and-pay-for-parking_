// ParkingControl SOA — Frontend conectado al backend REST + JWT

const TOKEN_KEY = 'parking_jwt';
const USER_KEY = 'parking_user';
const TICKET_KEY = 'ultimo_ticket';

const PARKING_ESPACIOS = {
  'Parqueadero Centro': 1,
  'Parking Plaza': 2,
  'Estacionamiento Norte': 3,
  'Parking Express': 4
};

let currentScreen = 'login-screen';
let currentParking = '';
let currentUsuario = null;
let refreshIntervalId = null;

// --- Deteccion de layout (index.html modal vs demo.html pantallas) ---

function isModalLayout() {
  return !!document.getElementById('login-modal');
}

function isScreenLayout() {
  return !!document.getElementById('login-screen');
}

// --- Token y sesion (localStorage para GitHub Pages) ---

function guardarToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function obtenerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function guardarUsuario(usuario) {
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  currentUsuario = usuario;
}

function obtenerUsuario() {
  if (currentUsuario) return currentUsuario;
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TICKET_KEY);
  currentUsuario = null;
  if (refreshIntervalId) clearInterval(refreshIntervalId);
  if (isModalLayout()) {
    document.getElementById('login-modal').style.display = 'flex';
  } else if (isScreenLayout()) {
    showScreen('login-screen');
  }
}

function actualizarUIUsuario(usuario) {
  document.querySelectorAll('.user-avatar').forEach(el => {
    el.textContent = usuario.nombre.charAt(0).toUpperCase();
  });
  document.querySelectorAll('.user-menu span, .header-right .user-menu span').forEach(el => {
    if (el.classList.contains('user-avatar')) return;
    el.textContent = usuario.nombre;
  });
}

// --- Cliente HTTP ---

async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = obtenerToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

function setButtonLoading(btn, loading, loadingText) {
  if (!btn) return;
  if (loading) {
    btn.dataset.originalHtml = btn.innerHTML;
    btn.innerHTML = loadingText || 'Cargando...';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.originalHtml || btn.textContent;
    btn.disabled = false;
  }
}

// --- Autenticacion ---

async function loginReal(email, password) {
  const { ok, data } = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (ok && data.token) {
    guardarToken(data.token);
    guardarUsuario({ nombre: data.nombre, email: data.email, rol: data.rol });
    actualizarUIUsuario(data);
    return { success: true, data };
  }
  return { success: false, error: data?.error || 'Credenciales invalidas' };
}

async function registerReal(nombre, email, password) {
  const { ok, status, data } = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nombre, email, password, rol: 'OPERADOR' })
  });
  if (ok) return { success: true, data };
  return { success: false, error: data?.error || (status === 409 ? 'Email ya registrado' : 'Error al registrar') };
}

async function processLogin() {
  const email = document.querySelector('#login-form input[type="email"]')?.value?.trim();
  const password = document.querySelector('#login-form input[type="password"]')?.value;
  const btn = document.querySelector('#login-form .btn-primary');

  if (!email || !password) {
    showNotification('Complete email y contrasena', 'error');
    return;
  }

  setButtonLoading(btn, true, 'Iniciando sesion...');
  try {
    const result = await loginReal(email, password);
    if (result.success) {
      entrarAlMapa();
      iniciarActualizacionAutomatica();
      showNotification(`Bienvenido, ${result.data.nombre}`, 'success');
      playSound(800, 0.2);
    } else {
      showNotification(result.error, 'error');
    }
  } catch (err) {
    showNotification('No se pudo conectar al servidor. Verifique que el backend este activo.', 'error');
    console.error(err);
  } finally {
    setButtonLoading(btn, false);
  }
}

async function processRegister() {
  const nombre = document.querySelector('#register-form input[placeholder="Nombre completo"]')?.value?.trim();
  const email = document.querySelector('#register-form input[type="email"]')?.value?.trim();
  const phoneInput = document.querySelector('#register-form input[type="tel"]');
  const phone = phoneInput?.value?.trim();
  const password = document.querySelector('#register-form input[type="password"]')?.value;
  const btn = document.querySelector('#register-form .btn-primary');

  if (!nombre || !email || !password) {
    showNotification('Complete nombre, email y contrasena', 'error');
    return;
  }
  if (phoneInput && !phone) {
    showNotification('Complete el telefono', 'error');
    return;
  }

  setButtonLoading(btn, true, 'Creando cuenta...');
  try {
    const result = await registerReal(nombre, email, password);
    if (result.success) {
      const loginResult = await loginReal(email, password);
      if (loginResult.success) {
        entrarAlMapa();
        iniciarActualizacionAutomatica();
        showNotification(`Cuenta creada. Bienvenido, ${nombre}`, 'success');
        playSound(800, 0.2);
      }
    } else {
      showNotification(result.error, 'error');
    }
  } catch (err) {
    showNotification('Error de conexion con el servidor', 'error');
    console.error(err);
  } finally {
    setButtonLoading(btn, false);
  }
}

function entrarAlMapa() {
  if (isModalLayout()) {
    document.getElementById('login-modal').style.display = 'none';
  } else {
    showScreen('main-screen');
  }
}

async function restaurarSesion() {
  const token = obtenerToken();
  const usuario = obtenerUsuario();
  if (!token || !usuario) return false;

  currentUsuario = usuario;
  actualizarUIUsuario(usuario);

  const { ok } = await apiRequest('/disponibilidad/resumen');
  if (ok) {
    entrarAlMapa();
    iniciarActualizacionAutomatica();
    return true;
  }

  cerrarSesion();
  return false;
}

// --- Disponibilidad ---

async function cargarDisponibilidadReal() {
  if (!obtenerToken()) return;

  try {
    const { ok, data } = await apiRequest('/disponibilidad/resumen');
    if (!ok) return;

    const textoDisp = `${data.disponibles} disponibles`;
    const textoOcup = `${data.ocupados} ocupados`;

    document.querySelectorAll('.spaces-count, .available-count, .spots').forEach(el => {
      el.textContent = textoDisp;
    });
    document.querySelectorAll('.occupied-count').forEach(el => {
      el.textContent = textoOcup;
    });

    const statEspacios = document.querySelector('.stat-card .stat-content h3');
    if (statEspacios && statEspacios.closest('.stat-card')?.querySelector('.stat-content p')?.textContent?.includes('Espacios')) {
      statEspacios.textContent = data.total;
    }

    const pct = data.total > 0 ? data.disponibles / data.total : 0;
    document.querySelectorAll('.parking-marker').forEach(marker => {
      marker.style.borderColor = pct > 0.3 ? '#28A745' : pct > 0.1 ? '#FFC107' : '#DC3545';
    });

    document.querySelectorAll('.parking-item').forEach((item, i) => {
      const btn = item.querySelector('.btn-reserve');
      if (btn && data.disponibles <= i) {
        btn.textContent = 'Sin cupo';
        btn.disabled = true;
      } else if (btn) {
        btn.textContent = 'Reservar';
        btn.disabled = false;
      }
    });
  } catch (err) {
    console.error('Error cargando disponibilidad:', err);
  }
}

function iniciarActualizacionAutomatica() {
  if (refreshIntervalId) clearInterval(refreshIntervalId);
  cargarDisponibilidadReal();
  refreshIntervalId = setInterval(cargarDisponibilidadReal, 30000);
}

// --- Ingreso y salida ---

function extraerPlacaYTipo() {
  const select = document.getElementById('vehicle-select') ||
    document.querySelector('.reservation-form select:last-of-type') ||
    document.querySelector('.reservation-form select');
  const texto = select?.selectedOptions?.[0]?.textContent || 'Carro ABC123';
  const placaMatch = texto.match(/([A-Z0-9]{5,7})\s*$/i);
  const placa = placaMatch ? placaMatch[1].toUpperCase() : 'ABC123';
  const tipo = /moto/i.test(texto) ? 'MOTO' : 'CARRO';
  return { placa, tipoVehiculo: tipo };
}

async function registrarIngreso(placa, espacioId, tipoVehiculo = 'CARRO') {
  const { ok, data } = await apiRequest('/ingreso', {
    method: 'POST',
    body: JSON.stringify({ placa, espacioId, tipoVehiculo })
  });
  if (ok) {
    localStorage.setItem(TICKET_KEY, String(data.ticketId));
    await cargarDisponibilidadReal();
    return data;
  }
  throw new Error(data?.error || 'Error al registrar ingreso');
}

async function registrarSalida(ticketId) {
  const { ok, data } = await apiRequest('/salida', {
    method: 'POST',
    body: JSON.stringify({ ticketId: Number(ticketId) })
  });
  if (ok) {
    await cargarDisponibilidadReal();
    return data;
  }
  throw new Error(data?.error || 'Error al registrar salida');
}

function actualizarResumenPago(totalPagar, placa, espacio) {
  document.querySelectorAll('.summary-item.total span:last-child, .price-item.total span:last-child').forEach(el => {
    el.textContent = `$${Number(totalPagar).toLocaleString('es-CO')}`;
  });
  document.querySelectorAll('.btn-large, .payment-footer .btn-primary').forEach(btn => {
    if (btn.textContent.includes('Pagar')) {
      btn.textContent = `Pagar $${Number(totalPagar).toLocaleString('es-CO')}`;
    }
  });
  const placaEl = document.querySelector('.detail-item .value');
  if (placaEl && placa) {
    document.querySelectorAll('.detail-item').forEach(item => {
      const label = item.querySelector('.label');
      if (label?.textContent.includes('Codigo')) {
        item.querySelector('.value').textContent = `#TKT${localStorage.getItem(TICKET_KEY)}`;
      }
      if (label?.textContent.includes('Vehiculo') || label?.textContent.includes('Placa')) {
        item.querySelector('.value').textContent = placa;
      }
      if (label?.textContent.includes('Parqueadero') && espacio) {
        item.querySelector('.value').textContent = `${currentParking} (${espacio})`;
      }
    });
  }
}

// --- Navegacion UI (sin cambiar estructura visual) ---

function switchTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginBtn = document.querySelector('.tab-btn[onclick="switchTab(\'login\')"]');
  const registerBtn = document.querySelector('.tab-btn[onclick="switchTab(\'register\')"]');

  if (tab === 'login') {
    loginForm?.classList.add('active');
    registerForm?.classList.remove('active');
    loginBtn?.classList.add('active');
    registerBtn?.classList.remove('active');
  } else {
    loginForm?.classList.remove('active');
    registerForm?.classList.add('active');
    loginBtn?.classList.remove('active');
    registerBtn?.classList.add('active');
  }
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    currentScreen = screenId;
  }
}

function showReservationModal(parkingName) {
  currentParking = parkingName;
  const nameEl = document.getElementById('parking-name');
  if (nameEl) nameEl.textContent = parkingName;
  const modal = document.getElementById('reservation-modal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
  playSound(600, 0.1);
}

function closeModal() {
  const modal = document.getElementById('reservation-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

async function goToPayment() {
  const startTime = document.getElementById('start-time')?.value;
  const endTime = document.getElementById('end-time')?.value;
  const startDate = document.getElementById('reservation-date')?.value;

  if (startDate && startTime && endTime && startTime >= endTime) {
    showNotification('La hora de salida debe ser posterior a la de llegada', 'error');
    return;
  }

  const espacioId = PARKING_ESPACIOS[currentParking] || 1;
  const { placa, tipoVehiculo } = extraerPlacaYTipo();

  const confirmBtn = document.querySelector('#reservation-modal .btn-primary');
  setButtonLoading(confirmBtn, true, 'Registrando ingreso...');

  try {
    const ingreso = await registrarIngreso(placa, espacioId, tipoVehiculo);
    closeModal();

    if (document.getElementById('payment-modal')) {
      document.getElementById('payment-modal').style.display = 'flex';
    } else {
      showScreen('payment-screen');
    }

    actualizarResumenPago(3000, ingreso.placa, ingreso.espacio);
    showNotification(`Ingreso registrado. Ticket #${ingreso.ticketId}`, 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  } finally {
    setButtonLoading(confirmBtn, false);
  }
}

async function processPayment() {
  const ticketId = localStorage.getItem(TICKET_KEY);
  if (!ticketId) {
    showNotification('No hay ticket activo. Confirme una reserva primero.', 'error');
    return;
  }

  const paymentBtn = document.querySelector('.btn-large') ||
    document.querySelector('.payment-footer .btn-primary');
  setButtonLoading(paymentBtn, true, 'Procesando salida...');

  try {
    const salida = await registrarSalida(ticketId);

    if (document.getElementById('payment-modal')) {
      document.getElementById('payment-modal').style.display = 'none';
      document.getElementById('confirmation-modal').style.display = 'flex';
    } else {
      showScreen('confirmation-screen');
    }

    actualizarResumenPago(salida.totalPagar, salida.placa, salida.espacio);
    showNotification(`Salida registrada. Total: $${Number(salida.totalPagar).toLocaleString('es-CO')} COP`, 'success');
    playSound(800, 0.2);
  } catch (err) {
    showNotification(err.message, 'error');
  } finally {
    setButtonLoading(paymentBtn, false);
  }
}

function goBack() {
  if (document.getElementById('payment-modal')) {
    document.getElementById('payment-modal').style.display = 'none';
    document.getElementById('confirmation-modal').style.display = 'none';
  } else if (currentScreen === 'payment-screen' || currentScreen === 'confirmation-screen') {
    showScreen('main-screen');
  }
}

function downloadTicket() {
  const ticketId = localStorage.getItem(TICKET_KEY);
  if (document.getElementById('confirmation-modal')) {
    document.getElementById('confirmation-modal').style.display = 'none';
  }
  showNotification(ticketId ? `Comprobante ticket #${ticketId} listo` : 'Comprobante generado', 'success');
}

function viewHistory() {
  if (document.getElementById('confirmation-modal')) {
    document.getElementById('confirmation-modal').style.display = 'none';
  }
  showNotification('Historial completo disponible en el panel administrativo', 'info');
}

function selectPaymentMethod(element) {
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
  element.classList.add('active');
}

function showAdminPanel() {
  if (document.getElementById('admin-screen')) {
    showScreen('admin-screen');
  }
}

function playSound(frequency, duration) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch { /* sin audio */ }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `<span>${message}</span><button type="button" aria-label="Cerrar">&times;</button>`;
  notification.style.cssText = `
    position:fixed;top:20px;right:20px;z-index:10000;padding:14px 18px;border-radius:8px;
    display:flex;align-items:center;gap:12px;max-width:400px;box-shadow:0 4px 12px rgba(0,0,0,.15);
    background:${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
    color:${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
  `;
  notification.querySelector('button').onclick = () => notification.remove();
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
}

function addInteractivity() {
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => selectPaymentMethod(opt));
  });

  const modal = document.getElementById('reservation-modal');
  if (modal) {
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  }

  const userMenu = document.querySelector('.user-menu');
  if (userMenu && !userMenu.dataset.bound) {
    userMenu.dataset.bound = '1';
    userMenu.addEventListener('click', e => {
      e.stopPropagation();
      const existing = document.querySelector('.user-dropdown');
      if (existing) { existing.remove(); return; }

      const menu = document.createElement('div');
      menu.className = 'user-dropdown';
      menu.innerHTML = `
        <div class="dropdown-item" data-action="admin">Administracion</div>
        <div class="dropdown-item" data-action="logout">Cerrar Sesion</div>`;
      menu.style.cssText = 'position:absolute;top:100%;right:0;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.15);padding:8px 0;min-width:160px;z-index:1000;';
      menu.querySelectorAll('.dropdown-item').forEach(item => {
        item.style.cssText = 'padding:10px 16px;cursor:pointer;font-size:14px;';
        item.onmouseenter = () => item.style.background = '#f8f9fa';
        item.onmouseleave = () => item.style.background = 'transparent';
        item.onclick = () => {
          if (item.dataset.action === 'admin') showAdminPanel();
          if (item.dataset.action === 'logout') { cerrarSesion(); showNotification('Sesion cerrada', 'info'); }
          menu.remove();
        };
      });
      userMenu.style.position = 'relative';
      userMenu.appendChild(menu);
    });
  }
}

function wireLoginButtons() {
  const loginBtn = document.querySelector('#login-form .btn-primary');
  const registerBtn = document.querySelector('#register-form .btn-primary');

  if (loginBtn && !loginBtn.dataset.apiBound) {
    loginBtn.dataset.apiBound = '1';
    loginBtn.removeAttribute('onclick');
    loginBtn.addEventListener('click', e => { e.preventDefault(); processLogin(); });
  }
  if (registerBtn && !registerBtn.dataset.apiBound) {
    registerBtn.dataset.apiBound = '1';
    registerBtn.removeAttribute('onclick');
    registerBtn.addEventListener('click', e => { e.preventDefault(); processRegister(); });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  wireLoginButtons();
  addInteractivity();

  const sesionOk = await restaurarSesion();
  if (!sesionOk && obtenerToken()) {
    showNotification('Sesion expirada. Inicie sesion nuevamente.', 'info');
  }
});

window.switchTab = switchTab;
window.showScreen = showScreen;
window.processLogin = processLogin;
window.processRegister = processRegister;
window.showReservationModal = showReservationModal;
window.closeModal = closeModal;
window.goToPayment = goToPayment;
window.processPayment = processPayment;
window.goBack = goBack;
window.downloadTicket = downloadTicket;
window.viewHistory = viewHistory;
window.showAdminPanel = showAdminPanel;
window.selectPaymentMethod = selectPaymentMethod;
window.loginReal = loginReal;
window.cargarDisponibilidadReal = cargarDisponibilidadReal;
window.registrarIngreso = registrarIngreso;
window.registrarSalida = registrarSalida;
