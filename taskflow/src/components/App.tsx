import React, { useMemo, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/*************************** Types ***************************/
type Status = "Todo" | "In Progress" | "Review" | "Testing" | "Done";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  when: string | null; // ISO string with date+time or null
}

interface Project {
  id: string;
  name: string;
  description?: string;
  // key = YYYY-MM-DD for day planners
  tasksByDay: Record<string, Task[]>;
}

/*************************** Utils ***************************/
const uid = () => Math.random().toString(36).slice(2, 10);
const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const prettyDateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString() : "No date/time";

const STATUS: Status[] = ["Todo", "In Progress", "Review", "Testing", "Done"];

const STATUS_COLORS: Record<Status, string> = {
  Todo: "#eef2ff", // indigo-50
  "In Progress": "#fff7ed", // orange-50
  Review: "#ecfeff", // cyan-50
  Testing: "#fef9c3", // yellow-100
  Done: "#ecfdf5", // emerald-50
};

const STATUS_BORDER: Record<Status, string> = {
  Todo: "#6366f1",
  "In Progress": "#f59e0b",
  Review: "#06b6d4",
  Testing: "#eab308",
  Done: "#10b981",
};

/*********************** Sample bootstrap ********************/
const DEFAULT_PROJECT: Project = {
  id: uid(),
  name: "My First Project",
  description: "Daily planner for my tasks.",
  tasksByDay: {},
};

const LS_KEY = "plannerpro_state_v1";

