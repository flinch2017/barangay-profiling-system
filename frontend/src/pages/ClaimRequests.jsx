import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiClock, FiFileText, FiTrash2, FiX } from "react-icons/fi";
import { apiUrl } from "../lib/api";
import "../styles/claimRequests.css";

export default function ClaimRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [workingId, setWorkingId] = useState("");
  const [filter, setFilter] = useState("pending");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  async function loadRequests() {
    const response = await fetch(apiUrl("/api/resident-claims"), { headers });
    const data = await response.json();
    if (response.ok) setRequests(data.requests || []); else setMessage(data.message);
  }
  useEffect(() => { loadRequests(); }, []);

  async function review(request, decision) {
    setWorkingId(request.claim_id);
    const response = await fetch(apiUrl(`/api/resident-claims/${request.claim_id}`), { method: "PATCH", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ decision }) });
    const data = await response.json(); setMessage(data.message);
    if (response.ok) await loadRequests();
    setWorkingId("");
  }

  async function deleteRequest(request) {
    if (!window.confirm(`Delete the claim request from ${request.first_name} ${request.last_name}? This cannot be undone.`)) return;
    setWorkingId(request.claim_id);
    const response = await fetch(apiUrl(`/api/resident-claims/${request.claim_id}`), { method: "DELETE", headers });
    const data = await response.json(); setMessage(data.message);
    if (response.ok) setRequests((current) => current.filter(({ claim_id }) => claim_id !== request.claim_id));
    setWorkingId("");
  }

  const counts = useMemo(() => Object.fromEntries(["pending", "approved", "rejected"].map((status) => [status, requests.filter((request) => request.status === status).length])), [requests]);
  const visibleRequests = filter === "all" ? requests : requests.filter((request) => request.status === filter);

  return <main className="claim-requests-page">
    <header className="claim-requests-heading"><div><span>RESIDENT VERIFICATION</span><h1>Claim requests</h1><p>Review identity documents and connect verified residents to their profiles.</p></div><div className="claim-request-summary"><FiClock /><span><strong>{counts.pending || 0}</strong> awaiting review</span></div></header>
    {message && <div className="claim-request-message">{message}</div>}
    <nav className="claim-request-filters" aria-label="Claim request filters">{[["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"], ["all", "All requests"]].map(([status, label]) => <button type="button" className={filter === status ? "active" : ""} key={status} onClick={() => setFilter(status)}>{label}<span>{status === "all" ? requests.length : counts[status] || 0}</span></button>)}</nav>
    <section className="claim-request-list">{visibleRequests.length ? visibleRequests.map((request) => {
      const working = workingId === request.claim_id;
      const name = `${request.first_name} ${request.middle_name || ""} ${request.last_name}`.replace(/\s+/g, " ").trim();
      const profileName = [request.residents?.first_name, request.residents?.middle_name, request.residents?.last_name].filter(Boolean).join(" ");
      return <article className="claim-request-card" key={request.claim_id}><div className="claim-request-person"><div className="claim-request-avatar">{request.first_name?.charAt(0)}</div><div><h2>{name}</h2><p>{request.email}</p><small>Submitted {new Date(request.created_at).toLocaleDateString()}</small></div></div><div className="claim-request-profile"><span>REQUESTED PROFILE</span><strong>{profileName || "Resident profile"}</strong><p>{request.residents?.birthdate || "Birthdate unavailable"}</p></div><div className="claim-request-documents"><span>DOCUMENTS</span><div>{request.live_birth_url ? <a href={request.live_birth_url} target="_blank" rel="noreferrer"><FiFileText /> Birth certificate</a> : <em>Birth certificate unavailable</em>}{request.baptismal_url ? <a href={request.baptismal_url} target="_blank" rel="noreferrer"><FiFileText /> Baptismal certificate</a> : <em>Baptismal unavailable</em>}</div></div><div className="claim-request-actions">{request.status === "pending" ? <><button disabled={working} className="approve" onClick={() => review(request, "approved")}><FiCheck /> Approve</button><button disabled={working} className="reject" onClick={() => review(request, "rejected")}><FiX /> Reject</button></> : <span className={`claim-status ${request.status}`}>{request.status}</span>}<button disabled={working} className="delete" onClick={() => deleteRequest(request)} aria-label={`Delete ${name}'s request`}><FiTrash2 /></button></div></article>;
    }) : <div className="claim-empty"><FiFileText /><h2>No {filter === "all" ? "claim requests" : filter + " requests"}</h2><p>New resident profile claims will appear here for review.</p></div>}</section>
  </main>;
}
