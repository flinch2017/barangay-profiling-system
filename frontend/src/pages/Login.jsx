import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { loginUser } from "../services/authService";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(username, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "resident") {
        navigate("/resident/portal");
      } else if (data.user.role === "system_admin") {
        navigate("/system/dashboard");
      } else {
        navigate("/barangay/dashboard");
      }
    } catch {
      alert("Invalid Login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">

      {/* LEFT PANEL */}
      <div className="login-left">
        <div className="branding">
          <h1>Barangay Profiling System</h1>
          <p>
            A centralized platform for resident profiling,
            certificate generation, and barangay administration.
          </p>
          <span>c 2026 Dossier Creatives</span>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-card">

          <h2>Sign In</h2>
          <p>Enter your credentials to continue</p>

          <form onSubmit={handleSubmit}>

            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label>Password</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="password-visibility-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                !username.trim() ||
                !password.trim()
              }
            >
              {loading ? "Signing in..." : "Login"}
            </button>

          </form>

          <div className="signup-text">
            Need a barangay admin account?{" "}
            <Link to="/signup/barangay-admin">
              Sign up
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
