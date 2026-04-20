import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../components/loader.component';
import { BenchmarkService } from '../services/benchmark.service';

interface ApiResult {
  count: number;
  latency: string;
  throughput: string;
  responseKB: string;
  speedMBps: string;
}

@Component({
  standalone: true,
  selector: 'app-api-benchmark',
  imports: [CommonModule, LoaderComponent],
  template: `
    <div class="w-full max-w-lg bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-5">
      <h1 class="text-3xl font-bold text-slate-900 text-center">Angular API Load Benchmark</h1>
      <p class="text-center text-slate-600 text-sm">
        Tests backend latency, throughput & response speed using heavy JSON payloads.
      </p>

      <label class="text-xs font-medium text-slate-600">Payload Size (JSON objects)</label>
      <select [value]="count" (change)="onSizeChange($event)" class="border px-3 py-2 rounded-xl">
        <option value="200">200</option>
        <option value="1000">1K</option>
        <option value="5000">5K</option>
        <option value="20000">20K</option>
      </select>

      <button
        (click)="startTest()"
        [disabled]="status === 'running'"
        class="py-2 rounded-xl font-semibold text-white flex justify-center items-center gap-2 h-[42px]"
        [ngClass]="status === 'running' ? 'bg-red-500' : 'bg-red-700 hover:bg-red-400'"
      >
        <ng-container *ngIf="status !== 'running'; else loader"
          ><span>Run API Load Test</span></ng-container
        >
      </button>
      <ng-template #loader><app-loader></app-loader></ng-template>

      <p *ngIf="status === 'running'" class="text-xs text-center text-slate-500">Running...</p>

      <div *ngIf="result" class="bg-slate-50 p-4 rounded-xl text-sm space-y-1 mt-2">
        <p><b>Payload:</b> {{ result.count | number }} items</p>
        <p><b>Latency:</b> {{ result.latency }} ms</p>
        <p><b>Throughput:</b> {{ result.throughput }} req/sec</p>
        <p><b>Response Size:</b> {{ result.responseKB }} KB</p>
        <p><b>Speed:</b> {{ result.speedMBps }} MB/s</p>

        <button
          (click)="upload()"
          class="w-full bg-slate-900 text-white py-2 rounded-xl mt-3 hover:bg-slate-800"
        >
          Upload to Dashboard
        </button>

        <div *ngIf="showSuccess" class="text-center mt-3 space-y-2">
          <p class="text-green-600 font-semibold">✓ Uploaded</p>
          <button
            (click)="goDashboard()"
            class="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full font-semibold transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ApiBenchmarkComponent {
  status: 'idle' | 'running' | 'uploading' | 'done' = 'idle';
  result: ApiResult | null = null;
  count = 200;
  showSuccess = false;

  readonly DASHBOARD_URL = 'http://localhost:5173/dashboard';

  constructor(private api: BenchmarkService, private cdr: ChangeDetectorRef) {}

  onSizeChange(event: Event) {
    this.count = Number((event.target as HTMLSelectElement).value);
  }

  startTest() {
    this.status = 'running';
    this.result = null;
    this.showSuccess = false;
    this.cdr.detectChanges();

    setTimeout(() => this.runTest(), 70);
  }

  async runTest() {
    const start = performance.now();
    const res = await this.api.runHeavyJson(this.count);
    const latency = performance.now() - start;

    const responseKB = JSON.stringify(res.data).length / 1024;
    const throughput = 1000 / latency;
    const speedMBps = responseKB / 1024 / (latency / 1000);

    this.result = {
      count: this.count,
      latency: latency.toFixed(2),
      throughput: throughput.toFixed(2),
      responseKB: responseKB.toFixed(2),
      speedMBps: speedMBps.toFixed(2),
    };

    this.status = 'done';
    this.cdr.detectChanges();
  }

  async upload() {
    if (!this.result) return;

    await this.api.reportResult({
      id: 'api-angular-' + Date.now(),
      framework: 'angular',
      category: 'api',
      scenario: 'api-load',
      config: { requestCount: this.count },
      metrics: {
        payloadSize: this.result.count,
        latencyMs: +this.result.latency,
        throughput: +this.result.throughput,
        responseKB: +this.result.responseKB,
        speedMBps: +this.result.speedMBps,
      },
      timestamp: new Date().toISOString(),
    });

    this.showSuccess = true;
    this.cdr.detectChanges();
  }

  goDashboard() {
    window.location.href = this.DASHBOARD_URL;
  }
}
