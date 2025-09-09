export type Status = "Todo" | "In Progress" | "Review" | "Testing" | "Done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  when: string | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  tasksByDay: Record<string, Task[]>;
}
