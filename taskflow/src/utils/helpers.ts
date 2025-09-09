export const uid = () => Math.random().toString(36).slice(2, 10);
export const dayKey = (d: Date) => d.toISOString().slice(0, 10);
export const prettyDateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString() : "No date/time";
