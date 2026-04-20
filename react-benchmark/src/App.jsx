import { useState } from "react";
import "./App.css";
import ApiBenchmark from "./pages/ApiBenchmark";
import JSONBenchmark from "./pages/JSONBenchmark";

export default function App() {
  const [page, setPage] = useState("json");

  return (
    <div className="min-h-screen p-8 flex flex-col items-center gap-10 bg-slate-50">
      {/* ================= Page Heading ================= */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">
          React Performance Benchmark Suite
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Compare JSON computation speed & API workload performance in real
          time.
        </p>
      </div>

      {/* ================= Navigation Tabs (Unchanged UI) ================= */}
      <div className="flex gap-4">
        <button
          onClick={() => setPage("json")}
          className={`px-5 py-2 rounded-xl font-medium transition ${
            page === "json"
              ? "bg-blue-600 text-white"
              : "bg-white border border-slate-300 hover:bg-slate-100"
          }`}
        >
          JSON Benchmark
        </button>

        <button
          onClick={() => setPage("api")}
          className={`px-5 py-2 rounded-xl font-medium transition ${
            page === "api"
              ? "bg-blue-600 text-white"
              : "bg-white border border-slate-300 hover:bg-slate-100"
          }`}
        >
          API Load Test
        </button>
      </div>

      {/* ================= Page Switch ================= */}
      {page === "json" && <JSONBenchmark />}
      {page === "api" && <ApiBenchmark />}
    </div>
  );
}
