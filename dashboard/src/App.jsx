import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SummaryPage from "./pages/Summary.jsx";
import "./App.css";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/summary" element={<SummaryPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
