/**
 * src/pages/student/MyLeave.jsx — Student Leave & Holiday Checkout Requests
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { CalendarDays, Plus, XCircle, LogIn } from "lucide-react";
import { holidayAPI } from "../../api";
import toast from "react-hot-toast";

export default function MyLeave() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ reason: "", fromDate: "", toDate: "" });

  const { data: leavesRes, isLoading } = useQuery("my-leave-requests", () => holidayAPI.getLeaveRequests());

  const requests = Array.isArray(leavesRes?.data?.data) ? leavesRes.data.data : [];

  const createMutation = useMutation(holidayAPI.createLeaveRequest, {
    onSuccess: () => {
      toast.success("Leave request submitted for warden approval!");
      setShowModal(false);
      setForm({ reason: "", fromDate: "", toDate: "" });
      qc.invalidateQueries("my-leave-requests");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to submit leave request"),
  });

  const confirmReturnMutation = useMutation(holidayAPI.confirmLeaveReturn, {
    onSuccess: () => {
      toast.success("Return confirmed!");
      qc.invalidateQueries("my-leave-requests");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to confirm return"),
  });

  const handleCreateLeave = (e) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate) return toast.error("Please select dates");
    createMutation.mutate(form);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Holiday Checkout & Leave</h1>
          <p>Submit leave requests for hostel checkout during holidays and track approvals.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Request Leave
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Reason / Purpose</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Status</th>
                <th>Return Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6}><div className="loading-center"><div className="spinner" /></div></td></tr>
              ) : requests.length > 0 ? (
                requests.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{r.title || r.reason}</td>
                    <td>{new Date(r.date || r.fromDate).toLocaleDateString()}</td>
                    <td>{r.toDate ? new Date(r.toDate).toLocaleDateString() : "—"}</td>
                    <td>
                      <span className={`badge ${r.status === "APPROVED" ? "badge-success" : r.status === "REJECTED" ? "badge-danger" : "badge-warning"}`}>
                        {r.status || "PENDING"}
                      </span>
                    </td>
                    <td>
                      {r.returnConfirmed ? (
                        <span className="badge badge-success">Returned</span>
                      ) : (
                        <span className="badge badge-secondary">Not Returned</span>
                      )}
                    </td>
                    <td>
                      {r.status === "APPROVED" && !r.returnConfirmed && (
                        <button className="btn btn-success btn-sm" onClick={() => confirmReturnMutation.mutate(r.id)} disabled={confirmReturnMutation.isLoading}>
                          <LogIn size={14} /> Confirm Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <CalendarDays size={40} />
                      <h3>No leave requests</h3>
                      <p>Submit a request when planning to leave the hostel for holidays.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Request Holiday Checkout</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><XCircle size={18} /></button>
            </div>
            <form onSubmit={handleCreateLeave}>
              <div className="form-group">
                <label className="form-label">Reason for Leave</label>
                <input
                  className="form-input"
                  placeholder="e.g. Diwali Vacation / Family Visit"
                  required
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Departure Date</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={form.fromDate}
                    onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Return Date</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={form.toDate}
                    onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isLoading}>
                  {createMutation.isLoading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
