import { ref, set, update, onValue } from 'firebase/database';
import { rtdb } from '../firebase';

const pacientesRef = ref(rtdb, 'pacientes');

export const STATUS_LABELS = {
  critico: 'Crítico',
  atencion: 'Atención',
  estable: 'Estable',
};

export const STATUS_DOT = {
  critico: 'bg-red',
  atencion: 'bg-yellow',
  estable: 'bg-green',
};

export function subscribePacientes(onData, onError) {
  return onValue(
    pacientesRef,
    (snapshot) => {
      const value = snapshot.val() || {};
      const list = Object.entries(value).map(([id, data]) => ({ id, ...data }));
      list.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
      onData(list);
    },
    onError,
  );
}

const randomInt = (max) => Math.floor(Math.random() * max);

// Mismo esquema que PatientsController.admit() en la app Flutter (US 2.1):
// el patientId es legible y también es el contenido del QR.
export async function admitirPaciente({ nombre, edad, habitacion, cama, diagnostico, creadoPor }) {
  const bedUpper = cama.toUpperCase();
  const id = `${habitacion}${bedUpper}-${randomInt(900) + 100}`;
  const now = new Date().toISOString();

  await set(ref(rtdb, `pacientes/${id}`), {
    id,
    nombre,
    edad,
    habitacion,
    cama: bedUpper,
    diagnosticos: [diagnostico],
    estado: 'estable',
    activo: true,
    creadoPor: creadoPor || null,
    creadoEn: now,
    signosActuales: {
      hr: 0,
      spo2: 0,
      sistolica: 0,
      diastolica: 0,
      temperatura: 0,
      frecuenciaRespiratoria: 0,
      actualizadoEn: now,
      origen: 'admision',
    },
  });

  return id;
}

export async function setPacienteActive(id, active) {
  await update(ref(rtdb, `pacientes/${id}`), { activo: active });
}

export async function updatePaciente(id, { nombre, edad, habitacion, cama, diagnosticos, estado, medicoAsignado }) {
  await update(ref(rtdb, `pacientes/${id}`), {
    nombre,
    edad,
    habitacion,
    cama: cama.toUpperCase(),
    diagnosticos,
    estado,
    medicoAsignado: medicoAsignado || null,
  });
}
