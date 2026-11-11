// React demo — a todo list component in TSX
import { useState } from "react";

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export function TodoList({ items }: { items: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(items);

  const toggle = (id: number) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id}>
          <label>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggle(todo.id)}
            />
            <span>{todo.title}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}