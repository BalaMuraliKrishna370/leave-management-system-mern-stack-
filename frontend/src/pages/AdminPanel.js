import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { leaveAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FiFilter, FiSearch, FiBarChart2, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import "../styles/Table.css";

const AdminPanel = () => {
  const [leaves, setLeaves] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [actionLeave, setActionLeave] = useState(null);
  const [adminComments, setAdminComments] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/");
      return;
    }
    fetchData();
  }, [isAuthenticated, isAdmin, navigate, page, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leavesRes, analyticsRes] = await Promise.all([
        leaveAPI.getAllLeaves(page, statusFilter, searchKeyword),
        leaveAPI.getAnalytics()
      ]);
      setLeaves(leavesRes.data.data.leaves);
      setTotalPages(leavesRes.data.data.pages);
      setAnalytics(analyticsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = (leave) => {
    setActionLeave({ ...leave, action: "approved" });
  };

  const handleRejectLeave = (leave) => {
    setActionLeave({ ...leave, action: "rejected" });
  };

  const confirmAction = async () => {
    if (!actionLeave) return;

    try {
      await leaveAPI.updateStatus(actionLeave._id, {
        status: actionLeave.action,
        adminComments
      });
      setError("");
      setAdminComments("");
      setActionLeave(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update leave status");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: "badge-pending", text: "⏳ Pending" },
      approved: { bg: "badge-approved", text: "✓ Approved" },
      rejected: { bg: "badge-rejected", text: "✗ Rejected" }
    };
    return statusMap[status] || statusMap.pending;
  };

  if (loading && leaves.length === 0) {
    return (
      <div className="table-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage and approve leave requests</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Analytics Section */}
      {analytics && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="analytics-card">
              <div className="analytics-icon">
                <FiBarChart2 />
              </div>
              <div className="analytics-content">
                <h5>Total Requests</h5>
                <p className="analytics-value">{analytics.totalRequests}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="analytics-card">
              <div className="analytics-icon">
                <FiClock />
              </div>
              <div className="analytics-content">
                <h5>Pending</h5>
                <p className="analytics-value">{analytics.pending}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="analytics-card">
              <div className="analytics-icon">
                <FiCheckCircle />
              </div>
              <div className="analytics-content">
                <h5>Approved</h5>
                <p className="analytics-value">{analytics.approved}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="analytics-card">
              <div className="analytics-icon">
                <FiAlertCircle />
              </div>
              <div className="analytics-content">
                <h5>Rejected</h5>
                <p className="analytics-value">{analytics.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section mb-4">
        <div className="row">
          <div className="col-md-6">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Search by reason..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="filter-select">
              <FiFilter className="filter-icon" />
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive table-card">
        {leaves.length === 0 ? (
          <div className="empty-state">
            <p>No leave requests found</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Period</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>
                    <div>
                      <strong>{leave.userId?.name}</strong>
                      <div style={{ fontSize: "12px", color: "#999" }}>
                        {leave.userId?.email}
                      </div>
                    </div>
                  </td>
                  <td>
                    {leave.leaveType === "earned" ? "🎖️ Earned" : "🏥 Sick"}
                  </td>
                  <td>
                    <div className="date-range">
                      {formatDate(leave.fromDate)} to {formatDate(leave.toDate)}
                    </div>
                  </td>
                  <td>
                    <span className="reason">{leave.reason}</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(leave.status).bg}`}>
                      {getStatusBadge(leave.status).text}
                    </span>
                  </td>
                  <td>
                    {leave.status === "pending" ? (
                      <div className="status-actions">
                        <button
                          className="btn-approve"
                          onClick={() => handleApproveLeave(leave)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleRejectLeave(leave)}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted" style={{ fontSize: "12px" }}>
                        Processed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-section">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="page-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Action Modal */}
      {actionLeave && (
        <div className="modal-overlay" onClick={() => setActionLeave(null)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h5>
                {actionLeave.action === "approved"
                  ? "Approve Leave Request"
                  : "Reject Leave Request"}
              </h5>
              <button
                type="button"
                className="close-btn"
                onClick={() => setActionLeave(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body-custom">
              <p>
                <strong>Employee:</strong> {actionLeave.userId?.name}
              </p>
              <p>
                <strong>Email:</strong> {actionLeave.userId?.email}
              </p>
              <p>
                <strong>Leave Type:</strong>{" "}
                {actionLeave.leaveType === "earned" ? "Earned" : "Sick"}
              </p>
              <p>
                <strong>Period:</strong> {formatDate(actionLeave.fromDate)} to{" "}
                {formatDate(actionLeave.toDate)}
              </p>
              <p>
                <strong>Reason:</strong> {actionLeave.reason}
              </p>

              <div className="form-group mt-3">
                <label>Comments (Optional)</label>
                <textarea
                  className="form-control"
                  placeholder="Add your comments..."
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer-custom">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setActionLeave(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-${actionLeave.action === "approved" ? "success" : "danger"}`}
                onClick={confirmAction}
              >
                {actionLeave.action === "approved" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;