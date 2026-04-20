import { Link } from "react-router-dom";

function Home() {
  const apps = [
    {
      name: "React Benchmark",
      icon: "/react.png",
      url: "http://localhost:5174",
    },
    {
      name: "Angular Benchmark",
      icon: "/angular.png",
      url: "http://localhost:4200",
    },
    { name: "Vue Benchmark", icon: "/vue.png", url: "http://localhost:5175" },
    {
      name: "Svelte Benchmark",
      icon: "/svelte.png",
      url: "http://localhost:5176",
    },
  ];

  return (
    <div
      className="min-h-screen w-full 
      bg-gradient-to-br from-blue-100 via-white to-purple-100 
      py-14 px-4 sm:px-6 md:px-10 flex flex-col gap-14"
    >
      {/* HERO SECTION */}
      <section
        className="grid gap-12 
        md:grid-cols-[1.1fr_0.9fr] 
        max-w-[1400px] w-full mx-auto items-start"
      >
        {/* left */}
        <div className="space-y-6 pr-4">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 shadow-sm">
            JSAP · Benchmark Suite
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            JSON & API Performance Lab
          </h1>

          <p className="text-slate-700 text-base leading-relaxed max-w-2xl">
            Benchmark <b>React, Angular, Vue & Svelte</b> under heavy JSON
            parsing, traversal, rendering and API workload stress — then compare
            everything in one analytics-ready dashboard.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Link
              to="/dashboard"
              className="rounded-xl bg-blue-600 text-white px-6 py-2.5 text-sm font-medium shadow hover:bg-blue-500 transition-all"
            >
              Open Dashboard
            </Link>
            <a
              href="#benchmark-apps"
              className="rounded-xl bg-white border border-slate-200 text-slate-700 px-6 py-2.5 text-sm font-medium shadow-sm hover:bg-slate-100 transition-all"
            >
              View Benchmarks
            </a>
          </div>
        </div>

        {/* right — feature card */}
        <div
          className="bg-white/70 backdrop-blur-sm 
          rounded-2xl border border-slate-200 shadow 
          p-6 sm:p-7 space-y-4 w-full"
        >
          <h2 className="text-sm font-semibold text-slate-900">
            What JSAP Measures
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
            {[
              ["JSON Benchmarks", "Parse, traverse, render"],
              ["API Workloads", "Latency, throughput"],
              ["UX Metrics", "FPS, frame drops"],
              ["Resource Use", "Memory footprint"],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-xl bg-slate-50/50 p-3 hover:bg-slate-100 transition"
              >
                <p className="text-slate-500">{title}</p>
                <p className="font-semibold text-slate-900 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benchmark Launch Section */}
      <section
        id="benchmark-apps"
        className="max-w-[1400px] mx-auto space-y-4 w-full"
      >
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
          Benchmark Applications
        </h2>
        <p className="text-sm text-slate-600">
          Launch → Run benchmark → Return to dashboard → Compare metrics.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {apps.map((app) => (
            <a
              key={app.name}
              href={app.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border bg-white border-slate-200 
                p-5 flex flex-col justify-between hover:border-blue-300 hover:shadow-lg 
                transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <img src={app.icon} className="w-9 h-9 drop-shadow-sm" />
                <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition">
                  {app.name}
                </span>
              </div>

              <span className="mt-6 text-xs text-blue-600 font-medium group-hover:underline">
                Open Benchmark →
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
