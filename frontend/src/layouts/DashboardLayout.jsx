import { NavLink, Outlet } from "react-router-dom";
import "../styles/global.css";

export default function DashboardLayout() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard-layout">

      <aside className="sidebar">

        {/* TOP SECTION */}
        <div>
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
        </div>

        {/* BOTTOM USER SECTION */}
        <div className="sidebar-user">
          <button className="user-btn">
            <div className="avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <p className="name">{user?.username}</p>
              <small>Signed in</small>
            </div>
          </button>
        </div>

      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>

    </div>
  );
}