# HospitOS Admin Web — Alcance

App web exclusiva para el Administrador. Complementa a la app móvil Flutter:
mismo proyecto Firebase, pero con su propia autenticación (Firestore) y más
superficie de gestión desde escritorio.

Estado: **planeado, aún no implementado**.

---

## 1. Autenticación (propia, distinta al resto del sistema)

- Login contra Firestore: `/hospital-his-firebase-admin/MUatblio9cVNRbcKBjc9`
  (campos `user-email`, `password`).
- Sin Firebase Auth, sin Cloud Functions — comparación de texto en cliente,
  igual filosofía que `/usuarios` en RTDB.
- Sesión persistida en `localStorage`/`sessionStorage`.
- `ProtectedRoute` redirige a `/login` si no hay sesión. Un solo usuario fijo:
  no hace falta "recuperar contraseña" ni roles.

## 2. Control del servicio de simulación

- Switch **editable** en el dashboard que lee y escribe el booleano
  `active-service` en `/hospital-his-firebase-service-configs/configurations`
  (Firestore).
- Ese flag activa/desactiva el servicio externo que simula los smartwatches
  de los pacientes (signos vitales + estado): en `true` el servicio sigue
  generando datos; en `false` el servicio se detiene.
- El administrador puede alternarlo en cualquier momento para continuar o
  parar la simulación — no es solo indicador de estado, es el control real.
- Lectura en tiempo real (`onSnapshot`) + confirmación antes de apagar, para
  no cortar una demo en curso sin querer.

## 3. Módulos de gestión (sobre RTDB, mismo proyecto que la app Flutter)

| Módulo | Nodo RTDB | Capacidades |
|---|---|---|
| **Usuarios** | `/usuarios` | Listar, alta (clínico → código+PIN autogenerados; gestión → email+password), desactivar, desbloquear PIN — espejo de US 1.2 en escritorio |
| **Pacientes** | `/pacientes` | Listar con estado (crítico/atención/estable), ver expediente, admitir nuevo, dar de baja |
| **Alertas** | `/alertas` | Feed en tiempo real, marcar como atendida, historial filtrable |
| **Farmacia / Inventario** | `/inventario` | Listar, ajustar stock (misma transacción que ya usa la app) |
| **Umbrales críticos** | `/config/umbrales` | Editar límites que definen "crítico" — hoy solo editable desde la consola de Firebase; se lleva a UI |
| **Órdenes / MAR** | `/ordenes` | Solo lectura — visibilidad de dosis pendientes/administradas, sin edición (flujo de médico/enfermero, no de admin) |

## 4. Dashboard de inicio

Resumen al entrar: nº de pacientes activos por estado, alertas sin atender,
estado del servicio de simulación, alertas de stock bajo — todo en tiempo
real vía listeners de RTDB y Firestore.

## 5. Fuera de alcance

- Reglas de seguridad/autorización de Firestore o RTDB (entorno de demo,
  igual que el resto del proyecto).
- Cifrado de credenciales (se mantiene en claro, consistente con `/usuarios`).
- Gestión de médicos/enfermeros *durante* su turno (marcar dosis, recetar) —
  eso queda en la app clínica.
- Push notifications nativas — la web solo refleja `/alertas` mientras está
  abierta.

## 6. Arquitectura técnica

- React Router: `/login`, `/dashboard`, `/usuarios`, `/pacientes`,
  `/pacientes/:id`, `/alertas`, `/inventario`, `/umbrales`.
- `src/firebase.js` ya expone `db` (Firestore) y `rtdb` (RTDB) — se reutiliza
  tal cual.
- `AuthContext` envuelve la app, expone sesión y logout.
- Sin backend propio, sin servicios de pago — mismo principio que el resto
  del proyecto.

---

Fuentes relacionadas: [`docs/HISTORIAS-DE-USUARIO.md`](HISTORIAS-DE-USUARIO.md),
[`firebase/MODELO-DATOS.md`](../firebase/MODELO-DATOS.md).