/*************************** App ***************************/
export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [DEFAULT_PROJECT];
    } catch {
      return [DEFAULT_PROJECT];
    }
  });
  const [projectId, setProjectId] = useState<string>(projects[0]?.id);
  const [activeDate, setActiveDate] = useState<Date>(new Date());

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(projects));
  }, [projects]);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId) || projects[0],
    [projects, projectId]
  );

  const tasksForDay: Task[] = useMemo(() => {
    const key = dayKey(activeDate);
    return project?.tasksByDay[key] || [];
  }, [project, activeDate]);

  const updateProject = (upd: Project) =>
    setProjects((arr) => arr.map((p) => (p.id === upd.id ? upd : p)));

  /*************** Project actions ***************/
  const addProject = () => {
    const name = prompt("Project name?");
    if (!name) return;
    const p: Project = { id: uid(), name, description: "", tasksByDay: {} };
    setProjects((arr) => [...arr, p]);
    setProjectId(p.id);
  };

  const saveProjectMeta = (name: string, description: string) => {
    if (!project) return;
    updateProject({ ...project, name, description });
  };

  /***************** Task CRUD (per day) *****************/
  const addTask = (title: string, description: string, when: Date | null) => {
    if (!project) return;
    const key = dayKey(activeDate);
    const t: Task = {
      id: uid(),
      title: title.trim(),
      description: description.trim(),
      status: "Todo",
      when: when ? when.toISOString() : null,
    };
    const dayTasks = project.tasksByDay[key] || [];
    updateProject({
      ...project,
      tasksByDay: { ...project.tasksByDay, [key]: [t, ...dayTasks] },
    });
  };

  const updateTask = (id: string, patch: Partial<Task>) => {
    if (!project) return;
    const key = dayKey(activeDate);
    const updated = (project.tasksByDay[key] || []).map((t) =>
      t.id === id ? { ...t, ...patch } : t
    );
    updateProject({
      ...project,
      tasksByDay: { ...project.tasksByDay, [key]: updated },
    });
  };

  const removeTask = (id: string) => {
    if (!project) return;
    const key = dayKey(activeDate);
    const filtered = (project.tasksByDay[key] || []).filter((t) => t.id !== id);
    updateProject({
      ...project,
      tasksByDay: { ...project.tasksByDay, [key]: filtered },
    });
  };

  /***************** Stats for chart *****************/
  const stats = useMemo(() => {
    const counts = STATUS.map((s) => ({
      name: s,
      value: tasksForDay.filter((t) => t.status === s).length,
    }));
    return counts;
  }, [tasksForDay]);

  /***************** Form state *****************/
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [when, setWhen] = useState<Date | null>(new Date());

  const submitNew = () => {
    if (!title.trim()) return;
    addTask(title, desc, when);
    setTitle("");
    setDesc("");
    setWhen(new Date());
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.brandLeft}>
          <div style={styles.logo}>PP</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>PlannerPro</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Multi‑Project Daily Planner
            </div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={styles.select}
            aria-label="Select project"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button onClick={addProject} style={styles.primaryBtn}>
            + New Project
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Planner Day:</span>
            <DatePicker
              selected={activeDate}
              onChange={(d) => d && setActiveDate(d)}
              dateFormat="PP"
              className="date-input"
            />
          </div>
        </div>
      </header>

      {/* Project meta */}
      {project && (
        <section style={styles.metaRow}>
          <input
            style={styles.inputLg}
            value={project.name}
            onChange={(e) =>
              saveProjectMeta(e.target.value, project.description || "")
            }
            placeholder="Project name"
          />
          <input
            style={styles.input}
            value={project.description || ""}
            onChange={(e) => saveProjectMeta(project.name, e.target.value)}
            placeholder="Project description"
          />
        </section>
      )}

      {/* Add Task */}
      <section style={styles.panel}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Add Task</div>
        <div style={styles.formRow}>
          <input
            style={styles.input}
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Description (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <DatePicker
            selected={when}
            onChange={(d) => setWhen(d)}
            showTimeSelect
            timeIntervals={15}
            dateFormat="PP p"
            className="date-input"
          />
          <button style={styles.primaryBtn} onClick={submitNew}>
            Add
          </button>
        </div>
      </section>

      {/* Board + Chart */}
      <div style={styles.grid}>
        {/* Board */}
        <section style={{ ...styles.panel, gridColumn: "1 / span 2" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 12,
            }}
          >
            {STATUS.map((s) => (
              <div key={s} style={styles.column}>
                <div style={styles.columnHeader}>
                  <span>{s}</span>
                  <span style={styles.pill}>
                    {tasksForDay.filter((t) => t.status === s).length}
                  </span>
                </div>
                <div>
                  {tasksForDay
                    .filter((t) => t.status === s)
                    .map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onUpdate={updateTask}
                        onRemove={removeTask}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chart */}
        <section style={styles.panel}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Progress (by status)
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {stats.map((_, i) => (
                    <Cell
                      key={i}
                      fill={Object.values(STATUS_BORDER)[i % STATUS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Local styles for inputs from react-datepicker */}
      <style>{`
        .date-input { border:1px solid #e5e7eb; padding:8px 10px; border-radius:10px; font:inherit; }
      `}</style>
    </div>
  );
}

/*************************** Task Card ***************************/
function TaskCard({
  task,
  onUpdate,
  onRemove,
}: {
  task: Task;
  onUpdate: (id: string, patch: Partial<Task>) => void;
  onRemove: (id: string) => void;
}) {
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

/*************************** Styles ***************************/
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f5f7",
    color: "#0f172a",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
  },
  brandLeft: { display: "flex", alignItems: "center", gap: 10 },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: "#2563eb",
    display: "grid",
    placeItems: "center",
    color: "#fff",
    fontWeight: 800,
  },
  headerRight: { display: "flex", alignItems: "center", gap: 10 },
  select: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "8px 10px",
    background: "#fff",
  },
  metaRow: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: 10,
    padding: 12,
  },
  input: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "8px 10px",
    background: "#fff",
  },
  inputLg: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 12px",
    background: "#fff",
    fontWeight: 700,
  },
  panel: {
    background: "#fff",
    margin: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1.6fr auto auto",
    gap: 10,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 12,
    padding: "0 12px 24px",
  },
  column: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 8,
    minHeight: 220,
  },
  columnHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    fontWeight: 700,
  },
  pill: {
    padding: "2px 8px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontSize: 12,
  },
  card: {
    border: "2px solid",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    boxShadow: "0 1px 2px rgba(0,0,0,.04)",
    background: "#fff",
  },
  cardTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardDesc: { fontSize: 13, color: "#475569", marginBottom: 6 },
  cardRow: {
    display: "grid",
    gridTemplateColumns: "80px 1fr",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  label: { fontSize: 12, color: "#475569" },
  iconBtn: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 8,
    padding: "2px 8px",
    cursor: "pointer",
  },
  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 600,
  },
};
