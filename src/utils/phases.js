export const PHASE_MAP = {
  GROUP_STAGE: 'Grupos',
  GROUP_A: 'Grupo A', GROUP_B: 'Grupo B', GROUP_C: 'Grupo C',
  GROUP_D: 'Grupo D', GROUP_E: 'Grupo E', GROUP_F: 'Grupo F',
  GROUP_G: 'Grupo G', GROUP_H: 'Grupo H', GROUP_I: 'Grupo I',
  GROUP_J: 'Grupo J', GROUP_K: 'Grupo K', GROUP_L: 'Grupo L',
  LAST_32: '32avos de Final',
  LAST_16: 'Octavos de Final',
  QUARTER_FINALS: 'Cuartos de Final',
  SEMI_FINALS: 'Semifinales',
  FINAL: 'Gran Final',
  THIRD_PLACE: 'Tercer Lugar',
};

export const PHASE_ORDER = [
  'GROUP_A', 'GROUP_B', 'GROUP_C', 'GROUP_D', 'GROUP_E', 'GROUP_F',
  'GROUP_G', 'GROUP_H', 'GROUP_I', 'GROUP_J', 'GROUP_K', 'GROUP_L',
  'LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL',
];

export const adaptPhase = (f) => PHASE_MAP[f] || f || 'Grupos';
