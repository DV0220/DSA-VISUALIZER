const NAV = [
  {
    group: "sorting",
    items: [
      { id: "bubble", label: "Bubble Sort" },
      { id: "selection", label: "Selection Sort" },
      { id: "insertion", label: "Insertion Sort" },
      { id: "merge", label: "Merge Sort" },
      { id: "quick", label: "Quick Sort" },
    ],
  },
  {
    group: "searching",
    items: [
      { id: "linear", label: "Linear Search" },
      { id: "binary", label: "Binary Search" },
    ],
  },
  {
    group: "graph",
    items: [
      { id: "bfs", label: "BFS" },
      { id: "dfs", label: "DFS" },
      { id: "dijkstra", label: "Dijkstra" },
    ],
  },
  {
    group: "activity",
    items: [{ id: "history", label: "Run History" }],
  },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <nav className="sidebar">
      {NAV.map((section) => (
        <div className="sidebar-group" key={section.group}>
          <h4>{section.group}</h4>
          {section.items.map((item) => (
            <button
              key={item.id}
              className={"sidebar-item" + (active === item.id ? " active" : "")}
              onClick={() => onSelect(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}
