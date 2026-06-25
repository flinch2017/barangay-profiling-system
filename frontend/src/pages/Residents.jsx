import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/residents.css";

export default function Residents() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);


  const totalResidents = residents.length;

  const indexOfLastResident = currentPage * rowsPerPage;
  const indexOfFirstResident = indexOfLastResident - rowsPerPage;

  const currentResidents = residents.slice(
    indexOfFirstResident,
    indexOfLastResident
  );

  const totalPages = Math.ceil(
    totalResidents / rowsPerPage
  );

  useEffect(() => {
    fetchResidents();
  }, []);

  async function fetchResidents() {
    try {
      const res = await fetch("http://localhost:5000/api/residents");
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setResidents(data.residents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

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

        <input
          type="text"
          placeholder="Search resident..."
          className="search-input"
        />

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

      </div>

      <div className="stats-row">

        <div className="stat-card">
          <span>Total Residents</span>
          <h2>{residents.length}</h2>
        </div>

        <div className="stat-card">
          <span>Senior Citizens</span>
          <h2>
            {residents.filter(r => r.senior_citizen).length}
          </h2>
        </div>

        <div className="stat-card">
          <span>4Ps Beneficiaries</span>
          <h2>
            {residents.filter(r => r.fourps_beneficiary).length}
          </h2>
        </div>

      </div>

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
              {currentResidents.map((r) => (
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
              ))}
            </tbody>

          </table>

          
        )}

        <div className="pagination">

          <button
            onClick={() =>
              setCurrentPage(prev =>
                Math.max(prev - 1, 1)
              )
            }
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage(prev =>
                Math.min(prev + 1, totalPages)
              )
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
}