import { ref, runTransaction, update, onValue } from 'firebase/database';
import { rtdb } from '../firebase';

const inventarioRef = ref(rtdb, 'inventario');

export function subscribeInventario(onData, onError) {
  return onValue(
    inventarioRef,
    (snapshot) => {
      const value = snapshot.val() || {};
      const list = Object.entries(value).map(([id, data]) => ({ id, ...data }));
      list.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
      onData(list);
    },
    onError,
  );
}

// Misma transacción que InventoryController.adjustStock() en la app Flutter:
// evita que dos farmacéuticos tocando el mismo ítem se pisen, nunca baja de 0.
export async function adjustStock(itemId, delta, adminId) {
  const stockRef = ref(rtdb, `inventario/${itemId}/stock`);
  await runTransaction(stockRef, (current) => {
    const value = typeof current === 'number' ? current : Number(current) || 0;
    const next = value + delta;
    return next < 0 ? 0 : next;
  });
  await update(ref(rtdb, `inventario/${itemId}`), {
    actualizadoEn: new Date().toISOString(),
    actualizadoPor: adminId || null,
  });
}

export async function updateInventarioItem(
  itemId,
  { nombre, presentacion, dosisSugerida, via, stock, stockMinimo },
  adminId,
) {
  await update(ref(rtdb, `inventario/${itemId}`), {
    nombre,
    presentacion,
    dosisSugerida,
    via,
    stock: Number(stock),
    stockMinimo: Number(stockMinimo),
    actualizadoEn: new Date().toISOString(),
    actualizadoPor: adminId || null,
  });
}
