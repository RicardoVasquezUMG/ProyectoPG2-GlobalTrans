// src/utils/menuUtils.js
/**
 * Returns an array of navigation items for the sidebar based on the user's role.
 * Each item contains a unique key, a label, and a PrimeReact icon class.
 * The "Perfil" item is always included for all roles.
 */
export function getMenuItems(role) {
  const baseItems = [
    { key: 'dashboard', label: 'Inicio', icon: 'pi pi-home', path: '/dashboard' },
    { key: 'perfil', label: 'Perfil', icon: 'pi pi-user', path: '/perfil' },
  ];

  // Add role‑specific navigation items (extend as needed)
  switch (role) {
    case 'LEVEL_1': // Administrador
      baseItems.push(
        { key: 'admin-users', label: 'Usuarios', icon: 'pi pi-users', path: '/usuarios' },
        { key: 'admin-vehicles', label: 'Vehículos', icon: 'pi pi-car', path: '/vehiculos' },
        { key: 'admin-vans', label: 'Furgones', icon: 'pi pi-truck', path: '/furgones' }
      );
      break;
    case 'LEVEL_2': // Operador / Nivel 2
      baseItems.push(
        { key: 'operator-schedules', label: 'Cronogramas', icon: 'pi pi-calendar', path: '/cronogramas' }
      );
      break;
    case 'LEVEL_3': // Cliente / Nivel 3
      baseItems.push(
        { key: 'client-trips', label: 'Viajes', icon: 'pi pi-compass', path: '/viajes' },
        { key: 'client-docs', label: 'Documentos', icon: 'pi pi-file', path: '/documentos' }
      );
      break;
    default:
      break;
  }

  return baseItems;
}
