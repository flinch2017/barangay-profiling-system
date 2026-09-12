import { useEffect, useState } from "react";
import { apiUrl } from "../lib/api";
import "../styles/residentPortal.css";

export default function ResidentNotifications() {
  const [claim, setClaim] = useState(undefined);
  useEffect(() => { fetch(apiUrl("/api/resident-claims/me"), { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then((response) => response.json()).then((data) => setClaim(data.latestClaim || null)).catch(() => setClaim(null)); }, []);
  if (claim === undefined) return <div className="resident-portal"><p>Loading notifications...</p></div>;
  const details = claim?.status === "approved" ? ["Profile claim approved", "Your resident profile is now verified and portal features are unlocked."] : claim?.status === "rejected" ? ["Profile claim not approved", "Please contact your barangay office if you need help with your request."] : claim ? ["Profile claim pending", "Your barangay administrator is reviewing your submitted documents."] : ["No notifications yet", "Submit a profile claim to receive updates here."];
  return <div className="resident-portal"><section className="portal-card"><p className="portal-kicker">NOTIFICATIONS</p><h1>{details[0]}</h1><p>{details[1]}</p>{claim && <small>Submitted {new Date(claim.created_at).toLocaleDateString()}</small>}</section></div>;
}
