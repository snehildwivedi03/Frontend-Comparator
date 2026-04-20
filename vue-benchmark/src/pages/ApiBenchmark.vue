<script setup>
import { ref } from "vue";
import Loader from "../components/Loader.vue";
import { runHeavyJson, reportResult } from "../services/benchmarkService";

const count = ref(200);
const status = ref("");
const loading = ref(false);
const uploaded = ref(false);
const result = ref(null);

const sizes = [
  { label: "200", value: 200 },
  { label: "1K", value: 1000 },
  { label: "5K", value: 5000 },
  { label: "20K", value: 20000 },
];

// -----------------------------------
// Run API Benchmark
//------------------------------------
const runTest = async () => {
  loading.value = true;
  result.value = null;
  uploaded.value = false;
  status.value = "Benchmark running...";

  const start = performance.now();
  const res = await runHeavyJson(count.value);
  const latency = performance.now() - start;

  const responseKB = JSON.stringify(res.data).length / 1024;
  const throughput = (1000 / latency).toFixed(2);
  const speedMBps = (responseKB / 1024 / (latency / 1000)).toFixed(2);

  result.value = {
    count: count.value,
    latency: latency.toFixed(2),
    throughput,
    responseKB: responseKB.toFixed(2),
    speedMBps,
  };

  loading.value = false;
  status.value = "Completed ✓";
};

// -----------------------------------
// Upload to Dashboard
//------------------------------------
const upload = async () => {
  uploaded.value = true;

  await reportResult({
    id: "api-vue-" + Date.now(),
    framework: "vue",
    category: "api",
    scenario: "api-load",
    config: { requestCount: result.value.count },
    metrics: {
      payloadSize: result.value.count,
      latencyMs: Number(result.value.latency),
      throughput: Number(result.value.throughput),
      responseKB: Number(result.value.responseKB),
      speedMBps: Number(result.value.speedMBps),
    },
    timestamp: new Date().toISOString(),
  });
};
</script>

<template>
  <div
    class="w-full max-w-lg bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-5"
  >
    <h1 class="text-3xl font-bold text-black text-center">Vue API Benchmark</h1>
    <p class="text-center text-sm text-gray-600">
      Tests backend speed using heavy JSON payload
    </p>

    <label class="text-xs font-medium text-gray-700"
      >Payload Size (JSON objects)</label
    >
    <select
      v-model="count"
      class="border rounded-xl px-3 py-2 focus:ring-2 ring-green-500"
    >
      <option v-for="s in sizes" :value="s.value" :key="s.value">
        {{ s.label }}
      </option>
    </select>

    <!-- Run Button -->
    <button
      @click="runTest"
      :disabled="loading"
      :class="loading ? 'bg-green-300' : 'bg-green-600 hover:bg-green-500'"
      class="text-white py-2 rounded-xl font-semibold h-[42px] flex justify-center items-center"
    >
      <Loader v-if="loading" />
      <span v-else>Run API Load Test</span>
    </button>

    <p v-if="status" class="text-xs text-center text-gray-500">{{ status }}</p>

    <!-- Result Box -->
    <div
      v-if="result"
      class="bg-gray-50 p-4 rounded-xl space-y-1 text-sm animate-fadeIn"
    >
      <p><b>Payload:</b> {{ result.count.toLocaleString() }} items</p>
      <p><b>Latency:</b> {{ result.latency }} ms</p>
      <p><b>Throughput:</b> {{ result.throughput }} req/sec</p>
      <p><b>Response Size:</b> {{ result.responseKB }} KB</p>
      <p><b>Speed:</b> {{ result.speedMBps }} MB/s</p>

      <button
        @click="upload"
        :disabled="uploaded"
        class="w-full bg-[#0A192F] text-white py-2 rounded-xl mt-3 hover:bg-[#071629]"
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
