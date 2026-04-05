// App Constants & Role Configuration
export const ROLES = {
  LEVEL_1: 'LEVEL_1',
  LEVEL_2: 'LEVEL_2',
  LEVEL_3: 'LEVEL_3',
};

export const ROLE_LABELS = {
  [ROLES.LEVEL_1]: 'Nivel 1 (Administrador)',
  [ROLES.LEVEL_2]: 'Nivel 2 (Operador)',
  [ROLES.LEVEL_3]: 'Nivel 3 (Cliente)',
};

export const PERMISSIONS = {
  MODULE_ADMIN: [ROLES.LEVEL_1],
  MODULE_OPERATIONS: [ROLES.LEVEL_1, ROLES.LEVEL_2],
  MODULE_PUBLIC_OR_CLIENT: [ROLES.LEVEL_1, ROLES.LEVEL_2, ROLES.LEVEL_3],
};
