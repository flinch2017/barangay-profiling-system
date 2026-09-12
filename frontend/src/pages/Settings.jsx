import { useEffect, useState } from "react";
import { FiEdit2, FiKey, FiMail, FiMoon, FiSend, FiSun, FiUser } from "react-icons/fi";
import { apiUrl } from "../lib/api";
import "../styles/settings.css";

export default function Settings() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [editing, setEditing] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("bpsTheme") || "light");

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("bpsTheme", theme); }, [theme]);
  async function updateAccount(payload) {
    setSaving(true); setMessage("");
    try {
      const response = await fetch(apiUrl("/api/auth/profile"), { method: "PUT", headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" }, body: JSON.stringify({ username, email, ...payload }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message);
      localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("barangay-profile-updated")); setEditing(""); setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" }); setMessage("Account settings updated.");
    } catch (error) { setMessage(error.message || "Unable to update settings."); } finally { setSaving(false); }
  }
  function saveIdentity(field) { updateAccount({}); if (field === "username") setUsername(username.trim()); if (field === "email") setEmail(email.trim()); }
  function savePassword() { if (passwords.newPassword !== passwords.confirmPassword) return setMessage("New passwords do not match."); updateAccount(passwords); }
  return <main className="settings-page"><header className="settings-heading"><span>ACCOUNT</span><h1>Settings</h1><p>Manage your BPS account preferences and support options.</p></header>{message && <div className="settings-message">{message}</div>}<section className="settings-card"><div className="settings-card-heading"><div><FiUser /><div><h2>Account Center</h2><p>Update your sign-in information.</p></div></div></div><SettingRow icon={<FiUser />} label="Username" value={username} editing={editing === "username"} onEdit={() => setEditing("username")} onCancel={() => setEditing("")} onSave={() => saveIdentity("username")} saving={saving}><input value={username} onChange={(event) => setUsername(event.target.value)} /></SettingRow><SettingRow icon={<FiMail />} label="Email address" value={email} editing={editing === "email"} onEdit={() => setEditing("email")} onCancel={() => setEditing("")} onSave={() => saveIdentity("email")} saving={saving}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></SettingRow><div className="settings-row"><div className="settings-row-label"><FiKey /><div><strong>Password</strong><span>Use exactly 8 characters with uppercase, lowercase, number, and special character.</span></div></div>{editing !== "password" ? <button onClick={() => setEditing("password")}>Change password</button> : <div className="settings-edit-panel"><input type="password" placeholder="Current password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} /><input type="password" placeholder="New password" maxLength="8" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} /><input type="password" placeholder="Confirm new password" maxLength="8" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} /><div><button onClick={() => setEditing("")}>Cancel</button><button className="settings-primary" disabled={saving} onClick={savePassword}>Save password</button></div></div>}</div></section><section className="settings-card"><div className="settings-card-heading"><div><FiSun /><div><h2>Theme</h2><p>Choose how BPS appears on this device.</p></div></div></div><div className="theme-options"><button className={theme === "light" ? "selected" : ""} onClick={() => setTheme("light")}><FiSun />Light</button><button className={theme === "dark" ? "selected" : ""} onClick={() => setTheme("dark")}><FiMoon />Dark</button></div></section><section className="settings-card"><div className="settings-card-heading"><div><FiSend /><div><h2>Report a problem</h2><p>Tell the BPS support team about an issue.</p></div></div><a href="mailto:support@example.com?subject=BPS%20Problem%20Report">Report a problem</a></div></section></main>;
}
function SettingRow({ icon, label, value, editing, onEdit, onCancel, onSave, saving, children }) { return <div className="settings-row"><div className="settings-row-label">{icon}<div><strong>{label}</strong>{editing ? children : <span>{value || "Not set"}</span>}</div></div>{editing ? <div className="settings-row-actions"><button onClick={onCancel}>Cancel</button><button className="settings-primary" onClick={onSave} disabled={saving}>Save</button></div> : <button onClick={onEdit}><FiEdit2 />Edit</button>}</div>; }
