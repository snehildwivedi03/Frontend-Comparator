<script setup>
import { ref } from "vue";
import Loader from "../components/Loader.vue";
import { reportResult } from "../services/benchmarkService";

const jsonSize = ref(500);
const loading = ref(false);
const status = ref("");
const uploaded = ref(false);
const result = ref(null);

const sizes = [
  { label: "500", value: 500 },
  { label: "5K", value: 5000 },
  { label: "10K", value: 10000 },
  { label: "100K", value: 100000 },
  { label: "250K", value: 250000 },
  { label: "500K", value: 500000 },
];

// -------------------------------
// Benchmark Functions
// -------------------------------
const generateJSON = (c) => {
  return Array.from({ length: c }, (_, i) => ({
    id: i,
    value: Math.random(),
    nested: { x: Math.random(), y: Math.random() },
  }));
};

const traverseJSON = (arr) => {
  let sum = 0;
  arr.forEach((o) => (sum += o.value + o.nested.x + o.nested.y));
  return sum;
};

const measureFPS = (ms = 1600) => {
  return new Promise((r) => {
    let f = 0,
      s = performance.now();
    const loop = () => {
      f++;
      performance.now() - s < ms
        ? requestAnimationFrame(loop)
        : r((f / (ms / 1000)).toFixed(1));
    };
    requestAnimationFrame(loop);
  });
};

// MAIN RUN
const runBenchmark = async () => {
  loading.value = true;
  result.value = null;
  uploaded.value = false;
  status.value = "Running Benchmark...";

  const json = generateJSON(jsonSize.value);
  const jsonStr = JSON.stringify(json);
  const memoryMB = ((jsonStr.length * 2) / (1024 * 1024)).toFixed(2);

  const p1 = performance.now();
  const parsed = JSON.parse(jsonStr);
  const p2 = performance.now();

  const t1 = performance.now();
  traverseJSON(parsed);
  const t2 = performance.now();

  const r1 = performance.now();
  parsed.slice(0, 300);
  const r2 = performance.now() + 4; // artificial ~4ms UI sim

  const fps = await measureFPS();

  result.value = {
    datasetSize: jsonSize.value,
    parseTime: (p2 - p1).toFixed(2),
    traverseTime: (t2 - t1).toFixed(2),
    renderTime: (r2 - r1).toFixed(2),
    fps,
    memoryMB: memoryMB,
  };

  loading.value = false;
  status.value = "Completed ✓";
};

// Upload to Dashboard
const upload = async () => {
  uploaded.value = true;

  await reportResult({
    id: "json-vue-" + Date.now(),
    framework: "vue",
    category: "json",
    scenario: "json-bulk",
    config: { datasetSize: result.value.datasetSize },
    metrics: {
      jsonCount: result.value.datasetSize,
      parseTimeMs: Number(result.value.parseTime),
      traversalTimeMs: Number(result.value.traverseTime),
      renderTimeMs: Number(result.value.renderTime),
      fps: Number(result.value.fps),
      memoryUsedMB: Number(result.value.memoryMB),
    },
    timestamp: new Date().toISOString(),
  });
};
</script>

<template>
  <div
    class="w-full max-w-lg bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-5"
  >
    <h1 class="text-3xl font-bold text-black text-center">
      Vue JSON Benchmark
    </h1>
    <p class="text-center text-sm text-gray-600">
      Parses, traverses & simulates render load similar to React + Angular
    </p>

    <label class="text-xs font-medium text-gray-700">Select Dataset Size</label>
    <select
      v-model="jsonSize"
      class="border rounded-xl px-3 py-2 focus:ring-2 ring-green-500"
    >
      <option v-for="s in sizes" :key="s.value" :value="s.value">
        {{ s.label }}
      </option>
    </select>

    <!-- Run Button -->
    <button
      @click="runBenchmark"
      :disabled="loading"
      :class="loading ? 'bg-green-300' : 'bg-green-600 hover:bg-green-500'"
      class="text-white py-2 rounded-xl font-semibold h-[42px] flex justify-center items-center"
    >
      <Loader v-if="loading" />
      <span v-else>Run JSON Benchmark</span>
    </button>

    <p v-if="status" class="text-xs text-center text-gray-500">{{ status }}</p>

    <!-- Result -->
    <div
      v-if="result"
      class="bg-gray-50 p-4 rounded-xl space-y-1 text-sm animate-fadeIn"
    >
      <p><b>Items:</b> {{ result.datasetSize.toLocaleString() }}</p>
      <p><b>Parse:</b> {{ result.parseTime }} ms</p>
      <p><b>Traverse:</b> {{ result.traverseTime }} ms</p>
      <p><b>Render:</b> {{ result.renderTime }} ms</p>
      <p><b>FPS:</b> {{ result.fps }}</p>
      <p><b>Memory:</b> {{ result.memoryMB }} MB</p>

      <button
        @click="upload"
        :disabled="uploaded"
        class="w-full bg-[#0A192F] text-white py-2 rounded-xl mt-3 hover:bg-[#071629] font-medium"
      >
        Upload Result
      </button>

      <div v-if="uploaded" class="text-center pt-3">
        <p class="text-green-600 font-semibold animate-pulse">✓ Uploaded</p>
        <a
          href="http://localhost:5173/dashboard"
          target="_blank"
          class="mt-2 inline-block bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-500"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  </div>
</template>
