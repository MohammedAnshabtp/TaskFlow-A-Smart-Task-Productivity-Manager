import type { Status } from "../types";

export const STATUS: Status[] = ["Todo", "In Progress", "Review", "Testing", "Done"];

export const STATUS_COLORS: Record<Status, string> = {
  Todo: "#eef2ff",
  "In Progress": "#fff7ed",
  Review: "#ecfeff",
  Testing: "#fef9c3",
  Done: "#ecfdf5",
};

export const STATUS_BORDER: Record<Status, string> = {
  Todo: "#6366f1",
  "In Progress": "#f59e0b",
  Review: "#06b6d4",
  Testing: "#eab308",
  Done: "#10b981",
};
