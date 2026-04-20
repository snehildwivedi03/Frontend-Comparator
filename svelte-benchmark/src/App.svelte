<script>
  import JSONBenchmark from "./pages/JSONBenchmark.svelte";
  import ApiBenchmark from "./pages/ApiBenchmark.svelte";

  // State variable for the current page
  let page = "json";
</script>

<div class="min-h-screen p-8 flex flex-col items-center gap-10 bg-slate-50">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-slate-900">
      Svelte Performance Benchmark Suite
    </h1>
    <p class="text-slate-600 text-sm mt-1">
      Compare JSON computation speed & API workload performance in real time.
    </p>
  </div>

  <div class="flex gap-4">
    <button
      on:click={() => (page = "json")}
      class="px-5 py-2 rounded-xl font-medium transition"
      class:bg-orange-600={page === "json"}
      class:text-white={page === "json"}
      class:bg-white={page !== "json"}
      class:border={page !== "json"}
      class:border-slate-300={page !== "json"}
      class:hover:bg-slate-100={page !== "json"}
    >
      JSON Benchmark
    </button>

    <button
      on:click={() => (page = "api")}
      class="px-5 py-2 rounded-xl font-medium transition"
      class:bg-orange-600={page === "api"}
      class:text-white={page === "api"}
      class:bg-white={page !== "api"}
      class:border={page !== "api"}
      class:border-slate-300={page !== "api"}
      class:hover:bg-slate-100={page !== "api"}
    >
      API Load Test
    </button>
  </div>

  {#if page === "json"}
    <JSONBenchmark />
  {:else if page === "api"}
    <ApiBenchmark />
  {/if}
</div>