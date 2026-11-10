import { useEffect, useState } from "react";
import { fetchRuns, clearRuns, deleteRun } from "../api";

export default function HistoryPanel() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    fetchRuns()
      .then((data) => {
        setRuns(data);
        setError(null);
      })
      .catch(() => setError("Could not reach the backend. Is the Express server running on port 5000?"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="panel-header">
        <h2>Run History</h2>
      </div>
      <p className="panel-description">
        Every completed visualization is saved to MongoDB through the Express API. This confirms your full stack
        (React → Express → MongoDB) is wired end to end.
      </p>

      <div className="controls-row">
        <button className="btn" onClick={load}>
          refresh
        </button>
        <button
          className="btn"
          onClick={() =>
            clearRuns().then(() => {
              setRuns([]);
            })
          }
        >
          clear all
        </button>
      </div>

      {error && <div className="empty-state">{error}</div>}
      {!error && loading && <div className="empty-state">loading…</div>}
      {!error && !loading && runs.length === 0 && (
        <div className="empty-state">No runs saved yet — run a sorting, searching, or graph visualizer first.</div>
      )}
      {!error && !loading && runs.length > 0 && (
        <table className="history-table">
          <thead>
            <tr>
              <th>category</th>
              <th>algorithm</th>
              <th>input size</th>
              <th>comparisons</th>
              <th>time</th>
              <th>result</th>
              <th>when</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r._id}>
                <td>{r.category}</td>
                <td>{r.algorithm}</td>
                <td>{r.inputSize}</td>
                <td>{r.comparisons}</td>
                <td>{r.timeTakenMs} ms</td>
                <td>{r.result}</td>
                <td>{new Date(r.createdAt).toLocaleTimeString()}</td>
                <td>
                  <button
                    className="btn"
                    style={{ padding: "3px 8px" }}
                    onClick={() => deleteRun(r._id).then(load)}
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
