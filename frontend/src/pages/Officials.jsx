import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/officials.css";

export default function Officials() {
  const navigate = useNavigate();

  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");

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

      setOfficials(data.officials || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // SEARCH FILTER
  const filteredOfficials = officials.filter((official) => {
    const fullName =
      `${official.first_name || ""} ${official.last_name || ""}`
        .toLowerCase();

    const position =
      official.position?.toLowerCase() || "";

    const category =
      official.category?.toLowerCase() || "";

    const search =
      searchTerm.toLowerCase();

    return (
      fullName.includes(search) ||
      position.includes(search) ||
      category.includes(search)
    );
  });

  // PAGINATION
  const totalOfficials = filteredOfficials.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalOfficials / rowsPerPage)
  );

  const indexOfLastOfficial =
    currentPage * rowsPerPage;

  const indexOfFirstOfficial =
    indexOfLastOfficial - rowsPerPage;

  const currentOfficials =
    filteredOfficials.slice(
      indexOfFirstOfficial,
      indexOfLastOfficial
    );

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

      <div className="toolbar">

        <input
          type="text"
          placeholder="Search official..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
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

      <div className="table-container">

        {loading ? (

          <div className="empty-state">
            <p>Loading officials...</p>
          </div>

        ) : filteredOfficials.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              👥
            </div>

            <h3>
              {officials.length === 0
                ? "No officials listed yet"
                : "No matching officials found"}
            </h3>

            <p>
              {officials.length === 0
                ? "Start by adding barangay officials to your directory."
                : "Try adjusting your search term."}
            </p>

            {officials.length === 0 && (
              <button
                className="add-btn"
                onClick={() =>
                  navigate("/barangay/officials/new")
                }
              >
                + Add Official
              </button>
            )}

          </div>

        ) : (

          <>
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

                {currentOfficials.map((official) => (

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
                      {official.first_name} {official.last_name}
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

            <div className="pagination">

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
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
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, totalPages)
                  )
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>

            </div>

          </>
        )}

      </div>

    </div>
  );
}