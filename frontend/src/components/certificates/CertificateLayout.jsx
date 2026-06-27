import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ResidentSummary from "./ResidentSummary";
import CertificatePreview from "./CertificatePreview";

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
  const savedRecord = recordId
    ? JSON.parse(localStorage.getItem("certificateRecords") || "[]").find(
        (record) => record.id === recordId
      )
    : null;
  const savedIssuedBy = savedRecord?.form?.issuedBy;

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
    ...(savedRecord?.form || {}),
  });

  useEffect(() => {
    async function fetchResident() {
      try {
        setLoading(true);
        setError("");

        const [residentRes, officialsRes] = await Promise.all([
          fetch(
            `http://localhost:5000/api/residents/${residentId}`
          ),
          fetch("http://localhost:5000/api/officials"),
        ]);

        const residentData = await residentRes.json();
        const officialsData = await officialsRes.json();

        if (!residentRes.ok) {
          throw new Error(
            residentData.message || "Unable to load resident."
          );
        }

        if (!officialsRes.ok) {
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

        setResident(residentData.resident);
        setPunongBarangay(currentPunongBarangay || null);

        if (!savedIssuedBy && currentPunongBarangay) {
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
  }, [residentId, savedIssuedBy]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handlePrint() {
    saveCertificate("issued", false);
    window.print();
  }

  function saveCertificate(status = "draft", notify = true) {
    const records = JSON.parse(
      localStorage.getItem("certificateRecords") || "[]"
    );

    const record = {
      id: currentRecordId ||
        (window.crypto?.randomUUID
          ? window.crypto.randomUUID()
          : `${Date.now()}-${residentId}`),
      status,
      certificateType: title,
      certificateTitle: form.customTitle || formatTitle(title),
      residentId,
      residentName: formatFullName(resident),
      purpose: form.purpose,
      issuedDate: form.issuedDate,
      createdAt:
        records.find((item) => item.id === currentRecordId)?.createdAt ||
        new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      form,
      punongBarangay,
    };

    const nextRecords = records.filter((item) => item.id !== record.id);

    localStorage.setItem(
      "certificateRecords",
      JSON.stringify([record, ...nextRecords])
    );
    setCurrentRecordId(record.id);

    if (notify) {
      alert(
        status === "issued"
          ? "Certificate marked as issued."
          : "Certificate draft saved."
      );
    }
  }

  if (loading) {
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

        <ResidentSummary resident={resident} />

        <div className="form-group">
          <label>Purpose</label>
          <textarea
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            placeholder="Example: employment, school requirement, financial assistance"
          />
        </div>

        <FieldsComponent
          form={form}
          handleChange={handleChange}
          resident={resident}
        />

        <div className="form-grid">
          <div className="form-group">
            <label>Issued Date</label>
            <input
              type="date"
              name="issuedDate"
              value={form.issuedDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Issued By</label>
            <input
              name="issuedBy"
              value={form.issuedBy}
              onChange={handleChange}
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
            />
          </div>
        )}

        <div className="button-row">
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
        </div>
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
