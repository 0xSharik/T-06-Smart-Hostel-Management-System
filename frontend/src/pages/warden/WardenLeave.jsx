/**
 * src/pages/warden/WardenLeave.jsx — Warden Leave Request Approval Queue
 */

import { useQuery, useMutation, useQueryClient } from "react-query";
import { CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { holidayAPI } from "../../api";
import toast from "react-hot-toast";

export default function WardenLeave() {
  const qc = useQueryClient();

  const { data: leavesRes, isLoading } = useQuery("warden-leave-requests", () => holidayAPI.getLeaveRequests());

  const items = Array.isArray(leavesRes?.data?.data) ? leavesRes.data.data : [];

  const statusMutation = useMutation(({ id, status }) => holidayAPI.updateLeaveStatus(id, status), {
    onSuccess: (_, variables) => {
      toast.success(`Leave request ${variables.status.toLowerCase()}!`);
      qc.invalidateQueries("warden-leave-requests");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update leave request"),
  });

  const handleAction = (id, status) => {
    statusMutation.mutate({ id, status });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Leave & Holiday Checkout Queue</h1>
          <p>Review student holiday leave applications, approve checkouts, and verify student returns.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Reason</th>
                <th>Departure Date</th>
                <th>Expected Return</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6}><div className="loading-center"><div className="spinner" /></div></td></tr>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.student?.user?.name || "Student"}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.student?.rollNo || "Roll N/A"} {item.student?.room?.roomNo ? `| Room ${item.student.room.roomNo}` : ""}</div>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{item.title || item.reason || "Holiday Leave"}</td>
                    <td>{new Date(item.fromDate || item.date || Date.now()).toLocaleDateString()}</td>
                    <td>{item.toDate ? new Date(item.toDate).toLocaleDateString() : "—"}</td>
                    <td>
                      <span className={`badge ${item.status === "APPROVED" ? "badge-success" : item.status === "REJECTED" ? "badge-danger" : "badge-warning"}`}>
                        {item.status || "PENDING"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleAction(item.id, "APPROVED")} disabled={statusMutation.isLoading || item.status === "APPROVED"}>
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleAction(item.id, "REJECTED")} disabled={statusMutation.isLoading || item.status === "REJECTED"}>
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <CalendarDays size={40} />
                      <h3>No pending leave applications</h3>
                      <p>All student holiday checkout requests have been processed.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
