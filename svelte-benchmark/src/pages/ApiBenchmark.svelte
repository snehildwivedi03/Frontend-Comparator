<script>
import Loader from "../components/Loader.svelte";
import { fetchHeavyJson, reportResult } from "../services/benchmarkService";

let count = 200; // This is a Number
let status = "idle";
let result = null;
let uploaded = false;

const runTest = async () => {
  status = "running";
  result = null;
  uploaded = false;

  const start = performance.now();
  const res = await fetchHeavyJson(count);
  const latency = performance.now() - start;

  const responseKB = JSON.stringify(res.data).length / 1024;
  const throughput = 1000 / latency;
  const speedMBps = responseKB / 1024 / (latency / 1000);

  result = {
    count,
    latency: latency.toFixed(2),
    throughput: throughput.toFixed(2),
    responseKB: responseKB.toFixed(2),
    speedMBps: speedMBps.toFixed(2),
  };

  status = "done";
};

const upload = async () => {
  if (!result) return;

  uploaded = true;

  await reportResult({
    id: "api-svelte-" + Date.now(),
    framework: "svelte",
    category: "api",
    scenario: "api-load",
    config: { requestCount: count },
    metrics: {
      payloadSize: result.count,
      latencyMs: Number(result.latency),
      throughput: Number(result.throughput),
      responseKB: Number(result.responseKB),
      speedMBps: Number(result.speedMBps),
    },
    timestamp: new Date().toISOString(),
  });
};
</script>

<div class="w-full max-w-lg bg-white border rounded-2xl shadow-sm p-6 flex flex-col gap-5">
  
  <h1 class="text-3xl font-bold text-black text-center">Svelte API Benchmark</h1>
  <p class="text-center text-sm text-gray-600">Tests JSON API latency, throughput & response size</p>

  <label class="text-xs font-semibold text-gray-700">Payload Size</label>

  <select bind:value={count} class="border px-3 py-2 rounded-xl focus:ring-2 ring-orange-500" >
    <option value={200}>200</option>
    <option value={1000}>1K</option>
    <option value={5000}>5K</option>
    <option value={20000}>20K</option>
  </select>

  <button
    on:click={runTest}
    disabled={status === "running"}
    class="py-2 rounded-xl font-semibold text-white flex justify-center items-center h-[42px]
      {status === 'running' ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-500'}"
  >
    {#if status === "running"}
      <Loader />
    {:else}
      Run API Load Test
    {/if}
  </button>

  {#if result}
  <div class="bg-gray-50 p-4 rounded-xl text-sm space-y-1 animate-fadeIn">
    <p><b>Payload:</b> {result.count}</p>
    <p><b>Latency:</b> {result.latency} ms</p>
    <p><b>Throughput:</b> {result.throughput} req/s</p>
    <p><b>Response Size:</b> {result.responseKB} KB</p>
    <p><b>Speed:</b> {result.speedMBps} MB/s</p>

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
        class="inline-block bg-orange-600 text-white px-4 py-1 rounded-lg hover:bg-orange-500 w-full text-center"
      >
        Go to Dashboard
      </a>
    </div>
    {/if}
  </div>
  {/if}
</div>