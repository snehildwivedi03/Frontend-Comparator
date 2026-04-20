import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../components/loader.component';
import { BenchmarkService } from '../services/benchmark.service';

interface JsonBenchmarkResult {
  datasetSize: number;
  parseTime: string;
  traverseTime: string;
  renderTime: string;
  fps: string;
  memoryMB: number;
}

@Component({
  selector: 'app-json-benchmark',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  template: `
    <div class="w-full max-w-lg bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-5">
      <h1 class="text-3xl font-bold text-slate-900 text-center">Angular JSON Benchmark</h1>
      <p class="text-center text-sm text-slate-600">
        Parse, traverse & render large JSON arrays. Tests FPS + memory usage.
      </p>

      <label class="text-xs font-medium text-slate-600">Select Dataset Size</label>
      <select
        [value]="jsonSize"
        (change)="onSizeChange($event)"
        class="border rounded-xl px-3 py-2"
      >
        <option *ngFor="let s of sizes" [value]="s.value">{{ s.label }}</option>
      </select>

      <button
        (click)="startBenchmark()"
        [disabled]="loading"
        class="py-2 rounded-xl font-semibold text-white flex justify-center items-center gap-2 h-[42px]"
        [ngClass]="loading ? 'bg-red-400' : 'bg-red-700 hover:bg-red-400'"
      >
        <ng-container *ngIf="!loading; else loader"><span>Run JSON Benchmark</span></ng-container>
      </button>
      <ng-template #loader><app-loader></app-loader></ng-template>

      <p *ngIf="status" class="text-xs text-center text-slate-500">{{ status }}</p>

      <div *ngIf="result" class="bg-slate-50 p-4 rounded-xl text-sm space-y-1 mt-2">
        <p><b>Items:</b> {{ result.datasetSize | number }}</p>
        <p><b>Parse Time:</b> {{ result.parseTime }} ms</p>
        <p><b>Traversal Time:</b> {{ result.traverseTime }} ms</p>
        <p><b>Render Time:</b> {{ result.renderTime }} ms</p>
        <p><b>FPS Stability:</b> {{ result.fps }}</p>
        <p><b>Memory Usage:</b> {{ result.memoryMB }} MB</p>

        <button
          (click)="upload()"
          class="w-full bg-slate-900 text-white py-2 rounded-xl mt-3 hover:bg-slate-800"
        >
          Upload to Dashboard
        </button>

        <div *ngIf="uploaded" class="text-center mt-3 space-y-2">
          <p class="text-green-600 font-semibold">✓ Uploaded</p>
          <button
            (click)="goDashboard()"
            class="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-400 w-full"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  `,
})
export class JsonBenchmarkComponent {
  jsonSize = 500;
  loading = false;
  uploaded = false;
  status = '';
  result: JsonBenchmarkResult | null = null;
  readonly DASHBOARD_URL = 'http://localhost:5173/dashboard';

  constructor(private api: BenchmarkService, private cdr: ChangeDetectorRef) {}

  sizes = [
    { label: '500', value: 500 },
    { label: '5K', value: 5000 },
    { label: '10K', value: 10000 },
    { label: '100K', value: 100000 },
    { label: '250K', value: 250000 },
    { label: '500K', value: 500000 },
  ];

  onSizeChange(e: Event) {
    this.jsonSize = Number((e.target as HTMLSelectElement).value);
  }

  startBenchmark() {
    this.loading = true;
    this.status = 'Preparing...';
    this.result = null;
    this.uploaded = false;
    this.cdr.detectChanges();
    setTimeout(() => this.runBenchmark(), 70);
  }

  async runBenchmark() {
    this.status = 'Running benchmark...';

    const json = Array.from({ length: this.jsonSize }, (_, i) => ({
      id: i,
      value: Math.random(),
      nested: { x: Math.random(), y: Math.random() },
    }));

    const str = JSON.stringify(json);
    const memoryMB = ((str.length * 2) / (1024 * 1024)).toFixed(2);

    const t1 = performance.now();
    JSON.parse(str);
    const t2 = performance.now();
    const t3 = performance.now();
    json.forEach((o) => o.value + o.nested.x + o.nested.y);
    const t4 = performance.now();

    const t5 = performance.now();
    this.result = null;
    this.cdr.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    const t6 = performance.now();

    const fps = await this.measureFPS();

    this.result = {
      datasetSize: this.jsonSize,
      parseTime: (t2 - t1).toFixed(2),
      traverseTime: (t4 - t3).toFixed(2),
      renderTime: (t6 - t5).toFixed(2),
      fps,
      memoryMB: +memoryMB,
    };

    this.status = 'Completed ✓';
    this.loading = false;
    this.cdr.detectChanges();
  }

  measureFPS(ms = 1500): Promise<string> {
    return new Promise((r) => {
      let f = 0,
        s = performance.now();
      const loop = () => {
        f++;
        performance.now() - s < ms ? requestAnimationFrame(loop) : r((f / (ms / 1000)).toFixed(1));
      };
      requestAnimationFrame(loop);
    });
  }

  async upload() {
    if (!this.result) return;
    await this.api.reportResult({
      id: 'json-angular-' + Date.now(),
      framework: 'angular',
      category: 'json',
      scenario: 'json-bulk',
      config: { datasetSize: this.result.datasetSize },
      metrics: {
        jsonCount: this.result.datasetSize,
        parseTimeMs: +this.result.parseTime,
        traversalTimeMs: +this.result.traverseTime,
        renderTimeMs: +this.result.renderTime,
        fps: +this.result.fps,
        memoryUsedMB: this.result.memoryMB,
      },
    });
    this.uploaded = true;
    this.cdr.detectChanges();
  }

  goDashboard() {
    window.location.href = this.DASHBOARD_URL;
  }
}
