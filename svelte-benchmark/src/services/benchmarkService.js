import axios from "axios";

const API = "http://localhost:5000/api";

export async function reportResult(payload) {
  return axios.post(`${API}/report-result`, payload);
}

export async function fetchHeavyJson(size) {
  return axios.get(`${API}/heavy-json?size=${size}`);
}
