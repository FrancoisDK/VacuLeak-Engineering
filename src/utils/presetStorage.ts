import { SystemInputs } from './vacuumLeakage';

export interface SavedPreset {
  id: string;
  name: string;
  savedAt: string;
  inputs: SystemInputs;
}

const STORAGE_KEY = 'vaculeak_saved_presets_v1';

function isValidPreset(item: unknown): item is SavedPreset {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.name !== 'string' ||
    !candidate.inputs ||
    typeof candidate.inputs !== 'object'
  ) {
    return false;
  }
  const inp = candidate.inputs as Record<string, unknown>;
  return (
    typeof inp.volumeM3 === 'number' &&
    typeof inp.pressureMbar === 'number' &&
    typeof inp.vesselMaterial === 'string' &&
    typeof inp.gasketMaterial === 'string'
  );
}

export function loadSavedPresets(): SavedPreset[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidPreset);
  } catch {
    return [];
  }
}

function persistPresets(presets: SavedPreset[]): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    return true;
  } catch {
    return false;
  }
}

export function saveUserPreset(
  rawName: string,
  inputs: SystemInputs
): { presets: SavedPreset[]; saved: SavedPreset; ok: boolean } {
  const cleanName = rawName.trim().slice(0, 60);
  const existing = loadSavedPresets();
  const matchIdx = existing.findIndex(
    (p) => p.name.toLowerCase() === cleanName.toLowerCase()
  );

  const id =
    matchIdx >= 0
      ? existing[matchIdx].id
      : `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const clonedInputs: SystemInputs = {
    ...inputs,
    presetId: id,
    componentCounts: { ...inputs.componentCounts },
  };

  const saved: SavedPreset = {
    id,
    name: cleanName,
    savedAt: new Date().toISOString(),
    inputs: clonedInputs,
  };

  const next =
    matchIdx >= 0
      ? existing.map((p, idx) => (idx === matchIdx ? saved : p))
      : [saved, ...existing];

  const ok = persistPresets(next);
  return { presets: next, saved, ok };
}

export function deleteUserPreset(id: string): SavedPreset[] {
  const existing = loadSavedPresets();
  const next = existing.filter((p) => p.id !== id);
  persistPresets(next);
  return next;
}
