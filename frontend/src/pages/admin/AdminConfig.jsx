/**
 * src/pages/admin/AdminConfig.jsx — Hostel System Configuration
 */
import { useState } from "react";
import { Settings2, Save, Building2, Users, CalendarClock } from "lucide-react";
import toast from "react-hot-toast";

const defaultConfig = {
  hostelName: "SmartHostel University Residence",
  totalFloors: "10",
  roomsPerFloor: "50",
  defaultLeaveDays: "3",
  gateClosingTime: "22:00",
  visitorAllowedFrom: "08:00",
  visitorAllowedTo: "20:00",
  qrPassValidityHours: "8",
  maintenanceSLAHours: "48",
  messFeedbackWindowDays: "1",
};

export default function AdminConfig() {
  const [config, setConfig] = useState(defaultConfig);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    toast.success("Configuration saved (local session).");
    setTimeout(() => setSaved(false), 3000);
  };

  const field = (label, key, type = "text", hint = "") => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-input"
        value={config[key]}
        onChange={e => setConfig(c => ({ ...c, [key]: e.target.value }))}
      />
      {hint && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4, display: "block" }}>{hint}</span>}
    </div>
  );

  return (
    <div style={{ maxWidth: 840, margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h1>Hostel System Configuration</h1>
          <p>Configure hostel-wide operational rules, timings, and policy defaults.</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="card" style={{ marginBottom: "var(--space-xl)" }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Building2 size={18} color="var(--accent-primary)" /> Hostel Identity
            </h3>
          </div>
          <div className="grid-2">
            {field("Hostel Name", "hostelName", "text")}
            {field("Total Floors", "totalFloors", "number")}
            {field("Rooms Per Floor", "roomsPerFloor", "number")}
          </div>
        </div>

        <div className="card" style={{ marginBottom: "var(--space-xl)" }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={18} color="var(--accent-primary)" /> Visitor & Gate Policy
            </h3>
          </div>
          <div className="grid-2">
            {field("Gate Closing Time", "gateClosingTime", "time")}
            {field("Visitor Allowed From", "visitorAllowedFrom", "time")}
            {field("Visitor Allowed To", "visitorAllowedTo", "time")}
            {field("QR Pass Validity (hours)", "qrPassValidityHours", "number", "How long a generated QR visitor pass remains valid.")}
          </div>
        </div>

        <div className="card" style={{ marginBottom: "var(--space-xl)" }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarClock size={18} color="var(--accent-primary)" /> Operational Policies
            </h3>
          </div>
          <div className="grid-2">
            {field("Default Leave Duration (days)", "defaultLeaveDays", "number")}
            {field("Maintenance SLA (hours)", "maintenanceSLAHours", "number", "Time after which a pending ticket is marked as SLA breach.")}
            {field("Mess Feedback Window (days)", "messFeedbackWindowDays", "number", "Days students can submit feedback for a past meal.")}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ minWidth: 200 }}>
          <Save size={16} /> {saved ? "Configuration Saved ✓" : "Save Configuration"}
        </button>
      </form>
    </div>
  );
}
