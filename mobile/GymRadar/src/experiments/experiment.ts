export const EXPERIMENTS = {
  home_gym_layout: { variants: ['A', 'B'] as const },
} as const;

export type ExperimentName = keyof typeof EXPERIMENTS;
export type Variant = 'A' | 'B';
export type EventType = 'impression' | 'conversion';

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function assignVariant(experiment: ExperimentName, userId: string): Variant {
  const variants = EXPERIMENTS[experiment].variants;
  const seed = `${experiment}:${userId || 'anon'}`;
  return variants[hashString(seed) % variants.length] as Variant;
}

export type ExperimentEvent = {
  experiment: ExperimentName;
  variant: Variant;
  eventType: EventType;
  userId: string;
};

export function buildEventPayload(
  experiment: ExperimentName,
  variant: Variant,
  eventType: EventType,
  userId: string
): ExperimentEvent {
  return { experiment, variant, eventType, userId };
}
