import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronRight,
  FiSearch,
  FiUser,
} from "react-icons/fi";

import "../styles/certificateResidentSelect.css";

export default function CertificateResidentSelect() {

  const { certificateType } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    async function fetchResidents() {
      try {

        const res = await fetch(
          "http://localhost:5000/api/residents"
        );

        const data = await res.json();

        if (!res.ok)
          throw new Error(data.message);

        setResidents(data.residents);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    }

    fetchResidents();
  }, []);

  const filteredResidents = useMemo(() => {

    const keyword = search.toLowerCase();

    return residents.filter((resident) => {

      const fullName =
        `${resident.first_name} ${resident.middle_name || ""} ${resident.last_name}`
          .toLowerCase();

      return (

        fullName.includes(keyword) ||

        resident.contact_number?.toLowerCase().includes(keyword) ||

        resident.purok?.toLowerCase().includes(keyword) ||

        resident.street?.toLowerCase().includes(keyword)

      );

    });

  }, [residents, search]);

  return (

    <div className="certificate-select-page">

      <div className="page-header">

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        <div>

          <h1>
            Select Resident
          </h1>

          <p>
            {decodeURIComponent(certificateType)
              .replace(/-/g, " ")
              .replace(/\b\w/g, c => c.toUpperCase())}
          </p>

        </div>

      </div>

      <div className="search-box">

        <FiSearch />

        <input
          type="text"
          placeholder="Search resident..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {loading ? (

        <div className="empty-state">
          Loading residents...
        </div>

      ) : filteredResidents.length === 0 ? (

        <div className="empty-state">

          <FiUser size={64} />

          <h3>No residents found</h3>

          <p>
            Try another search keyword.
          </p>

        </div>

      ) : (

        <div className="resident-list">

          {filteredResidents.map((resident) => {

            const isExpanded =
              expanded === resident.resident_id;

            return (

              <div
                key={resident.resident_id}
                className="resident-card"
              >

                <div
                  className="resident-header"
                  onClick={() =>
                    setExpanded(
                      isExpanded
                        ? null
                        : resident.resident_id
                    )
                  }
                >

                  <div className="resident-basic">

                    <img
                      src={
                        resident.pfp_url ||
                        "/default-avatar.png"
                      }
                      alt=""
                    />

                    <div>

                      <h3>

                        {resident.first_name}{" "}
                        {resident.last_name}

                      </h3>

                      <span>

                        {resident.street},
                        {" "}
                        Purok {resident.purok}

                      </span>

                    </div>

                  </div>

                  {isExpanded ? (
                    <FiChevronDown />
                  ) : (
                    <FiChevronRight />
                  )}

                </div>

                {isExpanded && (

                  <div className="resident-details">

                    <div className="detail-grid">

                      <p>
                        <b>Gender:</b>{" "}
                        {resident.gender}
                      </p>

                      <p>
                        <b>Birthdate:</b>{" "}
                        {resident.birthdate}
                      </p>

                      <p>
                        <b>Civil Status:</b>{" "}
                        {resident.civil_status}
                      </p>

                      <p>
                        <b>Occupation:</b>{" "}
                        {resident.occupation || "-"}
                      </p>

                      <p>
                        <b>Education:</b>{" "}
                        {resident.educational_level || "-"}
                      </p>

                      <p>
                        <b>Status:</b>{" "}
                        {resident.resident_status}
                      </p>

                      <p>
                        <b>4Ps:</b>{" "}
                        {resident.fourps_beneficiary
                          ? "Yes"
                          : "No"}
                      </p>

                      <p>
                        <b>Senior:</b>{" "}
                        {resident.senior_citizen
                          ? "Yes"
                          : "No"}
                      </p>

                      <p>
                        <b>Voter:</b>{" "}
                        {resident.voter
                          ? "Yes"
                          : "No"}
                      </p>

                    </div>

                    <button
                      className="choose-btn"
                      onClick={() =>
                        navigate(
                          `/barangay/certificates/new/${certificateType}/${resident.resident_id}`
                        )
                      }
                    >
                      Choose Resident
                    </button>

                  </div>

                )}

              </div>

            );

          })}

        </div>

      )}

    </div>
  );

}
