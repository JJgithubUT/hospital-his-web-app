import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const CONFIG_DOC = doc(db, 'hospital-his-firebase-service-configs', 'configurations');

const modulos = [
  { titulo: 'Usuarios', detalle: 'Alta, baja y desbloqueo de accesos.', to: '/usuarios' },
  { titulo: 'Pacientes', detalle: 'Expedientes activos y admisión.', to: '/pacientes' },
  { titulo: 'Alertas', detalle: 'Feed en tiempo real y atención de críticos.', to: '/alertas' },
  { titulo: 'Farmacia', detalle: 'Inventario y stock.', to: '/farmacia' },
  { titulo: 'Umbrales críticos', detalle: 'Límites de lo que se considera crítico.', to: '/umbrales' },
];

export default function Dashboard() {
  const { session } = useAuth();
  const [activeService, setActiveService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [confirmingStop, setConfirmingStop] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      CONFIG_DOC,
      (snapshot) => {
        setLoading(false);
        if (!snapshot.exists()) {
          setError('No existe el documento de configuración del servicio.');
          return;
        }
        setActiveService(Boolean(snapshot.data()['active-service']));
      },
      (err) => {
        setLoading(false);
        setError(err.message || 'No se pudo leer la configuración del servicio.');
      },
    );
    return unsubscribe;
  }, []);

  const applyServiceChange = async (next) => {
    setUpdating(true);
    setError('');
    try {
      await updateDoc(CONFIG_DOC, { 'active-service': next });
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el servicio.');
    } finally {
      setUpdating(false);
    }
  };

  const toggleService = () => {
    if (activeService === null) return;

    if (activeService) {
      setConfirmingStop(true);
      return;
    }
    applyServiceChange(true);
  };

  const confirmStop = () => {
    setConfirmingStop(false);
    applyServiceChange(false);
  };

  return (
    <>
      <header className="border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-xl font-bold">Panel de administrador</h1>
          <span className="text-sm text-muted">{session?.email}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-10">
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Servicio de simulación</h2>
          <p className="mt-1 text-sm text-muted">
            Controla si el servicio externo sigue generando signos vitales
            para los pacientes (simulación de smartwatches).
          </p>

          {error && (
            <p className="mt-4 rounded-lg border border-red bg-red/10 px-3 py-2 text-sm text-red">
              {error}
            </p>
          )}

          <div className="mt-5 flex items-center gap-4">
            {loading ? (
              <span className="text-sm text-muted">Cargando estado…</span>
            ) : (
              <>
                <button
                  role="switch"
                  aria-checked={!!activeService}
                  onClick={toggleService}
                  disabled={updating || activeService === null}
                  className={`relative h-8 w-14 rounded-full transition disabled:opacity-60 ${
                    activeService ? 'bg-green' : 'bg-surface-3'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-cream transition ${
                      activeService ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium">
                  {activeService ? 'Activo — generando datos' : 'Detenido'}
                </span>
              </>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-semibold text-cream">Módulos</h2>
          <p className="mt-1 text-sm text-muted">Gestión completa desde este panel.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {modulos.map((modulo) => (
              <Link
                key={modulo.titulo}
                to={modulo.to}
                className="rounded-xl border border-border bg-surface p-5 transition hover:border-pink"
              >
                <h3 className="font-semibold text-cream">{modulo.titulo}</h3>
                <p className="mt-1 text-sm text-muted">{modulo.detalle}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {confirmingStop && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface-2 p-6">
            <h3 className="font-semibold">Detener el servicio de simulación</h3>
            <p className="mt-2 text-sm text-muted">
              Los pacientes dejarán de recibir signos vitales nuevos hasta que
              lo vuelvas a activar.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmingStop(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-cream transition hover:bg-surface-3"
              >
                Cancelar
              </button>
              <button
                onClick={confirmStop}
                className="rounded-lg bg-red px-4 py-2 text-sm font-semibold text-cream transition hover:opacity-90"
              >
                Detener
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
