import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheck } from "react-icons/fi";
import { apiUrl } from "../lib/api";
import "../styles/residentPortal.css";

export default function ResidentNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" };
  async function loadNotifications() { try { const response = await fetch(apiUrl("/api/notifications"), { headers }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Unable to load notifications."); setNotifications(data.notifications || []); } catch (error) { setMessage(error.message); } finally { setLoading(false); } }
  useEffect(() => { loadNotifications(); }, []);
  async function markRead(id) { await fetch(apiUrl(`/api/notifications/${id}/read`), { method: "PATCH", headers }); setNotifications((items) => items.map((item) => item.notification_id === id ? { ...item, is_read: true } : item)); }
  async function markAllRead() { await fetch(apiUrl("/api/notifications/read-all"), { method: "PATCH", headers }); setNotifications((items) => items.map((item) => ({ ...item, is_read: true }))); }
  if (loading) return <div className="resident-portal"><p>Loading notifications...</p></div>;
  const unread = notifications.filter((notification) => !notification.is_read).length;
  return <main className="resident-portal"><section className="portal-card notification-card"><header className="notification-heading"><div><p className="portal-kicker">NOTIFICATIONS</p><h1>Updates for you</h1><p>{unread ? `${unread} unread notification${unread === 1 ? "" : "s"}` : "You are all caught up."}</p></div>{unread > 0 && <button type="button" onClick={markAllRead}><FiCheck /> Mark all read</button>}</header>{message && <p className="notification-message">{message}</p>}<div className="notification-list">{notifications.length ? notifications.map((notification) => <button type="button" key={notification.notification_id} className={`notification-item ${notification.is_read ? "" : "unread"}`} onClick={() => { if (!notification.is_read) markRead(notification.notification_id); if (notification.link) navigate(notification.link); }}><FiBell /><span><strong>{notification.title}</strong><small>{notification.message}</small><em>{new Date(notification.created_at).toLocaleString()}</em></span></button>) : <div className="notification-empty"><FiBell /><h2>No notifications yet</h2><p>Profile, registration, and account updates will appear here.</p></div>}</div></section></main>;
}
