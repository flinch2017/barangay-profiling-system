import { NavLink, Outlet } from "react-router-dom";
import "../styles/global.css";

export default function DashboardLayout() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR (ONLY ONCE HERE) */}
      <aside className="sidebar">

        <div className="sidebar-header">
          <h2>Barangay System</h2>
          <p>{user?.username}</p>
        </div>

        <nav className="sidebar-nav">

          <NavLink to="/barangay/dashboard">Dashboard</NavLink>
          <NavLink to="/barangay/residents">Residents</NavLink>
          <NavLink to="/barangay/certificates">Certificates</NavLink>
          <NavLink to="/barangay/officials">Officials</NavLink>
          <NavLink to="/barangay/settings">Settings</NavLink>

        </nav>

      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        <Outlet />
      </main>

    </div>
  );
}