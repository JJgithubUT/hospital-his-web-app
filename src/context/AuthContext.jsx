import { createContext, useContext, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext(null);
const SESSION_KEY = 'hospitos-admin-session';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (email, password) => {
    const adminQuery = query(
      collection(db, 'hospital-his-firebase-admin'),
      where('user-email', '==', email.trim()),
      where('password', '==', password),
    );
    const snapshot = await getDocs(adminQuery);
    if (snapshot.empty) {
      throw new Error('Correo o contraseña incorrectos.');
    }
    const adminDoc = snapshot.docs[0];
    const data = { id: adminDoc.id, email: adminDoc.data()['user-email'] };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    setSession(data);
    return data;
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, isAuthenticated: !!session }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
