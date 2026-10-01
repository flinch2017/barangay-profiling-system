import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { apiUrl } from "../lib/api";
import "../styles/global.css";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}")
  );
  const [profile, setProfile] = useState(() =>
    JSON.parse(localStorage.getItem("barangayProfile") || "{}")
  );
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const isResident = user?.role === "resident";
  const logoUrl = isResident ? user?.pfp_url : profile.logoDataUrl || user?.pfp_url;
  const accountName = user?.username || "Account";
  const accountRole = user?.role
    ?.split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

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

  useEffect(() => {
    if (isResident) return;
    async function loadSharedBarangayLogo() {
      try {
        const response = await fetch(apiUrl("/api/barangays/profile"), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();
        if (!response.ok || !data.profile?.logo_url) return;
        const nextProfile = { ...JSON.parse(localStorage.getItem("barangayProfile") || "{}"), logoDataUrl: data.profile.logo_url };
        localStorage.setItem("barangayProfile", JSON.stringify(nextProfile));
        setProfile(nextProfile);
      } catch {
        // The header can still use a cached logo while offline.
      }
    }
    loadSharedBarangayLogo();
  }, [isResident]);

  useEffect(() => {
    function closeAccountMenu(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setIsAccountMenuOpen(false);
    }

    document.addEventListener("mousedown", closeAccountMenu);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeAccountMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAccountMenuOpen(false);
    navigate("/");
  }

  return (
    <div className="app-shell">

      <header className="top-nav">
        <div className="top-nav-brand">
          <span className="top-nav-brand-mark" aria-hidden="true">B</span>
          <h2>BPS</h2>
        </div>

        <nav className="top-nav-links" aria-label="Main navigation">
          {isResident ? (
            <>
              <NavLink to="/resident/portal">My Portal</NavLink>
              <NavLink to="/resident/notifications">Notifications</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/barangay/dashboard">Dashboard</NavLink>
              <NavLink to="/barangay/residents">Residents</NavLink>
              <NavLink to="/barangay/certificates">Certificates</NavLink>
              <NavLink to="/barangay/officials">Officials</NavLink>
              <NavLink to="/barangay/claim-requests">Claim Requests</NavLink>
              <NavLink to="/barangay/customization">Customization</NavLink>
            </>
          )}
        </nav>

        <div className="top-nav-user" ref={accountMenuRef}>
          <button
            className="top-nav-user-btn"
            onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
            type="button"
            aria-label={`Account menu for ${accountName}`}
            aria-expanded={isAccountMenuOpen}
            aria-haspopup="menu"
          >
            <div className="avatar">
              {logoUrl ? (
                <img src={logoUrl} alt="" />
              ) : (
                user?.username?.charAt(0).toUpperCase()
              )}
            </div>
          </button>

          {isAccountMenuOpen && (
            <div className="account-dropdown" role="menu">
              <div className="account-dropdown-identity" role="group" aria-label="Signed-in account">
                <div className="account-dropdown-avatar" aria-hidden="true">
                  {logoUrl ? (
                    <img src={logoUrl} alt="" />
                  ) : (
                    accountName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="account-dropdown-user">
                  <span>Signed in as</span>
                  <strong title={accountName}>{accountName}</strong>
                  {user?.email && <small title={user.email}>{user.email}</small>}
                  {accountRole && <span className="account-dropdown-role">{accountRole}</span>}
                </div>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  navigate("/settings");
                }}
              >
                <FiSettings aria-hidden="true" />
                <span>Settings</span>
              </button>
              <button type="button" role="menuitem" className="account-dropdown-logout" onClick={handleLogout}>
                <FiLogOut aria-hidden="true" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>

      </header>

      <main className="dashboard-content">
        <Outlet />
      </main>

    </div>
  );
}
