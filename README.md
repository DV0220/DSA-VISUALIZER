# dsa.sim — DSA Algorithm Simulator (MERN)

A full-stack tool for visualizing sorting, searching, and graph algorithms.
Every completed run is logged to MongoDB through an Express API, so the
project demonstrates a real MERN flow (MongoDB, Express, React, Node) —
not just a frontend demo.

## What's included

**Sorting** — Bubble, Selection, Insertion, Merge, Quick Sort, animated
bar chart, live comparison/swap counters.

**Searching** — Linear Search and Binary Search over a generated sorted
array, with the active search range highlighted.

**Graph** — BFS, DFS, and Dijkstra's algorithm on a fixed weighted graph,
rendered as an SVG node-edge diagram with live distance labels.

**History** — Every run (algorithm, input size, comparisons, time taken)
is POSTed to the backend and stored in MongoDB. The History tab reads it
back with GET, and lets you delete individual runs or clear everything —
full CRUD.

## Project structure

```
dsa-visualizer/
  backend/
    config/db.js        MongoDB connection
    models/Run.js        Mongoose schema for a saved run
    routes/runs.js        GET/POST/DELETE /api/runs
    server.js             Express app entry point
    .env.example
    package.json
  frontend/
    src/
      algorithms/         Pure-JS step generators (sorting.js, searching.js, graph.js)
      components/         Sidebar, SortingVisualizer, SearchingVisualizer, GraphVisualizer, HistoryPanel
      App.jsx
      api.js               fetch() wrapper for the backend
      index.css            Design tokens + all styling
    index.html
    package.json
    vite.config.js
```

## 1. Backend setup

You need MongoDB running locally, or a free MongoDB Atlas connection string.

```bash
cd backend
npm install
cp .env.example .env
# edit .env if your MongoDB URI or port differs
npm run dev        # nodemon, restarts on change
# or: npm start
```

The API runs on `http://localhost:5000` by default. Check it's alive:

```bash
curl http://localhost:5000/api/health
```

### API reference

| Method | Route              | Description                          |
|--------|---------------------|---------------------------------------|
| GET    | /api/runs           | List recent runs (optional `?category=sorting\|searching\|graph`) |
| GET    | /api/runs/stats     | Aggregated average time/comparisons per algorithm |
| POST   | /api/runs           | Save a completed run                  |
| DELETE | /api/runs/:id       | Delete one run                        |
| DELETE | /api/runs           | Clear all history                     |

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. If your backend runs on a different host/port,
create `frontend/.env` with:

```
VITE_API_URL=http://localhost:5000/api
```

## 3. Using it

1. Pick an algorithm from the sidebar (grouped by Sorting / Searching / Graph).
2. Adjust size/speed/target where relevant, then click **run**.
3. Watch the animation; comparisons, swaps, and timing update live.
4. Open **Run History** to see everything saved to MongoDB, confirming the
   full round trip: React → Express → MongoDB → back to React.

## Notes on extending it

- Add a new sorting algorithm by writing a step-generator function in
  `algorithms/sorting.js` that pushes `{ array, compare, swap, sorted }`
  snapshots, then register it in the `SORTERS` map — the visualizer and
  history logging pick it up automatically.
- The graph uses a fixed layout/adjacency (`algorithms/graph.js`) so
  traversal order is easy to compare across algorithms; swap in a random
  graph generator if you want variety.
- `routes/runs.js` already exposes `/stats` (average time/comparisons per
  algorithm) if you want to add a chart to the History tab later.
