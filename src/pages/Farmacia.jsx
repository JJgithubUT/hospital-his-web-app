import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adjustStock, subscribeInventario } from '../data/inventory';

export default function Farmacia() {
  const { session } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

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
    </>
  );
}
