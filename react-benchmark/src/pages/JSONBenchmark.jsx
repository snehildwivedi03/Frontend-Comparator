import { useState } from "react";
import axios from "axios";
import "../App.css";
import Loader from "../components/Loader";

export default function JSONBenchmark() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [jsonSize, setJsonSize] = useState(500);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [data, setData] = useState([]);

  const API_URL = "http://localhost:5000/api/report-result";

  const sizes = [
    { label: "500", value: 500 },
    { label: "5K", value: 5000 },
    { label: "10K", value: 10000 },
    { label: "100K", value: 100000 },
    { label: "250K", value: 250000 },
    { label: "500K", value: 500000 },
  ];

  const generateJSON = (count) => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        name: "Item " + i,
        value: Math.random() * 1000,
        nested: { x: Math.random(), y: Math.random() },
      });
    }
    return arr;
  };

  const traverseJSON = (arr) => {
    let sum = 0;
    for (let o of arr) sum += o.value + o.nested.x + o.nested.y;
    return sum;
  };

  const measureFPS = (duration = 1800) => {
    return new Promise((resolve) => {
      let frames = 0;
      let start = performance.now();
      const loop = () => {
        frames++;
        if (performance.now() - start < duration) requestAnimationFrame(loop);
        else resolve((frames / (duration / 1000)).toFixed(1));
      };
      requestAnimationFrame(loop);
    });
  };

  const runJSONBenchmark = async () => {
    setLoading(true);
    setShowSuccess(false);
    setBenchmarkResult(null);
    setStatus("Benchmark running...");

    const generated = generateJSON(jsonSize);
    const jsonString = JSON.stringify(generated);
    const memoryUsedMB = ((jsonString.length * 2) / (1024 * 1024)).toFixed(2);

    const startParse = performance.now();
    const parsed = JSON.parse(jsonString);
    const endParse = performance.now();

    const startTrav = performance.now();
    traverseJSON(parsed);
    const endTrav = performance.now();

    // 🔥 Render time fix — UI update measured correctly
    const startRender = performance.now();
    setData(parsed.slice(0, 300));
    await new Promise((r) => setTimeout(r, 0));
    const endRender = performance.now();

    const fps = await measureFPS();

    setBenchmarkResult({
      datasetSize: jsonSize,
      parseTime: (endParse - startParse).toFixed(2),
      traverseTime: (endTrav - startTrav).toFixed(2),
      renderTime: (endRender - startRender).toFixed(2),
      fps,
      memoryMB: Number(memoryUsedMB),
    });

    setLoading(false);
    setStatus("Done");
  };

  const uploadToDashboard = async () => {
    setStatus("Uploading...");
    await axios.post(API_URL, {
      id: "json-react-" + Date.now(),
      framework: "react",
      category: "json",
      scenario: "json-bulk",
      config: { datasetSize: benchmarkResult.datasetSize },
      metrics: {
        jsonCount: benchmarkResult.datasetSize,
        parseTimeMs: Number(benchmarkResult.parseTime),
        traversalTimeMs: Number(benchmarkResult.traverseTime),
        renderTimeMs: Number(benchmarkResult.renderTime),
        fps: Number(benchmarkResult.fps),
        memoryUsedMB: benchmarkResult.memoryMB,
      },
    });

    setShowSuccess(true); // <-- stop redirect here
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-5">
      <h1 className="text-3xl font-bold text-slate-900 text-center">
        React JSON Benchmark
      </h1>
      <p className="text-center text-sm text-slate-600">
        Measures parsing, traversal, rendering speed & FPS stability.
      </p>

      <label className="text-xs font-medium text-slate-600">
        Select Dataset Size
      </label>
      <select
        value={jsonSize}
        onChange={(e) => setJsonSize(Number(e.target.value))}
        className="border rounded-xl px-3 py-2"
      >
        {sizes.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <button
        onClick={runJSONBenchmark}
        disabled={loading}
        className="bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-500 transition font-semibold flex justify-center items-center h-[42px]"
      >
        {loading ? <Loader /> : "Run JSON Benchmark"}
      </button>

      {benchmarkResult && (
        <div className="bg-slate-50 p-4 rounded-xl text-sm space-y-1">
          <p>
            <b>Items:</b> {benchmarkResult.datasetSize.toLocaleString()}
          </p>
          <p>
            <b>Parse:</b> {benchmarkResult.parseTime} ms
          </p>
          <p>
            <b>Traverse:</b> {benchmarkResult.traverseTime} ms
          </p>
          <p>
            <b>Render:</b> {benchmarkResult.renderTime} ms
          </p>
          <p>
            <b>FPS:</b> {benchmarkResult.fps}
          </p>
          <p>
            <b>Memory:</b> {benchmarkResult.memoryMB} MB
          </p>

          <button
            onClick={uploadToDashboard}
            className="w-full bg-slate-900 text-white py-2 rounded-xl mt-3 hover:bg-slate-800"
          >
            Upload to Dashboard
          </button>
          {showSuccess && (
            <div className="text-center mt-3 space-y-2">
              <p className="text-green-600 font-semibold">✓ Uploaded</p>

              <button
                onClick={() =>
                  (window.location.href = "http://localhost:5173/dashboard")
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 w-full"
                target="#"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
