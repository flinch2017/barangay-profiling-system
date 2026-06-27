import bagongPilipinasLogo from "../../assets/Bagong_Pilipinas_Logo.png";

const CERTIFICATE_TITLES = {
  "barangay-clearance": "Barangay Clearance",
  "certificate-of-indigency": "Certificate of Indigency",
  "certificate-of-residency": "Certificate of Residency",
  "first-time-job-seeker": "First Time Job Seeker Certificate",
  "business-clearance": "Business Clearance",
  "good-moral-character": "Certificate of Good Moral Character",
  "solo-parent-certificate": "Solo Parent Certificate",
  other: "Certificate",
};

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

function formatOfficialName(official) {
  if (!official) {
    return "";
  }

  const middleInitial = official.middle_name
    ? `${official.middle_name.charAt(0)}.`
    : "";
  const prefix =
    official.category === "Elected" ? "HON." : "";

  return [
    prefix,
    official.first_name,
    middleInitial,
    official.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
}

function getBarangayLogo() {
  try {
    return JSON.parse(localStorage.getItem("barangayProfile") || "{}")
      .logoDataUrl;
  } catch {
    return "";
  }
}

function formatAddress(resident) {
  return [
    resident.street,
    resident.purok ? `Purok ${resident.purok}` : "",
    resident.barangay_name,
    resident.municipality,
    resident.province,
  ]
    .filter(Boolean)
    .join(", ");
}

function calculateAge(birthdate) {
  if (!birthdate) {
    return "";
  }

  const birthDate = new Date(birthdate);

  if (Number.isNaN(birthDate.getTime())) {
    return "";
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return `${age}`;
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getCertificateBody(type, resident, form) {
  const name = formatFullName(resident);
  const address = formatAddress(resident) || "this barangay";
  const age = calculateAge(resident.birthdate);
  const gender = resident.gender || resident.sex || "";
  const purpose = form.purpose || "legal and official purposes";
  const residentDetails = (
    <>
      <strong>{name}</strong>
      {age ? (
        <>
          , <strong>{age}</strong> years old
        </>
      ) : null}
      {gender ? (
        <>
          , <strong>{gender}</strong>
        </>
      ) : null}
    </>
  );

  const bodies = {
    "barangay-clearance": (
      <>
        This is to certify that {residentDetails}, is a resident of{" "}
        <strong>{address}</strong>. Based on the records of this office, the
        resident has no derogatory record filed as of the date of issuance. This
        clearance is issued upon request for <strong>{purpose}</strong>.
      </>
    ),
    "certificate-of-indigency": (
      <>
        This is to certify that {residentDetails}, a resident of{" "}
        <strong>{address}</strong>, belongs to an indigent household in this
        barangay. This certification is issued upon request for{" "}
        <strong>{form.reason || purpose}</strong>.
      </>
    ),
    "certificate-of-residency": (
      <>
        This is to certify that {residentDetails}, is a bona fide resident of{" "}
        <strong>{address}</strong>. This certification is issued upon request
        for <strong>{purpose}</strong>.
      </>
    ),
    "first-time-job-seeker": (
      <>
        This is to certify that {residentDetails}, a resident of{" "}
        <strong>{address}</strong>, is seeking employment for the first time.
        This certification is issued for application to{" "}
        <strong>{form.employer || "a prospective employer"}</strong>
        {form.position ? (
          <>
            {" "}
            for the position of <strong>{form.position}</strong>
          </>
        ) : null}
        .
      </>
    ),
    "business-clearance": (
      <>
        This is to certify that the business named{" "}
        <strong>{form.businessName || "the stated business"}</strong> owned or
        represented by {residentDetails} and located at{" "}
        <strong>{form.businessAddress || address}</strong> has requested
        barangay clearance for{" "}
        <strong>{form.businessType || "business purposes"}</strong>.
      </>
    ),
    "good-moral-character": (
      <>
        This is to certify that {residentDetails}, a resident of{" "}
        <strong>{address}</strong>, is known to be of good moral character and
        has shown respectful conduct in the community. This certification is
        issued upon request for <strong>{purpose}</strong>.
      </>
    ),
    "solo-parent-certificate": (
      <>
        This is to certify that {residentDetails}, a resident of{" "}
        <strong>{address}</strong>, has requested certification as a solo
        parent. This certification is issued for <strong>{purpose}</strong>.
      </>
    ),
    other: (
      <>
        This is to certify that {residentDetails}, a resident of{" "}
        <strong>{address}</strong>, has requested this certification for{" "}
        <strong>{purpose}</strong>.
      </>
    ),
  };

  return bodies[type] || bodies.other;
}

function DetailRow({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <p>
      <b>{label}:</b> <strong>{value}</strong>
    </p>
  );
}

export default function CertificatePreview({
  resident,
  form,
  type,
  punongBarangay,
}) {
  const title = form.customTitle || CERTIFICATE_TITLES[type] || "Certificate";
  const issuedDate = formatDate(form.issuedDate);
  const barangayName = resident.barangay_name || "Barangay";
  const municipality = resident.municipality || "Municipality";
  const province = resident.province || "Province";
  const punongBarangayName = formatOfficialName(punongBarangay);
  const barangayLogo = getBarangayLogo();

  return (
    <div className="certificate-preview">
      <article className="certificate-paper" id="certificate-print-area">
        <header className="certificate-letterhead">
          <div className="certificate-logo-bar">
            <img
              src={bagongPilipinasLogo}
              alt="Bagong Pilipinas logo"
              className="certificate-logo left-logo"
            />

            {barangayLogo ? (
              <img
                src={barangayLogo}
                alt="Barangay logo"
                className="certificate-logo right-logo"
              />
            ) : (
              <div className="certificate-logo logo-placeholder">
                Barangay Logo
              </div>
            )}
          </div>

          <p>Republic of the Philippines</p>
          <p>Province of {province}</p>
          <p>Municipality/City of {municipality}</p>
          <h2>Barangay {barangayName}</h2>
          <span>Office of the Punong Barangay</span>
        </header>

        <h1>{title}</h1>

        <section className="certificate-body">
          <p>To whom it may concern:</p>
          <p>{getCertificateBody(type, resident, form)}</p>
          <p>
            Issued this {issuedDate} at {barangayName}, {municipality},{" "}
            {province}.
          </p>
        </section>

        <section className="certificate-details">
          <DetailRow label="Cedula No." value={form.cedula} />
          <DetailRow label="Cedula Date" value={form.cedulaDate ? formatDate(form.cedulaDate) : ""} />
          <DetailRow label="Cedula Place" value={form.cedulaPlace} />
          <DetailRow label="Years of Residency" value={form.yearsOfResidency} />
          <DetailRow label="Character Reference" value={form.characterReference} />
          <DetailRow label="Solo Parent ID" value={form.soloParentId} />
          <DetailRow label="Number of Children" value={form.numberOfChildren} />
          <DetailRow label="Remarks" value={form.remarks} />
        </section>

        <footer className="certificate-signature">
          <div>
            <strong>{form.issuedBy || punongBarangayName || "Punong Barangay"}</strong>
            <span>{form.issuerPosition || "Punong Barangay"}</span>
          </div>
        </footer>
      </article>
    </div>
  );
}
