import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import "../styles/Navbar.css";

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar navbar-custom">
      <div className="nav-container">
        <Link to={isAuthenticated && isAdmin ? "/admin" : "/dashboard"} className="navbar-brand">
          <span className="brand-icon">📋</span>
          <span className="brand-text">Leave Management System</span>
        </Link>

    
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>


        {isAuthenticated && (
          <div className={`nav-menu ${mobileMenuOpen ? "open" : ""}`}>
            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className={`nav-link ${isActive("/admin") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/apply"
                  className={`nav-link ${isActive("/apply") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Apply Leave
                </Link>
                <Link
                  to="/history"
                  className={`nav-link ${isActive("/history") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leave History
                </Link>
              </>
            )}

            <div className="nav-user">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>

            <button className="btn-logout" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;