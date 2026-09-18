import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ResidentSummary from "./ResidentSummary";
import CertificatePreview from "./CertificatePreview";
import { apiUrl } from "../../lib/api";

function formatTitle(value) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatFullName(resident) {
  return [
    resident.first_name,
    resident.middle_name,
    resident.last_name,
    resident.suffix,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatOfficialName(official) {
  const middleInitial = official.middle_name
    ? `${official.middle_name.charAt(0)}.`
    : "";
  const prefix =
    official.category === "Elected" ? "HON." : "";

  return [
    prefix,
    official.first_name,
    middleInitial,
    official.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
}

function isCurrentOfficial(official) {
  const today = new Date();
  const startDate = official.start_date
    ? new Date(official.start_date)
    : null;
  const endDate = official.end_date
    ? new Date(official.end_date)
    : null;

  return (
    (!startDate || startDate <= today) &&
    (!endDate || endDate >= today)
  );
}

export default function CertificateLayout({
  title,
  FieldsComponent,
}) {
  const { residentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get("record");
  const isReadOnly = searchParams.get("mode") === "view";
  const [savedRecord, setSavedRecord] = useState(null);
  const [recordLoading, setRecordLoading] = useState(Boolean(recordId));
  const savedResident = savedRecord?.residentSnapshot || (savedRecord
    ? { first_name: savedRecord.residentName || "Former resident" }
    : null);

  const [resident, setResident] = useState(null);
  const [punongBarangay, setPunongBarangay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentRecordId, setCurrentRecordId] = useState(recordId);
  const [form, setForm] = useState({
    purpose: "",
    issuedBy: "",
    issuerPosition: "Punong Barangay",
    issuedDate: new Date().toISOString().slice(0, 10),
    remarks: "",
  });

  useEffect(() => {
    if (!recordId) { setRecordLoading(false); return; }
    async function loadRecord() {
      try {
        const response = await fetch(apiUrl(`/api/certificates/${recordId}`), { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load certificate record.");
        setSavedRecord(data.certificate);
        setForm((current) => ({ ...current, ...(data.certificate.form || {}) }));
      } catch (err) { setError(err.message); } finally { setRecordLoading(false); }
    }
    loadRecord();
  }, [recordId]);

  useEffect(() => {
    async function fetchResident() {
      if (recordLoading) return;
      try {
        setLoading(true);
        setError("");

        const [residentRes, officialsRes] = await Promise.all([
          fetch(
            apiUrl(`/api/residents/${residentId}`)
          ),
          fetch(apiUrl("/api/officials")),
        ]);

        const residentData = await residentRes.json();
        const officialsData = await officialsRes.json();

        if (!residentRes.ok && !savedResident) {
          throw new Error(residentData.message || "Unable to load resident.");
        }

        if (!officialsRes.ok && !savedRecord) {
          throw new Error(
            officialsData.message || "Unable to load officials."
          );
        }

        const currentPunongBarangay = (
          officialsData.officials || []
        )
          .filter(
            (official) =>
              official.position === "Punong Barangay" &&
              isCurrentOfficial(official)
          )
          .sort(
            (a, b) =>
              new Date(b.start_date || 0) -
              new Date(a.start_date || 0)
          )[0];

        setResident(residentRes.ok ? residentData.resident : savedResident);
        setPunongBarangay(savedRecord?.punongBarangay || currentPunongBarangay || null);

        if (!savedRecord?.form?.issuedBy && currentPunongBarangay) {
          setForm((prev) => ({
            ...prev,
            issuedBy: formatOfficialName(currentPunongBarangay),
            issuerPosition: "Punong Barangay",
          }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResident();
  }, [residentId, recordLoading, savedRecord]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handlePrint() {
    const saved = await saveCertificate("issued", false);
    if (!saved) return;
    window.print();
  }

  async function saveCertificate(status = "draft", notify = true) {
    const record = {
      status,
      certificateType: title,
      certificateTitle: form.customTitle || formatTitle(title),
      residentId,
      residentName: formatFullName(resident),
      purpose: form.purpose,
      issuedDate: form.issuedDate,
      form,
      punongBarangay,
      residentSnapshot: resident,
    };
    try {
      const response = await fetch(apiUrl(currentRecordId ? `/api/certificates/${currentRecordId}` : "/api/certificates"), { method: currentRecordId ? "PUT" : "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" }, body: JSON.stringify(record) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save certificate.");
      setCurrentRecordId(data.certificate.id);
      setSavedRecord(data.certificate);
      if (notify) alert(status === "issued" ? "Certificate marked as issued." : "Certificate draft saved.");
      return true;
    } catch (err) { setError(err.message); return false; }
  }

  if (loading || recordLoading) {
    return <p className="certificate-message">Loading resident...</p>;
  }

  if (error) {
    return (
      <div className="certificate-message">
        <h2>Unable to load certificate.</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!resident) {
    return <p className="certificate-message">Resident not found.</p>;
  }

  return (
    <div className="certificate-layout">
      <div className="certificate-form">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          type="button"
        >
          Back
        </button>

        <h1>{formatTitle(title)}</h1>
        {isReadOnly && <p className="certificate-read-only">Viewing saved certificate history.</p>}

        <ResidentSummary resident={resident} />

        <fieldset className="certificate-inputs" disabled={isReadOnly}>
        <div className="form-group">
          <label>Purpose</label>
          <textarea
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            readOnly={isReadOnly}
            placeholder="Example: employment, school requirement, financial assistance"
          />
        </div>

        <FieldsComponent
          form={form}
          handleChange={handleChange}
          resident={resident}
          readOnly={isReadOnly}
        />

        <div className="form-grid">
          <div className="form-group">
            <label>Issued Date</label>
            <input
              type="date"
              name="issuedDate"
              value={form.issuedDate}
              onChange={handleChange}
              readOnly={isReadOnly}
            />
          </div>

          <div className="form-group">
            <label>Issued By</label>
            <input
              name="issuedBy"
              value={form.issuedBy}
              onChange={handleChange}
              readOnly={isReadOnly}
              placeholder={
                punongBarangay
                  ? formatOfficialName(punongBarangay)
                  : "Punong Barangay"
              }
            />
          </div>

          <div className="form-group">
            <label>Issuer Position</label>
            <input
              name="issuerPosition"
              value={form.issuerPosition}
              onChange={handleChange}
              readOnly={isReadOnly}
            />
          </div>
        </div>

        {title !== "other" && (
          <div className="form-group">
            <label>Remarks</label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              readOnly={isReadOnly}
            />
          </div>
        )}
        </fieldset>

        {!isReadOnly && <div className="button-row">
          <button
            type="button"
            onClick={() => saveCertificate("draft")}
          >
            Save Draft
          </button>

          <button
            type="button"
            className="primary-action"
            onClick={handlePrint}
          >
            Generate PDF
          </button>
        </div>}
      </div>

      <CertificatePreview
        resident={resident}
        form={form}
        type={title}
        punongBarangay={punongBarangay}
      />
    </div>
  );
}
