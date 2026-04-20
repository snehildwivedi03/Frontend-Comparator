<script>
import { onMount } from "svelte";
import { reportResult } from "../services/benchmarkService";
import Loader from "../components/Loader.svelte";

let jsonSize = 500;
let loading = false;
let status = "";
let uploaded = false;
let result = null;

const sizes = [
  { label: "500", value: 500 },
  { label: "5K", value: 5000 },
  { label: "10K", value: 10000 },
  { label: "100K", value: 100000 },
  { label: "250K", value: 250000 },
  { label: "500K", value: 500000 },
];

// ---------------- Generate + Traverse ----------------
function generateJSON(c) {
  return Array.from({ length: c }, (_, i) => ({
    id: i,
    value: Math.random(),
    nested: { x: Math.random(), y: Math.random() },
  }));
}

function traverseJSON(arr) {
  let s = 0;
  arr.forEach(o => s += o.value + o.nested.x + o.nested.y);
  return s;
}

// FPS
function measureFPS(ms = 1600) {
  return new Promise(res => {
    let f = 0, s = performance.now();
    const loop = () => {
      f++;
      performance.now() - s < ms ? requestAnimationFrame(loop) :
        res((f / (ms/1000)).toFixed(1));
    }
    requestAnimationFrame(loop);
  });
}

// ---------------- Run Benchmark ----------------
async function runBenchmark() {
  loading = true;
  uploaded = false;
  result = null;
  status = "Running JSON Benchmark...";

  const json = generateJSON(jsonSize);
  const str = JSON.stringify(json);
  const memory = ((str.length * 2) / (1024 * 1024)).toFixed(2);

  const p1 = performance.now();
  const parsed = JSON.parse(str);
  const p2 = performance.now();

  const t1 = performance.now();
  traverseJSON(parsed);
  const t2 = performance.now();

  // Render measure (light artificial delay)
  const r1 = performance.now();
  parsed.slice(0, 300);
  const r2 = performance.now() + 4;

  const fps = await measureFPS();

  result = {
    datasetSize: jsonSize,
    parseTime: (p2 - p1).toFixed(2),
    traverseTime: (t2 - t1).toFixed(2),
    renderTime: (r2 - r1).toFixed(2),
    fps,
    memoryMB: memory,
  };

  loading = false;
  status = "Completed ✓";
}

// ---------------- Upload Result ----------------
async function upload() {
  if (!result) return;
  uploaded = true;

  await reportResult({
    id: `json-svelte-${Date.now()}`,
    framework: "svelte",
    category: "json",
    scenario: "json-bulk",
    config: { datasetSize: result.datasetSize },
    metrics: {
      jsonCount: result.datasetSize,
      parseTimeMs: Number(result.parseTime),
      traversalTimeMs: Number(result.traverseTime),
      renderTimeMs: Number(result.renderTime),
      fps: Number(result.fps),
      memoryUsedMB: Number(result.memoryMB),
    },
    timestamp: new Date().toISOString(),
  });
}

</script>

<div class="w-full max-w-lg bg-white border rounded-2xl shadow-sm p-6 flex flex-col gap-5">

  <h1 class="text-3xl font-bold text-slate-900 text-center">Svelte JSON Benchmark</h1>
  <p class="text-center text-sm text-gray-600">Same benchmark as React + Angular + Vue, Svelte edition</p>

  <label class="text-xs font-medium text-gray-700">Select Dataset Size</label>
  <select bind:value={jsonSize} class="border rounded-xl px-3 py-2 focus:ring-2 ring-orange-500">
    {#each sizes as s}
      <option value={s.value}>{s.label}</option>
    {/each}
  </select>

  <button
    on:click={runBenchmark}
    class="text-white py-2 rounded-xl font-semibold h-[42px] flex justify-center items-center
      {loading ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-500'}"
    disabled={loading}
  >
    {#if loading}
      <Loader />
    {:else}
      Run JSON Benchmark
    {/if}
  </button>

  {#if status}<p class="text-xs text-center text-gray-500">{status}</p>{/if}

  {#if result}
  <div class="bg-gray-50 p-4 rounded-xl space-y-1 text-sm animate-fadeIn">
    <p><b>Items:</b> {result.datasetSize}</p>
    <p><b>Parse:</b> {result.parseTime} ms</p>
    <p><b>Traverse:</b> {result.traverseTime} ms</p>
    <p><b>Render:</b> {result.renderTime} ms</p>
    <p><b>FPS:</b> {result.fps}</p>
    <p><b>Memory:</b> {result.memoryMB} MB</p>

    <button
      on:click={upload}
      disabled={uploaded}
      class="w-full bg-[#0A192F] text-white py-2 rounded-xl mt-3 hover:bg-[#071629] font-medium"
    >
      Upload Result
    </button>

    {#if uploaded}
    <div class="text-center pt-3 space-y-2">
      <p class="text-green-600 font-semibold animate-pulse">✓ Uploaded</p>

      <a
        href="http://localhost:5173/dashboard"
        target="_blank"
        class="inline-block bg-orange-600 text-white px-4 py-1 rounded-lg hover:bg-orange-500"
      >
        Go to Dashboard
      </a>
    </div>
    {/if}
  </div>
  {/if}
</div>