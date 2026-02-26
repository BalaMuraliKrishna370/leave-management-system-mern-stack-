import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { leaveAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FiCalendar, FiAlertCircle } from "react-icons/fi";
import "../styles/Form.css";

const ApplyLeave = () => {
  const [formData, setFormData] = useState({
    leaveType: "earned",
    fromDate: "",
    toDate: "",
    reason: ""
  });
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    fetchBalance();
  }, [isAuthenticated, navigate]);

  const fetchBalance = async () => {
    try {
      const res = await leaveAPI.getBalance();
      console.log("balance fetched", res.data.data);
      // ensure numeric values
      const bal = {
        earnedLeaves: Number(res.data.data.earnedLeaves) || 0,
        sickLeaves: Number(res.data.data.sickLeaves) || 0
      };
      setBalance(bal);
    } catch (err) {
      console.error("Failed to fetch balance", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const MAX_DAYS = 30;

  const calculateDays = () => {
    if (!formData.fromDate || !formData.toDate) return 0;
    const start = new Date(formData.fromDate);
    const end = new Date(formData.toDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const availableDaysRaw = formData.leaveType === "earned" ? balance?.earnedLeaves : balance?.sickLeaves;
  // if balance is above cap we consider it invalid per user request
  const invalidBalance = availableDaysRaw > MAX_DAYS;
  const availableDays = invalidBalance ? 0 : availableDaysRaw;

  const requestedDays = calculateDays();
  const remainingDays = availableDays != null ? availableDays - requestedDays : 0;
  const hasEnoughDays = requestedDays <= availableDays;
  const exceedsMaxRequest = requestedDays > MAX_DAYS; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // debug values (remove later if undesired)
    console.log("applyLeave check", {
      availableDays,
      requestedDays,
      hasEnoughDays,
      exceedsMaxRequest
    });

    // Validation
    if (!formData.fromDate || !formData.toDate || !formData.reason) {
      setError("Please fill all fields");
      return;
    }

    if (formData.reason.length < 10) {
      setError("Reason must be at least 10 characters");
      return;
    }

    if (exceedsMaxRequest) {
      setError(`Cannot request more than ${MAX_DAYS} days in one application`);
      return;
    }

    if (!hasEnoughDays) {
      if (availableDays === 0) {
        setError("❌ No more leaves available");
      } else {
        setError(`You only have ${availableDays} ${formData.leaveType} leaves available`);
      }
      return;
    }

    setLoading(true);

    try {
      await leaveAPI.applyLeave(formData);
      setSuccess("Leave application submitted successfully!");
      setFormData({
        leaveType: "earned",
        fromDate: "",
        toDate: "",
        reason: ""
      });
      setTimeout(() => navigate("/history"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h1>
            <FiCalendar /> Apply for Leave
          </h1>
          <p>Submit your leave request for approval</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Leave Type */}
          <div className="form-group mb-4">
            <label htmlFor="leaveType" className="form-label">
              Leave Type
            </label>
            <select
              className="form-control form-control-lg"
              id="leaveType"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              disabled={availableDays === 0}
            >
              <option value="earned">Earned Leave</option>
              <option value="sick">Sick Leave</option>
            </select>
            {invalidBalance ? (
              <small className="text-danger fw-bold">
                ❌ Balance exceeds {MAX_DAYS} days – cannot apply. Contact admin.
              </small>
            ) : availableDays === 0 ? (
              <small className="text-danger fw-bold">
                ❌ No more leaves available
              </small>
            ) : (
              <small className="text-muted">
                Available: {availableDays || 0} {formData.leaveType} leaves
              </small>
            )}
          </div>

          {/* From Date */}
          <div className="form-group mb-4">
            <label htmlFor="fromDate" className="form-label">
              From Date
            </label>
            <input
              type="date"
              className="form-control form-control-lg"
              id="fromDate"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* To Date */}
          <div className="form-group mb-4">
            <label htmlFor="toDate" className="form-label">
              To Date
            </label>
            <input
              type="date"
              className="form-control form-control-lg"
              id="toDate"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              required
              min={formData.fromDate}
            />
          </div>

          {/* Days Summary */}
          {formData.fromDate && formData.toDate && (
            <div className="days-summary mb-4">
              <div className="summary-item">
                <span>Total Days:</span>
                <strong>{requestedDays} day(s)</strong>
              </div>
              <div className="summary-item">
                <span>Available:</span>
                <strong>{availableDays != null ? availableDays : 0} day(s)</strong>
              </div>
              <div className="summary-item">
                <span>Remaining:</span>
                <strong
                  className={
                    exceedsMaxRequest
                      ? "text-warning"
                      : hasEnoughDays
                      ? "text-success"
                      : "text-danger"
                  }
                >
                  {availableDays != null ? remainingDays : 0} day(s)
                </strong>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="form-group mb-4">
            <label htmlFor="reason" className="form-label">
              Reason for Leave
            </label>
            <textarea
              className="form-control form-control-lg"
              id="reason"
              name="reason"
              placeholder="Provide details about your leave request..."
              value={formData.reason}
              onChange={handleChange}
              rows="4"
              required
            />
            <small className="text-muted">
              {formData.reason.length}/500 characters
            </small>
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={
                loading || !hasEnoughDays || availableDays === 0 || exceedsMaxRequest || invalidBalance
              }
            >
              {loading ? "Submitting..." : "Apply for Leave"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-lg"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
          </div>
        </form>

        {!hasEnoughDays && formData.fromDate && (
          <div className="alert alert-warning mt-3">
            <FiAlertCircle className="me-2" />
            You don't have enough {formData.leaveType} leaves for this period
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyLeave;