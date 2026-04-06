// App Constants & Role Configuration
export const ROLES = {
  LEVEL_1: 'LEVEL_1',
  LEVEL_2: 'LEVEL_2',
  LEVEL_3: 'LEVEL_3',
};

export const ROLE_LABELS = {
  [ROLES.LEVEL_1]: 'Administrador',
  [ROLES.LEVEL_2]: 'Analista',
  [ROLES.LEVEL_3]: 'Piloto',
};

export const PERMISSIONS = {
  MODULE_ADMIN: [ROLES.LEVEL_1],
  MODULE_OPERATIONS: [ROLES.LEVEL_1, ROLES.LEVEL_2],
  MODULE_PUBLIC_OR_CLIENT: [ROLES.LEVEL_1, ROLES.LEVEL_2, ROLES.LEVEL_3],
};
