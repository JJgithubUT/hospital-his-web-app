import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const tabClass = ({ isActive }) =>
  `px-6 py-5 text-[13px] font-semibold uppercase tracking-wider border-b-[3px] transition-colors ${
    isActive ? 'text-cream border-pink' : 'text-muted border-transparent hover:text-cream'
  }`;

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 flex items-center border-b border-border bg-bg px-8">
      <Link
        to="/"
        className="mr-12 py-5 font-mono text-sm font-bold tracking-wide text-pink"
      >
        Hospit<span className="text-cream">OS</span>
      </Link>

      <div className="flex">
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard" className={tabClass}>
              Panel
            </NavLink>
            <NavLink to="/usuarios" className={tabClass}>
              Usuarios
            </NavLink>
            <NavLink to="/pacientes" className={tabClass}>
              Pacientes
            </NavLink>
            <NavLink to="/alertas" className={tabClass}>
              Alertas
            </NavLink>
            <NavLink to="/farmacia" className={tabClass}>
              Farmacia
            </NavLink>
            <NavLink to="/umbrales" className={tabClass}>
              Umbrales
            </NavLink>
            <button
              onClick={logout}
              className="px-6 py-5 text-[13px] font-semibold uppercase tracking-wider text-muted transition-colors hover:text-cream"
            >
              Salir
            </button>
          </>
        ) : (
          <NavLink to="/login" className={tabClass}>
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}
