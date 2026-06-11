import "../styles/global.css";
import "../styles/barangay_dashboard.css";

export default function BarangayDashboard() {
  return (
    <div>
      <h1>Barangay Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">Total Residents: 1,245</div>
        <div className="stat-card">Male: 620</div>
        <div className="stat-card">Female: 625</div>
        <div className="stat-card">Certificates: 89</div>
      </div>
    </div>
  );
}