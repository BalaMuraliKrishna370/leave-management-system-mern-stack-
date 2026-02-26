import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import "../styles/Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee" // can be set to "admin" for testing
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      
      await authAPI.register(formData);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join our Leave Management System</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="name" className="form-label">
              <FiUser className="me-2" /> Full Name
            </label>
            <input
              type="text"
              className="form-control form-control-lg"
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="email" className="form-label">
              <FiMail className="me-2" /> Email Address
            </label>
            <input
              type="email"
              className="form-control form-control-lg"
              id="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="password" className="form-label">
              <FiLock className="me-2" /> Password
            </label>
            <div className="password-input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control form-control-lg"
                id="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="form-group mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              <FiLock className="me-2" /> Confirm Password
            </label>
            <div className="password-input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control form-control-lg"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Admin toggle - only for development/testing purposes */}
          <div className="form-group mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="isAdmin"
                checked={formData.role === "admin"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: e.target.checked ? "admin" : "employee"
                  }))
                }
              />
              <label className="form-check-label" htmlFor="isAdmin">
                Register as administrator (for testing only)
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 btn-lg mb-3"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="divider">or</div>

        <p className="text-center">
          Already have an account?{" "}
          <Link to="/" className="link-primary fw-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;