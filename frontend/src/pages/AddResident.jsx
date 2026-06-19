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

        <div className="grid">

          <input required name="first_name" placeholder="First Name" onChange={handleChange} />
          <input name="middle_name" placeholder="Middle Name" onChange={handleChange} />
          <input required name="last_name" placeholder="Last Name" onChange={handleChange} />
          <input name="suffix" placeholder="Suffix" onChange={handleChange} />

          <input name="contact_number" placeholder="Contact Number" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />

          <input required type="date" name="birthdate" onChange={handleChange} />

          <select required name="gender" onChange={handleChange}>
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <select required name="civil_status" onChange={handleChange}>
            <option value="">Civil Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
          </select>

          <input required name="street" placeholder="Street" onChange={handleChange} />
          <input required name="purok" placeholder="Purok" onChange={handleChange} />

          <input required name="occupation" placeholder="Occupation" onChange={handleChange} />
          <input required name="salary" placeholder="Salary" type="number" onChange={handleChange} />

          <input name="educational_level" placeholder="Educational Level" onChange={handleChange} />

        </div>

        <div className="file-upload-section">

          <label>
            Profile Photo
            <input type="file" name="pfp" accept="image/*" onChange={handleFileChange} />
          </label>

          <label>
            Live Birth Certificate
            <input type="file" name="live_birth" accept="image/*,.pdf" onChange={handleFileChange} />
          </label>

          <label>
            Baptismal Certificate
            <input type="file" name="baptismal" accept="image/*,.pdf" onChange={handleFileChange} />
          </label>

        </div>

        <div className="checkboxes">

          <label>
            <input
              type="checkbox"
              name="fourps_beneficiary"
              onChange={handleChange}
            />
            4Ps Beneficiary
          </label>

          <label>
            <input
              type="checkbox"
              name="senior_citizen"
              onChange={handleChange}
            />
            Senior Citizen
          </label>

          <label>
            <input
              type="checkbox"
              name="voter"
              onChange={handleChange}
            />
            Voter
          </label>

        </div>

        <button
            type="submit"
            className="submit-btn"
            disabled={saving}
            >
            {saving ? "Saving..." : "Save Resident"}
        </button>

      </form>

    </div>
  );
}