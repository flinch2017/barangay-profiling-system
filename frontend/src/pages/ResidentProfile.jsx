import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/residentProfile.css";

export default function ResidentProfile() {
  const { residentId } = useParams();
  const navigate = useNavigate();

  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResident();
  }, []);

  async function fetchResident() {
    try {
      const res = await fetch(
        `http://localhost:5000/api/residents/${residentId}`
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setResident(data.resident);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading profile...</p>;
  if (!resident) return <p>Resident not found.</p>;

  return (
    <div className="resident-profile">

      {/* HEADER */}
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate("/barangay/residents")}>
          ← Back
        </button>

        <h1>
          {resident.first_name} {resident.last_name}
        </h1>
      </div>

      {/* MAIN GRID */}
      <div className="profile-grid">

        {/* INFO CARD */}
        <div className="profile-card">
          <h2>Personal Information</h2>

          <div className="info-grid">
            <p><b>Gender:</b> {resident.gender}</p>
            <p><b>Birthdate:</b> {resident.birthdate}</p>
            <p><b>Civil Status:</b> {resident.civil_status}</p>
            <p><b>Contact:</b> {resident.contact_number}</p>
            <p><b>Email:</b> {resident.email}</p>
            <p><b>Address:</b> {resident.street}, {resident.purok}</p>
            <p><b>Occupation:</b> {resident.occupation}</p>
            <p><b>Salary:</b> ₱{resident.salary}</p>
            <p><b>Education:</b> {resident.educational_level}</p>
            <p><b>Status:</b> {resident.resident_status}</p>

            <p><b>4Ps:</b> {resident.fourps_beneficiary ? "Yes" : "No"}</p>
            <p><b>Senior:</b> {resident.senior_citizen ? "Yes" : "No"}</p>
            <p><b>Voter:</b> {resident.voter ? "Yes" : "No"}</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="side-column">

          {/* PROFILE PHOTO */}
          <div className="profile-card">
            <h2>Profile Photo</h2>

            {resident.pfp_url ? (
              <img
                src={resident.pfp_url}
                alt="Profile"
                className="profile-pfp"
              />
            ) : (
              <p>No profile photo uploaded</p>
            )}
          </div>

          {/* DOCUMENTS */}
          <div className="profile-card">
            <h2>Documents</h2>

            <div className="docs-grid">

              <div className="doc-item">
                <b>Live Birth</b>
                {resident.live_birth_url ? (
                  <a href={resident.live_birth_url} target="_blank">
                    View
                  </a>
                ) : (
                  <p>None</p>
                )}
              </div>

              <div className="doc-item">
                <b>Baptismal</b>
                {resident.baptismal_url ? (
                  <a href={resident.baptismal_url} target="_blank">
                    View
                  </a>
                ) : (
                  <p>None</p>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}