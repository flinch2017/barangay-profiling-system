import { useState } from "react";
import { useNavigate } from "react-router-dom";


import "../styles/addResident.css";

export default function AddResident() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    suffix: "",
    contact_number: "",
    email: "",
    birthdate: "",
    gender: "",
    civil_status: "",
    street: "",
    purok: "",
    occupation: "",
    salary: "",
    educational_level: "",
    fourps_beneficiary: false,
    senior_citizen: false,
    voter: false,
  });

  const [files, setFiles] = useState({
    pfp: null,
    live_birth: null,
    baptismal: null,
  });

  function handleFileChange(e) {
    const { name, files: fileList } = e.target;

    setFiles((prev) => ({
      ...prev,
      [name]: fileList[0],
    }));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);

    try {
      const formData = new FormData();

      // text fields
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      formData.append("barangay_id", user.barangayId);

      // numbers
      formData.set(
        "salary",
        form.salary ? Number(form.salary) : ""
      );

      // files
      if (files.pfp) formData.append("pfp", files.pfp);
      if (files.live_birth) formData.append("live_birth", files.live_birth);
      if (files.baptismal) formData.append("baptismal", files.baptismal);

      const response = await fetch(
        "http://localhost:5000/api/residents",
        {
          method: "POST",
          body: formData, // IMPORTANT: no JSON headers
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      alert("Resident added successfully!");

      navigate("/barangay/residents");

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="add-resident-page">

      <div className="page-header">
        <h1>Add New Resident</h1>

        <button
          className="back-btn"
          onClick={() => navigate("/barangay/residents")}
        >
          ← Back
        </button>
      </div>

      <form className="resident-form" onSubmit={handleSubmit}>

        <div className="form-section">
          <h3>Personal Information</h3>

          <div className="form-grid">

            <div className="form-group">
              <label>First Name *</label>
              <input
                required
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Middle Name</label>
              <input
                name="middle_name"
                value={form.middle_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                required
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Suffix</label>
              <select
                name="suffix"
                value={form.suffix}
                onChange={handleChange}
              >
                <option value="">None</option>
                <option value="Jr.">Jr.</option>
                <option value="Sr.">Sr.</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
              </select>
            </div>

            <div className="form-group">
              <label>Birthdate *</label>
              <input
                type="date"
                required
                name="birthdate"
                value={form.birthdate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <select
                required
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Nonbinary">Non-binary</option>
              </select>
            </div>

            <div className="form-group">
              <label>Civil Status *</label>
              <select
                required
                name="civil_status"
                value={form.civil_status}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
                <option value="Divorced">Divorced</option>
                <option value="Annulled">Annulled</option>
              </select>
            </div>

          </div>
        </div>

        <div className="form-section">
          <h3>Contact & Address</h3>

          <div className="form-grid">

            <div className="form-group">
              <label>Contact Number</label>
              <input
                name="contact_number"
                value={form.contact_number}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Street *</label>
              <input
                required
                name="street"
                value={form.street}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Purok *</label>
              <input
                required
                name="purok"
                value={form.purok}
                onChange={handleChange}
              />
            </div>

          </div>
        </div>

        <div className="form-section">
          <h3>Employment & Education</h3>

          <div className="form-grid">

            <div className="form-group">
              <label>Occupation</label>
              <input
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Monthly Income Bracket</label>

              <select
                name="salary"
                value={form.salary}
                onChange={handleChange}
              >
                <option value="">Select Income Bracket</option>

                <option value="Below 5000">
                  Below ₱5,000
                </option>

                <option value="5000-9999">
                  ₱5,000 - ₱9,999
                </option>

                <option value="10000-14999">
                  ₱10,000 - ₱14,999
                </option>

                <option value="15000-24999">
                  ₱15,000 - ₱24,999
                </option>

                <option value="25000-49999">
                  ₱25,000 - ₱49,999
                </option>

                <option value="50000+">
                  ₱50,000 and above
                </option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Educational Level</label>

              <select
                name="educational_level"
                value={form.educational_level}
                onChange={handleChange}
              >
                <option value="">Select Educational Level</option>

                <option value="No Formal Education">
                  No Formal Education
                </option>

                <option value="Elementary Undergraduate">
                  Elementary Undergraduate
                </option>

                <option value="Elementary Graduate">
                  Elementary Graduate
                </option>

                <option value="Junior High School Undergraduate">
                  Junior High School Undergraduate
                </option>

                <option value="Junior High School Graduate">
                  Junior High School Graduate
                </option>

                <option value="Senior High School Undergraduate">
                  Senior High School Undergraduate
                </option>

                <option value="Senior High School Graduate">
                  Senior High School Graduate
                </option>

                <option value="Vocational">
                  Vocational
                </option>

                <option value="College Undergraduate">
                  College Undergraduate
                </option>

                <option value="College Graduate">
                  College Graduate
                </option>

                <option value="Master's Degree">
                  Master's Degree
                </option>

                <option value="Doctorate Degree">
                  Doctorate Degree
                </option>
              </select>
            </div>

          </div>
        </div>

        <div className="form-section">
          <h3>Resident Status</h3>

          <div className="checkbox-grid">

            <label className="checkbox-item">
              <input
                type="checkbox"
                name="fourps_beneficiary"
                checked={form.fourps_beneficiary}
                onChange={handleChange}
              />
              4Ps Beneficiary
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                name="senior_citizen"
                checked={form.senior_citizen}
                onChange={handleChange}
              />
              Senior Citizen
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                name="voter"
                checked={form.voter}
                onChange={handleChange}
              />
              Registered Voter
            </label>

          </div>
        </div>

        <div className="form-section">
          <h3>Supporting Documents</h3>

          <div className="form-grid">

            <div className="form-group">
              <label>Profile Photo</label>
              <input
                type="file"
                name="pfp"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="form-group">
              <label>Live Birth Certificate</label>
              <input
                type="file"
                name="live_birth"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
            </div>

            <div className="form-group">
              <label>Baptismal Certificate</label>
              <input
                type="file"
                name="baptismal"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
            </div>

          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/barangay/residents")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="submit-btn"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Resident"}
          </button>
        </div>

      </form>

    </div>
  );
}