import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
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

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${resident.first_name} ${resident.last_name}?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/residents/${residentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      alert("Resident deleted successfully.");

      navigate("/barangay/residents");

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div className="resident-profile">

      {/* HEADER */}
      <div className="profile-header">

        <div className="header-left">
          <button
            className="back-btn"
            onClick={() => navigate("/barangay/residents")}
          >
            ← Back
          </button>

          <h1>
            {resident.first_name} {resident.last_name}
          </h1>
        </div>

        <div className="header-actions">

          <button
            className="icon-btn edit-btn"
            onClick={() =>
              navigate(
                `/barangay/residents/${resident.resident_id}/edit`
              )
            }
            title="Edit Resident"
            hint="Edit Resident"
          >
            <FiEdit2 />
          </button>

          <button
            className="icon-btn delete-btn"
            onClick={handleDelete}
            title="Delete Resident"
            hint="Delete Resident"
          >
            <FiTrash2 />
          </button>

        </div>

      </div>

      {/* MAIN GRID */}
      <div className="profile-grid">

        <div className="main-column">

        {/* INFO CARD */}
        <div className="profile-card">
          <h2>Personal Information</h2>

          <div className="info-grid">

            <p><b>First Name:</b> {resident.first_name}</p>

            <p><b>Last Name:</b> {resident.last_name}</p>

            {resident.middle_name && (
              <p><b>Middle Name:</b> {resident.middle_name}</p>
            )}

            {resident.suffix && (
              <p><b>Suffix:</b> {resident.suffix}</p>
            )}

            {resident.gender && (
              <p><b>Gender:</b> {resident.gender}</p>
            )}

            {resident.birthdate && (
              <p><b>Birthdate:</b> {resident.birthdate}</p>
            )}

            {resident.civil_status && (
              <p><b>Civil Status:</b> {resident.civil_status}</p>
            )}

            {resident.contact_number && (
              <p><b>Contact:</b> {resident.contact_number}</p>
            )}

            {resident.email && (
              <p><b>Email:</b> {resident.email}</p>
            )}

            {(resident.street ||
              resident.purok ||
              resident.barangay_name) && (
              <p>
                <b>Address:</b>{" "}
                {[
                  resident.street,
                  resident.purok && `Purok ${resident.purok}`,
                  resident.barangay_name,
                  resident.municipality,
                  resident.province,
                  resident.country,
                  resident.zip_code,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}

            {resident.occupation && (
              <p><b>Occupation:</b> {resident.occupation}</p>
            )}

            {resident.salary && (
              <p><b>Salary:</b> {resident.salary}</p>
            )}

            {resident.resident_status && (
              <p><b>Status:</b> {resident.resident_status}</p>
            )}

            {resident.fourps_beneficiary && (
              <p><b>4Ps Beneficiary:</b> Yes</p>
            )}

            {resident.senior_citizen && (
              <p><b>Senior Citizen:</b> Yes</p>
            )}

            {resident.voter && (
              <p><b>Registered Voter:</b> Yes</p>
            )}

          </div>
        </div>

        <div className="profile-card">
          <h2>Education Information</h2>

          <div className="info-grid">

            <p>
              <b>Highest Educational Attainment:</b>
              {" "}
              {resident.educational_level}
            </p>

            {resident.school_name && (
              <p>
                <b>Name of School:</b>
                {" "}
                {resident.school_name}
              </p>
            )}

            {resident.course && (
              <p>
                <b>Program/Course:</b>
                {" "}
                {resident.course}
              </p>
            )}

            {resident.year_level && (
              <p>
                <b>Year Level:</b>
                {" "}
                {resident.year_level}
              </p>
            )}

            {resident.graduation_year && (
              <p>
                <b>Graduation Year:</b>
                {" "}
                {resident.graduation_year}
              </p>
            )}

            <p>
              <b>Enrollment Status:</b>
              {" "}
              {resident.currently_enrolled
                ? "Currently Enrolled"
                : "Not Enrolled"}
            </p>

          </div>
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