// src/utils/menuUtils.js
/**
 * Returns an array of navigation items for the sidebar based on the user's role.
 * Each item contains a unique key, a label, and a PrimeReact icon class.
 * The "Perfil" item is always included for all roles.
 */
export function getMenuItems(role) {
  const baseItems = [
    { key: 'perfil', label: 'Perfil', icon: 'pi pi-user' },
  ];

  // Add role‑specific navigation items (extend as needed)
  switch (role) {
    case 'LEVEL_1': // Administrador
      baseItems.push(
        { key: 'admin-dashboard', label: 'Dashboard', icon: 'pi pi-chart-line' },
        { key: 'admin-users', label: 'Usuarios', icon: 'pi pi-users' }
      );
      break;
    case 'LEVEL_2': // Operador
      baseItems.push(
        { key: 'operator-shipments', label: 'Envíos', icon: 'pi pi-box' },
        { key: 'operator-routes', label: 'Rutas', icon: 'pi pi-map' }
      );
      break;
    case 'LEVEL_3': // Cliente
      baseItems.push(
        { key: 'client-tracking', label: 'Rastrear', icon: 'pi pi-search' },
        { key: 'client-orders', label: 'Pedidos', icon: 'pi pi-shopping-cart' }
      );
      break;
    default:
      break;
  }

  return baseItems;
}
