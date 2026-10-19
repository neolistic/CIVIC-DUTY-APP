import api from "../api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getValidToken } from "../utils/auth";

// Registration screen for creating a new user account.
// It stores the token after a successful account creation.
function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Register - Civic Issues Reporting";
  }, []);

  // Register a new user account and immediately sign them in on success.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (trimmedPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        email: trimmedEmail,
        password: trimmedPassword,
        name: trimmedName,
      });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Registration failed. Please check your details and try again.",
      );
      console.error("Registration failed", error);
    }
  };

  useEffect(() => {
    const token = getValidToken();
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="tag">Create account</span>
        <h2>Join Civic Duty</h2>
        <p className="muted">
          Create an account to report and track community issues.
        </p>
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={handleSubmit} className="stack-form">
          <div className="field-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="field-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              minLength={8}
              required
            />
          </div>
          <button className="primary-button" type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
