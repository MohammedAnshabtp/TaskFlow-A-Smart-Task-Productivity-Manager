// App.tsx
import { useState } from "react";

type Task = {
  id: number;
  title: string;
  description: string;
  category: string;
  dueDate: string;
  status: "todo" | "inprogress" | "done";
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Work");
  const [dueDate, setDueDate] = useState("");

  const addTask = () => {
    if (!title) return;
    const newTask: Task = {
      id: Date.now(),
      title,
      description,
      category,
      dueDate,
      status: "todo",
    };
    setTasks([...tasks, newTask]);
    setTitle("");
    setDescription("");
    setDueDate("");
  };

  const moveTask = (id: number, status: Task["status"]) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, status } : task))
    );
  };

  const renderTasks = (status: Task["status"]) =>
    tasks
      .filter((t) => t.status === status)
      .map((t) => (
        <div
          key={t.id}
          className="bg-white p-4 rounded-xl shadow hover:shadow-md transition mb-3"
        >
          <h3 className="font-semibold text-gray-800">{t.title}</h3>
          <p className="text-sm text-gray-600">{t.description}</p>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>{t.category}</span>
            <span>{t.dueDate}</span>
          </div>
          <div className="flex gap-2 mt-3">
            {status !== "todo" && (
              <button
                onClick={() => moveTask(t.id, "todo")}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
              >
                To Do
              </button>
            )}
            {status !== "inprogress" && (
              <button
                onClick={() => moveTask(t.id, "inprogress")}
                className="px-2 py-1 text-xs bg-blue-200 rounded hover:bg-blue-300"
              >
                In Progress
              </button>
            )}
            {status !== "done" && (
              <button
                onClick={() => moveTask(t.id, "done")}
                className="px-2 py-1 text-xs bg-green-200 rounded hover:bg-green-300"
              >
                Done
              </button>
            )}
          </div>
        </div>
      ));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-white shadow p-4 flex items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          TaskFlow <span className="text-green-500">✔</span>
        </h1>
      </header>

      {/* Task Form */}
      <div className="p-6">
        <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 p-2 border rounded-md focus:ring focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 p-2 border rounded-md focus:ring focus:ring-blue-300"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option>Work</option>
            <option>Personal</option>
            <option>Other</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="p-2 border rounded-md"
          />
          <button
            onClick={addTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Task Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">To Do</h2>
          {renderTasks("todo")}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">In Progress</h2>
          {renderTasks("inprogress")}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">Done ✅</h2>
          {renderTasks("done")}
        </div>
      </div>
    </div>
  );
}
