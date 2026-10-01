import { useCallback, useEffect, useMemo, useState } from "react";
import { FiCheck, FiClock, FiFileText, FiTrash2, FiX } from "react-icons/fi";
import { apiUrl } from "../lib/api";
import "../styles/claimRequests.css";

const fieldLabels = {
  first_name: "First name",
  middle_name: "Middle name",
  last_name: "Last name",
  suffix: "Suffix",
  contact_number: "Contact number",
  email: "Email",
  birthdate: "Birthdate",
  gender: "Sex",
  civil_status: "Civil status",
  street: "Street",
  purok: "Purok",
  occupation: "Occupation",
  salary: "Monthly income bracket",
  educational_level: "Educational level",
  school_name: "School name",
  year_level: "Year level",
  course: "Course / degree",
  currently_enrolled: "Currently enrolled",
  graduation_year: "Graduation year",
  fourps_beneficiary: "4Ps beneficiary",
  senior_citizen: "Senior citizen",
  voter: "Registered voter",
  pfp_url: "Profile photo",
  live_birth_url: "Live birth certificate",
  baptismal_url: "Baptismal certificate",
};

const displayChange = (value) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value === null || value === undefined || value === "" ? "Not recorded" : value;
};

function ChangeValue({ field, value }) {
  if (field.endsWith("_url") && value) {
    return <a href={value} target="_blank" rel="noreferrer">View proposed file</a>;
  }
  return displayChange(value);
}

