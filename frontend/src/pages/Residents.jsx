import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";
import "../styles/residents.css";

export default function Residents() {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filterRef = useRef(null);

  const [filters, setFilters] = useState({
    gender: "all",
    voter: "all",
    senior: "all",
    fourps: "all",
    student: "all",
    youth: "all",
  });

  // -----------------------------
  // Helpers
  // -----------------------------

  function isTrue(value) {
    return value === true || value === "true";
  }

  function getAge(birthdate) {
    if (!birthdate) return null;

    const birth = new Date(birthdate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const monthDifference = today.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  function isYouth(resident) {
    const age = getAge(resident.birthdate);

    return age !== null && age >= 15 && age <= 30;
  }

  // -----------------------------
  // Fetch residents
  // -----------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadResidents() {
      try {
        const res = await fetch(apiUrl("/api/residents"));

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        if (!cancelled) {
          setResidents(data.residents);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setLoading(false);
        }
      }
    }

    loadResidents();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  // -----------------------------
  // Filtering
  // -----------------------------

  const filteredResidents = residents.filter((r) => {
    // Search
    const fullName =
      `${r.first_name || ""} ${r.middle_name || ""} ${r.last_name || ""}`.toLowerCase();

    const searchTerm = search.toLowerCase();

    const searchMatch =
      fullName.includes(searchTerm) ||
      (r.contact_number || "").toLowerCase().includes(searchTerm) ||
      (r.purok || "").toLowerCase().includes(searchTerm);

    if (!searchMatch) {
      return false;
    }

    // Gender
    if (
      filters.gender !== "all" &&
      (r.gender || "").toLowerCase() !== filters.gender.toLowerCase()
    ) {
      return false;
    }

    // Voter
    if (filters.voter !== "all") {
      const isVoter = isTrue(r.voter);

      if (filters.voter === "yes" && !isVoter) {
        return false;
      }

      if (filters.voter === "no" && isVoter) {
        return false;
      }
    }

    // Senior Citizen
    if (filters.senior !== "all") {
      const isSenior = isTrue(r.senior_citizen);

      if (filters.senior === "yes" && !isSenior) {
        return false;
      }

      if (filters.senior === "no" && isSenior) {
        return false;
      }
    }

    // 4Ps
    if (filters.fourps !== "all") {
      const is4Ps = isTrue(r.fourps_beneficiary);

      if (filters.fourps === "yes" && !is4Ps) {
        return false;
      }

      if (filters.fourps === "no" && is4Ps) {
        return false;
      }
    }

    // Student
    if (filters.student !== "all") {
      const isStudent = isTrue(r.currently_enrolled);

      if (filters.student === "yes" && !isStudent) {
        return false;
      }

      if (filters.student === "no" && isStudent) {
        return false;
      }
    }

    // Youth (15–30)
    if (filters.youth !== "all") {
      const youth = isYouth(r);

      if (filters.youth === "yes" && !youth) {
        return false;
      }

      if (filters.youth === "no" && youth) {
        return false;
      }
    }

    return true;
  });

  // -----------------------------
  // Pagination
  // -----------------------------

  const totalResidents = filteredResidents.length;

  const totalPages = Math.max(1, Math.ceil(totalResidents / rowsPerPage));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const indexOfLastResident = safeCurrentPage * rowsPerPage;

  const indexOfFirstResident = indexOfLastResident - rowsPerPage;

  const currentResidents = filteredResidents.slice(
    indexOfFirstResident,
    indexOfLastResident,
  );

  // -----------------------------
  // Filter helpers
  // -----------------------------

  function updateFilter(name, value) {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    setCurrentPage(1);
  }

  function clearFilters() {
    setFilters({
      gender: "all",
      voter: "all",
      senior: "all",
      fourps: "all",
      student: "all",
      youth: "all",
    });

    setCurrentPage(1);
  }

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "all",
  ).length;

  // -----------------------------
  // Render
  // -----------------------------

  return (
    <div className="residents-page">
      <div className="page-header">
        <div>
          <h1>Residents</h1>
          <p>Manage all barangay residents.</p>
        </div>

        <button
          className="add-btn"
          onClick={() => navigate("/barangay/residents/new")}
        >
          + Add Resident
        </button>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          {/* Search */}

          <input
            type="text"
            placeholder="Search resident..."
            className="search-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          {/* Rows */}

          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10 rows</option>

            <option value={25}>25 rows</option>

            <option value={50}>50 rows</option>
          </select>

          {/* Filter */}

          <div className="filter-wrapper" ref={filterRef}>
            <button
              type="button"
              className={`filter-btn ${activeFilterCount > 0 ? "active" : ""}`}
              onClick={() => setShowFilters((prev) => !prev)}
            >
              Filter
              {activeFilterCount > 0 && (
                <span className="filter-count">{activeFilterCount}</span>
              )}
            </button>

            {showFilters && (
              <div className="filter-panel">
                <div className="filter-header">
                  <strong>Filter Residents</strong>

                  <button type="button" onClick={clearFilters}>
                    Clear
                  </button>
                </div>

                <div className="filter-grid">
                  {/* Sex */}

                  <div className="filter-group">
                    <label>Sex</label>

                    <select
                      value={filters.gender}
                      onChange={(e) => updateFilter("gender", e.target.value)}
                    >
                      <option value="all">All</option>

                      <option value="Male">Male</option>

                      <option value="Female">Female</option>

                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Voter */}

                  <div className="filter-group">
                    <label>Voter Status</label>

                    <select
                      value={filters.voter}
                      onChange={(e) => updateFilter("voter", e.target.value)}
                    >
                      <option value="all">All</option>

                      <option value="yes">Voter</option>

                      <option value="no">Non-voter</option>
                    </select>
                  </div>

                  {/* Senior Citizen */}

                  <div className="filter-group">
                    <label>Senior Citizen</label>

                    <select
                      value={filters.senior}
                      onChange={(e) => updateFilter("senior", e.target.value)}
                    >
                      <option value="all">All</option>

                      <option value="yes">Senior Citizen</option>

                      <option value="no">Non-senior</option>
                    </select>
                  </div>

                  {/* 4Ps */}

                  <div className="filter-group">
                    <label>4Ps Status</label>

                    <select
                      value={filters.fourps}
                      onChange={(e) => updateFilter("fourps", e.target.value)}
                    >
                      <option value="all">All</option>

                      <option value="yes">4Ps Beneficiary</option>

                      <option value="no">Not 4Ps</option>
                    </select>
                  </div>

                  {/* Student */}

                  <div className="filter-group">
                    <label>Student</label>

                    <select
                      value={filters.student}
                      onChange={(e) => updateFilter("student", e.target.value)}
                    >
                      <option value="all">All</option>

                      <option value="yes">Student</option>

                      <option value="no">Non-student</option>
                    </select>
                  </div>

                  {/* Youth */}

                  <div className="filter-group">
                    <label>Youth</label>

                    <select
                      value={filters.youth}
                      onChange={(e) => updateFilter("youth", e.target.value)}
                    >
                      <option value="all">All</option>

                      <option value="yes">Youth (15–30)</option>

                      <option value="no">Not Youth</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}

        <div className="stats-inline">
          <div className="mini-stat">
            <span>Residents</span>

            <strong>{residents.length}</strong>
          </div>

          <div className="mini-stat">
            <span>Voters</span>

            <strong>{residents.filter((r) => isTrue(r.voter)).length}</strong>
          </div>

          <div className="mini-stat">
            <span>Seniors</span>

            <strong>
              {residents.filter((r) => isTrue(r.senior_citizen)).length}
            </strong>
          </div>

          <div className="mini-stat">
            <span>4Ps</span>

            <strong>
              {residents.filter((r) => isTrue(r.fourps_beneficiary)).length}
            </strong>
          </div>

          <div className="mini-stat">
            <span>Students</span>

            <strong>
              {residents.filter((r) => isTrue(r.currently_enrolled)).length}
            </strong>
          </div>
        </div>
      </div>

      {/* Table */}

      <div className="table-container">
        {loading ? (
          <p>Loading residents...</p>
        ) : (
          <table className="residents-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Birthdate</th>
                <th>Civil Status</th>
                <th>Contact</th>
                <th>Purok</th>
                <th>Occupation</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {currentResidents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-state">
                    No residents found.
                  </td>
                </tr>
              ) : (
                currentResidents.map((r) => (
                  <tr
                    key={r.resident_id}
                    className="clickable-row"
                    onClick={() =>
                      navigate(`/barangay/residents/${r.resident_id}`)
                    }
                  >
                    <td>
                      <img
                        src={r.pfp_url || "/default-avatar.png"}
                        alt="profile"
                        className="resident-pfp"
                      />
                    </td>

                    <td>
                      {r.first_name} {r.last_name}
                    </td>

                    <td>{r.gender}</td>

                    <td>{r.birthdate}</td>

                    <td>{r.civil_status}</td>

                    <td>{r.contact_number}</td>

                    <td>{r.purok}</td>

                    <td>{r.occupation}</td>

                    <td>{r.resident_status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}

        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={safeCurrentPage === 1}
          >
            Previous
          </button>

          <span>
            Page {safeCurrentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={safeCurrentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
