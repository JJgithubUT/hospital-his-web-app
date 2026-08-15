import { ref, query, limitToLast, update, onValue } from 'firebase/database';
import { rtdb } from '../firebase';

const alertasRef = query(ref(rtdb, 'alertas'), limitToLast(30));

export const TYPE_LABELS = {
  spo2: 'SpO₂',
  hr: 'Frecuencia cardiaca',
  temperatura: 'Temperatura',
  sistolica: 'Presión sistólica',
};

export function subscribeAlertas(onData, onError) {
  return onValue(
    alertasRef,
    (snapshot) => {
      const value = snapshot.val() || {};
      const list = Object.entries(value).map(([id, data]) => ({ id, ...data }));
      list.sort((a, b) => new Date(b.creadaEn || 0) - new Date(a.creadaEn || 0));
      onData(list);
    },
    onError,
  );
}

export async function atenderAlerta(id, adminId) {
  await update(ref(rtdb, `alertas/${id}`), {
    atendida: true,
    atendidaPor: adminId || null,
    atendidaEn: new Date().toISOString(),
  });
}
