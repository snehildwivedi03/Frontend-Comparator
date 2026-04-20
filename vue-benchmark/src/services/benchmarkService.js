import axios from "axios";

const API = "http://localhost:5000/api";

export const runHeavyJson = (size) =>
  axios.get(`${API}/heavy-json?size=${size}`);

export const reportResult = (data) => axios.post(`${API}/report-result`, data);

export const fetchResults = () => axios.get(`${API}/results`);
