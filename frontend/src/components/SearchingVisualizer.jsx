import { useEffect, useRef, useState } from "react";
import { SEARCHERS } from "../algorithms/searching";
import { saveRun } from "../api";

function randomSortedArray(size) {
  const arr = [];
  let v = Math.floor(Math.random() * 5);
  for (let i = 0; i < size; i++) {
    arr.push(v);
    v += Math.floor(Math.random() * 6) + 1;
  }
  return arr;
}

function parseCustomArray(text) {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}

export default function SearchingVisualizer({ algoId }) {
  const algo = SEARCHERS[algoId];
  const [size, setSize] = useState(16);
  const [array, setArray] = useState(() => randomSortedArray(16));
  const [target, setTarget] = useState(array[Math.floor(array.length / 2)]);
  const [customInput, setCustomInput] = useState("");
  const [customError, setCustomError] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [run, setRun] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    reset(size);
  }, [algoId]);

  function reset(newSize) {
    const arr = randomSortedArray(newSize);
    setArray(arr);
    setTarget(arr[Math.floor(Math.random() * arr.length)]);
    setCustomInput("");
    setCustomError("");
    setCustomNote("");
    setRun(null);
    setStepIndex(0);
    setPlaying(false);
    setSaved(false);
  }

  function applyCustomArray() {
    const parsed = parseCustomArray(customInput);
    if (parsed.length < 1) {
      setCustomError("Enter at least 1 number, separated by commas (e.g. 3,7,12,19,25)");
      return;
    }
    if (parsed.length > 40) {
      setCustomError("Keep it to 40 numbers or fewer so the cells stay readable");
      return;
    }
    let finalArray = parsed;
    let note = "";
    if (algo.requiresSorted) {
      const sorted = [...parsed].sort((a, b) => a - b);
      const alreadySorted = sorted.every((v, i) => v === parsed[i]);
      if (!alreadySorted) {
        finalArray = sorted;
        note = "Binary search needs a sorted array — your numbers were sorted automatically.";
      }
    }
    setCustomError("");
    setCustomNote(note);
    setArray(finalArray);
    setTarget(finalArray[0]);
    setRun(null);
    setStepIndex(0);
    setSaved(false);
  }

  const step = run ? run.steps[stepIndex] : null;
  const finished = run && stepIndex === run.steps.length - 1;

  function startRun() {
    const t0 = performance.now();
    const result = algo.fn(array, target);
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
      }, 550);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, run]);

  useEffect(() => {
    if (finished && run && !saved) {
      saveRun({
        category: "searching",
        algorithm: algo.label,
        inputSize: array.length,
        comparisons: run.comparisons,
        timeTakenMs: run.timeTakenMs,
        result: run.foundIndex >= 0 ? `found at index ${run.foundIndex}` : "not found",
      })
        .then(() => setSaved(true))
        .catch(() => {});
    }
  }, [finished, run, saved]);

  return (
    <div>
      <div className="panel-header">
        <h2>{algo.label}</h2>
        <span className="complexity">{algo.complexity}</span>
      </div>
      <p className="panel-description">
        {algo.requiresSorted
          ? "Binary search needs a sorted array — random arrays are generated pre-sorted, and any custom array you enter will be sorted automatically."
          : "Linear search checks each element left to right until it finds the target."}
      </p>

      <div className="controls-row">
        <label>
          random size
          <input
            type="number"
            min={6}
            max={30}
            value={size}
            onChange={(e) => {
              const v = Math.min(30, Math.max(6, Number(e.target.value)));
              setSize(v);
              reset(v);
            }}
          />
        </label>
        <label>
          target
          <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
        </label>
        <button className="btn" onClick={() => reset(size)}>
          new random array
        </button>
        <button className="btn btn-primary" onClick={startRun}>
          {finished ? "run again" : "run"}
        </button>
      </div>

      <div className="controls-row">
        <label style={{ flex: 1, minWidth: 260 }}>
          custom array (comma separated)
          <input
            type="text"
            placeholder="e.g. 3,7,12,19,25,31"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
        <button className="btn" onClick={applyCustomArray}>
          use this array
        </button>
      </div>
      {customError && (
        <p style={{ color: "var(--accent-red)", fontSize: "12.5px", fontFamily: "var(--font-mono)", margin: "-8px 0 16px" }}>
          {customError}
        </p>
      )}
      {!customError && customNote && (
        <p style={{ color: "var(--accent-amber)", fontSize: "12.5px", fontFamily: "var(--font-mono)", margin: "-8px 0 16px" }}>
          {customNote}
        </p>
      )}

      <div className="stage" style={{ flexWrap: "wrap" }}>
        <div className="array-strip">
          {array.map((val, i) => {
            let cls = "array-cell";
            if (step) {
              const inRange = i >= step.range[0] && i <= step.range[1];
              if (!inRange) cls += " discarded";
              else cls += " range";
              if (step.mid === i) cls += " mid";
              if (step.current === i) cls += " mid";
              if (step.found === i) cls += " found";
            }
            return (
              <div className={cls} key={i}>
                <span className="idx">{i}</span>
                {val}
              </div>
            );
          })}
        </div>
      </div>

      <div className="metrics-row">
        <span>
          target: <b>{target}</b>
        </span>
        <span>
          comparisons: <b>{run?.comparisons ?? 0}</b>
        </span>
        <span>
          result:{" "}
          <b>
            {run
              ? run.foundIndex >= 0
                ? `found at index ${run.foundIndex}`
                : "not found"
              : "—"}
          </b>
        </span>
        <span>
          last run time: <b>{run ? `${run.timeTakenMs} ms` : "—"}</b>
        </span>
      </div>
    </div>
  );
}