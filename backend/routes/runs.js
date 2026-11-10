const express = require("express");
const router = express.Router();
const Run = require("../models/Run");

// GET /api/runs - list history, most recent first, optional ?category= filter
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const runs = await Run.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/runs/stats - aggregate average time per algorithm
router.get("/stats", async (req, res) => {
  try {
    const stats = await Run.aggregate([
      {
        $group: {
          _id: { algorithm: "$algorithm", category: "$category" },
          avgTimeMs: { $avg: "$timeTakenMs" },
          runs: { $sum: 1 },
          avgComparisons: { $avg: "$comparisons" },
        },
      },
      { $sort: { "_id.category": 1, "_id.algorithm": 1 } },
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/runs - save a completed visualization run
router.post("/", async (req, res) => {
  try {
    const { category, algorithm, inputSize, comparisons, swaps, timeTakenMs, result } = req.body;
    if (!category || !algorithm || inputSize == null || timeTakenMs == null) {
      return res.status(400).json({ error: "category, algorithm, inputSize, timeTakenMs are required" });
    }
    const run = await Run.create({ category, algorithm, inputSize, comparisons, swaps, timeTakenMs, result });
    res.status(201).json(run);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/runs/:id - remove a single history entry
router.delete("/:id", async (req, res) => {
  try {
    await Run.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/runs - clear all history
router.delete("/", async (req, res) => {
  try {
    await Run.deleteMany({});
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
