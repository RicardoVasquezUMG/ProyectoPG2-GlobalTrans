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

export const ESTADOS_VIAJE = {
  PLANIFICADO: 'planificado',
  EN_RUTA: 'en_ruta',
  EN_ADUANA: 'en_aduana',
  ENTREGADO: 'entregado',
  RETRASADO: 'retrasado',
  CANCELADO: 'cancelado'
};

export const EVENT_TYPES = {
  ADUANA_LLEGADA: 'Llegada a Aduana',
  ADUANA_SALIDA: 'Salida de Aduana',
  INCIDENTE_MECANICO: 'Avería Mecánica',
  INCIDENTE_ACCIDENTE: 'Accidente',
  INCIDENTE_TRAFICO: 'Retraso por Tráfico',
  PAUSA_ALIMENTACION: 'Pausa por Alimentación',
  PAUSA_DESCANSO: 'Pausa por Descanso',
  PAUSA_COMBUSTIBLE: 'Recarga de Combustible',
};
