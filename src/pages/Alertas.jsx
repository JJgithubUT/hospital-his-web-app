import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TYPE_LABELS, atenderAlerta, subscribeAlertas } from '../data/alerts';

const SEVERITY_STYLE = {
  critica: 'border-red bg-red/10 text-red',
  atencion: 'border-yellow bg-yellow/10 text-yellow',
};

function formatTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' });
}

export default function Alertas() {
  const { session } = useAuth();
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [onlyPending, setOnlyPending] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAlertas(
      (list) => {
        setAlertas(list);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'No se pudo leer /alertas.');
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const visibles = useMemo(
    () => (onlyPending ? alertas.filter((a) => !a.atendida) : alertas),
    [alertas, onlyPending],
  );

  const pendientes = alertas.filter((a) => !a.atendida).length;

  const handleAtender = async (alerta) => {
    setBusyId(alerta.id);
    try {
      await atenderAlerta(alerta.id, session?.id);
    } catch (err) {
      setError(err.message || 'No se pudo marcar la alerta como atendida.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <header className="border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-xl font-bold">
            Alertas
            {pendientes > 0 && (
              <span className="ml-3 rounded bg-red px-2 py-0.5 text-xs font-semibold text-cream align-middle">
                {pendientes} sin atender
              </span>
            )}
          </h1>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={onlyPending}
              onChange={(event) => setOnlyPending(event.target.checked)}
              className="accent-pink"
            />
            Solo sin atender
          </label>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-10">
        {error && (
          <p className="mb-4 rounded-lg border border-red bg-red/10 px-3 py-2 text-sm text-red">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted">Cargando alertas…</p>
        ) : visibles.length === 0 ? (
          <p className="text-sm text-muted">
            {onlyPending ? 'No hay alertas pendientes.' : 'No hay alertas registradas.'}
          </p>
        ) : (
          <div className="space-y-3">
            {visibles.map((alerta) => (
              <div
                key={alerta.id}
                className={`rounded-xl border p-4 ${
                  alerta.atendida
                    ? 'border-border bg-surface'
                    : SEVERITY_STYLE[alerta.severidad] || 'border-border bg-surface'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-cream">
                        {alerta.pacienteNombre || alerta.pacienteId}
                      </span>
                      <span className="text-xs text-muted">
                        Hab. {alerta.habitacion} · {TYPE_LABELS[alerta.tipo] || alerta.tipo}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-cream/90">{alerta.mensaje}</p>
                    <p className="mt-1 font-mono text-xs text-muted">
                      {formatTime(alerta.creadaEn)}
                      {alerta.valor !== undefined && ` · valor: ${alerta.valor}`}
                    </p>
                  </div>

                  {alerta.atendida ? (
                    <span className="shrink-0 rounded bg-surface-3 px-2 py-1 text-xs text-muted">
                      Atendida
                    </span>
                  ) : (
                    <button
                      disabled={busyId === alerta.id}
                      onClick={() => handleAtender(alerta)}
                      className="shrink-0 rounded-lg bg-pink px-3 py-1.5 text-xs font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
                    >
                      Atender
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
