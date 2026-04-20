import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class BenchmarkService {
  private API = 'http://localhost:5000/api'; // Backend URL

  // ▶ Request heavy JSON payload (API benchmark)
  runHeavyJson(size: number) {
    return axios.get(`${this.API}/heavy-json?size=${size}`);
  }

  // ▶ Upload JSON/API benchmark results to dashboard backend
  reportResult(payload: any) {
    return axios.post(`${this.API}/report-result`, payload);
  }

  // ▶ Fetch results for dashboard (use later for Angular Dashboard)
  fetchResults() {
    return axios.get(`${this.API}/results`);
  }

  // ▶ Clear database
  clearResults() {
    return axios.post(`${this.API}/clear-results`, {});
  }
}
