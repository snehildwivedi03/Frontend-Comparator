import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export async function fetchResults() {
  const response = await axios.get(`${API_BASE_URL}/api/results`);
  return response.data;
}

export async function reportResult(result) {
  const response = await axios.post(
    `${API_BASE_URL}/api/report-result`,
    result
  );
  return response.data;
}

export async function clearResults() {
  const response = await axios.post(`${API_BASE_URL}/api/clear-results`);
  return response.data;
}
