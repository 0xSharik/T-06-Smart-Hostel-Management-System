/**
 * src/pages/warden/QRScanPage.jsx — QR Visitor Pass Generator & Browser Scanner
 * Enhanced premium UI design with proper error handling for DB connection issues.
 */

import { useState } from "react";
import { QrCode, Scan, CheckCircle2, AlertCircle, Download, Copy, Clock, User, Phone, Heart, Shield, RefreshCw, Printer } from "lucide-react";
import { visitorAPI } from "../../api";
import toast from "react-hot-toast";

export default function QRScanPage() {
  const [activeTab, setActiveTab] = useState("scan");
  const [scanResult, setScanResult] = useState(null);
  const [manualToken, setManualToken] = useState("");
  const [loading, setLoading] = useState(false);

  // QR Generation form state
  const [genForm, setGenForm] = useState({ studentId: "", name: "", phone: "", relation: "", purpose: "" });
  const [generatedQR, setGeneratedQR] = useState(null);

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;

    setLoading(true);
    try {
      const res = await visitorAPI.scanQR(manualToken.trim());
      setScanResult({
        success: true,
        message: "Visitor QR Verified & Entry Logged!",
        visitor: res.data?.data,
        timestamp: new Date().toLocaleTimeString("en-IN"),
      });
      toast.success("Visitor entry logged via QR pass!");
      setManualToken("");
    } catch (err) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || "Invalid or Expired QR Pass Token!",
        timestamp: new Date().toLocaleTimeString("en-IN"),
      });
      toast.error("QR Verification failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await visitorAPI.generateQR(genForm);
      const data = res.data?.data;
      setGeneratedQR({
        token: data.qrToken,
        qrUrl: data.qrImageDataUrl,
        studentId: genForm.studentId,
        visitorName: genForm.name,
        phone: genForm.phone,
        relation: genForm.relation,
        purpose: genForm.purpose || "General Visit",
        expiresIn: data.expiresAt ? new Date(data.expiresAt).toLocaleString("en-IN") : "8 Hours",
        generatedAt: new Date().toLocaleTimeString("en-IN"),
      });
      toast.success("QR Pass generated successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to generate QR pass.";
      if (msg.includes("database") || msg.includes("connection")) {
        toast.error("Database connection issue. Please try again in a moment.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (generatedQR?.token) {
      navigator.clipboard.writeText(generatedQR.token).then(() => toast.success("Token copied to clipboard!"));
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "var(--radius-md)",
              background: "var(--gradient-brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--shadow-glow)",
            }}>
              <QrCode size={20} color="white" />
            </div>
            QR Visitor Pass System
          </h1>
          <p style={{ marginTop: 4 }}>Generate time-limited signed passes or verify visitor QR codes at the hostel entry gate.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "scan" ? "active" : ""}`}
          onClick={() => setActiveTab("scan")}
        >
          <Scan size={15} style={{ display: "inline", marginRight: 6 }} />
          Gate Scanner
        </button>
        <button
          className={`tab-btn ${activeTab === "generate" ? "active" : ""}`}
          onClick={() => setActiveTab("generate")}
        >
          <QrCode size={15} style={{ display: "inline", marginRight: 6 }} />
          Generate Pass
        </button>
      </div>

      {/* ─── TAB 1: SCANNER ─────────────────────────────────────────── */}
      {activeTab === "scan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
          <div className="grid-2" style={{ alignItems: "start" }}>
            {/* Scanner Viewfinder Card */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{
                background: "linear-gradient(135deg, #0a0e1a 0%, #111827 100%)",
                padding: "var(--space-xl)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent-success)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
                  ● Live Gate Scanner
                </div>
                {/* Animated scanner viewfinder */}
                <div className="webcam-container" style={{ maxWidth: 320, margin: "0 auto", background: "#050810", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                  <div className="scan-overlay">
                    <div className="scan-frame" style={{ position: "relative" }}>
                      {/* Corner decorations */}
                      {[
                        { top: -2, left: -2, borderRight: "none", borderBottom: "none" },
                        { top: -2, right: -2, borderLeft: "none", borderBottom: "none" },
                        { bottom: -2, left: -2, borderRight: "none", borderTop: "none" },
                        { bottom: -2, right: -2, borderLeft: "none", borderTop: "none" },
                      ].map((style, i) => (
                        <div key={i} style={{
                          position: "absolute",
                          width: 20, height: 20,
                          border: "3px solid #10b981",
                          ...style,
                        }} />
                      ))}
                    </div>
                  </div>
                  <div style={{
                    display: "flex", height: "100%", alignItems: "center",
                    justifyContent: "center", color: "#1e3a2f",
                    flexDirection: "column", gap: 12, padding: "2rem"
                  }}>
                    <QrCode size={64} color="rgba(16,185,129,0.15)" />
                    <span style={{ fontSize: "0.75rem", color: "rgba(16,185,129,0.4)", maxWidth: 200 }}>
                      Camera access not available — use manual token entry below
                    </span>
                  </div>
                </div>
                <p style={{ marginTop: "1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  Align the visitor's QR pass inside the frame
                </p>
              </div>

              {/* Manual Token Entry */}
              <div style={{ padding: "var(--space-xl)", borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                  Paste Token / Barcode Scanner Input
                </div>
                <form onSubmit={handleManualVerify}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      className="form-input"
                      placeholder="Paste QR token or scan with barcode reader..."
                      value={manualToken}
                      onChange={e => setManualToken(e.target.value)}
                      style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ whiteSpace: "nowrap" }}>
                      {loading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><Scan size={15} /> Verify</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Scan result */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              {scanResult ? (
                <div className="card" style={{
                  borderColor: scanResult.success ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)",
                  background: scanResult.success
                    ? "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(5,150,105,0.04) 100%)"
                    : "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(220,38,38,0.04) 100%)",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                      background: scanResult.success ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {scanResult.success
                        ? <CheckCircle2 size={26} color="#10b981" />
                        : <AlertCircle size={26} color="#ef4444" />
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "1rem", color: scanResult.success ? "#34d399" : "#f87171" }}>
                        {scanResult.success ? "✅ ACCESS GRANTED" : "❌ ACCESS DENIED"}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: 4 }}>
                        {scanResult.message}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={12} /> Scanned at {scanResult.timestamp}
                      </div>
                    </div>
                  </div>

                  {scanResult.success && scanResult.visitor && (
                    <div style={{
                      marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(16,185,129,0.15)",
                      display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem"
                    }}>
                      {[
                        { icon: User, label: "Visitor", value: scanResult.visitor.name },
                        { icon: Phone, label: "Phone", value: scanResult.visitor.phone },
                        { icon: Heart, label: "Relation", value: scanResult.visitor.relation },
                        { icon: Shield, label: "Room", value: scanResult.visitor.student?.room?.roomNo || "—" },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Icon size={13} color="var(--accent-success)" />
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}:</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: 500 }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="card" style={{ textAlign: "center", padding: "3rem var(--space-xl)" }}>
                  <div style={{ opacity: 0.3, marginBottom: "1rem" }}>
                    <Scan size={48} color="var(--text-muted)" />
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                    Scan result will appear here after verification
                  </div>
                </div>
              )}

              {/* Instructions card */}
              <div className="card" style={{ background: "rgba(99,102,241,0.04)", borderColor: "rgba(99,102,241,0.15)" }}>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)", marginBottom: "0.75rem" }}>
                  How it works
                </div>
                {[
                  "Student requests a QR pass from the Warden",
                  "Warden generates a signed 8-hour pass with visitor details",
                  "Visitor shows QR code at the gate on arrival",
                  "Guard scans or pastes the token to verify entry",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", background: "var(--gradient-brand)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.6875rem", fontWeight: 700, color: "white", flexShrink: 0,
                    }}>{i + 1}</div>
                    <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: GENERATE PASS ───────────────────────────────────── */}
      {activeTab === "generate" && (
        <div className="grid-2" style={{ alignItems: "start" }}>
          {/* Form */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "var(--radius-sm)",
                background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <QrCode size={18} color="var(--accent-primary)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>Issue Visitor Pass</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Valid for 8 hours · Cryptographically signed</div>
              </div>
            </div>

            <form onSubmit={handleGenerateQR}>
              <div className="form-group">
                <label className="form-label">Student Roll No / ID</label>
                <input
                  className="form-input"
                  placeholder="e.g. ST2024001 or cuid..."
                  required
                  value={genForm.studentId}
                  onChange={e => setGenForm(f => ({ ...f, studentId: e.target.value }))}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Visitor Full Name</label>
                  <input
                    className="form-input"
                    placeholder="Full name"
                    required
                    value={genForm.name}
                    onChange={e => setGenForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    placeholder="9876543210"
                    required
                    value={genForm.phone}
                    onChange={e => setGenForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Relation to Student</label>
                  <select
                    className="form-select"
                    value={genForm.relation}
                    onChange={e => setGenForm(f => ({ ...f, relation: e.target.value }))}
                    required
                  >
                    <option value="">Select relation</option>
                    {["Father", "Mother", "Sibling", "Guardian", "Friend", "Relative", "Other"].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose (optional)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Fee payment"
                    value={genForm.purpose}
                    onChange={e => setGenForm(f => ({ ...f, purpose: e.target.value }))}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "0.5rem", justifyContent: "center" }}
                disabled={loading}
              >
                {loading
                  ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating…</>
                  : <><QrCode size={17} /> Generate Signed QR Pass</>
                }
              </button>
            </form>
          </div>

          {/* QR Pass Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            {generatedQR ? (
              <>
                {/* Pass card — premium hostel ID card style */}
                <div style={{
                  background: "linear-gradient(145deg, #1a2035 0%, #1e2a4a 50%, #1a2035 100%)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: "var(--radius-xl)",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
                }}>
                  {/* Pass Header */}
                  <div style={{
                    background: "var(--gradient-brand)",
                    padding: "1rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <div>
                      <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        Smart Hostel Management
                      </div>
                      <div style={{ fontWeight: 800, color: "white", fontSize: "1rem" }}>
                        🔐 Visitor Entry Pass
                      </div>
                    </div>
                    <div style={{
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.25rem 0.75rem",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "white",
                    }}>
                      8h PASS
                    </div>
                  </div>

                  {/* Pass Body */}
                  <div style={{ padding: "1.5rem", display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                    {/* QR Code */}
                    <div style={{
                      background: "white",
                      borderRadius: "var(--radius-md)",
                      padding: "0.75rem",
                      flexShrink: 0,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    }}>
                      <img src={generatedQR.qrUrl} alt="Visitor QR Pass" style={{ width: 130, height: 130, display: "block" }} />
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: "1.125rem", color: "white", marginBottom: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {generatedQR.visitorName}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "1rem" }}>
                        {generatedQR.relation} of Student
                      </div>

                      {[
                        { icon: Phone, label: "Phone", value: generatedQR.phone },
                        { icon: Shield, label: "Student ID", value: generatedQR.studentId.substring(0, 20) + (generatedQR.studentId.length > 20 ? "…" : "") },
                        { icon: Heart, label: "Purpose", value: generatedQR.purpose },
                        { icon: Clock, label: "Expires", value: generatedQR.expiresIn },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                          <Icon size={12} color="rgba(99,102,241,0.8)" />
                          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", minWidth: 60 }}>{label}</span>
                          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pass Footer */}
                  <div style={{
                    borderTop: "1px dashed rgba(99,102,241,0.2)",
                    padding: "1rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)" }}>
                      Generated: {generatedQR.generatedAt}
                    </div>
                    <span className="badge badge-success" style={{ fontSize: "0.625rem" }}>● ACTIVE PASS</span>
                  </div>
                </div>

                {/* Token textarea */}
                <div className="card" style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                      Signed QR Token
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={copyToken}>
                        <Copy size={13} /> Copy
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="form-textarea"
                    readOnly
                    value={generatedQR.token}
                    style={{ minHeight: 72, fontSize: "0.6875rem", fontFamily: "var(--font-mono)", resize: "none", color: "var(--text-muted)" }}
                  />
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", marginBottom: 0 }}>
                    Share this token with the visitor for gate entry. It expires in 8 hours.
                  </p>
                </div>

                {/* Reset button */}
                <button type="button" className="btn btn-secondary" onClick={() => setGeneratedQR(null)} style={{ width: "100%", justifyContent: "center" }}>
                  <RefreshCw size={15} /> Generate New Pass
                </button>
              </>
            ) : (
              <div className="card" style={{
                textAlign: "center", padding: "3rem var(--space-xl)",
                background: "linear-gradient(145deg, rgba(99,102,241,0.03), transparent)",
                borderColor: "rgba(99,102,241,0.1)",
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "var(--radius-lg)",
                  background: "rgba(99,102,241,0.08)", border: "1px dashed rgba(99,102,241,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1rem",
                }}>
                  <QrCode size={32} color="rgba(99,102,241,0.4)" />
                </div>
                <div style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  No Pass Generated Yet
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", maxWidth: 280, margin: "0 auto" }}>
                  Fill the form on the left and click "Generate Signed QR Pass" to create a cryptographically secured 8-hour visitor entry pass.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
