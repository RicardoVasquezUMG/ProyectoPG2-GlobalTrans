// src/utils/menuUtils.js
/**
 * Returns an array of navigation items for the sidebar based on the user's role.
 * Each item contains a unique key, a label, and a PrimeReact icon class.
 * The "Perfil" item is always included for all roles.
 */
export function getMenuItems(role) {
  const items = [];

  items.push(
    { key: 'section-general', label: 'General', isDivider: true },
    { key: 'dashboard', label: 'Inicio', icon: 'pi pi-home', path: '/dashboard' },
    { key: 'perfil', label: 'Perfil', icon: 'pi pi-user', path: '/perfil' }
  );

  if (role === 'LEVEL_1') {
    items.push(
      { key: 'section-admin', label: 'Administración', isDivider: true },
      { key: 'admin-users', label: 'Usuarios', icon: 'pi pi-users', path: '/usuarios' },
      { key: 'admin-vehicles', label: 'Vehículos', icon: 'pi pi-car', path: '/vehiculos' },
      { key: 'admin-vans', label: 'Furgones', icon: 'pi pi-truck', path: '/furgones' },
      { key: 'admin-campanias', label: 'Campañas', icon: 'pi pi-megaphone', path: '/campanias' },
      { key: 'admin-tiendas', label: 'Tiendas', icon: 'pi pi-shop', path: '/tiendas' },
      { key: 'admin-cargamentos', label: 'Cargamentos', icon: 'pi pi-box', path: '/cargamentos' },
      
      { key: 'section-ops', label: 'Operaciones', isDivider: true },
      { key: 'operator-schedules', label: 'Cronogramas', icon: 'pi pi-calendar', path: '/cronogramas' },
      
      { key: 'section-clients', label: 'Clientes', isDivider: true },
      { key: 'client-trips', label: 'Viajes', icon: 'pi pi-compass', path: '/viajes' },
      { key: 'client-docs', label: 'Documentos', icon: 'pi pi-file', path: '/documentos' }
    );
  } else if (role === 'LEVEL_2') {
    items.push(
      { key: 'section-ops', label: 'Operaciones', isDivider: true },
      { key: 'operator-schedules', label: 'Cronogramas', icon: 'pi pi-calendar', path: '/cronogramas' }
    );
  } else if (role === 'LEVEL_3') {
    items.push(
      { key: 'section-clients', label: 'Clientes', isDivider: true },
      { key: 'client-trips', label: 'Viajes', icon: 'pi pi-compass', path: '/viajes' },
      { key: 'client-docs', label: 'Documentos', icon: 'pi pi-file', path: '/documentos' }
    );
  }

  return items;
}
