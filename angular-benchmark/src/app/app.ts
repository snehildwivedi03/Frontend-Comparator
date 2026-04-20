import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonBenchmarkComponent } from './pages/json-benchmark.component';
import { ApiBenchmarkComponent } from './pages/api-benchmark.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, JsonBenchmarkComponent, ApiBenchmarkComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent {
  page: 'json' | 'api' = 'json';
}
