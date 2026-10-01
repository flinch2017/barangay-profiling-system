import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../lib/api";
import "../styles/residentPortal.css";

const displayValue = (value) => value === null || value === undefined || value === "" ? "Not recorded" : value;

function Details({ fields }) {
  return (
    <dl>
      {fields.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{displayValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ResidentPortal() {
  const [resident, setResident] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [latestClaim, setLatestClaim] = useState(null);
  const [latestRegistration, setLatestRegistration] = useState(null);
  const [pendingProfileUpdate, setPendingProfileUpdate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPortal() {
      try {
        const response = await fetch(apiUrl("/api/resident-claims/me"), {
          headers: { Authorization: `******"token")}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setResident(result.resident);
        setLatestClaim(result.latestClaim);
        setLatestRegistration(result.latestRegistration);
        setPendingProfileUpdate(result.pendingProfileUpdate);
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
  if (!resident) {
    const registrationPending = latestRegistration?.status === "pending";
    return (
      <div className="resident-portal">
        <section className="portal-welcome">
          <div>
            <p className="portal-kicker">RESIDENT PORTAL</p>
            <h1>Welcome to your portal</h1>
            <p>{registrationPending ? "Your resident registration is being reviewed." : latestClaim?.status === "pending" ? "Your profile claim is being reviewed." : "Claim an existing profile or register if you do not have one yet."}</p>
          </div>
        </section>
        <section className="portal-card">
          <h2>Resident profile</h2>
          <p>{registrationPending ? "Your registration is pending barangay approval. You will be notified when it is reviewed." : "Choose the option that matches your situation."}</p>
          <div className="portal-action-row">
            {!registrationPending && (!latestClaim || latestClaim.status === "rejected") && <Link className="portal-primary-action" to="/resident/claim-profile">Claim a resident profile</Link>}
            {!registrationPending && <Link className="portal-secondary-action" to="/resident/register">Register as a resident</Link>}
            {(registrationPending || latestClaim?.status === "pending") && <Link className="portal-primary-action" to="/resident/notifications">View notifications</Link>}
          </div>
        </section>
      </div>
    );
  }

  const fullName = [resident.first_name, resident.middle_name, resident.last_name, resident.suffix].filter(Boolean).join(" ");
  const address = [resident.street, resident.purok && `Purok ${resident.purok}`, resident.barangay_name, resident.municipality, resident.province, resident.country, resident.zip_code].filter(Boolean).join(", ");

  return (
    <div className="resident-portal">
      <section className="portal-welcome">
        <div>
          <p className="portal-kicker">RESIDENT PORTAL</p>
          <h1>Welcome, {resident.first_name}</h1>
          <p>View the information connected to your verified barangay profile.</p>
        </div>
        {resident.pfp_url
          ? <img className="portal-avatar" src={resident.pfp_url} alt={`${fullName} profile`} />
          : <span className="portal-avatar portal-avatar-placeholder">{resident.first_name?.charAt(0)}</span>}
      </section>

      {pendingProfileUpdate ? (
        <section className="portal-pending-update" role="status">
          <div>
            <strong>Profile changes awaiting approval</strong>
            <p>Your current profile stays unchanged until the barangay administrator reviews your request.</p>
          </div>
          <Link to="/resident/notifications">View updates</Link>
        </section>
      ) : (
        <div className="portal-edit-action">
          <Link className="portal-primary-action" to="/resident/profile-update">Request profile changes</Link>
          <span>Changes are applied only after barangay approval.</span>
        </div>
      )}

      <div className="portal-grid">
        <section className="portal-card">
          <h2>Personal information</h2>
          <Details fields={[
            ["Full name", fullName],
            ["Birthdate", resident.birthdate],
            ["Sex", resident.gender],
            ["Civil status", resident.civil_status],
            ["Resident record status", resident.resident_status],
          ]} />
        </section>
        <section className="portal-card">
          <h2>Contact and address</h2>
          <Details fields={[
            ["Contact number", resident.contact_number],
            ["Email", resident.email],
            ["Address", address],
            ["Street", resident.street],
            ["Purok", resident.purok],
            ["Barangay", resident.barangay_name],
            ["Municipality", resident.municipality],
            ["Province", resident.province],
            ["Country", resident.country],
            ["ZIP code", resident.zip_code],
          ]} />
        </section>
        <section className="portal-card">
          <h2>Employment and education</h2>
          <Details fields={[
            ["Occupation", resident.occupation],
            ["Monthly income bracket", resident.salary],
            ["Educational level", resident.educational_level],
            ["School", resident.school_name],
            ["Currently enrolled", resident.currently_enrolled ? "Yes" : "No"],
            ["Year level", resident.year_level],
            ["Course / degree", resident.course],
            ["Graduation year", resident.graduation_year],
          ]} />
        </section>
        <section className="portal-card">
          <h2>Resident information</h2>
          <Details fields={[
            ["Registered voter", resident.voter ? "Yes" : "No"],
            ["Senior citizen", resident.senior_citizen ? "Yes" : "No"],
            ["4Ps beneficiary", resident.fourps_beneficiary ? "Yes" : "No"],
          ]} />
        </section>
      </div>

      <section className="portal-card">
        <h2>Profile photo and documents</h2>
        <div className="portal-documents">
          {resident.pfp_url && <a href={resident.pfp_url} target="_blank" rel="noreferrer">View profile photo</a>}
          {resident.live_birth_url ? <a href={resident.live_birth_url} target="_blank" rel="noreferrer">View live birth certificate</a> : <span>Live birth certificate not available</span>}
          {resident.baptismal_url ? <a href={resident.baptismal_url} target="_blank" rel="noreferrer">View baptismal certificate</a> : <span>Baptismal certificate not available</span>}
        </div>
      </section>
    </div>
  );
}
