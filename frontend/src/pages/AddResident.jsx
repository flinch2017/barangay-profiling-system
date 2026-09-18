import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { apiUrl } from "../lib/api";

import "../styles/addResident.css";

const occupations = ["Accountant", "Architect", "Artist", "Barangay Worker", "Business Owner", "Call Center Agent", "Carpenter", "Cashier", "Chef / Cook", "Construction Worker", "Dentist", "Driver", "Electrician", "Engineer", "Farmer", "Fisherfolk", "Government Employee", "Health Worker", "Homemaker", "IT Professional", "Laborer", "Lawyer", "Manager", "Mechanic", "Medical Technologist", "Military / Police", "Nurse", "Office Staff", "Overseas Filipino Worker", "Pharmacist", "Photographer", "Plumber", "Retired", "Salesperson", "Seafarer", "Security Guard", "Self-employed", "Student", "Teacher", "Technician", "Unemployed", "Vendor", "Virtual Assistant", "Other"];

export default function AddResident() {
  const navigate = useNavigate();
  const location = useLocation();
  const { residentId } = useParams();
  const isEditing = Boolean(residentId);
  const isResidentRegistration = location.pathname === "/resident/register";

  const user = JSON.parse(localStorage.getItem("user"));

  const [saving, setSaving] = useState(false);
  const [loadingResident, setLoadingResident] = useState(isEditing);
  const [loadError, setLoadError] = useState("");
  const [barangays, setBarangays] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [noPurok, setNoPurok] = useState(false);
  const [noContactNumber, setNoContactNumber] = useState(false);
  const [noMiddleName, setNoMiddleName] = useState(false);

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
    educational_level: "",

    school_name: "",
    year_level: "",
    course: "",
    currently_enrolled: false,
    graduation_year: "",
    fourps_beneficiary: false,
    senior_citizen: false,
    voter: false,
  });

  const [files, setFiles] = useState({
    pfp: null,
    live_birth: null,
    baptismal: null,
  });

  useEffect(() => {
    if (!isEditing) return;

    async function loadResident() {
      try {
        const response = await fetch(apiUrl(`/api/residents/${residentId}`));
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Unable to load resident");

        setForm((currentForm) => {
          const nextForm = { ...currentForm };
          Object.keys(currentForm).forEach((key) => {
            nextForm[key] = result.resident[key] ?? currentForm[key];
          });
          return nextForm;
        });
      } catch (error) {
        setLoadError(error.message || "Unable to load resident");
      } finally {
        setLoadingResident(false);
      }
    }

    loadResident();
  }, [isEditing, residentId]);

  useEffect(() => {
    if (!isResidentRegistration) return;
    fetch(apiUrl("/api/barangays/public")).then((response) => response.json()).then((data) => setBarangays(data.barangays || [])).catch(() => setLoadError("Unable to load barangays"));
  }, [isResidentRegistration]);

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
        formData.append(key, (key === "purok" && noPurok) || (key === "contact_number" && noContactNumber) || (key === "middle_name" && noMiddleName) ? "" : form[key]);
      });

      if (isResidentRegistration) {
        formData.append("barangay_id", selectedBarangay);
        formData.append("purok_not_applicable", noPurok);
      } else if (!isEditing) {
        formData.append("barangay_id", user.barangayId);
      }

      

      // files
      if (files.pfp) formData.append("pfp", files.pfp);
      if (files.live_birth) formData.append("live_birth", files.live_birth);
      if (files.baptismal) formData.append("baptismal", files.baptismal);

      const response = await fetch(
        apiUrl(isResidentRegistration ? "/api/resident-claims/register" : isEditing ? `/api/residents/${residentId}` : "/api/residents"),
        {
          method: isEditing ? "PUT" : "POST",
          headers: isResidentRegistration ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : undefined,
          body: formData, // IMPORTANT: no JSON headers
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      alert(isResidentRegistration ? "Resident registration completed!" : isEditing ? "Resident updated successfully!" : "Resident added successfully!");
      navigate(isResidentRegistration ? "/resident/portal" : "/barangay/residents");

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loadingResident) return <p>Loading resident...</p>;

  if (loadError) {
    return (
      <div className="add-resident-page">
        <div className="page-header">
          <h1>Unable to load resident</h1>
          <button className="back-btn" onClick={() => navigate("/barangay/residents")}>← Back</button>
        </div>
        <p>{loadError}</p>
      </div>
    );
  }

  return (
    <div className="add-resident-page">

      <div className="page-header">
        <h1>{isResidentRegistration ? "Register as a Resident" : isEditing ? "Edit Resident" : "Add New Resident"}</h1>

        <button
          className="back-btn"
          onClick={() => navigate(isResidentRegistration ? "/resident/portal" : "/barangay/residents")}
        >
          ← Back
        </button>
      </div>

      <form className="resident-form" onSubmit={handleSubmit}>

        {isResidentRegistration && <div className="form-section"><h3>Barangay Registration</h3><div className="form-grid"><div className="form-group full-width"><label>Barangay *</label><select required value={selectedBarangay} onChange={(event) => setSelectedBarangay(event.target.value)}><option value="">Select your barangay</option>{barangays.map((barangay) => <option key={barangay.barangay_id} value={barangay.barangay_id}>{[barangay.barangay_name, barangay.municipality, barangay.province].filter(Boolean).join(", ")}</option>)}</select></div></div></div>}

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
                disabled={noMiddleName}
              />
              <label className="checkbox-item"><input type="checkbox" checked={noMiddleName} onChange={(event) => setNoMiddleName(event.target.checked)} /> Not applicable</label>
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
              <label>Sex *</label>
              <select
                required
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
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
                disabled={noContactNumber}
              />
              <label className="checkbox-item"><input type="checkbox" checked={noContactNumber} onChange={(event) => setNoContactNumber(event.target.checked)} /> Not applicable</label>
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
              <label>Purok {noPurok ? "" : "*"}</label>
              <input
                required={!noPurok}
                name="purok"
                value={form.purok}
                onChange={handleChange}
                disabled={noPurok}
              />
              <label className="checkbox-item"><input type="checkbox" checked={noPurok} onChange={(event) => setNoPurok(event.target.checked)} /> Not applicable</label>
            </div>

          </div>
        </div>

        <div className="form-section">
          <h3>Employment & Education</h3>

          <div className="form-grid">

            <div className="form-group">
              <label>Occupation</label>
              <select
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
              >
                <option value="">Select occupation</option>
                {occupations.map((occupation) => <option key={occupation} value={occupation}>{occupation}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Monthly Income Bracket</label>

              <select
                name="salary"
                value={form.salary}
                onChange={handleChange}
              >
                <option value="">Select Income Bracket</option>

                <option value="Below ₱5000">
                  Below ₱5,000
                </option>

                <option value="₱5,000-₱9,999">
                  ₱5,000 - ₱9,999
                </option>

                <option value="₱10,000-₱14,999">
                  ₱10,000 - ₱14,999
                </option>

                <option value="₱15,000-₱24,999">
                  ₱15,000 - ₱24,999
                </option>

                <option value="₱25,000-₱49,999">
                  ₱25,000 - ₱49,999
                </option>

                <option value="₱50,000+">
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

              {form.educational_level &&
                form.educational_level !== "No Formal Education" && (

                  <>
                    <div className="form-group">
                      <label>School Name</label>

                      <input
                        name="school_name"
                        value={form.school_name}
                        onChange={handleChange}
                        placeholder="Enter school name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Currently Enrolled</label>

                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          name="currently_enrolled"
                          checked={form.currently_enrolled}
                          onChange={handleChange}
                        />
                        Yes
                      </label>
                    </div>
                  </>
              )}

              {[
                "Elementary Undergraduate",
                "Junior High School Undergraduate",
                "Senior High School Undergraduate",
              ].includes(form.educational_level) && (

                <div className="form-group">
                  <label>Current Year Level</label>

                  <input
                    name="year_level"
                    value={form.year_level}
                    onChange={handleChange}
                    placeholder="Example: Grade 4, Grade 8, Grade 11"
                  />
                </div>
              )}

              {form.educational_level === "Vocational" && (
                <>
                  <div className="form-group">
                    <label>Course / Training Program</label>

                    <input
                      name="course"
                      value={form.course}
                      onChange={handleChange}
                      placeholder="Example: Automotive NC II"
                    />
                  </div>

                  <div className="form-group">
                    <label>Year Completed</label>

                    <input
                      type="number"
                      name="graduation_year"
                      value={form.graduation_year}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {form.educational_level === "College Undergraduate" && (
                <>
                  <div className="form-group">
                    <label>Course</label>

                    <input
                      name="course"
                      value={form.course}
                      onChange={handleChange}
                      placeholder="BS Information Technology"
                    />
                  </div>

                  <div className="form-group">
                    <label>Year Level</label>

                    <select
                      name="year_level"
                      value={form.year_level}
                      onChange={handleChange}
                    >
                      <option value="">Select Year</option>
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                      <option>5th Year</option>
                    </select>
                  </div>
                </>
              )}

              {[
                "College Graduate",
                "Master's Degree",
                "Doctorate Degree",
              ].includes(form.educational_level) && (
                <>
                  <div className="form-group">
                    <label>Course / Degree</label>

                    <input
                      name="course"
                      value={form.course}
                      onChange={handleChange}
                      placeholder="Example: BSIT"
                    />
                  </div>

                  <div className="form-group">
                    <label>Year Graduated</label>

                    <input
                      type="number"
                      name="graduation_year"
                      value={form.graduation_year}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
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
            onClick={() => navigate(isResidentRegistration ? "/resident/portal" : "/barangay/residents")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="submit-btn"
            disabled={saving}
          >
            {saving ? "Saving..." : isResidentRegistration ? "Register as Resident" : isEditing ? "Save Changes" : "Save Resident"}
          </button>
        </div>

      </form>

    </div>
  );
}
