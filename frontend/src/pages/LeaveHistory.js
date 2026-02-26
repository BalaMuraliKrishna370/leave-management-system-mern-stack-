import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { leaveAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FiFilter, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "../styles/Table.css";

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    fetchLeaves();
  }, [isAuthenticated, navigate, page, statusFilter]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await leaveAPI.myLeaves(page, statusFilter);
      setLeaves(res.data.data.leaves);
      setTotalPages(res.data.data.pages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leaves");
    } finally {
      setLoading(false);
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

  const getTypeIcon = (leaveType) => {
    return leaveType === "earned" ? "🎖️" : "🏥";
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
          <h1>My Leave Requests</h1>
          <p>Track and manage your leave applications</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

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
                <th>Type</th>
                <th>Period</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>
                    <span className="type-badge">
                      {getTypeIcon(leave.leaveType)}
                      {leave.leaveType === "earned" ? "Earned" : "Sick"}
                    </span>
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
                    <small>{formatDate(leave.createdAt)}</small>
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
            <FiChevronLeft /> Previous
          </button>
          <span className="page-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaveHistory;