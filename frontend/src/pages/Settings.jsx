import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiImage,
  FiLogOut,
  FiSave,
  FiTrash2,
  FiUpload,
  FiUser,
} from "react-icons/fi";
import bagongPilipinasLogo from "../assets/Bagong_Pilipinas_Logo.png";
import "../styles/settings.css";

const PROFILE_STORAGE_KEY = "barangayProfile";
const MAX_LOGO_SIZE = 3 * 1024 * 1024;

function getStoredProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function formatDate(value) {
  if (!value) {
    return "Not saved yet";
  }

  return new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Settings() {
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);
  const [profile, setProfile] = useState(() => getStoredProfile());
  const [logoPreview, setLogoPreview] = useState(profile.logoDataUrl || "");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [message, setMessage] = useState("");

  function applyLogoFile(file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose a valid image file.");
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      setMessage("Please choose an image smaller than 3 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const logoDataUrl = reader.result;

      setLogoPreview(logoDataUrl);
      setProfile((prev) => ({
        ...prev,
        logoName: file.name,
        logoDataUrl,
      }));
      setIsDirty(true);
      setMessage("Logo selected. Save profile to apply it everywhere.");
    };

    reader.readAsDataURL(file);
  }

  function handleLogoChange(e) {
    applyLogoFile(e.target.files?.[0]);
    e.target.value = "";
  }

  function handleRemoveLogo() {
    setLogoPreview("");
    setProfile((prev) => ({
      ...prev,
      logoName: "",
      logoDataUrl: "",
    }));
    setIsDirty(true);
    setMessage("Logo removed. Save profile to apply the change.");
  }

  function handleSave() {
    setSaving(true);

    const nextProfile = {
      ...profile,
      logoDataUrl: logoPreview,
      updatedAt: new Date().toISOString(),
    };
    const nextUser = {
      ...user,
      pfp_url: logoPreview || "",
    };

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    localStorage.setItem("user", JSON.stringify(nextUser));
    window.dispatchEvent(new Event("barangay-profile-updated"));

    setProfile(nextProfile);
    setIsDirty(false);
    setSaving(false);
    setMessage("Admin profile saved. Certificates will use the updated logo.");
  }

  function handleLogout() {
    const confirmed = window.confirm("Log out of this admin account?");

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-header">
        <div>
          <span>Administration</span>
          <h1>Admin Profile</h1>
          <p>
            Set the barangay logo once and it will appear on the sidebar profile
            and the certificate letterhead.
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
          type="button"
        >
          <FiLogOut />
          Logout
        </button>
      </div>

      <section className="profile-summary-card">
        <div className="profile-avatar-large">
          {logoPreview ? (
            <img src={logoPreview} alt="Barangay logo" />
          ) : (
            <FiUser />
          )}
        </div>

        <div>
          <h2>{user.username || "Barangay Admin"}</h2>
          <p>{user.email || "No email recorded"}</p>
          <div className="profile-badges">
            <span>{user.role || "barangay_admin"}</span>
            <span>{logoPreview ? "Logo ready" : "Logo needed"}</span>
            {isDirty && <span className="pending-badge">Unsaved changes</span>}
          </div>
        </div>
      </section>

      {message && (
        <div className="profile-message">
          <FiCheckCircle />
          <span>{message}</span>
        </div>
      )}

      <div className="admin-profile-grid">
        <section className="admin-profile-card logo-card">
          <div className="profile-card-header">
            <div>
              <h2>Barangay Logo</h2>
              <p>Use a clear square PNG or JPG for best certificate results.</p>
            </div>
          </div>

          <div className="logo-upload-panel">
            <label className="logo-dropzone">
              {logoPreview ? (
                <img src={logoPreview} alt="Barangay logo preview" />
              ) : (
                <span>
                  <FiImage />
                  Upload barangay logo
                  <small>PNG or JPG, up to 3 MB</small>
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </label>

            <div className="logo-button-row">
              <label className="upload-btn">
                <FiUpload />
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </label>

              <button
                className="remove-logo-btn"
                onClick={handleRemoveLogo}
                disabled={!logoPreview}
                type="button"
              >
                <FiTrash2 />
                Remove
              </button>
            </div>

            <p className="logo-filename">
              {profile.logoName || "No image selected yet"}
            </p>
          </div>
        </section>

        <section className="admin-profile-card">
          <div className="profile-card-header">
            <div>
              <h2>Certificate Header Preview</h2>
              <p>This is how the logos will appear when generating certificates.</p>
            </div>
          </div>

          <div className="certificate-header-preview">
            <img src={bagongPilipinasLogo} alt="Bagong Pilipinas logo" />
            <div>
              <p>Republic of the Philippines</p>
              <p>Province / Municipality</p>
              <h3>Barangay Name</h3>
              <span>Office of the Punong Barangay</span>
            </div>
            {logoPreview ? (
              <img src={logoPreview} alt="Barangay logo preview" />
            ) : (
              <div className="preview-logo-placeholder">Barangay Logo</div>
            )}
          </div>

          <div className="profile-detail-list compact">
            <div>
              <span>Username</span>
              <strong>{user.username || "-"}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{user.email || "-"}</strong>
            </div>
            <div>
              <span>Barangay ID</span>
              <strong>{user.barangayId || "-"}</strong>
            </div>
            <div>
              <span>Last Saved</span>
              <strong>{formatDate(profile.updatedAt)}</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="sticky-profile-actions">
        <span>
          {isDirty
            ? "You have unsaved profile changes."
            : "Profile is up to date."}
        </span>

        <button
          className="save-profile-btn"
          onClick={handleSave}
          disabled={saving || !isDirty}
          type="button"
        >
          <FiSave />
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
