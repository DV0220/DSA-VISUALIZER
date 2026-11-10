import { useEffect, useRef, useState } from "react";
import { GRAPH_ALGOS, NODES, EDGES } from "../algorithms/graph";
import { saveRun } from "../api";

export default function GraphVisualizer({ algoId }) {
  const algo = GRAPH_ALGOS[algoId];
  const [start, setStart] = useState("A");
  const [run, setRun] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setRun(null);
    setStepIndex(0);
    setPlaying(false);
    setSaved(false);
  }, [algoId, start]);

  const step = run ? run.steps[stepIndex] : null;
  const finished = run && stepIndex === run.steps.length - 1;

  function startRun() {
    const t0 = performance.now();
    const result = algo.fn(start);
    const timeTakenMs = Math.round(performance.now() - t0);
    setRun({ ...result, timeTakenMs });
    setStepIndex(0);
    setSaved(false);
    setPlaying(true);
  }

  useEffect(() => {
    if (playing && run) {
      timerRef.current = setInterval(() => {
        setStepIndex((i) => {
          if (i >= run.steps.length - 1) {
            clearInterval(timerRef.current);
            setPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, 700);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, run]);

  useEffect(() => {
    if (finished && run && !saved) {
      saveRun({
        category: "graph",
        algorithm: algo.label,
        inputSize: NODES.length,
        comparisons: run.comparisons,
        timeTakenMs: run.timeTakenMs,
        result: run.order ? `visit order: ${run.order.join(" -> ")}` : "distances computed",
      })
        .then(() => setSaved(true))
        .catch(() => {});
    }
  }, [finished, run, saved]);

  function nodePos(id) {
    return NODES.find((n) => n.id === id);
  }

  const visited = step?.visited || [];
  const current = step?.current;
  const activeEdge = step?.edge;

  return (
    <div>
      <div className="panel-header">
        <h2>{algo.label}</h2>
        <span className="complexity">{algo.complexity}</span>
      </div>
      <p className="panel-description">
        Runs on a fixed weighted graph so you can compare traversal order across algorithms directly.
      </p>

      <div className="controls-row">
        <label>
          start node
          <select value={start} onChange={(e) => setStart(e.target.value)}>
            {NODES.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" onClick={startRun}>
          {finished ? "run again" : "run"}
        </button>
      </div>

      <div className="stage" style={{ alignItems: "center" }}>
        <svg viewBox="0 0 640 360" width="100%" height="340">
          {EDGES.map(([u, v, w], idx) => {
            const p1 = nodePos(u);
            const p2 = nodePos(v);
            const isActive =
              activeEdge && ((activeEdge[0] === u && activeEdge[1] === v) || (activeEdge[0] === v && activeEdge[1] === u));
            return (
              <g key={idx}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isActive ? "#5eead4" : "#262b38"}
                  strokeWidth={isActive ? 3 : 1.5}
                />
                <text
                  x={(p1.x + p2.x) / 2}
                  y={(p1.y + p2.y) / 2 - 6}
                  fill="#8a8f9c"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="11"
                  textAnchor="middle"
                >
                  {w}
                </text>
              </g>
            );
          })}
          {NODES.map((n) => {
            const isVisited = visited.includes(n.id);
            const isCurrent = current === n.id;
            const dist = step?.dist?.[n.id];
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={20}
                  fill={isCurrent ? "#f2b84b" : isVisited ? "#2b3d3a" : "#1b1f2b"}
                  stroke={isCurrent ? "#f2b84b" : isVisited ? "#5eead4" : "#262b38"}
                  strokeWidth="2"
                />
                <text
                  x={n.x}
                  y={n.y + 5}
                  fill={isCurrent ? "#0e1015" : "#e9e7e1"}
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="13"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {n.id}
                </text>
                {dist !== undefined && (
                  <text
                    x={n.x}
                    y={n.y - 28}
                    fill="#f2b84b"
                    fontFamily="JetBrains Mono, monospace"
                    fontSize="11"
                    textAnchor="middle"
                  >
                    {dist === Infinity ? "inf" : dist}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="graph-legend">
        <span>
          <span className="legend-dot" style={{ background: "#f2b84b" }} /> current
        </span>
        <span>
          <span className="legend-dot" style={{ background: "#2b3d3a", border: "1px solid #5eead4" }} /> visited
        </span>
        <span>
          <span className="legend-dot" style={{ background: "#1b1f2b", border: "1px solid #262b38" }} /> unvisited
        </span>
      </div>

      <div className="metrics-row">
        <span>
          step: <b>{run ? `${stepIndex + 1} / ${run.steps.length}` : "0 / 0"}</b>
        </span>
        <span>
          visited: <b>{visited.length}</b> / {NODES.length}
        </span>
        <span>
          last run time: <b>{run ? `${run.timeTakenMs} ms` : "—"}</b>
        </span>
      </div>
    </div>
  );
}