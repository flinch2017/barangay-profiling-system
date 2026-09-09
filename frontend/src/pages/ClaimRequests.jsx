import { useEffect, useState } from "react";
import { apiUrl } from "../lib/api";
import "../styles/residents.css";

export default function ClaimRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  async function loadRequests() {
    const response = await fetch(apiUrl("/api/resident-claims"), { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (response.ok) setRequests(data.requests); else setMessage(data.message);
  }

  useEffect(() => { loadRequests(); }, []);

  async function review(claimId, decision) {
    const response = await fetch(apiUrl(`/api/resident-claims/${claimId}`), { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ decision }) });
    const data = await response.json(); setMessage(data.message); if (response.ok) loadRequests();
  }

  return <div className="residents-page"><div className="page-header"><div><h1>Resident Claim Requests</h1><p>Review pending requests to link resident profiles with login accounts.</p></div></div>{message && <p>{message}</p>}<div className="table-container"><table className="residents-table"><thead><tr><th>Claimant</th><th>Profile</th><th>Submitted</th><th>Documents</th><th>Action</th></tr></thead><tbody>{requests.length ? requests.map((request) => <tr key={request.claim_id}><td>{request.first_name} {request.last_name}<br /><small>{request.email}</small></td><td>{request.residents?.first_name} {request.residents?.last_name}<br /><small>{request.residents?.birthdate}</small></td><td>{new Date(request.created_at).toLocaleDateString()}</td><td>{request.live_birth_url && <a href={request.live_birth_url} target="_blank" rel="noreferrer">Birth certificate</a>} {request.baptismal_url && <a href={request.baptismal_url} target="_blank" rel="noreferrer">Baptismal</a>}</td><td>{request.status === "pending" ? <><button onClick={() => review(request.claim_id, "approved")}>Approve</button><button onClick={() => review(request.claim_id, "rejected")}>Reject</button></> : request.status}</td></tr>) : <tr><td colSpan="5">No claim requests.</td></tr>}</tbody></table></div></div>;
}
