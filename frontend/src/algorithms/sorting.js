// Each generator returns an array of "steps". A step describes the array
// state at that moment plus which indices are being compared/swapped, so
// the visualizer can animate frame by frame without re-running the algorithm.

function snapshot(array, { compare = [], swap = [], sorted = [] } = {}) {
  return { array: [...array], compare, swap, sorted: [...sorted] };
}

export function bubbleSort(input) {
  const arr = [...input];
  const steps = [];
  const n = arr.length;
  const sortedFromEnd = [];
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      steps.push(snapshot(arr, { compare: [j, j + 1], sorted: sortedFromEnd }));
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        steps.push(snapshot(arr, { swap: [j, j + 1], sorted: sortedFromEnd }));
      }
    }
    sortedFromEnd.unshift(n - i - 1);
  }
  sortedFromEnd.unshift(0);
  steps.push(snapshot(arr, { sorted: Array.from({ length: n }, (_, i) => i) }));
  return { steps, comparisons, swaps };
}

export function selectionSort(input) {
  const arr = [...input];
  const steps = [];
  const n = arr.length;
  const sorted = [];
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      steps.push(snapshot(arr, { compare: [minIdx, j], sorted }));
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      swaps++;
      steps.push(snapshot(arr, { swap: [i, minIdx], sorted }));
    }
    sorted.push(i);
  }
  sorted.push(n - 1);
  steps.push(snapshot(arr, { sorted: Array.from({ length: n }, (_, i) => i) }));
  return { steps, comparisons, swaps };
}

export function insertionSort(input) {
  const arr = [...input];
  const steps = [];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  for (let i = 1; i < n; i++) {
    let j = i - 1;
    const key = arr[i];
    while (j >= 0 && arr[j] > key) {
      comparisons++;
      steps.push(snapshot(arr, { compare: [j, j + 1] }));
      arr[j + 1] = arr[j];
      swaps++;
      j--;
      steps.push(snapshot(arr, { swap: [j + 1, j + 2] }));
    }
    arr[j + 1] = key;
    steps.push(snapshot(arr, {}));
  }
  steps.push(snapshot(arr, { sorted: Array.from({ length: n }, (_, i) => i) }));
  return { steps, comparisons, swaps };
}

export function mergeSort(input) {
  const arr = [...input];
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  function merge(lo, mid, hi) {
    const left = arr.slice(lo, mid + 1);
    const right = arr.slice(mid + 1, hi + 1);
    let i = 0,
      j = 0,
      k = lo;
    while (i < left.length && j < right.length) {
      comparisons++;
      steps.push(snapshot(arr, { compare: [lo + i, mid + 1 + j] }));
      if (left[i] <= right[j]) {
        arr[k++] = left[i++];
      } else {
        arr[k++] = right[j++];
      }
      swaps++;
      steps.push(snapshot(arr, { swap: [k - 1] }));
    }
    while (i < left.length) {
      arr[k++] = left[i++];
      steps.push(snapshot(arr, { swap: [k - 1] }));
    }
    while (j < right.length) {
      arr[k++] = right[j++];
      steps.push(snapshot(arr, { swap: [k - 1] }));
    }
  }

  function sort(lo, hi) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  }

  sort(0, arr.length - 1);
  steps.push(snapshot(arr, { sorted: Array.from({ length: arr.length }, (_, i) => i) }));
  return { steps, comparisons, swaps };
}

export function quickSort(input) {
  const arr = [...input];
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  function partition(lo, hi) {
    const pivot = arr[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      steps.push(snapshot(arr, { compare: [j, hi] }));
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        swaps++;
        steps.push(snapshot(arr, { swap: [i, j] }));
      }
    }
    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    swaps++;
    steps.push(snapshot(arr, { swap: [i + 1, hi] }));
    return i + 1;
  }

  function sort(lo, hi) {
    if (lo < hi) {
      const p = partition(lo, hi);
      sort(lo, p - 1);
      sort(p + 1, hi);
    }
  }

  sort(0, arr.length - 1);
  steps.push(snapshot(arr, { sorted: Array.from({ length: arr.length }, (_, i) => i) }));
  return { steps, comparisons, swaps };
}

export const SORTERS = {
  bubble: { fn: bubbleSort, label: "Bubble Sort", complexity: "O(n^2)" },
  selection: { fn: selectionSort, label: "Selection Sort", complexity: "O(n^2)" },
  insertion: { fn: insertionSort, label: "Insertion Sort", complexity: "O(n^2)" },
  merge: { fn: mergeSort, label: "Merge Sort", complexity: "O(n log n)" },
  quick: { fn: quickSort, label: "Quick Sort", complexity: "O(n log n) avg" },
};
