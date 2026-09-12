import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupBarangayAdmin } from "../services/authService";
import { apiUrl } from "../lib/api";
import "../styles/global.css";
import "../styles/signup.css";

export default function BarangaySignup() {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [form, setForm] = useState({ username: "", email: "", barangayId: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const setField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");
    setError(""); setSubmitting(true);
    try {
      const result = type === "resident"
        ? await (await fetch(apiUrl("/api/resident-claims/signup"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })).json()
        : await signupBarangayAdmin(form.username, form.email, form.password, form.barangayId, "barangay_admin");
      if (!result.token) throw new Error(result.message || "Unable to create account");
      localStorage.setItem("token", result.token); localStorage.setItem("user", JSON.stringify(result.user));
      navigate(type === "resident" ? "/resident/portal" : "/barangay/dashboard");
    } catch (err) { setError(err.response?.data?.message || err.message || "Unable to create account"); } finally { setSubmitting(false); }
  }

  if (!type) return <div className="signup-wrapper"><section className="signup-choice-card card"><p className="signup-eyebrow">GET STARTED</p><h1 className="signup-title">What would you like to do?</h1><p className="signup-subtitle">Choose the account that best describes you.</p><div className="signup-options"><button type="button" className="signup-option" onClick={() => setType("resident")}><span className="signup-option-icon">⌁</span><span className="signup-option-content"><strong>Create a resident account</strong><span>Access your personal portal and request to claim a resident profile.</span></span><span className="signup-option-arrow">→</span></button><button type="button" className="signup-option" onClick={() => setType("admin")}><span className="signup-option-icon">+</span><span className="signup-option-content"><strong>Create a BPS account</strong><span>Register a new Barangay Profiling System administrator account.</span></span><span className="signup-option-arrow">→</span></button></div><p className="signup-footer">Already have an account? <Link to="/" className="link">Login</Link></p></section></div>;

  return <div className="signup-wrapper"><section className="signup-card card"><button type="button" className="back-to-options" onClick={() => setType("")}>← Back to options</button><p className="signup-eyebrow">{type === "resident" ? "RESIDENT ACCOUNT" : "BPS ACCOUNT"}</p><h1 className="signup-title">{type === "resident" ? "Create a resident account" : "Create a BPS account"}</h1><p className="signup-subtitle">{type === "resident" ? "You can request to claim a resident profile from your portal after signing up." : "Create an administrator account for a barangay unit."}</p>{error && <div className="alert-error">{error}</div>}<form onSubmit={submit} className="signup-form"><div className="form-group"><label>Username</label><input name="username" className="input" value={form.username} onChange={setField} required /></div><div className="form-group"><label>Email</label><input name="email" type="email" className="input" value={form.email} onChange={setField} required /></div>{type === "admin" && <div className="form-group"><label>Barangay ID</label><input name="barangayId" className="input" value={form.barangayId} onChange={setField} required /></div>}<div className="form-group"><label>Password</label><input name="password" type="password" className="input" value={form.password} onChange={setField} minLength="6" required /></div><div className="form-group"><label>Confirm password</label><input name="confirmPassword" type="password" className="input" value={form.confirmPassword} onChange={setField} minLength="6" required /></div><button className="btn btn-primary signup-btn" disabled={submitting}>{submitting ? "Creating account..." : "Create account"}</button></form><p className="signup-footer">Already have an account? <Link to="/" className="link">Login</Link></p></section></div>;
}
