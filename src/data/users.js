import { ref, push, update, onValue } from 'firebase/database';
import { rtdb } from '../firebase';

const usuariosRef = ref(rtdb, 'usuarios');

export const ROLE_LABELS = {
  medico: 'Médico',
  enfermero: 'Enfermero',
  administrador: 'Administrador',
  farmaceutico: 'Farmacéutico',
};

const PREFIXES = {
  medico: 'MED',
  enfermero: 'ENF',
  administrador: 'ADM',
  farmaceutico: 'FAR',
};

export const isClinical = (role) => role === 'medico' || role === 'enfermero';

const randomInt = (max) => Math.floor(Math.random() * max);

// Mismo esquema que UsersController.create() en la app Flutter (US 1.2):
// clínicos → código legible + PIN de 6 dígitos; gestión → email + contraseña.
export function subscribeUsuarios(onData, onError) {
  return onValue(
    usuariosRef,
    (snapshot) => {
      const value = snapshot.val() || {};
      const list = Object.entries(value).map(([id, data]) => ({ id, ...data }));
      list.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
      onData(list);
    },
    onError,
  );
}

export async function createUsuario({ nombre, rol, email, password }) {
  const clinical = isClinical(rol);
  const codigo = clinical ? `${PREFIXES[rol]}-${randomInt(900) + 100}` : null;
  const pin = clinical
    ? Array.from({ length: 6 }, () => randomInt(10)).join('')
    : null;

  const payload = {
    nombre,
    rol,
    activo: true,
    creadoEn: new Date().toISOString(),
    ...(clinical
      ? { codigo, pin, bloqueado: false, intentosFallidos: 0 }
      : { email: email?.trim().toLowerCase(), password }),
  };

  await push(usuariosRef, payload);
  return { codigo, pin, email };
}

export async function updateUsuario(uid, { nombre, rol, codigo, pin, email, password }) {
  const clinical = isClinical(rol);
  const payload = {
    nombre,
    rol,
    ...(clinical
      ? {
          codigo,
          pin,
          email: null,
          password: null,
        }
      : {
          email: email?.trim().toLowerCase(),
          password,
          codigo: null,
          pin: null,
          bloqueado: null,
          intentosFallidos: null,
        }),
  };
  await update(ref(rtdb, `usuarios/${uid}`), payload);
}

export async function setUsuarioActive(uid, active) {
  await update(ref(rtdb, `usuarios/${uid}`), { activo: active });
}

export async function unblockUsuario(uid) {
  await update(ref(rtdb, `usuarios/${uid}`), {
    bloqueado: false,
    intentosFallidos: 0,
  });
}
