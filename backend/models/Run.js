const mongoose = require("mongoose");

const runSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["sorting", "searching", "graph"],
    required: true,
  },
  algorithm: {
    type: String,
    required: true,
  },
  inputSize: {
    type: Number,
    required: true,
  },
  comparisons: {
    type: Number,
    default: 0,
  },
  swaps: {
    type: Number,
    default: 0,
  },
  timeTakenMs: {
    type: Number,
    required: true,
  },
  result: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Run", runSchema);
