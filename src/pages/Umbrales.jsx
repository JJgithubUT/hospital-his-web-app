import { useEffect, useState } from 'react';
import {
  LIMIT_LABELS,
  VITAL_LABELS,
  saveThresholds,
  subscribeThresholds,
} from '../data/thresholds';

const LIMIT_KEYS = ['criticoMenorQue', 'atencionMenorQue', 'atencionMayorQue', 'criticoMayorQue'];

export default function Umbrales() {
  const [thresholds, setThresholds] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeThresholds(
      (data) => {
        setThresholds(data);
        setDraft(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'No se pudo leer /config/umbrales.');
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const dirty = draft && thresholds && JSON.stringify(draft) !== JSON.stringify(thresholds);

  const handleChange = (vital, limitKey, rawValue) => {
    setSaved(false);
    setDraft((prev) => {
      const next = { ...prev, [vital]: { ...prev[vital] } };
      if (rawValue === '') {
        delete next[vital][limitKey];
      } else {
        const num = Number(rawValue);
        if (!Number.isNaN(num)) next[vital][limitKey] = num;
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await saveThresholds(draft);
      setSaved(true);
    } catch (err) {
      setError(err.message || 'No se pudo guardar los umbrales.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDraft(thresholds);
    setSaved(false);
  };

  return (
    <>
      <header className="border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-mono text-xl font-bold">Umbrales críticos</h1>
            <p className="mt-1 text-sm text-muted">
              Definen cuándo un signo vital dispara una alerta de atención o crítica.
              Deja un campo vacío para no aplicar ese límite.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saved && !dirty && <span className="text-sm text-green">Guardado</span>}
            {dirty && (
              <button
                onClick={handleReset}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-cream transition hover:bg-surface-3"
              >
                Descartar
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className="rounded-lg bg-pink px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-10">
        {error && (
          <p className="mb-4 rounded-lg border border-red bg-red/10 px-3 py-2 text-sm text-red">
            {error}
          </p>
        )}

        {loading || !draft ? (
          <p className="text-sm text-muted">Cargando umbrales…</p>
        ) : (
          <div className="space-y-4">
            {Object.keys(VITAL_LABELS).map((vital) => {
              const info = VITAL_LABELS[vital];
              const rule = draft[vital] || {};
              return (
                <div key={vital} className="rounded-xl border border-border bg-surface p-5">
                  <h2 className="font-semibold text-cream">
                    {info.label} <span className="text-xs text-muted">({info.unit})</span>
                  </h2>
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {LIMIT_KEYS.map((limitKey) => (
                      <div key={limitKey}>
                        <label className="block text-xs text-muted">
                          {LIMIT_LABELS[limitKey]}
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={rule[limitKey] ?? ''}
                          onChange={(event) => handleChange(vital, limitKey, event.target.value)}
                          placeholder="sin límite"
                          className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-cream outline-none focus:border-pink"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
