import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = 5000;

// Path Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resultsFile = path.join(__dirname, "results.json");
const summaryFile = path.join(__dirname, "summary.json");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json({ limit: "50mb" }));
app.use(cors());

// Ensure Files Exist
const ensureFile = (file, defaultData) => {
  if (!fs.existsSync(file))
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
};
ensureFile(resultsFile, { results: [] });
ensureFile(summaryFile, { summary: null, timestamp: null });

// --- Endpoints ---

app.get("/", (_, res) => res.send("Benchmark Server Running ✔"));

app.get("/api/heavy-json", (req, res) => {
  const size = parseInt(req.query.size) || 1000;
  const data = Array.from({ length: size }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    nested: { deep: "data", value: Math.random() },
    timestamp: new Date().toISOString(),
  }));
  res.json(data);
});

app.get("/api/results", (_, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(resultsFile, "utf8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read results" });
  }
});

app.post("/api/report-result", (req, res) => {
  try {
    const fileData = JSON.parse(fs.readFileSync(resultsFile, "utf8"));
    const {
      metrics: m = {},
      config: cfg = {},
      category,
      id,
      framework,
      scenario,
    } = req.body;

    let normalizedMetrics = {};

    if (category === "json") {
      const jsonCount = m.jsonCount ?? cfg.datasetSize ?? null;
      let memoryUsedMB = m.memoryUsedMB ? Number(m.memoryUsedMB) : null;
      if (!memoryUsedMB && jsonCount) {
        memoryUsedMB = Number(((jsonCount * 220) / (1024 * 1024)).toFixed(2));
      }
      normalizedMetrics = {
        jsonCount,
        parseTimeMs: Number(m.parseTimeMs ?? 0),
        traversalTimeMs: Number(m.traversalTimeMs ?? 0),
        renderTimeMs: Number(m.renderTimeMs ?? 0),
        fps: Number(m.fps ?? 0),
        memoryUsedMB,
      };
    } else if (category === "api") {
      normalizedMetrics = {
        payloadSize: Number(m.payloadSize ?? cfg.requestCount ?? 0),
        latencyMs: Number(m.latencyMs ?? 0),
        throughput: Number(m.throughput ?? 0),
        responseKB: Number(m.responseKB ?? 0),
        speedMBps: Number(m.speedMBps ?? 0),
      };
    }

    fileData.results.push({
      id,
      framework,
      category,
      scenario,
      config: cfg,
      metrics: normalizedMetrics,
      timestamp: new Date().toISOString(),
    });

    fs.writeFileSync(resultsFile, JSON.stringify(fileData, null, 2));
    console.log(`📩 Saved ${category} result for ${framework}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save result" });
  }
});

app.post("/api/clear-results", (_, res) => {
  fs.writeFileSync(resultsFile, JSON.stringify({ results: [] }, null, 2));
  fs.writeFileSync(
    summaryFile,
    JSON.stringify({ summary: null, timestamp: null }, null, 2)
  );
  console.log("🧹 Results cleared");
  res.json({ success: true });
});

app.get("/api/get-summary", (_, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(summaryFile, "utf8"));
    res.json(data);
  } catch {
    res.json({ summary: null });
  }
});

app.post("/api/generate-summary", async (_, res) => {
  try {
    const fileData = JSON.parse(fs.readFileSync(resultsFile, "utf8"));
    if (!fileData.results.length)
      return res.status(400).json({ error: "No data to analyze" });

    console.log("🤖 Asking Gemini...");

    // Use gemini-1.5-flash (Requires updated @google/generative-ai package)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      Analyze these frontend benchmark results (JSON): ${JSON.stringify(
        fileData.results
      )}
      
      Provide a technical summary structured as:
      ### 🏆 Executive Verdict
      ### ⚡ JSON Performance (Parse, Render, Memory)
      ### 🌐 API Performance (Latency, Throughput)
      ### 📝 Key Observations
      ### 💡 Recommendation
      
      Keep it professional and concise.
    `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    fs.writeFileSync(
      summaryFile,
      JSON.stringify({ summary, timestamp: new Date() }, null, 2)
    );
    console.log("✅ AI Summary Saved");
    res.json({ success: true, summary });
  } catch (err) {
    console.error("AI Error:", err.message);
    res
      .status(500)
      .json({ error: "AI generation failed", details: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
