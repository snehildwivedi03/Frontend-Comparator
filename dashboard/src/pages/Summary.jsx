import { useEffect, useState } from "react";
import { fetchResults } from "../utils/resultsApi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import ReactMarkdown from "react-markdown";

// ... (Metric Info remains unchanged) ...
const METRIC_INFO = [
  {
    name: "Parse Time",
    desc: "Measures how fast the engine reads and converts JSON text into JavaScript objects.",
    calc: "performance.now() before and after JSON.parse()",
  },
  {
    name: "Traversal Time",
    desc: "Time taken to loop through entire JSON dataset & access nested values.",
    calc: "Iterating objects and summing values using forEach/map",
  },
  {
    name: "Render Time",
    desc: "Simulated UI workload that represents DOM rendering pressure.",
    calc: "Dummy render delay + JSON slice operations",
  },
  {
    name: "FPS Stability",
    desc: "Frames rendered per second. Indicates UI smoothness under heavy load.",
    calc: "requestAnimationFrame loop count within given time window",
  },
  {
    name: "Memory Usage",
    desc: "Estimated RAM consumed when JSON is loaded and parsed.",
    calc: "((JSON size * 2) / 1024 / 1024) in MB",
  },
  {
    name: "Latency (API)",
    desc: "Time between request start and response completion.",
    calc: "performance.now() before and after fetch()",
  },
  {
    name: "Throughput",
    desc: "Requests handled per second — higher means better handling speed.",
    calc: "1000 / latency",
  },
  {
    name: "Transfer Speed (MB/s)",
    desc: "Rate of response downloading — good for large payload APIs.",
    calc: "Size(KB) / 1024 / (latency/1000)",
  },
];

export default function SummaryPage() {
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    const r = await fetchResults();
    setResults(r.results || []);

    try {
      const s = await axios.get("http://localhost:5000/api/get-summary");
      if (s.data && s.data.summary) {
        setSummary(s.data.summary);
      }
    } catch (err) {
      console.log("No existing summary found.");
    }
  };

  const hasData = results.length > 0;

  const generateSummary = async () => {
    if (!hasData) {
      alert("Please run at least one benchmark first!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/generate-summary"
      );
      if (res.data.success) {
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        alert("Error: No benchmark data found on server. Run a test first.");
      } else {
        alert("Failed to generate summary. Check if Backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById("summary-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.querySelectorAll("*");
          allElements.forEach((el) => {
            const style = window.getComputedStyle(el);
            [
              "background-color",
              "color",
              "border-color",
              "outline-color",
            ].forEach((prop) => {
              const val = style.getPropertyValue(prop);
              if (val && (val.includes("oklab") || val.includes("oklch"))) {
                const safeColor = prop === "color" ? "#1e293b" : "#ffffff";
                el.style.setProperty(prop, safeColor, "important");
              }
            });
          });
        },
      });

      const img = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const margin = 15;
      const imgWidth = pdfWidth - margin * 2;
      const imgProps = pdf.getImageProperties(img);
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.text("JSAP Benchmark - AI Summary", margin, 12);
      pdf.addImage(img, "JPEG", margin, 20, imgWidth, imgHeight);
      pdf.save("JSAP-AI-Summary.pdf");
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Error generating PDF. Check console.");
    }
  };

  return (
    <div
      className="min-h-screen w-full py-10 px-6 sm:px-10"
      style={{
        background:
          "linear-gradient(to bottom right, #eef6ff, #f9fbff, #f7f3ff)",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-slate-900">
          📄 Benchmark Summary
        </h1>

        {/* No data state */}
        {!hasData && !summary && (
          <div className="bg-white border rounded-2xl p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              No benchmark results found
            </h2>
            <p className="text-slate-600 mb-5">
              Run at least one test in a framework benchmark app to enable AI
              Analysis.
            </p>
            <a
              href="http://localhost:5173"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow inline-block"
            >
              Go to Launchpad →
            </a>
          </div>
        )}

        {/* Metrics Explanation */}
        {hasData && !summary && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-800">
              📌 Understanding Benchmark Metrics
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {METRIC_INFO.map((m) => (
                <div
                  key={m.name}
                  className="bg-white border rounded-xl p-4 shadow-sm hover:shadow transition"
                >
                  <h3 className="font-semibold text-slate-900">{m.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{m.desc}</p>
                  <p className="text-xs text-blue-600 mt-2">📐 {m.calc}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center pt-4">
              <button
                onClick={generateSummary}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-500 shadow text-sm flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Generating with Gemini AI...
                  </>
                ) : (
                  "Generate AI Summary"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ---------- Summary Display ---------- */}
        {summary && (
          <div
            id="summary-content"
            className="bg-white p-8 border rounded-2xl shadow-lg space-y-6"
          >
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                📊 AI Analysis Report
              </h2>
              {/* Removed the 'Generated by Gemini Pro' badge */}
            </div>

            {/* Markdown Content */}
            <div className="text-slate-700">
              <ReactMarkdown
                components={{
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-xl font-bold text-slate-800 mt-6 mb-3 border-l-4 border-blue-500 pl-3"
                      {...props}
                    />
                  ),
                  strong: ({ node, ...props }) => (
                    <span className="font-bold text-slate-900" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 space-y-2 mb-4" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-slate-600 leading-relaxed" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      className="mb-4 text-slate-600 leading-relaxed"
                      {...props}
                    />
                  ),
                }}
              >
                {summary}
              </ReactMarkdown>
            </div>

            <div className="pt-6 flex justify-start border-t mt-4">
              <button
                onClick={downloadPDF}
                className="bg-slate-900 text-white px-5 py-2 rounded-xl hover:bg-slate-800 shadow text-sm transition-transform active:scale-95"
              >
                Download Summary PDF
              </button>

              {/* Removed the Regenerate Button */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
