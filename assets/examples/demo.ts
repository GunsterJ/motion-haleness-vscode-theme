// TypeScript demo — types, generics and async helpers
type Status = "idle" | "loading" | "success" | "error";

interface User {
  id: number;
  name: string;
  status: Status;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchUsers(limit: number = 20): Promise<User[]> {
  const res = await fetch(`/api/users?limit=${limit}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: User[] = await res.json();
  return data.filter((u) => u.status !== "error");
}

function groupBy<T, K extends keyof T>(items: T[], key: K): Map<T[K], T[]> {
  return items.reduce((map, item) => {
    const k = item[key];
    (map.get(k) ?? []).push(item);
    return map;
  }, new Map<T[K], T[]>());
}