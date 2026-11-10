import { useState } from "react";
import Sidebar from "./components/Sidebar";
import SortingVisualizer from "./components/SortingVisualizer";
import SearchingVisualizer from "./components/SearchingVisualizer";
import GraphVisualizer from "./components/GraphVisualizer";
import HistoryPanel from "./components/HistoryPanel";
import { SORTERS } from "./algorithms/sorting";
import { SEARCHERS } from "./algorithms/searching";
import { GRAPH_ALGOS } from "./algorithms/graph";

export default function App() {
  const [active, setActive] = useState("bubble");

  function renderPanel() {
    if (active === "history") return <HistoryPanel />;
    if (SORTERS[active]) return <SortingVisualizer algoId={active} />;
    if (SEARCHERS[active]) return <SearchingVisualizer algoId={active} />;
    if (GRAPH_ALGOS[active]) return <GraphVisualizer algoId={active} />;
    return null;
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="logo">
          dsa<span>.sim</span>
        </div>
        <div className="status">
          <span className="status-dot online" />
          MERN visualizer
        </div>
      </div>
      <Sidebar active={active} onSelect={setActive} />
      <main className="main">{renderPanel()}</main>
    </div>
  );
}