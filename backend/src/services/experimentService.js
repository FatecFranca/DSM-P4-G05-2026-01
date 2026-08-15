const DEFAULT_VARIANTS = ['A', 'B'];
const VALID_EVENT_TYPES = ['impression', 'conversion'];
const SIGNIFICANCE_LEVEL = 0.05;

export function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function assignVariant({ experiment, userId, variants = DEFAULT_VARIANTS, weights }) {
  const keys = variants.length > 0 ? variants : DEFAULT_VARIANTS;
  const seed = `${experiment}:${userId ?? 'anon'}`;
  const bucket = hashString(seed);

  if (Array.isArray(weights) && weights.length === keys.length) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    if (totalWeight <= 0) {
      return keys[bucket % keys.length];
    }
    const normalized = bucket / 0xffffffff;
    let cumulative = 0;
    for (let i = 0; i < keys.length; i++) {
      cumulative += weights[i] / totalWeight;
      if (normalized < cumulative) return keys[i];
    }
    return keys[keys.length - 1];
  }

  return keys[bucket % keys.length];
}

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const abs = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * abs);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-abs * abs));
  return sign * y;
}

function chiSquarePValue(a, b) {
  const aConv = a.conversions;
  const aTotal = a.impressions;
  const bConv = b.conversions;
  const bTotal = b.impressions;

  if (aTotal <= 0 || bTotal <= 0) return null;

  const n = aTotal + bTotal;
  const totalConv = aConv + bConv;
  const totalNoConv = n - totalConv;

  if (totalConv === 0 || totalNoConv === 0) return null;

  const expAConv = (aTotal * totalConv) / n;
  const expBConv = (bTotal * totalConv) / n;
  const expANoConv = (aTotal * totalNoConv) / n;
  const expBNoConv = (bTotal * totalNoConv) / n;

  let chi2 = 0;
  chi2 += ((aConv - expAConv) ** 2) / expAConv;
  chi2 += ((bConv - expBConv) ** 2) / expBConv;
  chi2 += ((aTotal - aConv - expANoConv) ** 2) / expANoConv;
  chi2 += ((bTotal - bConv - expBNoConv) ** 2) / expBNoConv;

  return 1 - erf(Math.sqrt(chi2 / 2));
}

export function computeResults(experiment, events = []) {
  const variants = {};
  for (const variant of DEFAULT_VARIANTS) {
    variants[variant] = { variant, impressions: 0, conversions: 0, rate: 0 };
  }

  for (const event of events) {
    const entry = variants[event.variant];
    if (!entry) continue;
    if (event.eventType === 'impression') {
      entry.impressions += 1;
    } else if (event.eventType === 'conversion') {
      entry.conversions += 1;
    }
  }

  for (const variant of Object.keys(variants)) {
    const entry = variants[variant];
    entry.rate = entry.impressions > 0 ? entry.conversions / entry.impressions : 0;
  }

  const totalImpressions = DEFAULT_VARIANTS.reduce((sum, v) => sum + variants[v].impressions, 0);
  const totalConversions = DEFAULT_VARIANTS.reduce((sum, v) => sum + variants[v].conversions, 0);

  const total = {
    impressions: totalImpressions,
    conversions: totalConversions,
    rate: totalImpressions > 0 ? totalConversions / totalImpressions : 0,
  };

  const pValue = chiSquarePValue(variants.A, variants.B);

  let uplift = null;
  if (variants.A.impressions > 0 && variants.A.rate > 0) {
    uplift = ((variants.B.rate - variants.A.rate) / variants.A.rate) * 100;
  } else if (variants.A.impressions > 0 && variants.B.rate > 0) {
    uplift = Infinity;
  }

  const significant = pValue !== null ? pValue < SIGNIFICANCE_LEVEL : null;

  let winner = 'none';
  if (variants.A.rate !== variants.B.rate) {
    winner = variants.A.rate > variants.B.rate ? 'A' : 'B';
  } else if (variants.A.impressions > 0 || variants.B.impressions > 0) {
    winner = 'tie';
  }

  return {
    experiment,
    variants,
    total,
    uplift,
    pValue,
    significant,
    winner,
    confidence: pValue !== null ? (1 - pValue) * 100 : null,
  };
}

export function validateEvent({ experiment, variant, eventType } = {}) {
  if (!experiment || typeof experiment !== 'string' || !experiment.trim()) {
    return { valid: false, error: 'Missing experiment name' };
  }
  if (!variant || !DEFAULT_VARIANTS.includes(variant)) {
    return { valid: false, error: `Invalid variant, expected one of: ${DEFAULT_VARIANTS.join(', ')}` };
  }
  if (!VALID_EVENT_TYPES.includes(eventType)) {
    return { valid: false, error: `Invalid eventType, expected one of: ${VALID_EVENT_TYPES.join(', ')}` };
  }
  return { valid: true };
}
