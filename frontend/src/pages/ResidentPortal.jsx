import { useEffect, useState } from "react";
import { apiUrl } from "../lib/api";
import "../styles/residentPortal.css";

export default function ResidentPortal() {
  const [resident, setResident] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [latestClaim, setLatestClaim] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPortal() {
      try {
        const response = await fetch(apiUrl("/api/resident-claims/me"), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setResident(result.resident);
        setLatestClaim(result.latestClaim);
        if (result.resident?.resident_id) {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem("user", JSON.stringify({
            ...user,
            residentId: result.resident.resident_id,
            pfp_url: result.resident.pfp_url || user.pfp_url,
          }));
          window.dispatchEvent(new Event("barangay-profile-updated"));
        }
        setLoaded(true);
      } catch (loadError) {
        setError(loadError.message || "Unable to load your portal.");
      }
    }
    loadPortal();
  }, []);

  if (error) return <div className="resident-portal"><p>{error}</p></div>;
  if (!loaded) return <div className="resident-portal"><p>Loading your portal...</p></div>;
  if (!resident) return <div className="resident-portal"><section className="portal-welcome"><div><p className="portal-kicker">RESIDENT PORTAL</p><h1>Welcome to your portal</h1><p>{latestClaim?.status === "pending" ? "Your profile claim is being reviewed." : "Claim your resident profile to unlock your verified profile and documents."}</p></div></section><section className="portal-card"><h2>Profile claim</h2><p>{latestClaim?.status === "rejected" ? "Your latest request was not approved. Please contact your barangay office before submitting another request." : latestClaim?.status === "pending" ? "Your claim is pending. You will be notified when the barangay administrator decides." : "You have not claimed a resident profile yet."}</p>{!latestClaim || latestClaim.status === "rejected" ? <a className="portal-primary-action" href="/resident/claim-profile">Claim a resident profile</a> : <a className="portal-primary-action" href="/resident/notifications">View notifications</a>}</section></div>;

  const fullName = [resident.first_name, resident.middle_name, resident.last_name, resident.suffix].filter(Boolean).join(" ");
  const address = [resident.street, resident.purok && `Purok ${resident.purok}`, resident.barangay_name, resident.municipality, resident.province].filter(Boolean).join(", ");

  return (
    <div className="resident-portal">
      <section className="portal-welcome">
        <div><p className="portal-kicker">RESIDENT PORTAL</p><h1>Welcome, {resident.first_name}</h1><p>View the information connected to your verified barangay profile.</p></div>
        {resident.pfp_url ? <img className="portal-avatar" src={resident.pfp_url} alt="" /> : <span className="portal-avatar portal-avatar-placeholder">{resident.first_name?.charAt(0)}</span>}
      </section>

      <div className="portal-grid">
        <section className="portal-card"><h2>My Profile</h2><dl><div><dt>Full name</dt><dd>{fullName}</dd></div><div><dt>Birthdate</dt><dd>{resident.birthdate || "Not recorded"}</dd></div><div><dt>Contact number</dt><dd>{resident.contact_number || "Not recorded"}</dd></div><div><dt>Email</dt><dd>{resident.email || "Not recorded"}</dd></div></dl></section>
        <section className="portal-card"><h2>Address</h2><p>{address || "Not recorded"}</p><h2 className="portal-section-title">Resident status</h2><div className="portal-tags">{resident.voter && <span>Registered voter</span>}{resident.senior_citizen && <span>Senior citizen</span>}{resident.fourps_beneficiary && <span>4Ps beneficiary</span>}{!resident.voter && !resident.senior_citizen && !resident.fourps_beneficiary && <span>No status recorded</span>}</div></section>
      </div>
      <section className="portal-card"><h2>My documents</h2><div className="portal-documents">{resident.live_birth_url ? <a href={resident.live_birth_url} target="_blank" rel="noreferrer">View live birth certificate</a> : <span>Live birth certificate not available</span>}{resident.baptismal_url ? <a href={resident.baptismal_url} target="_blank" rel="noreferrer">View baptismal certificate</a> : <span>Baptismal certificate not available</span>}</div></section>
    </div>
  );
}
