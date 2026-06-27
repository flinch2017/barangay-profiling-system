import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../styles/global.css";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}")
  );
  const [profile, setProfile] = useState(() =>
    JSON.parse(localStorage.getItem("barangayProfile") || "{}")
  );
  const logoUrl = profile.logoDataUrl || user?.pfp_url;

  useEffect(() => {
    function syncProfile() {
      setUser(JSON.parse(localStorage.getItem("user") || "{}"));
      setProfile(JSON.parse(localStorage.getItem("barangayProfile") || "{}"));
    }

    window.addEventListener("barangay-profile-updated", syncProfile);
    window.addEventListener("storage", syncProfile);

    return () => {
      window.removeEventListener("barangay-profile-updated", syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

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
            <NavLink to="/barangay/settings">Admin Profile</NavLink>
          </nav>
        </div>

        {/* BOTTOM USER SECTION */}
        <div className="sidebar-user">
          <button
            className="user-btn"
            onClick={() => navigate("/barangay/settings")}
            type="button"
          >
            <div className="avatar">
              {logoUrl ? (
                <img src={logoUrl} alt="" />
              ) : (
                user?.username?.charAt(0).toUpperCase()
              )}
            </div>

            <div className="user-info">
              <p className="name">{user?.username}</p>
              <small>Signed in</small>
            </div>
          </button>

          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>

      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>

    </div>
  );
}
