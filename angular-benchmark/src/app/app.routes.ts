import { Routes } from '@angular/router';
import { JsonBenchmarkComponent } from './pages/json-benchmark.component';
import { ApiBenchmarkComponent } from './pages/api-benchmark.component';

export const routes: Routes = [
  { path: '', redirectTo: 'json', pathMatch: 'full' },
  { path: 'json', component: JsonBenchmarkComponent },
  { path: 'api', component: ApiBenchmarkComponent },
  { path: '**', redirectTo: 'json' },
];
