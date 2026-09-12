import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrl } from "../lib/api";
import "../styles/addOfficial.css";

export default function AddOfficial() {
  const navigate = useNavigate();
  const { officialId } = useParams();
  const isEditing = Boolean(officialId);

  const [saving, setSaving] = useState(false);
  const [residents, setResidents] = useState([]);

  const [documentFile, setDocumentFile] = useState(null);

  const [residentSearch, setResidentSearch] = useState("");
    const [showResidents, setShowResidents] = useState(false);

  function handleFileChange(e) {
        setDocumentFile(e.target.files[0]);
  }

  const user = JSON.parse(
    localStorage.getItem("user")
    );

    

  const [form, setForm] = useState({
    resident_id: "",
    position: "",
    category: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchResidents();
    if (isEditing) fetchOfficial();
  }, []);

  async function fetchOfficial() {
    try {
      const response = await fetch(apiUrl(`/api/officials/${officialId}`));
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      const official = data.official;
      setForm({ resident_id: official.resident_id || "", position: official.position || "", category: official.category || "", start_date: official.start_date || "", end_date: official.end_date || "" });
      setResidentSearch([official.first_name, official.middle_name, official.last_name].filter(Boolean).join(" "));
    } catch (error) { alert(error.message || "Unable to load official"); }
  }

  async function fetchResidents() {
    try {
      const res = await fetch(
        apiUrl("/api/residents")
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setResidents(data.residents);

    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);

    try {

        const formData = new FormData();

        Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
        });

        formData.append(
        "barangay_id",
        user.barangayId
        );

        if (documentFile) {
        formData.append(
            "supporting_document",
            documentFile
        );
        }

        const response = await fetch(
        apiUrl(isEditing ? `/api/officials/${officialId}` : "/api/officials"),
        {
            method: isEditing ? "PUT" : "POST",
            body: formData,
        }
        );

        const result = await response.json();

        if (!response.ok) {
        throw new Error(result.message);
        }

        alert(isEditing ? "Official updated successfully." : "Official added successfully.");

        navigate("/barangay/officials");

    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        setSaving(false);
    }
}

    const filteredResidents = residents.filter((resident) => {
        const fullName = `${resident.first_name} ${
            resident.middle_name || ""
        } ${resident.last_name}`.toLowerCase();

        return fullName.includes(
            residentSearch.toLowerCase()
        );
    });

  return (
    <div className="add-official-page">

      <div className="page-header">
        <h1>{isEditing ? "Edit Official" : "Add Official"}</h1>

        <button
          className="back-btn"
          onClick={() =>
            navigate("/barangay/officials")
          }
        >
          ← Back
        </button>
      </div>

      <form
        className="official-form"
        onSubmit={handleSubmit}
      >

        <div className="form-section">

          <h3>Official Information</h3>

          <div className="form-grid">

            <div className="form-group">
              <label>Resident *</label>

              <div className="resident-search-container">

                <input
                    type="text"
                    placeholder="Search resident..."
                    value={residentSearch}
                    onChange={(e) => {
                    setResidentSearch(e.target.value);
                    setShowResidents(true);
                    }}
                    onFocus={() => setShowResidents(true)}
                    required={!form.resident_id}
                />

                {showResidents &&
                    residentSearch &&
                    filteredResidents.length > 0 && (

                    <div className="resident-dropdown">

                        {filteredResidents
                        .slice(0, 10)
                        .map((resident) => (

                            <div
                                key={resident.resident_id}
                                className="resident-option"
                                onClick={() => {

                                    const fullName =
                                    `${resident.first_name} ${
                                        resident.middle_name || ""
                                    } ${resident.last_name}`;

                                    setResidentSearch(fullName);

                                    setForm((prev) => ({
                                    ...prev,
                                    resident_id:
                                        resident.resident_id,
                                    }));

                                    setShowResidents(false);
                                }}
                                >

                                <img
                                    src={
                                    resident.pfp_url ||
                                    "/default-avatar.png"
                                    }
                                    alt="Resident"
                                    className="resident-option-avatar"
                                />

                                <div className="resident-option-info">
                                    <div className="resident-option-name">
                                    {resident.first_name}{" "}
                                    {resident.middle_name}{" "}
                                    {resident.last_name}
                                    </div>

                                    <div className="resident-option-meta">
                                    {resident.purok}
                                    </div>
                                </div>

                                </div>

                        ))}

                    </div>

                )}

                </div>
            </div>

            <div className="form-group">
              <label>Position *</label>

              <select
                required
                name="position"
                value={form.position}
                onChange={handleChange}
              >
                <option value="">
                  Select Position
                </option>

                <option>
                  Punong Barangay
                </option>

                <option>
                  Barangay Kagawad
                </option>

                <option>
                  Barangay Secretary
                </option>

                <option>
                  Barangay Treasurer
                </option>

                <option>
                  SK Chairperson
                </option>

                <option>
                  SK Member
                </option>

                <option>
                  SK Secretary
                </option>

                <option>
                  SK Treasurer
                </option>

                <option>
                  Barangay Tanod
                </option>

                <option>
                  BHW
                </option>

                <option>
                  BNS
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Category *</label>

              <select
                required
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">
                  Select Category
                </option>

                <option>Elected</option>
                <option>Appointed</option>
                <option>Barangay Staff</option>
                <option>Tanod</option>
                <option>BHW</option>
                <option>BNS</option>
              </select>
            </div>

            <div className="form-group">
              <label>Start Date</label>

              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>

              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
              />
            </div>

          </div>

        </div>

        <div className="form-section">

            <h3>Supporting Documents</h3>

            <div className="form-grid">

                <div className="form-group">
                <label>
                    Oath of Office / Supporting Document
                </label>

                <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                />
                </div>

            </div>

        </div>

        <div className="form-actions">

          <button
            type="button"
            className="cancel-btn"
            onClick={() =>
              navigate("/barangay/officials")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="submit-btn"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isEditing ? "Save Changes" : "Save Official"}
          </button>

        </div>

      </form>

    </div>
  );
}
