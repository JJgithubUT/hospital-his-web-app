import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adjustStock, subscribeInventario, updateInventarioItem } from '../data/inventory';

function EditItemModal({ item, onClose, adminId }) {
  const [nombre, setNombre] = useState(item.nombre || '');
  const [presentacion, setPresentacion] = useState(item.presentacion || '');
  const [dosisSugerida, setDosisSugerida] = useState(item.dosisSugerida || '');
  const [via, setVia] = useState(item.via || '');
  const [stock, setStock] = useState(item.stock ?? 0);
  const [stockMinimo, setStockMinimo] = useState(item.stockMinimo ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateInventarioItem(
        item.id,
        { nombre, presentacion, dosisSugerida, via, stock, stockMinimo },
        adminId,
      );
      onClose();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el medicamento.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-2 p-6">
        <form onSubmit={handleSubmit}>
          <h3 className="font-mono font-semibold text-cream">Editar medicamento</h3>

          <label className="mt-4 block text-sm text-muted" htmlFor="edit-nombre">
            Nombre
          </label>
          <input
            id="edit-nombre"
            required
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-cream outline-none focus:border-pink"
          />

          <label className="mt-4 block text-sm text-muted" htmlFor="edit-presentacion">
            Presentación
          </label>
          <input
            id="edit-presentacion"
            required
            value={presentacion}
            onChange={(event) => setPresentacion(event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-cream outline-none focus:border-pink"
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted" htmlFor="edit-via">
                Vía
              </label>
              <input
                id="edit-via"
                required
                value={via}
                onChange={(event) => setVia(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-cream outline-none focus:border-pink"
              />
            </div>
            <div>
              <label className="block text-sm text-muted" htmlFor="edit-dosis">
                Dosis sugerida
              </label>
              <input
                id="edit-dosis"
                required
                value={dosisSugerida}
                onChange={(event) => setDosisSugerida(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-cream outline-none focus:border-pink"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted" htmlFor="edit-stock">
                Stock
              </label>
              <input
                id="edit-stock"
                type="number"
                min="0"
                required
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-cream outline-none focus:border-pink"
              />
            </div>
            <div>
              <label className="block text-sm text-muted" htmlFor="edit-stock-min">
                Stock mínimo
              </label>
              <input
                id="edit-stock-min"
                type="number"
                min="0"
                required
                value={stockMinimo}
                onChange={(event) => setStockMinimo(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-cream outline-none focus:border-pink"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red bg-red/10 px-3 py-2 text-sm text-red">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-cream transition hover:bg-surface-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-pink px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Farmacia() {
  const { session } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeInventario(
      (list) => {
        setItems(list);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'No se pudo leer /inventario.');
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => (item.nombre || '').toLowerCase().includes(q));
  }, [items, search]);

  const handleAdjust = async (item, delta) => {
    setBusyId(item.id);
    try {
      await adjustStock(item.id, delta, session?.id);
    } catch (err) {
      setError(err.message || 'No se pudo ajustar el stock.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <header className="border-b border-border px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-mono text-xl font-bold">Farmacia</h1>
          <input
            type="search"
            placeholder="Buscar medicamento…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-64 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-cream outline-none focus:border-pink"
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-10">
        {error && (
          <p className="mb-4 rounded-lg border border-red bg-red/10 px-3 py-2 text-sm text-red">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted">Cargando inventario…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted">
            {search ? 'Sin resultados para esa búsqueda.' : 'No hay medicamentos registrados.'}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left text-muted">
                  <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider">
                    Medicamento
                  </th>
                  <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider">
                    Vía / Dosis
                  </th>
                  <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const low = item.stock <= item.stockMinimo;
                  return (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-medium text-cream">{item.nombre}</div>
                        <div className="text-xs text-muted">{item.presentacion}</div>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {item.via} · {item.dosisSugerida}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono font-semibold ${low ? 'text-red' : 'text-cream'}`}>
                          {item.stock}
                        </span>
                        <span className="ml-1 text-xs text-muted">
                          / mín. {item.stockMinimo}
                        </span>
                        {low && (
                          <span className="ml-2 rounded bg-red/20 px-1.5 py-0.5 text-xs text-red">
                            Bajo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            disabled={busyId === item.id}
                            onClick={() => handleAdjust(item, -1)}
                            className="h-7 w-7 rounded-lg border border-border text-cream transition hover:bg-surface-3 disabled:opacity-60"
                          >
                            −
                          </button>
                          <button
                            disabled={busyId === item.id}
                            onClick={() => handleAdjust(item, 1)}
                            className="h-7 w-7 rounded-lg border border-border text-cream transition hover:bg-surface-3 disabled:opacity-60"
                          >
                            +
                          </button>
                          <button
                            onClick={() => setEditing(item)}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs text-cream transition hover:bg-surface-3"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {editing && (
        <EditItemModal item={editing} onClose={() => setEditing(null)} adminId={session?.id} />
      )}
    </>
  );
}
