import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDocs,
  doc, deleteDoc, updateDoc, query, orderBy, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── CONFIG ───────────────────────────────────────
const firebaseConfig = {
  apiKey:    "AIzaSyCs1tRbJqvR3lQv1I3Q-3D_PZUMyMoyXkA",
  authDomain:"bta-rojas.firebaseapp.com",
  projectId: "bta-rojas",
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

let adminActivo = false;
let editandoId  = null;

// ── MODAL ────────────────────────────────────────
window.toggleModal = () => {
  const overlay = document.getElementById('modal-overlay');
  const candado = document.getElementById('btn-candado');
  if (adminActivo) { doLogout(); return; }
  const visible = overlay.classList.toggle('visible');
  candado.classList.toggle('abierto', visible);
  if (visible) setTimeout(() => document.getElementById('inp-email').focus(), 100);
};

window.cerrarModal = () => {
  document.getElementById('modal-overlay').classList.remove('visible');
  document.getElementById('btn-candado').classList.remove('abierto');
};

window.cerrarModalSiFondo = (e) => {
  if (e.target === document.getElementById('modal-overlay')) window.cerrarModal();
};

document.addEventListener('keydown', e => { if (e.key === 'Escape') window.cerrarModal(); });

// ── AUTH ─────────────────────────────────────────
window.doLogin = async () => {
  const email = document.getElementById('inp-email').value.trim();
  const pass  = document.getElementById('inp-pass').value;
  const err   = document.getElementById('login-error');
  const btn   = document.getElementById('btn-login');
  err.style.display = 'none';
  btn.textContent = 'Ingresando…';
  btn.disabled = true;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    window.cerrarModal();
    document.getElementById('inp-pass').value = '';
  } catch {
    err.textContent   = 'Email o contraseña incorrectos.';
    err.style.display = 'block';
  } finally {
    btn.textContent = 'Ingresar';
    btn.disabled = false;
  }
};

async function doLogout() {
  await signOut(auth);
}
window.doLogout = doLogout;

onAuthStateChanged(auth, user => {
  adminActivo = !!user;
  document.getElementById('stats-admin').classList.toggle('visible', adminActivo);
  document.getElementById('barra-admin').classList.toggle('visible', adminActivo);
  const candado = document.getElementById('btn-candado');
  candado.title = adminActivo ? 'Cerrar sesión' : 'Acceso administrador';
  candado.classList.toggle('abierto', adminActivo);
  candado.innerHTML = adminActivo
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
  cargarNovedades();
});

// ── FIRESTORE ────────────────────────────────────
async function cargarNovedades() {
  try {
    const q    = query(collection(db, 'novedades'), orderBy('fecha', 'desc'));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderMuro(items);
  } catch(e) {
    console.warn('No se pudieron cargar novedades de Firebase:', e.message);
  }
}

window.publicar = async () => {
  const titulo = document.getElementById('inp-titulo').value.trim();
  const cuerpo = document.getElementById('inp-cuerpo').value.trim();
  const err    = document.getElementById('form-error');
  if (!titulo) { err.textContent = 'Agregá un título.';     err.style.display='block'; return; }
  if (!cuerpo) { err.textContent = 'Escribí el contenido.'; err.style.display='block'; return; }
  err.style.display = 'none';
  const btn = document.getElementById('btn-pub');
  btn.textContent = 'Guardando…'; btn.disabled = true;
  try {
    if (editandoId) {
      await updateDoc(doc(db, 'novedades', editandoId), { titulo, cuerpo, editado: true });
      editandoId = null;
      document.getElementById('form-titulo-label').textContent = 'Nueva novedad';
      btn.textContent = 'Publicar';
    } else {
      await addDoc(collection(db, 'novedades'), { titulo, cuerpo, fecha: Timestamp.now(), editado: false });
    }
    document.getElementById('inp-titulo').value = '';
    document.getElementById('inp-cuerpo').value = '';
    await cargarNovedades();
  } catch(e) {
    err.textContent = 'Error al guardar. Revisá tu conexión.';
    err.style.display = 'block';
  } finally {
    btn.textContent = editandoId ? 'Guardar cambios' : 'Publicar';
    btn.disabled = false;
  }
};

window.eliminar = async (id) => {
  if (!confirm('¿Eliminar esta novedad?')) return;
  await deleteDoc(doc(db, 'novedades', id));
  await cargarNovedades();
};

window.editar = (id, titulo, cuerpo) => {
  editandoId = id;
  document.getElementById('inp-titulo').value = titulo;
  document.getElementById('inp-cuerpo').value = cuerpo;
  document.getElementById('form-titulo-label').textContent = 'Editar novedad';
  document.getElementById('btn-pub').textContent = 'Guardar cambios';
  document.getElementById('barra-admin').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.cancelarEdicion = () => {
  editandoId = null;
  document.getElementById('inp-titulo').value = '';
  document.getElementById('inp-cuerpo').value = '';
  document.getElementById('form-titulo-label').textContent = 'Nueva novedad';
  document.getElementById('btn-pub').textContent = 'Publicar';
  document.getElementById('form-error').style.display = 'none';
};

// ── RENDER ───────────────────────────────────────
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderMuro(items) {
  const muro = document.getElementById('nov-muro');
  if (!items.length) {
    muro.innerHTML = '<p class="nov-vacio">Próximamente habrá novedades por aquí ✦</p>';
    return;
  }
  muro.innerHTML = items.map(item => {
    const fecha = item.fecha?.toDate
      ? item.fecha.toDate().toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })
      : '';
    const acciones = adminActivo ? `
      <div class="nov-card-acciones">
        <button onclick="editar('${item.id}', ${JSON.stringify(esc(item.titulo))}, ${JSON.stringify(esc(item.cuerpo))})">Editar</button>
        <button class="borrar" onclick="eliminar('${item.id}')">Eliminar</button>
      </div>` : '';
    return `
      <article class="nov-card">
        <div class="nov-card-tira"></div>
        <div class="nov-card-body">
          <div class="nov-card-meta">
            <span class="nov-fecha">${fecha}</span>
            ${item.editado ? '<span class="nov-editado">editado</span>' : ''}
          </div>
          <h3 class="nov-card-titulo">${esc(item.titulo)}</h3>
          <p class="nov-card-cuerpo">${esc(item.cuerpo).replace(/\n/g,'<br>')}</p>
          ${acciones}
        </div>
      </article>`;
  }).join('');
}
