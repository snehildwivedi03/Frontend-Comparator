import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchResults, clearResults } from "../utils/resultsApi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// COLORS FOR FRAMEWORKS
const FW_COLORS = {
  react: "#2563eb",
  angular: "#dc2626",
  vue: "#16a34a",
  svelte: "#ea580c",
};

// Reusable aggregation hook
const useMetric = (results, key, category = "json") => {
  const map = {};
  results
    .filter((r) => r.category === category)
    .forEach((r) => {
      const fw = r.framework;
      if (!map[fw]) map[fw] = [];
      if (r.metrics?.[key] != null) map[fw].push(Number(r.metrics[key]));
    });
  return Object.entries(map).map(([fw, arr]) => ({
    framework: fw.toUpperCase(),
    value: Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)),
    fill: FW_COLORS[fw],
  }));
};

export default function DashboardPage() {
  const [results, setResults] = useState([]);
  const [clearing, setClearing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const r = await fetchResults();
    setResults(r.results || []);
  };

  const clearData = async () => {
    setClearing(true);
    await clearResults();
    await load();
    setClearing(false);
  };

  // JSON Aggregations
  const parseData = useMetric(results, "parseTimeMs", "json");
  const travData = useMetric(results, "traversalTimeMs", "json");
  const renderData = useMetric(results, "renderTimeMs", "json");
  const fpsData = useMetric(results, "fps", "json");

  // API Aggregations
  const apiLatency = useMetric(results, "latencyMs", "api");
  const apiThroughput = useMetric(results, "throughput", "api");
  const apiSpeed = useMetric(results, "speedMBps", "api");

  // JSON Table
  const jsonTable = useMemo(() => {
    const map = {};
    results
      .filter((r) => r.category === "json")
      .forEach((r) => {
        const fw = r.framework,
          m = r.metrics || {};
        if (!map[fw])
          map[fw] = {
            fw,
            color: FW_COLORS[fw],
            count: [],
            parse: [],
            trav: [],
            render: [],
            fps: [],
            mem: [],
          };
        if (m.jsonCount) map[fw].count.push(m.jsonCount);
        if (m.parseTimeMs) map[fw].parse.push(m.parseTimeMs);
        if (m.traversalTimeMs) map[fw].trav.push(m.traversalTimeMs);
        if (m.renderTimeMs) map[fw].render.push(m.renderTimeMs);
        if (m.fps) map[fw].fps.push(m.fps);
        if (m.memoryUsedMB) map[fw].mem.push(m.memoryUsedMB);
      });

    const avg = (a) =>
      a.length ? (a.reduce((x, y) => x + y) / a.length).toFixed(2) : "-";

    return Object.values(map).map((i) => ({
      fw: i.fw.toUpperCase(),
      color: i.color,
      json: avg(i.count),
      parse: avg(i.parse),
      trav: avg(i.trav),
      render: avg(i.render),
      fps: avg(i.fps),
      mem: avg(i.mem),
    }));
  }, [results]);

  // API Table
  const apiTable = useMemo(() => {
    const map = {};
    results
      .filter((r) => r.category === "api")
      .forEach((r) => {
        const fw = r.framework,
          m = r.metrics || {};
        if (!map[fw])
          map[fw] = {
            fw,
            color: FW_COLORS[fw],
            payload: [],
            latency: [],
            throughput: [],
            speed: [],
            size: [],
          };
        if (m.payloadSize) map[fw].payload.push(m.payloadSize);
        if (m.latencyMs) map[fw].latency.push(m.latencyMs);
        if (m.throughput) map[fw].throughput.push(m.throughput);
        if (m.speedMBps) map[fw].speed.push(m.speedMBps);
        if (m.responseKB) map[fw].size.push(m.responseKB);
      });

    const avg = (a) =>
      a.length ? (a.reduce((x, y) => x + y) / a.length).toFixed(2) : "-";

    return Object.values(map).map((i) => ({
      fw: i.fw.toUpperCase(),
      color: i.color,
      payload: avg(i.payload),
      latency: avg(i.latency),
      throughput: avg(i.throughput),
      speed: avg(i.speed),
      size: avg(i.size),
    }));
  }, [results]);

  // Graph Component (Added specific className for targeting in PDF)
  const Graph = ({ title, data }) => (
    <div className="bg-white/80 backdrop-blur-sm border rounded-xl p-5 shadow-sm">
      <h2 className="font-semibold text-sm text-slate-900 mb-2">{title}</h2>
      <div className="h-64 w-full pdf-graph-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="framework" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" radius={6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // ---- ROBUST PDF DOWNLOADER ----
  const downloadPDF = async () => {
    setIsDownloading(true);

    try {
      // 1. Setup PDF Doc
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const margin = 10;
      const imgWidth = pdfWidth - margin * 2;

      // 2. Capture Function
      const captureSection = async (elementId) => {
        const element = document.getElementById(elementId);
        if (!element) return null;

        const canvas = await html2canvas(element, {
          scale: 1.5,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          // CRITICAL: Ensure full scroll height is captured
          windowWidth: document.documentElement.scrollWidth,
          windowHeight: document.documentElement.scrollHeight,
          onclone: (clonedDoc) => {
            // A. Fix Colors (Oklch/Oklab)
            const allElements = clonedDoc.querySelectorAll("*");
            allElements.forEach((el) => {
              const style = window.getComputedStyle(el);
              const sanitize = (prop, safeColor) => {
                const val = style.getPropertyValue(prop);
                if (val && (val.includes("oklab") || val.includes("oklch"))) {
                  el.style.setProperty(prop, safeColor, "important");
                }
              };
              sanitize("background-color", "#ffffff");
              sanitize("color", "#1e293b");
              sanitize("border-color", "#e2e8f0");
            });

            // B. HIDE TOOLTIPS (Artifacts)
            const tooltips = clonedDoc.getElementsByClassName(
              "recharts-tooltip-wrapper"
            );
            Array.from(tooltips).forEach((el) => (el.style.display = "none"));

            // C. FORCE GRAPH WIDTH (Fix for disappeared graphs)
            // ResponsiveContainer often collapses to 0 in background clones
            const graphContainers = clonedDoc.getElementsByClassName(
              "pdf-graph-container"
            );
            Array.from(graphContainers).forEach((el) => {
              el.style.width = "600px";
              el.style.height = "300px";
              el.style.display = "block";
            });
          },
        });

        return canvas.toDataURL("image/jpeg", 0.75); // JPEG 0.75 Quality (Small Size)
      };

      // --- CAPTURE PAGE 1 (JSON) ---
      const jsonImg = await captureSection("json-section");
      if (jsonImg) {
        const props = pdf.getImageProperties(jsonImg);
        const h = (props.height * imgWidth) / props.width;
        pdf.text("JSAP Benchmark Report - JSON Metrics", margin, 10);
        pdf.addImage(jsonImg, "JPEG", margin, 15, imgWidth, h);
      }

      // --- PAUSE ---
      // Give browser time to clear memory buffers
      await new Promise((resolve) => setTimeout(resolve, 500));

      // --- CAPTURE PAGE 2 (API) ---
      const apiImg = await captureSection("api-section");
      if (apiImg) {
        pdf.addPage();
        const props = pdf.getImageProperties(apiImg);
        const h = (props.height * imgWidth) / props.width;
        pdf.text("JSAP Benchmark Report - API Metrics", margin, 10);
        pdf.addImage(apiImg, "JPEG", margin, 15, imgWidth, h);
      }

      pdf.save("JSAP-Benchmark-Report.pdf");
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Error generating PDF. Please ensure charts are visible.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full py-10 px-6 sm:px-10"
      style={{
        background:
          "linear-gradient(to bottom right, #eff6ff, #f8fafc, #ede9fe)",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Header (Not captured) */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">
            📊 JSAP Benchmark Dashboard
          </h1>

          <div className="flex gap-3">
            <button
              onClick={downloadPDF}
              disabled={isDownloading}
              className={`text-white px-4 py-2 rounded-xl shadow transition flex items-center gap-2 
                ${
                  isDownloading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
            >
              {isDownloading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Downloading...
                </>
              ) : (
                "Download Report"
              )}
            </button>

            <button
              onClick={clearData}
              disabled={clearing || isDownloading}
              className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-500 disabled:opacity-60 shadow"
            >
              {clearing ? "Clearing..." : "Clear Results"}
            </button>
          </div>
        </div>

        {/* ================= PAGE 1 TARGET ================= */}
        <div
          id="json-section"
          className="flex flex-col gap-6 p-4 bg-transparent"
        >
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
            📌 JSON Performance Benchmarks
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">
            <Graph title="Parse Time" data={parseData} />
            <Graph title="Traversal Time" data={travData} />
            <Graph title="Render Time" data={renderData} />
            <Graph title="FPS Stability" data={fpsData} />
          </div>

          <table className="w-full bg-white/80 backdrop-blur-sm border rounded-xl p-5 shadow-sm text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3">Framework</th>
                <th># Items</th>
                <th>Parse</th>
                <th>Traverse</th>
                <th>Render</th>
                <th>FPS</th>
                <th>Memory</th>
              </tr>
            </thead>
            <tbody>
              {jsonTable.map((r) => (
                <tr
                  key={r.fw}
                  className="border-b hover:bg-slate-50 text-center"
                >
                  <td className="p-3 flex items-center gap-2 justify-center">
                    <span
                      style={{ background: r.color }}
                      className="w-3 h-3 rounded-full"
                    ></span>
                    {r.fw}
                  </td>
                  <td>{r.json}</td>
                  <td>{r.parse}ms</td>
                  <td>{r.trav}ms</td>
                  <td>{r.render}ms</td>
                  <td>{r.fps}</td>
                  <td>{r.mem}MB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= PAGE 2 TARGET ================= */}
        <div
          id="api-section"
          className="flex flex-col gap-6 p-4 bg-transparent"
        >
          <h2 className="text-xl font-bold text-slate-800 mt-6 border-b pb-2">
            📌 API Load Benchmarks
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">
            <Graph title="Latency" data={apiLatency} />
            <Graph title="Throughput" data={apiThroughput} />
            <Graph title="Speed (MB/s)" data={apiSpeed} />
          </div>

          <table className="w-full bg-white/80 backdrop-blur-sm border rounded-xl p-5 shadow-sm text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3">FW</th>
                <th>Payload</th>
                <th>Latency</th>
                <th>Throughput</th>
                <th>Speed</th>
                <th>Response KB</th>
              </tr>
            </thead>
            <tbody>
              {apiTable.length ? (
                apiTable.map((r) => (
                  <tr
                    key={r.fw}
                    className="border-b hover:bg-slate-50 text-center"
                  >
                    <td className="p-3 flex items-center gap-2 justify-center">
                      <span
                        style={{ background: r.color }}
                        className="w-3 h-3 rounded-full"
                      ></span>
                      {r.fw}
                    </td>
                    <td>{r.payload}</td>
                    <td>{r.latency}ms</td>
                    <td>{r.throughput}r/s</td>
                    <td>{r.speed}MB/s</td>
                    <td>{r.size}KB</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-5 text-slate-500">
                    No API benchmark records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
