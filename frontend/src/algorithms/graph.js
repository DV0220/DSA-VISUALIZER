// Fixed layout so the visual graph stays readable across runs (positions in a 640x360 stage).
export const NODES = [
  { id: "A", x: 60, y: 180 },
  { id: "B", x: 180, y: 70 },
  { id: "C", x: 180, y: 290 },
  { id: "D", x: 320, y: 180 },
  { id: "E", x: 460, y: 70 },
  { id: "F", x: 460, y: 290 },
  { id: "G", x: 580, y: 180 },
];

export const EDGES = [
  ["A", "B", 4],
  ["A", "C", 2],
  ["B", "D", 5],
  ["C", "D", 1],
  ["B", "E", 10],
  ["D", "F", 3],
  ["D", "E", 4],
  ["E", "G", 4],
  ["F", "G", 6],
  ["C", "F", 8],
];

function buildAdjacency() {
  const adj = {};
  NODES.forEach((n) => (adj[n.id] = []));
  EDGES.forEach(([u, v, w]) => {
    adj[u].push({ to: v, weight: w });
    adj[v].push({ to: u, weight: w });
  });
  return adj;
}

export function bfs(start) {
  const adj = buildAdjacency();
  const steps = [];
  const visited = new Set([start]);
  const queue = [start];
  let comparisons = 0;

  steps.push({ visited: [...visited], frontier: [...queue], current: null, edge: null });

  while (queue.length) {
    const node = queue.shift();
    steps.push({ visited: [...visited], frontier: [...queue], current: node, edge: null });
    for (const { to } of adj[node]) {
      comparisons++;
      if (!visited.has(to)) {
        visited.add(to);
        queue.push(to);
        steps.push({ visited: [...visited], frontier: [...queue], current: node, edge: [node, to] });
      }
    }
  }
  return { steps, comparisons, order: [...visited] };
}

export function dfs(start) {
  const adj = buildAdjacency();
  const steps = [];
  const visited = new Set();
  let comparisons = 0;

  function visit(node) {
    visited.add(node);
    steps.push({ visited: [...visited], frontier: [], current: node, edge: null });
    for (const { to } of adj[node]) {
      comparisons++;
      if (!visited.has(to)) {
        steps.push({ visited: [...visited], frontier: [], current: node, edge: [node, to] });
        visit(to);
      }
    }
  }

  visit(start);
  return { steps, comparisons, order: [...visited] };
}

export function dijkstra(start) {
  const adj = buildAdjacency();
  const steps = [];
  const dist = {};
  const visited = new Set();
  NODES.forEach((n) => (dist[n.id] = Infinity));
  dist[start] = 0;
  let comparisons = 0;

  while (visited.size < NODES.length) {
    let u = null;
    let best = Infinity;
    for (const n of NODES) {
      if (!visited.has(n.id) && dist[n.id] < best) {
        best = dist[n.id];
        u = n.id;
      }
    }
    if (u === null) break;
    visited.add(u);
    steps.push({ visited: [...visited], frontier: [], current: u, edge: null, dist: { ...dist } });

    for (const { to, weight } of adj[u]) {
      comparisons++;
      const alt = dist[u] + weight;
      if (alt < dist[to]) {
        dist[to] = alt;
        steps.push({ visited: [...visited], frontier: [], current: u, edge: [u, to], dist: { ...dist } });
      }
    }
  }
  return { steps, comparisons, distances: dist };
}

export const GRAPH_ALGOS = {
  bfs: { fn: bfs, label: "Breadth-First Search", complexity: "O(V + E)" },
  dfs: { fn: dfs, label: "Depth-First Search", complexity: "O(V + E)" },
  dijkstra: { fn: dijkstra, label: "Dijkstra's Shortest Path", complexity: "O(V^2)" },
};
