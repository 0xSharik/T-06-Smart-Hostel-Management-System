/**
 * src/pages/RoomsPage.jsx
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Plus, Trash2, Search, DoorOpen, X, BedDouble } from "lucide-react";
import { roomAPI } from "../api";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  AVAILABLE: "badge-success",
  OCCUPIED: "badge-indigo",
  FULL: "badge-warning",
  MAINTENANCE: "badge-danger",
};

const TYPE_LABELS = { SINGLE: "Single (1)", DOUBLE: "Double (2)", TRIPLE: "Triple (3)", QUAD: "Quad (4)", QUINT: "Quint (5)" };

export default function RoomsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState({ status: "", type: "", floor: "" });
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ roomNo: "", floor: "", type: "SINGLE", capacity: 1, amenities: "" });

  const { data: statsRes } = useQuery("room-stats", roomAPI.getStats);
  const { data, isLoading } = useQuery(
    ["rooms", page, filter],
    () => roomAPI.getAll({ page, limit: 15, ...filter }),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(roomAPI.delete, {
    onSuccess: () => { qc.invalidateQueries("rooms"); qc.invalidateQueries("room-stats"); qc.invalidateQueries("warden-all-rooms"); qc.invalidateQueries("floor-occupancy"); qc.invalidateQueries("warden-floor-occupancy"); qc.invalidateQueries("dashboard-stats"); qc.invalidateQueries("warden-dash-stats"); toast.success("Room deleted"); },
    onError: (e) => toast.error(e.response?.data?.message || "Delete failed"),
  });

  const createMutation = useMutation(roomAPI.create, {
    onSuccess: () => { qc.invalidateQueries("rooms"); qc.invalidateQueries("room-stats"); qc.invalidateQueries("warden-all-rooms"); qc.invalidateQueries("floor-occupancy"); qc.invalidateQueries("warden-floor-occupancy"); qc.invalidateQueries("dashboard-stats"); qc.invalidateQueries("warden-dash-stats"); setShowModal(false); toast.success("Room created"); },
    onError: (e) => toast.error(e.response?.data?.message || "Create failed"),
  });

  const stats = statsRes?.data?.data;
  const rooms = data?.data?.data;
  const meta = data?.data?.meta;

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      floor: parseInt(form.floor),
      capacity: parseInt(form.capacity),
      amenities: form.amenities ? form.amenities.split(",").map(a => a.trim()).filter(Boolean) : [],
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Rooms</h1>
          <p>Manage hostel rooms, capacity, and assignments.</p>
        </div>
        <button id="add-room-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Room
        </button>
      </div>

      {/* Stats Strip */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: "var(--space-xl)" }}>
          <div className="stat-card"><div className="stat-icon indigo"><DoorOpen size={24} /></div><div className="stat-info"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Rooms</div></div></div>
          <div className="stat-card"><div className="stat-icon emerald"><BedDouble size={24} /></div><div className="stat-info"><div className="stat-value">{stats.available}</div><div className="stat-label">Available</div></div></div>
          <div className="stat-card"><div className="stat-icon violet"><BedDouble size={24} /></div><div className="stat-info"><div className="stat-value">{stats.occupied + stats.full}</div><div className="stat-label">Occupied</div></div></div>
          <div className="stat-card"><div className="stat-icon amber"><BedDouble size={24} /></div><div className="stat-info"><div className="stat-value">{stats.occupancyRate}%</div><div className="stat-label">Occupancy Rate</div></div></div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <select id="room-status-filter" className="form-select" style={{ width: 160 }} value={filter.status} onChange={e => { setFilter(f => ({ ...f, status: e.target.value })); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="FULL">Full</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
        <select id="room-type-filter" className="form-select" style={{ width: 160 }} value={filter.type} onChange={e => { setFilter(f => ({ ...f, type: e.target.value })); setPage(1); }}>
          <option value="">All Types</option>
          <option value="SINGLE">Single (1-seater)</option>
          <option value="DOUBLE">Double (2-seater)</option>
          <option value="TRIPLE">Triple (3-seater)</option>
          <option value="QUAD">Quad (4-seater)</option>
          <option value="QUINT">Quint (5-seater)</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Room No</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Occupied</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7}><div className="loading-center"><div className="spinner" /></div></td></tr>
              ) : rooms?.length > 0 ? (
                rooms.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "1rem" }}>
                        {r.roomNo}
                      </div>
                    </td>
                    <td>Floor {r.floor}</td>
                    <td><span className="badge badge-secondary">{TYPE_LABELS[r.type]}</span></td>
                    <td>{r.capacity}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{
                          height: 6,
                          width: 80,
                          background: "var(--border-subtle)",
                          borderRadius: 999,
                          overflow: "hidden"
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${r.capacity ? (r.occupancy / r.capacity) * 100 : 0}%`,
                            background: r.occupancy >= r.capacity ? "var(--accent-danger)" : "var(--accent-primary)",
                            borderRadius: 999,
                            transition: "width 0.3s ease"
                          }} />
                        </div>
                        <span style={{ fontSize: "0.875rem" }}>{r.occupancy}/{r.capacity}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${STATUS_STYLES[r.status]}`}>{r.status}</span></td>
                    <td>
                      <button className="btn btn-icon btn-secondary btn-sm" title="Delete" onClick={() => {
                        if (window.confirm(`Delete room ${r.roomNo}?`)) deleteMutation.mutate(r.id);
                      }}>
                        <Trash2 size={14} color="var(--accent-danger)" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <DoorOpen size={40} />
                    <h3>No rooms found</h3>
                    <p>Create rooms to assign students.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {meta && (
          <div className="pagination">
            <span className="pagination-info">Showing {rooms?.length || 0} of {meta.total} rooms</span>
            <div className="pagination-controls">
              <button className="btn btn-secondary btn-sm" disabled={!meta.hasPrevPage} onClick={() => setPage(p => p - 1)}>Previous</button>
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Page {meta.page} of {meta.totalPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={!meta.hasNextPage} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Add New Room</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <input id="room-roomNo" className="form-input" placeholder="101" required value={form.roomNo} onChange={e => setForm(f => ({ ...f, roomNo: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Floor</label>
                  <input id="room-floor" type="number" className="form-input" placeholder="1" min="0" required value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select id="room-type" className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="SINGLE">Single (1-seater)</option>
                    <option value="DOUBLE">Double (2-seater)</option>
                    <option value="TRIPLE">Triple (3-seater)</option>
                    <option value="QUAD">Quad (4-seater)</option>
                    <option value="QUINT">Quint (5-seater)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input id="room-capacity" type="number" className="form-input" min="1" max="10" required value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Amenities (comma-separated)</label>
                <input className="form-input" placeholder="WiFi, AC, Attached Bathroom" value={form.amenities} onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="room-create-submit" type="submit" className="btn btn-primary" disabled={createMutation.isLoading}>
                  {createMutation.isLoading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
