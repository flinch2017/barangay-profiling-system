import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupBarangayAdmin } from "../services/authService";
import "../styles/global.css";
import "../styles/signup.css";

export default function BarangaySignup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [barangayId, setBarangayId] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await signupBarangayAdmin(
        username,
        email,
        password,
        barangayId,
        "barangay_admin"
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/barangay/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create barangay admin account"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-wrapper">

      <div className="signup-card card">

        <h1 className="signup-title">
          Barangay Admin Registration
        </h1>

        <p className="signup-subtitle">
          Create an administrator account for a barangay unit
        </p>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">

          <div className="form-group">
            <label>Username</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Barangay ID</label>
            <input
              className="input"
              value={barangayId}
              onChange={(e) => setBarangayId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <input
              className="input"
              value="Barangay Admin"
              disabled
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button
            className="btn btn-primary signup-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="signup-footer">
          Already have an account?{" "}
          <Link to="/" className="link">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}