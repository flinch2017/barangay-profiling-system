import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupBarangayAdmin } from "../services/authService";
import { apiUrl } from "../lib/api";
import "../styles/global.css";
import "../styles/signup.css";

export default function BarangaySignup() {
  const navigate = useNavigate();
  const [signupType, setSignupType] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [barangayId, setBarangayId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimStep, setClaimStep] = useState("account");
  const [claimAccount, setClaimAccount] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [claimForm, setClaimForm] = useState({ firstName: "", middleName: "", noMiddleName: false, lastName: "", suffix: "", birthdate: "", province: "", municipality: "", barangay: "", street: "", purok: "", noPurok: false, live_birth: null, baptismal: null });
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [claimMessage, setClaimMessage] = useState("");

  const selectSignupType = (type) => {
    setSignupType(type);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await signupBarangayAdmin(username, email, password, barangayId, "barangay_admin");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/barangay/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create Barangay Profiling System account");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!signupType) {
    return (
      <div className="signup-wrapper">
        <section className="signup-choice-card card" aria-labelledby="signup-title">
          <p className="signup-eyebrow">GET STARTED</p>
          <h1 id="signup-title" className="signup-title">What would you like to do?</h1>
          <p className="signup-subtitle">Choose the option that best describes your request.</p>
          <div className="signup-options">
            <button type="button" className="signup-option" onClick={() => selectSignupType("claim")}>
              <span className="signup-option-icon" aria-hidden="true">⌁</span>
              <span className="signup-option-content"><strong>Claim a resident profile</strong><span>Request access to a resident profile that already exists in the system.</span></span>
              <span className="signup-option-arrow" aria-hidden="true">→</span>
            </button>
            <button type="button" className="signup-option" onClick={() => selectSignupType("account")}>
              <span className="signup-option-icon" aria-hidden="true">+</span>
              <span className="signup-option-content"><strong>Create a BPS account</strong><span>Register a new Barangay Profiling System administrator account.</span></span>
              <span className="signup-option-arrow" aria-hidden="true">→</span>
            </button>
          </div>
          <p className="signup-footer">Already have an account? <Link to="/" className="link">Login</Link></p>
        </section>
      </div>
    );
  }

  if (signupType === "claim") {
    const updateClaimField = (event) => {
      const { name, value, type, checked, files } = event.target;
      setClaimForm((form) => ({ ...form, [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value }));
    };
    const continueToClaim = (event) => {
      event.preventDefault();
      if (claimAccount.password !== claimAccount.confirmPassword) return setClaimMessage("Passwords do not match.");
      if (claimAccount.password.length < 6) return setClaimMessage("Password must be at least 6 characters.");
      setClaimMessage(""); setClaimStep("details");
    };
    const findMatches = async (event) => {
      event.preventDefault(); setClaimMessage(""); setIsSubmitting(true);
      try {
        const response = await fetch(apiUrl("/api/resident-claims/matches"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(claimForm) });
        const result = await response.json(); if (!response.ok) throw new Error(result.message);
        setMatches(result.matches); setClaimStep("matches");
      } catch (error) { setClaimMessage(error.message || "Unable to search profiles."); } finally { setIsSubmitting(false); }
    };
    const sendClaim = async () => {
      if (!selectedMatch) return; setIsSubmitting(true); setClaimMessage("");
      try {
        const request = new FormData();
        Object.entries({ ...claimAccount, ...claimForm, residentId: selectedMatch.residentId, middleName: claimForm.noMiddleName ? "" : claimForm.middleName, purok: claimForm.noPurok ? "" : claimForm.purok }).forEach(([key, value]) => { if (value !== null && typeof value !== "boolean" && key !== "confirmPassword") request.append(key, value); });
        const response = await fetch(apiUrl("/api/resident-claims"), { method: "POST", body: request }); const result = await response.json(); if (!response.ok) throw new Error(result.message);
        setClaimStep("complete"); setClaimMessage(result.message);
      } catch (error) { setClaimMessage(error.message || "Unable to submit claim."); } finally { setIsSubmitting(false); }
    };
    return (
      <div className="signup-wrapper">
        <section className="signup-card card" aria-labelledby="claim-title">
          <button type="button" className="back-to-options" onClick={() => selectSignupType("")}>← Back to options</button>
          <p className="signup-eyebrow">RESIDENT PROFILE</p>
          <h1 id="claim-title" className="signup-title">Claim a resident profile</h1>
          <p className="signup-subtitle">Set up your login, then verify the resident profile you want to claim.</p>
          {claimMessage && <div className="alert-error">{claimMessage}</div>}
          {claimStep === "account" && <form className="signup-form" onSubmit={continueToClaim}>
            <div className="form-group"><label>Username</label><input className="input" required value={claimAccount.username} onChange={(e) => setClaimAccount({ ...claimAccount, username: e.target.value })} /></div>
            <div className="form-group"><label>Email</label><input type="email" className="input" required value={claimAccount.email} onChange={(e) => setClaimAccount({ ...claimAccount, email: e.target.value })} /></div>
            <div className="form-group"><label>Password</label><input type="password" className="input" minLength="6" required value={claimAccount.password} onChange={(e) => setClaimAccount({ ...claimAccount, password: e.target.value })} /></div>
            <div className="form-group"><label>Confirm password</label><input type="password" className="input" minLength="6" required value={claimAccount.confirmPassword} onChange={(e) => setClaimAccount({ ...claimAccount, confirmPassword: e.target.value })} /></div>
            <button className="btn btn-primary signup-btn">Continue</button>
          </form>}
          {claimStep === "details" && <form className="signup-form" onSubmit={findMatches}>
            <div className="form-group"><label>First name</label><input name="firstName" className="input" required value={claimForm.firstName} onChange={updateClaimField} /></div>
            <div className="form-group"><label>Middle name</label><input name="middleName" className="input" disabled={claimForm.noMiddleName} value={claimForm.middleName} onChange={updateClaimField} /><label><input name="noMiddleName" type="checkbox" checked={claimForm.noMiddleName} onChange={updateClaimField} /> Not applicable</label></div>
            <div className="form-group"><label>Last name</label><input name="lastName" className="input" required value={claimForm.lastName} onChange={updateClaimField} /></div>
            <div className="form-group"><label>Suffix</label><select name="suffix" className="input" value={claimForm.suffix} onChange={updateClaimField}><option value="">None</option><option>Jr.</option><option>Sr.</option><option>II</option><option>III</option></select></div>
            <div className="form-group"><label>Birthdate</label><input name="birthdate" type="date" className="input" required value={claimForm.birthdate} onChange={updateClaimField} /></div>
            <div className="form-group"><label>Province</label><input name="province" className="input" required value={claimForm.province} onChange={updateClaimField} /></div>
            <div className="form-group"><label>Municipality / City</label><input name="municipality" className="input" required value={claimForm.municipality} onChange={updateClaimField} /></div>
            <div className="form-group"><label>Barangay</label><input name="barangay" className="input" required value={claimForm.barangay} onChange={updateClaimField} /></div>
            <div className="form-group"><label>Street</label><input name="street" className="input" required value={claimForm.street} onChange={updateClaimField} /></div>
            <div className="form-group"><label>Purok</label><input name="purok" className="input" disabled={claimForm.noPurok} value={claimForm.purok} onChange={updateClaimField} /><label><input name="noPurok" type="checkbox" checked={claimForm.noPurok} onChange={updateClaimField} /> Not applicable</label></div>
            <div className="form-group"><label>Live birth certificate</label><input name="live_birth" type="file" accept="image/*,.pdf" required onChange={updateClaimField} /></div>
            <div className="form-group"><label>Baptismal certificate</label><input name="baptismal" type="file" accept="image/*,.pdf" required onChange={updateClaimField} /></div>
            <button className="btn btn-primary signup-btn" disabled={isSubmitting}>{isSubmitting ? "Searching..." : "Find my profile"}</button>
          </form>}
          {claimStep === "matches" && <div className="signup-form"><p className="signup-subtitle">Choose the profile that belongs to you. Your barangay administrator will review the claim.</p>{matches.length ? matches.map((match) => <button type="button" className={`signup-option ${selectedMatch?.residentId === match.residentId ? "selected" : ""}`} key={match.residentId} onClick={() => setSelectedMatch(match)}><span className="signup-option-content"><strong>{match.name}</strong><span>{match.birthdate} · {match.barangay}, {match.municipality}</span></span></button>) : <div className="claim-notice">No matching resident profile was found. Please contact your barangay office.</div>} {matches.length > 0 && <button type="button" className="btn btn-primary signup-btn" disabled={!selectedMatch || isSubmitting} onClick={sendClaim}>{isSubmitting ? "Sending..." : "Claim this profile"}</button>}</div>}
          {claimStep === "complete" && <div className="claim-notice"><strong>Claim request submitted</strong><span>{claimMessage} You can sign in using the account details you created after approval.</span></div>}
        </section>
      </div>
    );
  }

  return (
    <div className="signup-wrapper">
      <section className="signup-card card" aria-labelledby="account-title">
        <button type="button" className="back-to-options" onClick={() => selectSignupType("")}>← Back to options</button>
        <p className="signup-eyebrow">BPS ACCOUNT</p>
        <h1 id="account-title" className="signup-title">Create a BPS account</h1>
        <p className="signup-subtitle">Create an administrator account for a barangay unit.</p>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group"><label htmlFor="username">Username</label><input id="username" className="input" value={username} onChange={(event) => setUsername(event.target.value)} required /></div>
          <div className="form-group"><label htmlFor="email">Email</label><input id="email" type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div className="form-group"><label htmlFor="barangay-id">Barangay ID</label><input id="barangay-id" className="input" value={barangayId} onChange={(event) => setBarangayId(event.target.value)} required /></div>
          <div className="form-group"><label>Role</label><input className="input" value="Barangay Admin" disabled /></div>
          <div className="form-group"><label htmlFor="password">Password</label><input id="password" type="password" className="input" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required /></div>
          <div className="form-group"><label htmlFor="confirm-password">Confirm password</label><input id="confirm-password" type="password" className="input" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={6} required /></div>
          <button className="btn btn-primary signup-btn" disabled={isSubmitting}>{isSubmitting ? "Creating Account..." : "Create Account"}</button>
        </form>
        <p className="signup-footer">Already have an account? <Link to="/" className="link">Login</Link></p>
      </section>
    </div>
  );
}
