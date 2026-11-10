const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchRuns(category) {
  const url = category ? `${BASE_URL}/runs?category=${category}` : `${BASE_URL}/runs`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch runs");
  return res.json();
}

export async function saveRun(run) {
  const res = await fetch(`${BASE_URL}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(run),
  });
  if (!res.ok) throw new Error("Failed to save run");
  return res.json();
}

export async function deleteRun(id) {
  const res = await fetch(`${BASE_URL}/runs/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error("Failed to delete run");
}

export async function clearRuns() {
  const res = await fetch(`${BASE_URL}/runs`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error("Failed to clear runs");
}
