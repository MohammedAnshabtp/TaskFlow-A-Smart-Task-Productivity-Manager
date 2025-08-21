import React from "react";
import type { Task } from "../types/task";

interface TaskListProps {
  tasks: Task[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  toggleTask,
  deleteTask,
}) => {
  if (tasks.length === 0) {
    return <p className="text-center text-gray-500">No tasks yet. Add one!</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="p-4 bg-gray-100 rounded-lg flex justify-between items-center"
        >
          <div>
            <h3
              className={`font-semibold ${
                task.completed ? "line-through text-gray-400" : ""
              }`}
            >
              {task.title}
            </h3>
            <p className="text-sm text-gray-600">{task.description}</p>
            <p className="text-xs text-gray-500">
              {task.category} | Due: {task.dueDate || "N/A"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggleTask(task.id)}
              className="px-3 py-1 text-sm rounded bg-green-500 text-white hover:bg-green-600"
            >
              {task.completed ? "Undo" : "Complete"}
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="px-3 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
