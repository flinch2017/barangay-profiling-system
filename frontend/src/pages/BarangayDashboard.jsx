import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAward,
  FiFileText,
  FiHome,
  FiPlus,
  FiRefreshCw,
  FiUsers,
} from "react-icons/fi";
import "../styles/global.css";
import "../styles/barangay_dashboard.css";

function isTruthy(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function formatName(person) {
  return [
    person.first_name,
    person.middle_name ? `${person.middle_name.charAt(0)}.` : "",
    person.last_name,
    person.suffix,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatOfficialName(official) {
  const prefix = official.category === "Elected" ? "HON." : "";

  return [
    prefix,
    official.first_name,
    official.middle_name ? `${official.middle_name.charAt(0)}.` : "",
    official.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
}

function isActiveOfficial(official) {
  const today = new Date();
  const startDate = official.start_date ? new Date(official.start_date) : null;
  const endDate = official.end_date ? new Date(official.end_date) : null;

  return (!startDate || startDate <= today) && (!endDate || endDate >= today);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPercentage(count, total) {
  if (!total) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

export default function BarangayDashboard() {
  const navigate = useNavigate();
  const [residents, setResidents] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function requestDashboardData() {
    const [residentsRes, officialsRes] = await Promise.all([
      fetch("http://localhost:5000/api/residents"),
      fetch("http://localhost:5000/api/officials"),
    ]);

    const residentsData = await residentsRes.json();
    const officialsData = await officialsRes.json();

    if (!residentsRes.ok) {
      throw new Error(residentsData.message || "Unable to load residents.");
    }

    if (!officialsRes.ok) {
      throw new Error(officialsData.message || "Unable to load officials.");
    }

    return {
      residents: residentsData.residents || [],
      officials: officialsData.officials || [],
      certificates: JSON.parse(
        localStorage.getItem("certificateRecords") || "[]"
      ),
    };
  }

  function applyDashboardData(data) {
    setResidents(data.residents);
    setOfficials(data.officials);
    setCertificates(data.certificates);
    setError("");
  }

  async function refreshDashboardData() {
    setLoading(true);

    try {
      applyDashboardData(await requestDashboardData());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadDashboardData() {
      try {
        const data = await requestDashboardData();

        if (!ignore) {
          applyDashboardData(data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      ignore = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const totalResidents = residents.length;
    const maleResidents = residents.filter(
      (resident) => resident.gender?.toLowerCase() === "male"
    ).length;
    const femaleResidents = residents.filter(
      (resident) => resident.gender?.toLowerCase() === "female"
    ).length;
    const activeResidents = residents.filter(
      (resident) =>
        !resident.resident_status ||
        resident.resident_status.toLowerCase() === "active"
    ).length;
    const voters = residents.filter((resident) => isTruthy(resident.voter)).length;
    const seniors = residents.filter((resident) =>
      isTruthy(resident.senior_citizen)
    ).length;
    const fourPs = residents.filter((resident) =>
      isTruthy(resident.fourps_beneficiary)
    ).length;
    const students = residents.filter((resident) =>
      isTruthy(resident.currently_enrolled)
    ).length;
    const issuedCertificates = certificates.filter(
      (certificate) => certificate.status === "issued"
    ).length;
    const draftCertificates = certificates.filter(
      (certificate) => certificate.status === "draft"
    ).length;
    const activeOfficials = officials
      .filter(isActiveOfficial)
      .sort((a, b) => new Date(b.start_date || 0) - new Date(a.start_date || 0));
    const punongBarangay = activeOfficials
      .filter((official) => official.position === "Punong Barangay")
      .sort((a, b) => new Date(b.start_date || 0) - new Date(a.start_date || 0))[0];

    return {
      totalResidents,
      maleResidents,
      femaleResidents,
      activeResidents,
      voters,
      seniors,
      fourPs,
      students,
      issuedCertificates,
      draftCertificates,
      activeOfficials,
      punongBarangay,
    };
  }, [residents, officials, certificates]);

  const recentResidents = useMemo(
    () =>
      [...residents]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5),
    [residents]
  );

  const recentCertificates = useMemo(
    () =>
      [...certificates]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
        .slice(0, 5),
    [certificates]
  );

  const populationBreakdown = [
    {
      label: "Male",
      value: metrics.maleResidents,
      percent: getPercentage(metrics.maleResidents, metrics.totalResidents),
    },
    {
      label: "Female",
      value: metrics.femaleResidents,
      percent: getPercentage(metrics.femaleResidents, metrics.totalResidents),
    },
    {
      label: "Voters",
      value: metrics.voters,
      percent: getPercentage(metrics.voters, metrics.totalResidents),
    },
    {
      label: "Students",
      value: metrics.students,
      percent: getPercentage(metrics.students, metrics.totalResidents),
    },
  ];

  return (
    <div className="barangay-dashboard-page">
      <section className="dashboard-heading">
        <div>
          <span className="section-kicker">Barangay Operations</span>
          <h1>Dashboard</h1>
          <p>
            Monitor resident records, certificate activity, and current
            officials from one workspace.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            className="secondary-action"
            onClick={refreshDashboardData}
            type="button"
          >
            <FiRefreshCw />
            Refresh
          </button>
          <button
            className="primary-action"
            onClick={() => navigate("/barangay/residents/new")}
            type="button"
          >
            <FiPlus />
            Add Resident
          </button>
        </div>
      </section>

      {error && (
        <div className="dashboard-alert">
          <strong>Dashboard data could not be loaded.</strong>
          <span>{error}</span>
        </div>
      )}

      <section className="dashboard-stat-grid">
        <article className="dashboard-stat-card">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <span>Total Residents</span>
          <strong>{loading ? "..." : metrics.totalResidents}</strong>
          <p>{metrics.activeResidents} active records</p>
        </article>

        <article className="dashboard-stat-card">
          <div className="stat-icon">
            <FiFileText />
          </div>
          <span>Issued Certificates</span>
          <strong>{loading ? "..." : metrics.issuedCertificates}</strong>
          <p>{metrics.draftCertificates} draft certificates</p>
        </article>

        <article className="dashboard-stat-card">
          <div className="stat-icon">
            <FiAward />
          </div>
          <span>Active Officials</span>
          <strong>{loading ? "..." : metrics.activeOfficials.length}</strong>
          <p>Currently serving this term</p>
        </article>

        <article className="dashboard-stat-card">
          <div className="stat-icon">
            <FiHome />
          </div>
          <span>Punong Barangay</span>
          <strong>
            {loading
              ? "..."
              : metrics.punongBarangay
                ? formatOfficialName(metrics.punongBarangay)
                : "Not assigned"}
          </strong>
          <p>
            {metrics.punongBarangay?.end_date
              ? `Term ends ${formatDate(metrics.punongBarangay.end_date)}`
              : "No active term recorded"}
          </p>
        </article>
      </section>

      <section className="dashboard-main-grid">
        <div className="dashboard-panel population-panel">
          <div className="panel-header">
            <div>
              <h2>Population Summary</h2>
              <p>Key resident groups based on current profiles.</p>
            </div>
          </div>

          <div className="breakdown-list">
            {populationBreakdown.map((item) => (
              <div className="breakdown-row" key={item.label}>
                <div className="breakdown-label">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="breakdown-percent">{item.percent}%</span>
              </div>
            ))}
          </div>

          <div className="compact-metrics">
            <div>
              <span>Senior Citizens</span>
              <strong>{metrics.seniors}</strong>
            </div>
            <div>
              <span>4Ps Beneficiaries</span>
              <strong>{metrics.fourPs}</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-panel quick-actions-panel">
          <div className="panel-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Common barangay workflows.</p>
            </div>
          </div>

          <div className="quick-action-list">
            <button
              type="button"
              onClick={() => navigate("/barangay/residents")}
            >
              <FiUsers />
              <span>
                <strong>Review Residents</strong>
                <small>Open resident master list</small>
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/barangay/certificates")}
            >
              <FiFileText />
              <span>
                <strong>Manage Certificates</strong>
                <small>Create, draft, and issue documents</small>
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/barangay/officials")}
            >
              <FiAward />
              <span>
                <strong>Manage Officials</strong>
                <small>Verify active officials and terms</small>
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="dashboard-table-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Residents</h2>
              <p>Latest profiles added to the registry.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/barangay/residents")}
            >
              View All
            </button>
          </div>

          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Purok</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentResidents.length === 0 ? (
                  <tr>
                    <td colSpan="4">No residents found.</td>
                  </tr>
                ) : (
                  recentResidents.map((resident) => (
                    <tr
                      key={resident.resident_id}
                      onClick={() =>
                        navigate(`/barangay/residents/${resident.resident_id}`)
                      }
                    >
                      <td>{formatName(resident)}</td>
                      <td>{resident.gender || "-"}</td>
                      <td>{resident.purok || "-"}</td>
                      <td>{resident.resident_status || "Active"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Certificate Activity</h2>
              <p>Recently saved or issued certificates.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/barangay/certificates")}
            >
              View All
            </button>
          </div>

          <div className="certificate-activity-list">
            {recentCertificates.length === 0 ? (
              <p className="empty-dashboard-text">No certificate activity yet.</p>
            ) : (
              recentCertificates.map((certificate) => (
                <button
                  key={certificate.id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/barangay/certificates/new/${certificate.certificateType}/${certificate.residentId}?record=${certificate.id}`
                    )
                  }
                >
                  <span>
                    <strong>{certificate.certificateTitle}</strong>
                    <small>{certificate.residentName}</small>
                  </span>
                  <em className={`activity-status ${certificate.status}`}>
                    {certificate.status}
                  </em>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="dashboard-panel officials-strip">
        <div className="panel-header">
          <div>
            <h2>Current Officials</h2>
            <p>Active officials reflected in certificates and records.</p>
          </div>
          <button type="button" onClick={() => navigate("/barangay/officials")}>
            Manage
          </button>
        </div>

        <div className="officials-list">
          {metrics.activeOfficials.length === 0 ? (
            <p className="empty-dashboard-text">No active officials recorded.</p>
          ) : (
            metrics.activeOfficials.slice(0, 6).map((official) => (
              <div className="official-item" key={official.official_id}>
                <img
                  src={official.pfp_url || "/default-avatar.png"}
                  alt=""
                />
                <span>
                  <strong>{formatOfficialName(official)}</strong>
                  <small>
                    {official.position} - Term ends {formatDate(official.end_date)}
                  </small>
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
