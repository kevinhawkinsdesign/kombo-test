// Deterministic real-people placeholder portraits, keyed by a stable seed
// (e.g. a person's name) so each individual keeps the same face across the app.
// Uses pravatar; if the image fails to load, the Avatar falls back to initials.
export function portraitFor(seed: string): string {
  return `https://i.pravatar.cc/160?u=${encodeURIComponent(seed)}`
}
