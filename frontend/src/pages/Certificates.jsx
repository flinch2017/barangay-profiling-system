import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiFileText } from "react-icons/fi";
import { apiUrl } from "../lib/api";
import "../styles/certificates.css";

export default function Certificates() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("requests");
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCertificates() {
      try {
        const response = await fetch(apiUrl("/api/certificates"), { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load certificate history.");
        const cloudRecords = data.certificates || [];
        const localRecords = JSON.parse(localStorage.getItem("certificateRecords") || "[]");
        if (!cloudRecords.length && localRecords.length) {
          const migrated = await Promise.all(localRecords.map(async (record) => {
            const payload = { ...record, residentSnapshot: record.residentSnapshot || { first_name: record.residentName || "Former resident" } };
            const saveResponse = await fetch(apiUrl("/api/certificates"), { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const saved = await saveResponse.json();
            return saveResponse.ok ? saved.certificate : null;
          }));
          const migratedRecords = migrated.filter(Boolean);
          if (migratedRecords.length) localStorage.removeItem("certificateRecords");
          setRecords(migratedRecords);
        } else {
          setRecords(cloudRecords);
        }
      } catch (err) { setError(err.message); }
    }
    loadCertificates();
  }, []);

  const visibleRecords = useMemo(() => {
    const status = activeTab === "requests" ? "draft" : "issued";
    const keyword = search.toLowerCase();

    return records.filter((record) => {
      const searchable = [
        record.residentName,
        record.certificateTitle,
        record.purpose,
        record.issuedDate,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return record.status === status && searchable.includes(keyword);
    });
  }, [activeTab, records, search]);

  function createCertificate(type) {
    navigate(
      `/barangay/certificates/new/${encodeURIComponent(type)}`
    );
  }

  function certificateUrl(record, mode = "view") {
    return `/barangay/certificates/new/${record.certificateType}/${record.residentId}?record=${record.id}&mode=${mode}`;
  }

  async function deleteCertificate(recordId) {
    if (!window.confirm("Delete this certificate record? This cannot be undone.")) return;
    try {
      const response = await fetch(apiUrl(`/api/certificates/${recordId}`), { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to delete certificate record.");
      setRecords((current) => current.filter((record) => record.id !== recordId));
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="certificates-page">

      {/* Header */}
      <div className="page-header-cert">

        <div>
          <h1>Certificates</h1>
          <p>
            Create, manage and archive barangay certificates.
          </p>
        </div>

        <div className="header-actions-cert">

          <div className="search-box-cert">
            <FiSearch />
            <input
              type="text"
              placeholder="Search certificate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="create-dropdown-cert">

            <button className="add-btn-cert">
              <FiPlus />
              Create Certificate
            </button>

            <div className="dropdown-menu-cert">

              <button
                onClick={() =>
                  createCertificate("barangay-clearance")
                }
              >
                Barangay Clearance
              </button>

              <button
                onClick={() =>
                  createCertificate("certificate-of-indigency")
                }
              >
                Certificate of Indigency
              </button>

              <button
                onClick={() =>
                  createCertificate("certificate-of-residency")
                }
              >
                Certificate of Residency
              </button>

              <button
                onClick={() =>
                  createCertificate("first-time-job-seeker")
                }
              >
                First Time Job Seeker
              </button>

              <button
                onClick={() =>
                  createCertificate("business-clearance")
                }
              >
                Business Clearance
              </button>

              <button
                onClick={() =>
                  createCertificate("good-moral-character")
                }
              >
                Good Moral Character
              </button>

              <button
                onClick={() =>
                  createCertificate("solo-parent-certificate")
                }
              >
                Solo Parent Certificate
              </button>

              <button
                onClick={() =>
                  createCertificate("other")
                }
              >
                Other Certificate...
              </button>

            </div>

          </div>

        </div>

      </div>
      {error && <p className="certificate-list-error">{error}</p>}

      {/* Tabs */}

      <div className="tabs">

        <button
          className={
            activeTab === "requests"
              ? "tab active"
              : "tab"
          }
          onClick={() => setActiveTab("requests")}
        >
          Drafts
        </button>

        <button
          className={
            activeTab === "completed"
              ? "tab active"
              : "tab"
          }
          onClick={() => setActiveTab("completed")}
        >
          Issued Certificates
        </button>

      </div>

      {/* Table */}

      <div className="table-card">

        <table className="certificates-table">

          <thead>

            <tr>

              <th>Resident</th>

              <th>Certificate</th>

              <th>Purpose</th>

              <th>Date</th>

              <th>Status</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>
            {visibleRecords.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <FiFileText
                      size={60}
                      className="empty-icon"
                    />

                    <h3>
                      {activeTab === "requests"
                        ? "No certificate drafts"
                        : "No certificates issued"}
                    </h3>

                    <p>
                      {activeTab === "requests"
                        ? "Saved certificate drafts will appear here."
                        : "Issued certificates will appear here once generated."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              visibleRecords.map((record) => (
                <tr key={record.id} className="certificate-history-row" onClick={() => navigate(certificateUrl(record))}>
                  <td>{record.residentName}</td>
                  <td>{record.certificateTitle}</td>
                  <td>{record.purpose || "-"}</td>
                  <td>{record.issuedDate || "-"}</td>
                  <td>
                    <span className={`status-pill ${record.status}`}>
                      {record.status === "issued" ? "Issued" : "Draft"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="table-action"
                      onClick={(event) => { event.stopPropagation(); navigate(certificateUrl(record, "edit")); }}
                    >
                      Edit
                    </button>
                    <button className="table-action table-action-danger" onClick={(event) => { event.stopPropagation(); deleteCertificate(record.id); }}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>

      </div>

    </div>
  );
}
