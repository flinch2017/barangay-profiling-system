import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";
import "../styles/claimProfile.css";

const fields = [
  "first_name", "middle_name", "last_name", "suffix", "contact_number", "email",
  "birthdate", "gender", "civil_status", "street", "purok", "occupation", "salary",
  "educational_level", "school_name", "year_level", "course", "currently_enrolled",
  "graduation_year", "fourps_beneficiary", "senior_citizen", "voter",
];
const booleanFields = ["currently_enrolled", "fourps_beneficiary", "senior_citizen", "voter"];

const fileFields = [
  ["pfp", "Profile photo", "image/*"],
  ["live_birth", "Live birth certificate", "image/*,.pdf"],
  ["baptismal", "Baptismal certificate", "image/*,.pdf"],
];

export default function ResidentProfileUpdate() {
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [currentResident, setCurrentResident] = useState(null);
  const [files, setFiles] = useState({});
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(apiUrl("/api/resident-claims/me"), {
          headers: { Authorization: `******"token")}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load your profile.");
        if (!data.resident) throw new Error("Claim a resident profile before requesting an update.");
        setCurrentResident(data.resident);
        setPending(Boolean(data.pendingProfileUpdate));
        setForm(Object.fromEntries(fields.map((field) => [
          field,
          data.resident[field] ?? (["currently_enrolled", "fourps_beneficiary", "senior_citizen", "voter"].includes(field) ? false : ""),
        ])));
      } catch (error) {
        setMessage(error.message);
      }
    }
    loadProfile();
  }, []);

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setSuccess(false);
    try {
      const body = new FormData();
      const changedFields = fields.filter((field) => (
        booleanFields.includes(field)
          ? Boolean(form[field]) !== Boolean(currentResident[field])
          : String(form[field] ?? "") !== String(currentResident[field] ?? "")
      ));
      changedFields.forEach((field) => body.append(field, String(form[field] ?? "")));
      fileFields.forEach(([name]) => {
        if (files[name]) body.append(name, files[name]);
      });
      if (!changedFields.length && !Object.keys(files).length) {
        setMessage("No profile changes were made.");
        setSaving(false);
        return;
      }
      const response = await fetch(apiUrl("/api/resident-claims/profile-updates"), {
        method: "POST",
        headers: { Authorization: `******"token")}` },
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to submit your profile changes.");
      setMessage(data.message);
      setSuccess(true);
      setPending(true);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <main className="claim-profile-page"><p>{message || "Loading your profile..."}</p></main>;

  return (
    <main className="claim-profile-page">
      <section className="claim-page-heading">
        <button className="claim-back" onClick={() => navigate("/resident/portal")}>← Return to portal</button>
        <span className="claim-kicker">PROFILE UPDATE</span>
        <h1>Request profile changes</h1>
        <p>Your barangay administrator must review and approve these changes before they take effect.</p>
      </section>
      {message && <div className={`claim-alert ${success ? "claim-alert-success" : ""}`} role="status">{message}</div>}
      {pending ? (
        <section className="claim-form-card">
          <h2>Update request pending</h2>
          <p>Your current profile remains active while the barangay administrator reviews your request. You can submit another update after this request has been reviewed.</p>
        </section>
      ) : (
        <form className="claim-form-card" onSubmit={submit}>
          <div className="claim-form-intro"><span>REVIEW REQUIRED</span><strong>Proposed profile details</strong></div>
          <Section title="Personal information">
            <Field label="First name"><input name="first_name" value={form.first_name} onChange={change} required /></Field>
            <Field label="Middle name"><input name="middle_name" value={form.middle_name} onChange={change} /></Field>
            <Field label="Last name"><input name="last_name" value={form.last_name} onChange={change} required /></Field>
            <Field label="Suffix"><input name="suffix" value={form.suffix} onChange={change} /></Field>
            <Field label="Birthdate"><input name="birthdate" type="date" value={form.birthdate} onChange={change} required /></Field>
            <Field label="Sex">
              <select name="gender" value={form.gender} onChange={change} required>
                <option value="">Select sex</option><option>Male</option><option>Female</option>
              </select>
            </Field>
            <Field label="Civil status">
              <select name="civil_status" value={form.civil_status} onChange={change} required>
                <option value="">Select status</option>
                {["Single", "Married", "Widowed", "Separated", "Divorced", "Annulled"].map((status) => <option key={status}>{status}</option>)}
              </select>
            </Field>
          </Section>
          <Section title="Contact and address">
            <Field label="Contact number"><input name="contact_number" value={form.contact_number} onChange={change} /></Field>
            <Field label="Email"><input name="email" type="email" value={form.email} onChange={change} /></Field>
            <Field label="Street"><input name="street" value={form.street} onChange={change} required /></Field>
            <Field label="Purok"><input name="purok" value={form.purok} onChange={change} /></Field>
            <p className="claim-field-help">Barangay, municipality, province, country, and ZIP code are set by the barangay and cannot be changed here.</p>
          </Section>
          <Section title="Employment and education">
            <Field label="Occupation"><input name="occupation" value={form.occupation} onChange={change} /></Field>
            <Field label="Monthly income bracket"><input name="salary" value={form.salary} onChange={change} /></Field>
            <Field label="Educational level"><input name="educational_level" value={form.educational_level} onChange={change} /></Field>
            <Field label="School name"><input name="school_name" value={form.school_name} onChange={change} /></Field>
            <Field label="Course / degree"><input name="course" value={form.course} onChange={change} /></Field>
            <Field label="Year level"><input name="year_level" value={form.year_level} onChange={change} /></Field>
            <Field label="Graduation year"><input name="graduation_year" type="number" value={form.graduation_year} onChange={change} /></Field>
          </Section>
          <section className="claim-section">
            <div className="claim-section-title"><h2>Resident information</h2><p>Update the information that applies to you.</p></div>
            <div className="claim-status-options">
              {[["currently_enrolled", "Currently enrolled"], ["fourps_beneficiary", "4Ps beneficiary"], ["senior_citizen", "Senior citizen"], ["voter", "Registered voter"]].map(([name, label]) => (
                <label key={name}><input name={name} type="checkbox" checked={Boolean(form[name])} onChange={change} /> {label}</label>
              ))}
            </div>
          </section>
          <Section title="Profile photo and documents">
            {fileFields.map(([name, label, accept]) => (
              <Field key={name} label={label}>
                {currentResident[`${name === "pfp" ? "pfp" : name}_url`] && (
                  <a href={currentResident[`${name === "pfp" ? "pfp" : name}_url`]} target="_blank" rel="noreferrer">View current {label.toLowerCase()}</a>
                )}
                <input type="file" name={name} accept={accept} onChange={(event) => setFiles((current) => ({ ...current, [name]: event.target.files?.[0] }))} />
              </Field>
            ))}
          </Section>
          <div className="claim-form-actions">
            <p>Nothing changes until your barangay administrator approves this request.</p>
            <button disabled={saving}>{saving ? "Sending request..." : "Submit for approval"}</button>
          </div>
        </form>
      )}
    </main>
  );
}

function Section({ title, children }) {
  return <section className="claim-section"><div className="claim-section-title"><h2>{title}</h2></div><div className="claim-form-grid">{children}</div></section>;
}

function Field({ label, children }) {
  return <label className="claim-field"><span>{label}</span>{children}</label>;
}
