# JSAP Benchmark Lab

> **Comparative Analysis of Frontend Frameworks (React, Angular, Vue, Svelte) for JSON & API Workloads**

---

## 🚀 Overview

JSAP Benchmark Lab is a full-stack benchmarking environment designed to measure and compare the performance of modern frontend frameworks under data-heavy conditions.

### What It Benchmarks

| Category                  | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| JSON Parsing & Processing | How efficiently each framework handles large JSON datasets |
| Rendering Performance     | Frame rates and render times under load                    |
| Memory Utilization        | Heap usage and garbage collection behavior                 |
| API Latency & Throughput  | Response times and request handling efficiency             |

### What's Included

- **4 Benchmark Apps** — React, Angular, Vue, Svelte
- **Central Dashboard** — Built with React + Recharts
- **Backend Server** — Node.js + Express
- **AI Summary Generation** — Powered by Google Gemini API

---

## 🛠️ Tech Stack

| Layer                  | Technology                  |
| ---------------------- | --------------------------- |
| Frontend Frameworks    | React, Angular, Vue, Svelte |
| Backend                | Node.js, Express            |
| Charts & Visualization | Recharts                    |
| AI Integration         | Google Gemini API           |
| Dev Server             | Vite                        |

---

## 📂 Project Structure

```
Final_Year_Project_V1/
│
├── backend/                # Node.js + Express server
├── dashboard/              # Central React dashboard
├── react-benchmark/        # React benchmark app
├── angular-benchmark/      # Angular benchmark app
├── vue-benchmark/          # Vue benchmark app
└── svelte-benchmark/       # Svelte benchmark app
```

---

## ⚙️ Prerequisites

Ensure the following are installed on your system before proceeding:

### Required

