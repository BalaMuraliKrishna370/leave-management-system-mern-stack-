import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { leaveAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FiCalendar, FiAlertCircle, FiCheckCircle, FiClock } from "react-icons/fi";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [balance, setBalance] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balanceRes, leavesRes] = await Promise.all([
        leaveAPI.getBalance(),
        leaveAPI.myLeaves(1, "")
      ]);

      setBalance(balanceRes.data.data);

      // Calculate stats
      const leaves = leavesRes.data.data.leaves;
      setStats({
        pending: leaves.filter((l) => l.status === "pending").length,
        approved: leaves.filter((l) => l.status === "approved").length,
        rejected: leaves.filter((l) => l.status === "rejected").length
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name}! 👋</h1>
          <p>Manage your leaves efficiently</p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate("/apply")}
        >
          <FiCalendar className="me-2" />
          Apply for Leave
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Leave Balance Cards */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="balance-card earned">
            <div className="balance-icon">🎖️</div>
            <div className="balance-content">
              <h3>Earned Leaves</h3>
              <div className="balance-value">{balance?.earnedLeaves || 0}</div>
              <p>Out of 12 days</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="balance-card sick">
            <div className="balance-icon">🏥</div>
            <div className="balance-content">
              <h3>Sick Leaves</h3>
              <div className="balance-value">{balance?.sickLeaves || 0}</div>
              <p>Out of 12 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row">
        <div className="col-md-4">
          <div className="stat-card pending">
            <div className="stat-icon">
              <FiClock />
            </div>
            <div className="stat-content">
              <h4>Pending</h4>
              <p className="stat-value">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card approved">
            <div className="stat-icon">
              <FiCheckCircle />
            </div>
            <div className="stat-content">
              <h4>Approved</h4>
              <p className="stat-value">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card rejected">
            <div className="stat-icon">
              <FiAlertCircle />
            </div>
            <div className="stat-content">
              <h4>Rejected</h4>
              <p className="stat-value">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions mt-5">
        <h3>Quick Actions</h3>
        <div className="row">
          <div className="col-md-6">
            <button
              className="action-btn"
              onClick={() => navigate("/apply")}
            >
              <FiCalendar />
              <span>Apply for Leave</span>
            </button>
          </div>
          <div className="col-md-6">
            <button
              className="action-btn"
              onClick={() => navigate("/history")}
            >
              <FiCheckCircle />
              <span>View Leave History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;