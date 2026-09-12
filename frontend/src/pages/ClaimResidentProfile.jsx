import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";
import "../styles/claimProfile.css";

const initialForm = { firstName: "", middleName: "", noMiddleName: false, lastName: "", suffix: "", birthdate: "", province: "", municipality: "", barangay: "", street: "", purok: "", noPurok: false, live_birth: null, baptismal: null };

export default function ClaimResidentProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const update = (event) => { const { name, value, type, checked, files } = event.target; setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value })); };

  async function findMatches(event) {
    event.preventDefault(); setWorking(true); setMessage("");
    try { const response = await fetch(apiUrl("/api/resident-claims/matches"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const data = await response.json(); if (!response.ok) throw new Error(data.message); setMatches(data.matches); setSelected(null); }
    catch (error) { setMessage(error.message || "We could not search the resident registry."); } finally { setWorking(false); }
  }

  async function submitClaim() {
    if (!selected) return; setWorking(true); setMessage("");
    try {
      const data = new FormData();
      Object.entries({ ...form, residentId: selected.residentId, middleName: form.noMiddleName ? "" : form.middleName, purok: form.noPurok ? "" : form.purok }).forEach(([key, value]) => { if (value !== null && typeof value !== "boolean") data.append(key, value); });
      const response = await fetch(apiUrl("/api/resident-claims"), { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, body: data }); const result = await response.json(); if (!response.ok) throw new Error(result.message); navigate("/resident/notifications");
    } catch (error) { setMessage(error.message || "We could not submit your claim."); } finally { setWorking(false); }
  }

  return (
    <main className="claim-profile-page">
      <section className="claim-page-heading">
        <button type="button" className="claim-back" onClick={() => navigate("/resident/portal")}>← Return to portal</button>
        <span className="claim-kicker">RESIDENT VERIFICATION</span>
        <h1>Claim your resident profile</h1>
        <p>Provide the details recorded by your barangay and supporting documents. Your request is reviewed before access is granted.</p>
      </section>

      {message && <div className="claim-alert">{message}</div>}

      <form className="claim-form-card" onSubmit={findMatches}>
        <div className="claim-form-intro"><span>Step 1 of 2</span><strong>Verify your identity</strong></div>
        <section className="claim-section">
          <div className="claim-section-title"><h2>Personal information</h2><p>Enter your legal name exactly as it appears on your documents.</p></div>
          <div className="claim-form-grid">
            <Field label="First name" required><input name="firstName" value={form.firstName} onChange={update} required /></Field>
            <Field label="Middle name"><input name="middleName" value={form.middleName} onChange={update} disabled={form.noMiddleName} /><Check name="noMiddleName" checked={form.noMiddleName} onChange={update}>Not applicable</Check></Field>
            <Field label="Last name" required><input name="lastName" value={form.lastName} onChange={update} required /></Field>
            <Field label="Suffix"><select name="suffix" value={form.suffix} onChange={update}><option value="">None</option><option>Jr.</option><option>Sr.</option><option>II</option><option>III</option></select></Field>
            <Field label="Birthdate" required><input name="birthdate" type="date" value={form.birthdate} onChange={update} required /></Field>
          </div>
        </section>
        <section className="claim-section">
          <div className="claim-section-title"><h2>Registered address</h2><p>Use the address associated with your barangay record.</p></div>
          <div className="claim-form-grid">
            <Field label="Province" required><input name="province" value={form.province} onChange={update} required /></Field>
            <Field label="Municipality / City" required><input name="municipality" value={form.municipality} onChange={update} required /></Field>
            <Field label="Barangay" required><input name="barangay" value={form.barangay} onChange={update} required /></Field>
            <Field label="Street" required><input name="street" value={form.street} onChange={update} required /></Field>
            <Field label="Purok"><input name="purok" value={form.purok} onChange={update} disabled={form.noPurok} /><Check name="noPurok" checked={form.noPurok} onChange={update}>Not applicable</Check></Field>
          </div>
        </section>
        <section className="claim-section">
          <div className="claim-section-title"><h2>Supporting documents</h2><p>Upload clear, readable copies in image or PDF format.</p></div>
          <div className="claim-document-grid"><Upload label="Live birth certificate" name="live_birth" onChange={update} /><Upload label="Baptismal certificate" name="baptismal" onChange={update} /></div>
        </section>
        <div className="claim-form-actions"><p>Your documents are used only to verify this claim.</p><button type="submit" disabled={working}>{working ? "Searching registry..." : "Find my resident profile"}</button></div>
      </form>

      {matches.length > 0 && <section className="claim-matches-card"><div className="claim-form-intro"><span>Step 2 of 2</span><strong>Select your profile</strong></div><p className="claim-matches-description">Choose the record that belongs to you. The barangay administrator will verify your request and documents.</p><div className="claim-match-list">{matches.map((match) => <button type="button" className={`claim-match ${selected?.residentId === match.residentId ? "is-selected" : ""}`} key={match.residentId} onClick={() => setSelected(match)}><span><strong>{match.name}</strong><small>{match.birthdate}</small></span><span>{match.barangay}, {match.municipality}</span></button>)}</div><div className="claim-form-actions"><p>Select one profile to continue.</p><button type="button" disabled={!selected || working} onClick={submitClaim}>{working ? "Submitting request..." : "Submit claim request"}</button></div></section>}
    </main>
  );
}

function Field({ label, required, children }) { return <label className="claim-field"><span>{label}{required && <b> *</b>}</span>{children}</label>; }
function Check({ children, ...props }) { return <label className="claim-check"><input type="checkbox" {...props} /> {children}</label>; }
function Upload({ label, name, onChange }) { return <label className="claim-upload"><strong>{label}</strong><span>Choose image or PDF</span><input name={name} type="file" accept="image/*,.pdf" required onChange={onChange} /></label>; }
