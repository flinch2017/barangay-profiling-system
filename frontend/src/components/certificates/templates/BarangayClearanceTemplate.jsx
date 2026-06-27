import "./barangayClearanceTemplate.css";

export default function BarangayClearanceTemplate({
  resident,
  barangay,
  purpose,
  clearanceNo,
  issuedDate,
}) {
  return (
    <div className="certificate-paper">

      <div className="certificate-header">

        {barangay?.logo && (
          <img
            src={barangay.logo}
            alt="Barangay Logo"
            className="certificate-logo"
          />
        )}

        <div>
          <p>Republic of the Philippines</p>
          <p>Province of {barangay?.province}</p>
          <p>Municipality of {barangay?.municipality}</p>

          <h2>BARANGAY {barangay?.name?.toUpperCase()}</h2>

          <p>Office of the Punong Barangay</p>
        </div>

      </div>

      <hr />

      <div className="certificate-title">
        <h1>BARANGAY CLEARANCE</h1>
      </div>

      <div className="certificate-body">

        <p>
          <strong>Clearance No.:</strong>{" "}
          {clearanceNo || "2026-001"}
        </p>

        <p>
          TO WHOM IT MAY CONCERN:
        </p>

        <p className="paragraph">

          This is to certify that

          <strong>
            {" "}
            {resident?.first_name}{" "}
            {resident?.middle_name}{" "}
            {resident?.last_name}
          </strong>

          , of legal age,
          <strong>
            {" "}
            {resident?.civil_status}
          </strong>
          ,
          residing at

          <strong>
            {" "}
            {resident?.street},
            {" "}
            Purok {resident?.purok},
            {" "}
            Barangay {barangay?.name}
          </strong>

          , is personally known to this office and is a bona fide resident of this barangay.

        </p>

        <p className="paragraph">

          This further certifies that as of this date, the above-named resident has no derogatory record filed in this office.

        </p>

        <p className="paragraph">

          This clearance is issued upon the request of the above-named person for

          <strong>
            {" "}
            {purpose || "whatever legal purpose it may serve"}
          </strong>

          .

        </p>

      </div>

      <div className="certificate-footer">

        <p>
          Issued this{" "}
          <strong>{issuedDate}</strong>.
        </p>

        <div className="signature">

          <div className="signature-line" />

          <strong>
            {barangay?.captain ||
              "JUAN DELA CRUZ"}
          </strong>

          <span>Punong Barangay</span>

        </div>

      </div>

    </div>
  );
}