<script setup>
import { ref } from "vue";
import JSONBenchmark from "./pages/JSONBenchmark.vue";
import ApiBenchmark from "./pages/ApiBenchmark.vue";

const page = ref("json");
</script>

<template>
  <div class="min-h-screen p-10 bg-gray-100 flex flex-col items-center gap-8">
    <h1 class="text-4xl font-bold text-black">
      Vue Performance Benchmark Suite
    </h1>
    <p class="text-gray-600 text-sm">
      Compare JSON & API performance — connected to dashboard like React &
      Angular.
    </p>

    <div class="flex gap-4">
      <button
        @click="page = 'json'"
        :class="
          page === 'json'
            ? 'bg-green-600 text-white'
            : 'bg-white border border-gray-300 text-green-700 hover:bg-gray-100'
        "
        class="px-5 py-2 rounded-xl font-semibold transition"
      >
        JSON Benchmark
      </button>

      <button
        @click="page = 'api'"
        :class="
          page === 'api'
            ? 'bg-green-600 text-white'
            : 'bg-white border border-gray-300 text-green-700 hover:bg-gray-100'
        "
        class="px-5 py-2 rounded-xl font-semibold transition"
      >
        API Load Test
      </button>
    </div>

    <JSONBenchmark v-if="page === 'json'" />
    <ApiBenchmark v-if="page === 'api'" />
  </div>
</template>
