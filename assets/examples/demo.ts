// TypeScript demo — showcasing the Motion Haleness palette
import { useState, useEffect } from "react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const FILTERS = ["all", "active", "done"] as const;

export function useTodos(initial: Todo[]) {
  const [todos, setTodos] = useState<Todo[]>(initial);

  const toggle = (id: number) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

  useEffect(() => {
    console.log(`todos updated: ${todos.length}`);
  }, [todos]);

  return { todos, toggle };
}