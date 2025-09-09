"use client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Status, Task } from "../types";
import { prettyDateTime } from "../utils/helpers";
import { STATUS, STATUS_COLORS, STATUS_BORDER } from "../constants/status";

interface Props {
  task: Task;
  onUpdate: (id: string, patch: Partial<Task>) => void;
  onRemove: (id: string) => void;
}

export default function TaskCard({ task, onUpdate, onRemove }: Props) {
  const color = STATUS_COLORS[task.status];
  const border = STATUS_BORDER[task.status];

  return (
    <div style={{ ...styles.card, background: color, borderColor: border }}>
      <div style={styles.cardTopRow}>
        <strong>{task.title}</strong>
        <button
          style={styles.iconBtn}
          onClick={() => onRemove(task.id)}
          title="Delete"
        >
          ✕
        </button>
      </div>

      {task.description && (
        <div style={styles.cardDesc}>{task.description}</div>
      )}

      <div style={styles.cardRow}>
        <label style={styles.label}>Status</label>
        <select
          value={task.status}
          onChange={(e) =>
            onUpdate(task.id, { status: e.target.value as Status })
          }
          style={styles.select}
        >
          {STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.cardRow}>
        <label style={styles.label}>Date & Time</label>
        <DatePicker
          selected={task.when ? new Date(task.when) : null}
          onChange={(d) =>
            onUpdate(task.id, { when: d ? d.toISOString() : null })
          }
          showTimeSelect
          timeIntervals={15}
          dateFormat="PP p"
          placeholderText="Pick date & time"
          className="date-input"
        />
      </div>

      <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
        {prettyDateTime(task.when)}
      </div>
    </div>
  );
}

// local styles (can be extracted later)
const styles: Record<string, React.CSSProperties> = {
  card: { border: "2px solid", borderRadius: 12, padding: 10, marginBottom: 8 },
  cardTopRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardDesc: { fontSize: 13, color: "#475569", marginBottom: 6 },
  cardRow: {
    display: "grid",
    gridTemplateColumns: "80px 1fr",
    gap: 8,
    marginTop: 6,
  },
  label: { fontSize: 12, color: "#475569" },
  select: { border: "1px solid #e5e7eb", borderRadius: 10, padding: "6px 8px" },
  iconBtn: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "2px 8px",
    cursor: "pointer",
  },
};
