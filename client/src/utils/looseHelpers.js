/**
 * Helper constants and conversion functions for loose items (weight / volume based products)
 */

export const SUB_UNITS = {
  kg: ['kg', 'gm'],
  l: ['l', 'ml'],
  g: ['gm'],
  gm: ['gm'],
  ml: ['ml'],
  pcs: ['pcs'],
  pack: ['pack'],
  dozen: ['dozen'],
};

export const PRESETS_BY_UNIT = {
  kg: [0.25, 0.5, 1, 2, 5],
  gm: [100, 250, 500, 1000],
  g: [100, 250, 500, 1000],
  l: [0.25, 0.5, 1, 2, 5],
  ml: [100, 250, 500, 1000],
  pcs: [1, 2, 5, 10],
  pack: [1, 2, 5],
  dozen: [0.5, 1, 2],
};

export const STEP_BY_UNIT = {
  kg: 0.25,
  gm: 50,
  g: 50,
  l: 0.25,
  ml: 100,
  pcs: 1,
  pack: 1,
  dozen: 1,
};

export const toBaseUnit = (displayUnit, baseUnit) => {
  if (displayUnit === baseUnit) return 1;
  if ((displayUnit === 'gm' || displayUnit === 'g') && baseUnit === 'kg') return 0.001;
  if (displayUnit === 'ml' && baseUnit === 'l') return 0.001;
  return 1;
};

export const formatQtyDisplay = (qtyInBase, unit = 'kg') => {
  const u = (unit || 'kg').toLowerCase();
  if (u === 'kg' && qtyInBase < 1) return `${Math.round(qtyInBase * 1000)}g`;
  if (u === 'l' && qtyInBase < 1) return `${Math.round(qtyInBase * 1000)}ml`;
  return `${qtyInBase} ${unit}`;
};
