import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-bg text-cream">
      <Navbar />
      {children}
    </div>
  );
}
