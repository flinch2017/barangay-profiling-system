import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/residents.css";

export default function Residents() {
  const navigate = useNavigate();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

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
              {residents.map((r) => (
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

      </div>

    </div>
  );
}