export default function ClaimRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [workingId, setWorkingId] = useState("");
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const headers = useMemo(() => ({ Authorization: "Bearer " + token }), [token]);

  const loadRequests = useCallback(async () => {
    try {
      const [claimsResponse, updatesResponse] = await Promise.all([
        fetch(apiUrl("/api/resident-claims"), { headers }),
        fetch(apiUrl("/api/resident-claims/profile-updates"), { headers }),
      ]);
      const [data, updateData] = await Promise.all([claimsResponse.json(), updatesResponse.json()]);
      if (!claimsResponse.ok) throw new Error(data.message || "Unable to load resident requests.");
      if (!updatesResponse.ok) throw new Error(updateData.message || "Unable to load profile update requests.");
      const registrations = (data.registrationRequests || []).map((request) => ({
        claim_id: request.registration_id,
        requestType: "registration",
        status: request.status,
        created_at: request.created_at,
        first_name: request.profile?.first_name,
        middle_name: request.profile?.middle_name,
        last_name: request.profile?.last_name,
        email: request.profile?.email,
        live_birth_url: request.live_birth_url,
        baptismal_url: request.baptismal_url,
        profile: request.profile,
      }));
      const profileUpdates = (updateData.requests || []).map((request) => ({
        ...request,
        claim_id: request.request_id,
        requestType: "profile-update",
        first_name: request.residents?.first_name,
        middle_name: request.residents?.middle_name,
        last_name: request.residents?.last_name,
        email: request.changes?.email || "",
      }));
      setRequests([...(data.requests || []), ...registrations, ...profileUpdates]);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { loadRequests(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadRequests]);

  async function review(request, decision) {
    setWorkingId(request.claim_id);
    try {
      const segment = request.requestType === "registration"
        ? `registrations/${request.claim_id}`
        : request.requestType === "profile-update"
          ? `profile-updates/${request.claim_id}`
          : request.claim_id;
      const response = await fetch(apiUrl(`/api/resident-claims/${segment}`), {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to review this request.");
      await loadRequests();
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setWorkingId("");
    }
  }

  async function deleteRequest(request) {
    if (request.requestType === "profile-update") return;
    if (!window.confirm(`Delete the request from ${request.first_name} ${request.last_name}? This cannot be undone.`)) return;
    setWorkingId(request.claim_id);
    try {
      const segment = request.requestType === "registration" ? `registrations/${request.claim_id}` : request.claim_id;
      const response = await fetch(apiUrl(`/api/resident-claims/${segment}`), { method: "DELETE", headers });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to delete this request.");
      setMessage(data.message);
      setRequests((current) => current.filter(({ claim_id }) => claim_id !== request.claim_id));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setWorkingId("");
    }
  }

  const counts = useMemo(() => Object.fromEntries(["pending", "approved", "rejected"].map((status) => [
    status,
    requests.filter((request) => request.status === status).length,
  ])), [requests]);
  const visibleRequests = filter === "all" ? requests : requests.filter((request) => request.status === filter);

  return (
    <main className="claim-requests-page">
      <header className="claim-requests-heading">
        <div><span>RESIDENT VERIFICATION</span><h1>Resident requests</h1><p>Review resident profile claims, registrations, and proposed profile changes.</p></div>
        <div className="claim-request-summary"><FiClock /><span><strong>{counts.pending || 0}</strong> awaiting review</span></div>
      </header>
      {message && <div className="claim-request-message" role="status">{message}</div>}
      <nav className="claim-request-filters" aria-label="Resident request filters">
        {[["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"], ["all", "All requests"]].map(([status, label]) => (
          <button type="button" className={filter === status ? "active" : ""} key={status} onClick={() => setFilter(status)}>
            {label}<span>{status === "all" ? requests.length : counts[status] || 0}</span>
          </button>
        ))}
      </nav>
      <section className="claim-request-list">
        {loading ? <p>Loading resident requests...</p> : visibleRequests.length ? visibleRequests.map((request) => {
          const working = workingId === request.claim_id;
          const name = [request.first_name, request.middle_name, request.last_name].filter(Boolean).join(" ") || "Resident";
          const profileName = request.requestType === "registration"
            ? "New resident registration"
            : request.requestType === "profile-update"
              ? "Existing resident profile"
              : [request.residents?.first_name, request.residents?.middle_name, request.residents?.last_name].filter(Boolean).join(" ");
          const requestLabel = request.requestType === "registration"
            ? "NEW REGISTRATION"
            : request.requestType === "profile-update"
              ? "PROFILE UPDATE"
              : "PROFILE CLAIM";
          return (
            <article className={`claim-request-card ${request.requestType === "profile-update" ? "profile-update-card" : ""}`} key={request.claim_id}>
              <div className="claim-request-person">
                <div className="claim-request-avatar">{request.first_name?.charAt(0)}</div>
                <div><h2>{name}</h2><p>{request.email || " "}</p><small>Submitted {new Date(request.created_at).toLocaleDateString()}</small></div>
              </div>
              <div className="claim-request-profile">
                <span>{requestLabel}</span>
                <strong>{profileName || "Resident profile"}</strong>
                <p>{request.residents?.birthdate || request.profile?.birthdate || "Birthdate unavailable"}</p>
              </div>
              {request.requestType === "profile-update" ? (
                <details className="profile-update-changes">
                  <summary>Review proposed changes ({Object.keys(request.changes || {}).length})</summary>
                  <dl>
                    {Object.entries(request.changes || {}).map(([field, value]) => (
                      <div key={field}>
                        <dt>{fieldLabels[field] || field}</dt>
                        <dd><span>{displayChange(request.residents?.[field])}</span><b aria-hidden="true">→</b><span><ChangeValue field={field} value={value} /></span></dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ) : (
                <div className="claim-request-documents">
                  <span>DOCUMENTS</span>
                  <div>
                    {request.live_birth_url ? <a href={request.live_birth_url} target="_blank" rel="noreferrer"><FiFileText /> Birth certificate</a> : <em>Birth certificate unavailable</em>}
                    {request.baptismal_url ? <a href={request.baptismal_url} target="_blank" rel="noreferrer"><FiFileText /> Baptismal certificate</a> : <em>Baptismal unavailable</em>}
                  </div>
                </div>
              )}
              <div className="claim-request-actions">
                {request.status === "pending" ? (
                  <>
                    <button disabled={working} className="approve" onClick={() => review(request, "approved")}><FiCheck /> Approve</button>
                    <button disabled={working} className="reject" onClick={() => review(request, "rejected")}><FiX /> Reject</button>
                  </>
                ) : <span className={`claim-status ${request.status}`}>{request.status}</span>}
                {request.requestType !== "profile-update" && <button disabled={working} className="delete" onClick={() => deleteRequest(request)} aria-label={`Delete ${name}'s request`}><FiTrash2 /></button>}
              </div>
            </article>
          );
        }) : (
          <div className="claim-empty"><FiFileText /><h2>No {filter === "all" ? "resident requests" : filter + " requests"}</h2><p>New resident profile requests will appear here for review.</p></div>
        )}
      </section>
    </main>
  );
}
