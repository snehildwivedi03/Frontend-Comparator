import { useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";

export default function ApiBenchmark() {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [count, setCount] = useState(200);
  const [showSuccess, setShowSuccess] = useState(false);

  // ================= RUN API TEST =================
  const runTest = async () => {
    setStatus("running");
    setResult(null);

    const start = performance.now();
    const res = await axios.get(
      `http://localhost:5000/api/heavy-json?size=${count}`
    );
    const latency = performance.now() - start;

    const responseKB = JSON.stringify(res.data).length / 1024;
    const throughput = 1000 / latency;
    const speedMBps = responseKB / 1024 / (latency / 1000);

    setResult({
      count,
      latency: latency.toFixed(2),
      throughput: throughput.toFixed(2),
      responseKB: responseKB.toFixed(2),
      speedMBps: speedMBps.toFixed(2),
    });

    setStatus("done");
  };

  // ================= UPLOAD TO DASHBOARD (fixed latency bug) =================
  const upload = async () => {
    if (!result) return;

    setStatus("uploading");

    await axios.post("http://localhost:5000/api/report-result", {
      id: "api-react-" + Date.now(),
      framework: "react",
      category: "api",
      scenario: "api-load",
      config: { requestCount: count },

      // 🔥 FIXED → now latency uploads correctly as latencyMs
      metrics: {
        payloadSize: Number(result.count),
        latencyMs: Number(result.latency), // << FIX
        throughput: Number(result.throughput),
        responseKB: Number(result.responseKB),
        speedMBps: Number(result.speedMBps),
      },
    });

    setShowSuccess(true);
    setStatus("done");
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-5">
      <h1 className="text-3xl font-bold text-slate-800 text-center">
        React API Load Benchmark
      </h1>

      <p className="text-center text-slate-600 text-sm -mt-2">
        Tests response latency, throughput & transfer performance.
      </p>

      <label className="text-xs font-semibold text-slate-600">
        Payload Size
      </label>

      <select
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
        className="border px-3 py-2 rounded-xl"
      >
        <option value={200}>200</option>
        <option value={1000}>1K</option>
        <option value={5000}>5K</option>
        <option value={20000}>20K</option>
      </select>

      <button
        onClick={runTest}
        disabled={status === "running"}
        className="bg-blue-600 text-white py-2 rounded-xl font-semibold flex justify-center"
      >
        {status === "running" ? <Loader /> : "Run API Load Test"}
      </button>

      {result && (
        <div className="bg-slate-50 p-4 rounded-xl text-sm space-y-1 animate-fadeIn">
          <p>
            <b>Payload:</b> {result.count.toLocaleString()} items
          </p>
          <p>
            <b>Latency:</b> {result.latency} ms
          </p>
          <p>
            <b>Throughput:</b> {result.throughput} req/sec
          </p>
          <p>
            <b>Response Size:</b> {result.responseKB} KB
          </p>
          <p>
            <b>Speed:</b> {result.speedMBps} MB/s
          </p>

          <button
            onClick={upload}
            className="mt-3 bg-slate-900 text-white w-full py-2 rounded-xl font-medium"
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
