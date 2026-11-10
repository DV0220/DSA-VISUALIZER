function snapshot(range, extra = {}) {
  return { range: [...range], ...extra };
}

export function linearSearch(arr, target) {
  const steps = [];
  let comparisons = 0;
  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    steps.push(snapshot([0, arr.length - 1], { current: i, found: -1 }));
    if (arr[i] === target) {
      steps.push(snapshot([0, arr.length - 1], { current: i, found: i }));
      return { steps, comparisons, foundIndex: i };
    }
  }
  steps.push(snapshot([0, arr.length - 1], { current: -1, found: -1, exhausted: true }));
  return { steps, comparisons, foundIndex: -1 };
}

export function binarySearch(arr, target) {
  const steps = [];
  let comparisons = 0;
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    comparisons++;
    steps.push(snapshot([lo, hi], { mid, found: -1 }));
    if (arr[mid] === target) {
      steps.push(snapshot([lo, hi], { mid, found: mid }));
      return { steps, comparisons, foundIndex: mid };
    } else if (arr[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  steps.push(snapshot([lo, hi], { mid: -1, found: -1, exhausted: true }));
  return { steps, comparisons, foundIndex: -1 };
}

export const SEARCHERS = {
  linear: { fn: linearSearch, label: "Linear Search", complexity: "O(n)", requiresSorted: false },
  binary: { fn: binarySearch, label: "Binary Search", complexity: "O(log n)", requiresSorted: true },
};
