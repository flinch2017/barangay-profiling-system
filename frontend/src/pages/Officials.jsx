import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/officials.css";

export default function Officials() {
  const navigate = useNavigate();

  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficials();
  }, []);

  async function fetchOfficials() {
    try {
      const res = await fetch(
        "http://localhost:5000/api/officials"
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setOfficials(data.officials);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="officials-page">

      <div className="page-header">

        <div>
          <h1>Barangay Officials</h1>
          <p>
            Manage elected and appointed officials.
          </p>
        </div>

        <button
          className="add-btn"
          onClick={() =>
            navigate("/barangay/officials/new")
          }
        >
          + Add Official
        </button>

      </div>

      <div className="table-container">

        {loading ? (
          <p>Loading officials...</p>
        ) : (

          <table className="officials-table">

            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Position</th>
                <th>Category</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>

            <tbody>

              {officials.map((official) => (

                <tr
                  key={official.official_id}
                  className="clickable-row"
                  onClick={() =>
                    navigate(
                      `/barangay/officials/${official.official_id}`
                    )
                  }
                >

                  <td>
                    <img
                      src={
                        official.pfp_url ||
                        "/default-avatar.png"
                      }
                      alt={`${official.first_name} ${official.last_name}`}
                      className="official-photo"
                    />
                  </td>

                  <td>
                    {official.first_name}{" "}
                    {official.last_name}
                  </td>

                  <td>{official.position}</td>

                  <td>{official.category}</td>

                  <td>{official.start_date}</td>

                  <td>
                    {official.end_date || "Present"}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}