- **Node.js** v22 or higher — [Download](https://nodejs.org/)
- **npm** or **yarn** — Comes bundled with Node.js

### Verify Installation

```bash
node -v     # Should output v18.x.x or higher
npm -v      # Should output a valid npm version
```

### Angular CLI (Required for Angular Benchmark only)

```bash
npm install -g @angular/cli
```

Verify:

```bash
ng version
```

---

## 📥 Step 1 — Clone the Repository

```bash
git clone <your-repo-url>
cd Final_Year_Project_V1
```

---

## 📦 Step 2 — Install Dependencies

Each service has its own `package.json` and must be installed separately. Open a terminal for each:

### Backend

```bash
cd backend
npm install
```

### Dashboard

```bash
cd dashboard
npm install
```

### React Benchmark

```bash
cd react-benchmark
npm install
```

### Vue Benchmark

```bash
cd vue-benchmark
npm install
```

### Svelte Benchmark

```bash
cd svelte-benchmark
npm install
```

### Angular Benchmark

```bash
cd angular-benchmark
npm install
```

> **Tip:** You can run all installs sequentially in one terminal using:
>
> ```bash
> for dir in backend dashboard react-benchmark vue-benchmark svelte-benchmark angular-benchmark; do
>   echo "Installing $dir..." && cd $dir && npm install && cd ..
> done
> ```

---

## 🔑 Step 3 — Configure Environment Variables

Inside the `backend/` directory, create a `.env` file:

```bash
cd backend
touch .env
```

Add the following content:

```env
GEMINI_API_KEY=your_api_key_here
```

> **Where to get a Gemini API Key?**
> Visit [Google AI Studio](https://aistudio.google.com/) and generate a free API key under your Google account.

---

## ▶️ Step 4 — Start All Services

Each service must run in its own terminal window or tab.

### 1️⃣ Backend Server

```bash
cd backend
node server.js
```

📡 Runs at: `http://localhost:5000`

---

### 2️⃣ Dashboard

```bash
cd dashboard
npm run dev
```

📊 Runs at: `http://localhost:5173`

---

### 3️⃣ React Benchmark

```bash
cd react-benchmark
npm run dev
```

⚛️ Runs at: `http://localhost:7174`

---

### 4️⃣ Vue Benchmark

```bash
cd vue-benchmark
npm run dev
```

🟢 Runs at: `http://localhost:5175`

---

### 5️⃣ Svelte Benchmark

```bash
cd svelte-benchmark
npm run dev
```

🔥 Runs at: `http://localhost:5176`

---

### 6️⃣ Angular Benchmark

```bash
cd angular-benchmark
ng serve --port 4200
```

🔴 Runs at: `http://localhost:4200`

> ⚠️ **Always start the backend server first** before launching any benchmark app or dashboard.

---

## 🧪 Step 5 — Run Benchmarks

1. Open each framework app in your browser:

| Framework | URL                   |
| --------- | --------------------- |
| React     | http://localhost:7174 |
| Angular   | http://localhost:4200 |
| Vue       | http://localhost:5175 |
| Svelte    | http://localhost:5176 |

2. In each app, run both available benchmark types:
   - **JSON Benchmark** — Tests parsing and rendering of large JSON datasets
   - **API Benchmark** — Tests API call latency and throughput

3. Each benchmark run will:
   - Compute real-time performance metrics
   - Automatically send results to the backend (`results.json`)

---

## 📊 Step 6 — View the Dashboard

Open the dashboard in your browser:

```
http://localhost:5173
```

The dashboard displays:

- 📈 **Charts** — Parse time, Render time, FPS, API Latency
- 🔢 **Aggregated Comparison** — Side-by-side framework metrics
- 📋 **Tables** — Average metrics per framework per category

---

## 🤖 Step 7 — Generate AI Summary

1. Navigate to the **Summary Tab** in the dashboard
2. Click **Generate Summary**
3. The backend sends benchmark data to the **Gemini API**
4. An AI-generated structured performance report is returned and displayed

> Ensure your `.env` file contains a valid `GEMINI_API_KEY` for this feature to work.

---

## 📁 Step 8 — Verify Data Storage

### Benchmark Results

Check the file:

```
backend/results.json
```

Expected structure:

```json
{
  "results": [
    {
      "framework": "react",
      "category": "json",
      "metrics": { ... }
    }
  ]
}
```

### AI Summary

Check the file:

```
backend/summary.json
```

---

## 📥 Step 9 — Export Reports

From the Dashboard:

- Click **Download PDF** to export a full report
- The exported PDF includes all charts, tables, and framework comparisons

---

## 🧹 Reset / Clear Data

To reset all benchmark results, use either method:

### Option A — Dashboard UI

Click the **Clear Results** button in the dashboard.

### Option B — API Call

```bash
curl -X POST http://localhost:5000/api/clear-results
```

---

## ⚠️ Common Issues & Fixes

### Port Already in Use

Find and kill the process occupying a port:

```bash
lsof -i :5173
kill -9 <PID>
```

Replace `5173` with whichever port is conflicting.

---

### AI Summary Not Generating

- Verify the `.env` file exists inside `backend/`
- Confirm the `GEMINI_API_KEY` is valid and has not expired
- Check the backend terminal for error logs

---

### No Data Showing in Dashboard

- Make sure you have **run benchmarks** in at least one framework app
- Confirm `backend/results.json` exists and is not empty
- Verify the backend server is running at `http://localhost:5000`

---

## 🎯 Service Reference

| Service           | URL                   |
| ----------------- | --------------------- |
| Dashboard         | http://localhost:5173 |
| Backend API       | http://localhost:5000 |
| React Benchmark   | http://localhost:7174 |
| Angular Benchmark | http://localhost:4200 |
| Vue Benchmark     | http://localhost:5175 |
| Svelte Benchmark  | http://localhost:5176 |

---

## 📌 Important Notes

- Always **start the backend first** before running any benchmark or opening the dashboard
- Ensure all port numbers match the configured values above
- Use the **latest version of Chrome or Firefox** for the most accurate performance measurements
- Each benchmark run may take a few seconds — wait for completion before switching frameworks

---

## 🏁 You're All Set!

With everything running, you can now:

- ✅ Measure real-world frontend framework performance
- ✅ Analyze and compare framework efficiency across multiple metrics
- ✅ Generate AI-powered insights and downloadable reports

---

_Built as a Final Year Project — JSAP Benchmark Lab_
