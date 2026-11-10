import { useEffect, useMemo, useRef, useState } from "react";
import { SORTERS } from "../algorithms/sorting";
import { saveRun } from "../api";

function randomArray(size) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

function parseCustomArray(text) {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}

export default function SortingVisualizer({ algoId }) {
  const algo = SORTERS[algoId];
  const [size, setSize] = useState(20);
  const [speed, setSpeed] = useState(60);
  const [seedArray, setSeedArray] = useState(() => randomArray(20));
  const [customInput, setCustomInput] = useState("");
  const [customError, setCustomError] = useState("");
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
  }, [algoId]);

  useEffect(() => {
    setSeedArray(randomArray(size));
    setRun(null);
    setStepIndex(0);
    setPlaying(false);
    setSaved(false);
  }, [size]);

  const currentArray = run ? run.steps[stepIndex]?.array : seedArray;
  const maxVal = useMemo(() => Math.max(...currentArray, 1), [currentArray]);
  const step = run ? run.steps[stepIndex] : null;
  const finished = run && stepIndex === run.steps.length - 1;

  function newRandomArray() {
    stopPlay();
    setCustomInput("");
    setCustomError("");
    setSeedArray(randomArray(size));
    setRun(null);
    setStepIndex(0);
    setSaved(false);
  }

  function applyCustomArray() {
    const parsed = parseCustomArray(customInput);
    if (parsed.length < 2) {
      setCustomError("Enter at least 2 numbers, separated by commas (e.g. 40,10,60,25,80)");
      return;
    }
    if (parsed.length > 60) {
      setCustomError("Keep it to 60 numbers or fewer so the bars stay readable");
      return;
    }
    stopPlay();
    setCustomError("");
    setSeedArray(parsed);
    setSize(parsed.length);
    setRun(null);
    setStepIndex(0);
    setSaved(false);
  }

  function startRun() {
    const t0 = performance.now();
    const result = algo.fn(seedArray);
    const timeTakenMs = Math.round(performance.now() - t0);
    setRun({ ...result, timeTakenMs });
    setStepIndex(0);
    setSaved(false);
    setPlaying(true);
  }

  function stopPlay() {
    setPlaying(false);
    clearInterval(timerRef.current);
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
      }, 210 - speed * 2);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, run, speed]);

  useEffect(() => {
    if (finished && run && !saved) {
      saveRun({
        category: "sorting",
        algorithm: algo.label,
        inputSize: seedArray.length,
        comparisons: run.comparisons,
        swaps: run.swaps,
        timeTakenMs: run.timeTakenMs,
        result: "sorted",
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
        Watch how {algo.label.toLowerCase()} rearranges an array. Amber bars are being compared, red bars are
        mid-swap, teal bars are locked into their sorted position. Use a random array, or type your own numbers
        below.
      </p>

      <div className="controls-row">
        <label>
          random size
          <input
            type="number"
            min={5}
            max={60}
            value={size}
            onChange={(e) => setSize(Math.min(60, Math.max(5, Number(e.target.value))))}
          />
        </label>
        <label>
          speed
          <input type="range" min={1} max={95} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        </label>
        <button className="btn" onClick={newRandomArray}>
          new random array
        </button>
        {!run || finished ? (
          <button className="btn btn-primary" onClick={startRun}>
            {finished ? "run again" : "run"}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setPlaying((p) => !p)}>
            {playing ? "pause" : "resume"}
          </button>
        )}
      </div>

      <div className="controls-row">
        <label style={{ flex: 1, minWidth: 260 }}>
          custom array (comma separated)
          <input
            type="text"
            placeholder="e.g. 40,10,60,25,80,15,30"
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

      <div className="stage">
        {currentArray.map((val, i) => {
          let cls = "bar";
          if (step) {
            if (step.compare?.includes(i)) cls += " compare";
            if (step.swap?.includes(i)) cls += " swap";
            if (step.sorted?.includes(i)) cls += " sorted";
          }
          return (
            <div
              key={i}
              className={cls}
              style={{ height: `${(val / maxVal) * 260}px`, width: `${Math.max(6, 640 / currentArray.length - 3)}px` }}
            >
              {currentArray.length <= 30 ? val : ""}
            </div>
          );
        })}
      </div>

      <div className="metrics-row">
        <span>
          comparisons: <b>{run?.comparisons ?? 0}</b>
        </span>
        <span>
          swaps: <b>{run?.swaps ?? 0}</b>
        </span>
        <span>
          step: <b>{run ? `${stepIndex + 1} / ${run.steps.length}` : "0 / 0"}</b>
        </span>
        <span>
          last run time: <b>{run ? `${run.timeTakenMs} ms` : "—"}</b>
        </span>
      </div>
    </div>
  );
}