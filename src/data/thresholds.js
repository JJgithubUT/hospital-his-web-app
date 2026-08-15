import { ref, set, onValue } from 'firebase/database';
import { rtdb } from '../firebase';

const umbralesRef = ref(rtdb, 'config/umbrales');

// Mismos valores por defecto que Thresholds._defaults en la app Flutter
// (vitals_rules.dart) — se usan si el nodo no existe todavía en RTDB.
export const DEFAULT_THRESHOLDS = {
  spo2: { criticoMenorQue: 90, atencionMenorQue: 94 },
  hr: { criticoMenorQue: 45, criticoMayorQue: 120, atencionMenorQue: 55, atencionMayorQue: 100 },
  temperatura: { criticoMayorQue: 39.0, atencionMayorQue: 37.8 },
  sistolica: { criticoMenorQue: 85, criticoMayorQue: 160, atencionMayorQue: 140 },
  frecuenciaRespiratoria: { criticoMayorQue: 28, atencionMayorQue: 22 },
};

export const VITAL_LABELS = {
  spo2: { label: 'SpO₂', unit: '%' },
  hr: { label: 'Frecuencia cardiaca', unit: 'lpm' },
  temperatura: { label: 'Temperatura', unit: '°C' },
  sistolica: { label: 'Presión sistólica', unit: 'mmHg' },
  frecuenciaRespiratoria: { label: 'Frecuencia respiratoria', unit: 'r/min' },
};

export const LIMIT_LABELS = {
  criticoMenorQue: 'Crítico si menor que',
  criticoMayorQue: 'Crítico si mayor que',
  atencionMenorQue: 'Atención si menor que',
  atencionMayorQue: 'Atención si mayor que',
};

export function subscribeThresholds(onData, onError) {
  return onValue(
    umbralesRef,
    (snapshot) => {
      const value = snapshot.val();
      onData(value && Object.keys(value).length ? value : DEFAULT_THRESHOLDS);
    },
    onError,
  );
}

export async function saveThresholds(thresholds) {
  await set(umbralesRef, thresholds);
}
