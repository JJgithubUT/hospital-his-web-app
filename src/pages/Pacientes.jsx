import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  STATUS_DOT,
  STATUS_LABELS,
  admitirPaciente,
  setPacienteActive,
  subscribePacientes,
} from '../data/patients';

function AdmitModal({ onClose, adminId }) {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [habitacion, setHabitacion] = useState('');
  const [cama, setCama] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const id = await admitirPaciente({
        nombre,
        edad: Number(edad),
        habitacion,
        cama,
        diagnostico,
        creadoPor: adminId,
      });
      setCreatedId(id);
    } catch (err) {
      setError(err.message || 'No se pudo admitir al paciente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-2 p-6">
        {createdId ? (
          <>
            <h3 className="font-mono font-semibold text-cream">Paciente admitido</h3>
            <p className="mt-2 text-sm text-muted">
              El expediente ya está activo. Este identificador es también el
              contenido de su código QR.
            </p>
            <div className="mt-4 rounded-lg border border-border bg-bg p-4 font-mono text-sm">
              ID: <span className="text-pink">{createdId}</span>
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-pink px-4 py-2 font-semibold text-bg transition hover:opacity-90"
            >
              Entendido
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 className="font-mono font-semibold text-cream">Admisión de paciente</h3>

            <label className="mt-4 block text-sm text-muted" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              required
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-cream outline-none focus:border-pink"
            />

            <label className="mt-4 block text-sm text-muted" htmlFor="edad">
              Edad
            </label>
            <input
              id="edad"
              type="number"
              min="0"
              required
              value={edad}
              onChange={(event) => setEdad(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-cream outline-none focus:border-pink"
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-muted" htmlFor="habitacion">
                  Cuarto
                </label>
                <input
                  id="habitacion"
                  required
                  value={habitacion}
                  onChange={(event) => setHabitacion(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-cream outline-none focus:border-pink"
                />
              </div>
              <div>
                <label className="block text-sm text-muted" htmlFor="cama">
                  Cama
                </label>
                <input
                  id="cama"
                  required
                  value={cama}
                  onChange={(event) => setCama(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-cream outline-none focus:border-pink"
                />
              </div>
            </div>

            <label className="mt-4 block text-sm text-muted" htmlFor="diagnostico">
              Diagnóstico principal
            </label>
            <input
              id="diagnostico"
              required
              value={diagnostico}
              onChange={(event) => setDiagnostico(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-cream outline-none focus:border-pink"
            />

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
                {saving ? 'Admitiendo…' : 'Admitir paciente'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function DetailModal({ patient, onClose }) {
  const vitals = patient.signosActuales || {};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-2 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-mono font-semibold text-cream">{patient.nombre}</h3>
            <p className="text-sm text-muted">
              Hab. {patient.habitacion} · Cama {patient.cama} · {patient.edad} años
            </p>
          </div>
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[patient.estado] || 'bg-muted'}`}
          />
        </div>

        <div className="mt-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted">Diagnósticos</p>
          <p className="mt-1 text-sm text-cream">
            {(patient.diagnosticos || []).join(', ') || '—'}
          </p>
        </div>

        <div className="mt-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted">Signos actuales</p>
          <div className="mt-2 grid grid-cols-3 gap-3 font-mono text-sm">
            <div>
              <div className="text-muted text-xs">FC</div>
              <div className="text-cream">{vitals.hr ?? '—'}</div>
            </div>
            <div>
              <div className="text-muted text-xs">SpO₂</div>
              <div className="text-cream">{vitals.spo2 ?? '—'}%</div>
            </div>
            <div>
              <div className="text-muted text-xs">Presión</div>
              <div className="text-cream">
                {vitals.sistolica ?? '—'}/{vitals.diastolica ?? '—'}
              </div>
            </div>
            <div>
              <div className="text-muted text-xs">Temp.</div>
              <div className="text-cream">{vitals.temperatura ?? '—'}°C</div>
            </div>
            <div>
              <div className="text-muted text-xs">FR</div>
              <div className="text-cream">{vitals.frecuenciaRespiratoria ?? '—'}</div>
            </div>
          </div>
        </div>

        {patient.medicoAsignado && (
          <div className="mt-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              Médico asignado
            </p>
            <p className="mt-1 text-sm text-cream">{patient.medicoAsignado}</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-border px-4 py-2 text-sm text-cream transition hover:bg-surface-3"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default function Pacientes() {
  const { session } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdmit, setShowAdmit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribePacientes(
      (list) => {
        setPacientes(list);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'No se pudo leer /pacientes.');
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const toggleActive = async (patient) => {
    setBusyId(patient.id);
    try {
      await setPacienteActive(patient.id, !patient.activo);
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el expediente.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <header className="border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-xl font-bold">Pacientes</h1>
          <button
            onClick={() => setShowAdmit(true)}
            className="rounded-lg bg-pink px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90"
          >
            + Admitir paciente
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-10">
        {error && (
          <p className="mb-4 rounded-lg border border-red bg-red/10 px-3 py-2 text-sm text-red">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted">Cargando pacientes…</p>
        ) : pacientes.length === 0 ? (
          <p className="text-sm text-muted">No hay pacientes registrados todavía.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left text-muted">
                  <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider">
                    Expediente
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {pacientes.map((patient) => (
                  <tr key={patient.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-cream">{patient.nombre}</div>
                      <div className="text-xs text-muted">{patient.edad} años</div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      Hab. {patient.habitacion} · Cama {patient.cama}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${STATUS_DOT[patient.estado] || 'bg-muted'}`}
                        />
                        {STATUS_LABELS[patient.estado] || patient.estado}
                        {!patient.activo && (
                          <span className="rounded bg-surface-3 px-1.5 py-0.5 text-xs text-muted">
                            Inactivo
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(patient)}
                        className="text-xs text-pink hover:underline"
                      >
                        Ver expediente
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        disabled={busyId === patient.id}
                        onClick={() => toggleActive(patient)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs text-cream transition hover:bg-surface-3 disabled:opacity-60"
                      >
                        {patient.activo ? 'Dar de baja' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showAdmit && (
        <AdmitModal onClose={() => setShowAdmit(false)} adminId={session?.id} />
      )}
      {selected && <DetailModal patient={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
