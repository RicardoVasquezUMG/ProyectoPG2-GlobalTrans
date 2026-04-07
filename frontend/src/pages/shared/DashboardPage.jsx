import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-900 m-0">Bienvenido, {user?.full_name || 'Usuario'}</h2>
      <p className="text-600 mt-2">
        Selecciona una opción en el menú lateral para comenzar.
      </p>
      <div className="flex justify-content-center mt-5">
        <img 
          src="src/assets/lojo.jpg" 
          alt="Logo" 
          style={{ maxHeight: '55vh', width: 'auto', objectFit: 'contain', opacity: 0.6 }} 
        />
      </div>
    </div >
  );
}
