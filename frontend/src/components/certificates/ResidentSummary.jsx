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

export default function ResidentSummary({ resident }) {
  return (
    <div className="resident-summary">
      <div>
        <span className="summary-label">Selected resident</span>
        <h2>{formatFullName(resident)}</h2>
      </div>

      <div className="summary-grid">
        <p>
          <b>Address</b>
          {resident.street || "-"}, Purok {resident.purok || "-"}
        </p>

        <p>
          <b>Birthdate</b>
          {resident.birthdate || "-"}
        </p>

        <p>
          <b>Civil Status</b>
          {resident.civil_status || "-"}
        </p>

        <p>
          <b>Contact</b>
          {resident.contact_number || "-"}
        </p>
      </div>
    </div>
  );
}
