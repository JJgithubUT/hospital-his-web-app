import { useEffect, useState } from 'react';
import {
  ROLE_LABELS,
  createUsuario,
  setUsuarioActive,
  subscribeUsuarios,
  unblockUsuario,
} from '../data/users';

const ROLE_DOT = {
  medico: 'bg-pink',
  enfermero: 'bg-green',
  farmaceutico: 'bg-yellow',
  administrador: 'bg-red',
};

const isClinical = (rol) => rol === 'medico' || rol === 'enfermero';

function NewUserModal({ onClose, onCreated }) {
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('medico');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  const clinical = isClinical(rol);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const result = await createUsuario({ nombre, rol, email, password });
      setCreated(result);
      onCreated();
    } catch (err) {
      setError(err.message || 'No se pudo crear el usuario.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-2 p-6">
        {created ? (
          <>
            <h3 className="font-mono font-semibold text-cream">Usuario creado</h3>
            <p className="mt-2 text-sm text-muted">
              Este es el único momento en que se muestran estas credenciales.
              Guárdalas antes de cerrar.
            </p>
            <div className="mt-4 space-y-2 rounded-lg border border-border bg-bg p-4 font-mono text-sm">
              {created.codigo ? (
                <>
                  <div>
                    Código: <span className="text-pink">{created.codigo}</span>
                  </div>
                  <div>
                    PIN: <span className="text-pink">{created.pin}</span>
                  </div>
                </>
              ) : (
                <div>
                  Correo: <span className="text-pink">{created.email}</span>
                </div>
              )}
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
            <h3 className="font-mono font-semibold text-cream">Nuevo usuario</h3>

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

            <label className="mt-4 block text-sm text-muted" htmlFor="rol">
              Rol
            </label>
            <select
              id="rol"
              value={rol}
              onChange={(event) => setRol(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-cream outline-none focus:border-pink"
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {clinical ? (
              <p className="mt-4 text-sm text-muted">
                Código y PIN se generan automáticamente al guardar.
              </p>
            ) : (
              <>
                <label className="mt-4 block text-sm text-muted" htmlFor="email">
                  Correo
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-cream outline-none focus:border-pink"
                />

                <label className="mt-4 block text-sm text-muted" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="text"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-cream outline-none focus:border-pink"
                />
              </>
            )}

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
                {saving ? 'Guardando…' : 'Crear usuario'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeUsuarios(
      (list) => {
        setUsuarios(list);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'No se pudo leer /usuarios.');
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const toggleActive = async (user) => {
    setBusyId(user.id);
    try {
      await setUsuarioActive(user.id, !user.activo);
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el usuario.');
    } finally {
      setBusyId(null);
    }
  };

  const handleUnblock = async (user) => {
    setBusyId(user.id);
    try {
      await unblockUsuario(user.id);
    } catch (err) {
      setError(err.message || 'No se pudo desbloquear al usuario.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <header className="border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-xl font-bold">Usuarios</h1>
          <button
            onClick={() => setShowNew(true)}
            className="rounded-lg bg-pink px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90"
          >
            + Nuevo usuario
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
          <p className="text-sm text-muted">Cargando usuarios…</p>
        ) : usuarios.length === 0 ? (
          <p className="text-sm text-muted">No hay usuarios registrados todavía.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left text-muted">
                  <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider">
                    Acceso
                  </th>
                  <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-cream">{user.nombre}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${ROLE_DOT[user.rol] || 'bg-muted'}`}
                        />
                        {ROLE_LABELS[user.rol] || user.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {user.codigo ? user.codigo : user.email}
                      {user.bloqueado && (
                        <span className="ml-2 rounded bg-red/20 px-1.5 py-0.5 text-red">
                          Bloqueado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold ${
                          user.activo ? 'text-green' : 'text-muted'
                        }`}
                      >
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {user.bloqueado && (
                          <button
                            disabled={busyId === user.id}
                            onClick={() => handleUnblock(user)}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs text-cream transition hover:bg-surface-3 disabled:opacity-60"
                          >
                            Desbloquear
                          </button>
                        )}
                        <button
                          disabled={busyId === user.id}
                          onClick={() => toggleActive(user)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-cream transition hover:bg-surface-3 disabled:opacity-60"
                        >
                          {user.activo ? 'Desactivar' : 'Reactivar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showNew && (
        <NewUserModal onClose={() => setShowNew(false)} onCreated={() => {}} />
      )}
    </>
  );
}
