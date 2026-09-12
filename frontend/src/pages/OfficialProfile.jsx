import { useEffect, useState } from "react";
import { FiEdit2, FiFileText, FiTrash2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrl } from "../lib/api";
import "../styles/officialProfile.css";

export default function OfficialProfile() {
  const { officialId } = useParams();
  const navigate = useNavigate();
  const [official, setOfficial] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOfficial() {
      try {
        const response = await fetch(apiUrl(`/api/officials/${officialId}`));
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setOfficial(data.official);
      } catch (loadError) { setError(loadError.message || "Unable to load official profile"); }
    }
    loadOfficial();
  }, [officialId]);

  async function removeOfficial() {
    if (!window.confirm(`Delete ${official.first_name} ${official.last_name} from the officials directory?`)) return;
    const response = await fetch(apiUrl(`/api/officials/${officialId}`), { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return setError(data.message || "Unable to delete official");
    navigate("/barangay/officials");
  }

  if (error) return <main className="official-profile-page"><p>{error}</p></main>;
  if (!official) return <main className="official-profile-page"><p>Loading official profile...</p></main>;
  const fullName = [official.first_name, official.middle_name, official.last_name, official.suffix].filter(Boolean).join(" ");
  const address = [official.street, official.purok && `Purok ${official.purok}`, official.barangay_name, official.municipality, official.province].filter(Boolean).join(", ");

  return <main className="official-profile-page">
    <header className="official-profile-header"><button className="official-back" onClick={() => navigate("/barangay/officials")}>← Officials</button><div className="official-profile-actions"><button className="official-edit" onClick={() => navigate(`/barangay/officials/${officialId}/edit`)}><FiEdit2 /> Edit</button><button className="official-delete" onClick={removeOfficial}><FiTrash2 /> Delete</button></div></header>
    <section className="official-hero"><img src={official.pfp_url || "/default-avatar.png"} alt="" /><div><span>{official.category || "Barangay official"}</span><h1>{fullName}</h1><p>{official.position || "Position not recorded"}</p></div></section>
    <div className="official-profile-grid"><section className="official-info-card"><h2>Office details</h2><dl><div><dt>Position</dt><dd>{official.position || "—"}</dd></div><div><dt>Category</dt><dd>{official.category || "—"}</dd></div><div><dt>Term started</dt><dd>{official.start_date || "—"}</dd></div><div><dt>Term ends</dt><dd>{official.end_date || "Present"}</dd></div></dl></section><section className="official-info-card"><h2>Resident information</h2><dl><div><dt>Contact number</dt><dd>{official.contact_number || "Not recorded"}</dd></div><div><dt>Email</dt><dd>{official.email || "Not recorded"}</dd></div><div><dt>Address</dt><dd>{address || "Not recorded"}</dd></div></dl></section><section className="official-info-card official-document"><h2>Supporting document</h2>{official.supporting_document_url ? <a href={official.supporting_document_url} target="_blank" rel="noreferrer"><FiFileText /> View oath of office / document</a> : <p>No supporting document uploaded.</p>}</section></div>
  </main>;
}
