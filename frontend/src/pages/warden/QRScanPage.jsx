/**
 * src/pages/warden/QRScanPage.jsx — QR Visitor Pass Generator & Gate Scanner
 * Premium warden-exclusive UI with rich scan/generate section styling.
 */

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "react-query";
import {
  QrCode, Scan, CheckCircle2, AlertCircle,
  Copy, Clock, User, Phone, Heart, Shield, RefreshCw,
  Fingerprint, Zap, UserCheck, KeyRound,
} from "lucide-react";
import { visitorAPI } from "../../api";
import toast from "react-hot-toast";

export default function QRScanPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab]     = useState("scan");
  const [scanResult, setScanResult]   = useState(null);
  const [manualToken, setManualToken] = useState("");
  const [loading, setLoading]         = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const cameraRunRef = useRef(false);

  const [genForm, setGenForm]     = useState({ studentId: "", name: "", phone: "", relation: "", purpose: "" });
  const [generatedQR, setGeneratedQR] = useState(null);

  const verifyToken = async (token) => {
    if (!token.trim() || loading) return;
    setLoading(true);
    try {
      const res = await visitorAPI.scanQR(token.trim());
      setScanResult({
        success: true,
        message: "Visitor QR Verified & Entry Logged!",
        visitor: res.data?.data,
        timestamp: new Date().toLocaleTimeString("en-IN"),
      });
      toast.success("Visitor entry logged via QR pass!");
      cameraRunRef.current = false;
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
      setCameraActive(false);
      qc.invalidateQueries("visitors");
      qc.invalidateQueries("dashboard-stats");
      qc.invalidateQueries("warden-dash-stats");
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

  const handleManualVerify = (e) => {
    e.preventDefault();
    verifyToken(manualToken);
  };

  const stopCamera = () => {
    cameraRunRef.current = false;
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is unavailable in this browser or page context. Use HTTPS or localhost, or paste the QR token below.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      cameraStreamRef.current = stream;
      if (!videoRef.current) return stopCamera();
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      const detector = "BarcodeDetector" in window
        ? new window.BarcodeDetector({ formats: ["qr_code"] })
        : null;
      const jsQRDecoder = detector ? null : (await import("jsqr")).default;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });
      cameraRunRef.current = true;
      setCameraActive(true);
      const scanFrame = async () => {
        if (!cameraRunRef.current || !videoRef.current) return;
        try {
          let rawValue;
          if (detector) {
            const codes = await detector.detect(videoRef.current);
            rawValue = codes[0]?.rawValue;
          } else if (videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && context) {
            const video = videoRef.current;
            const scale = Math.min(1, 640 / video.videoWidth);
            canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
            canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            rawValue = jsQRDecoder(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, { inversionAttempts: "attemptBoth" })?.data;
          }
          if (rawValue) {
            stopCamera();
            await verifyToken(rawValue);
            return;
          }
        } catch { /* keep scanning through transient camera decode errors */ }
        if (cameraRunRef.current) window.setTimeout(scanFrame, 250);
      };
      scanFrame();
    } catch (error) {
      stopCamera();
      setCameraError(error.name === "NotAllowedError" ? "Camera access was blocked. Allow camera access or paste the QR token below." : "Could not start the camera. Paste the QR token below.");
    }
  };

  useEffect(() => () => stopCamera(), []);
  useEffect(() => { if (activeTab !== "scan") stopCamera(); }, [activeTab]);

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await visitorAPI.generateQR(genForm);
      const data = res.data?.data;
      setGeneratedQR({
        token:       data.qrToken,
        qrUrl:       data.qrImageDataUrl,
        studentId:   genForm.studentId,
        visitorName: genForm.name,
        phone:       genForm.phone,
        relation:    genForm.relation,
        purpose:     genForm.purpose || "General Visit",
        expiresIn:   data.expiresAt ? new Date(data.expiresAt).toLocaleString("en-IN") : "8 Hours",
        generatedAt: new Date().toLocaleTimeString("en-IN"),
      });
      toast.success("QR Pass generated successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to generate QR pass.";
      toast.error(msg.includes("database") ? "Database issue — try again." : msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (generatedQR?.token)
      navigator.clipboard.writeText(generatedQR.token).then(() => toast.success("Token copied!"));
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>

      <div className="page-header">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "var(--radius-lg)",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(16,185,129,0.35)",
            }}>
              <QrCode size={22} color="white" />
            </div>
            QR Visitor Pass System
          </h1>
          <p style={{ marginTop: 4, color: "var(--text-muted)" }}>
            Issue cryptographically-signed 8-hour visitor passes or verify QR codes at the entry gate.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className={`btn ${activeTab === "scan" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("scan")}
            id="qr-tab-scan"
          >
            <Scan size={16} /> Gate Scanner
          </button>
          <button
            className={`btn ${activeTab === "generate" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("generate")}
            id="qr-tab-generate"
          >
            <QrCode size={16} /> Generate Pass
          </button>
        </div>
      </div>

      {activeTab === "scan" && (
        <div className="grid-2" style={{ alignItems: "start", gap: "var(--space-xl)" }}>

          <div className="qr-scan-section">
            <div className="qr-scan-header">
              <div className="qr-section-icon scan">
                <Scan size={18} color="#10b981" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>Gate Entry Scanner</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Paste token or use a barcode reader</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: "0.6875rem", color: "#10b981", fontWeight: 600 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", animation: "pulse 1.5s infinite" }} />
                LIVE
              </div>
            </div>

            <div className="qr-section-body">
              <div style={{
                background: "linear-gradient(135deg, #050810 0%, #0a0e1a 100%)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                border: "1px solid rgba(16,185,129,0.15)",
                marginBottom: "1.25rem",
                position: "relative",
              }}>
                {[
                  { top: 0, left: 0 },  { top: 0, right: 0 },
                  { bottom: 0, left: 0 }, { bottom: 0, right: 0 },
                ].map((pos, i) => (
                  <div key={i} style={{
                    position: "absolute", width: 20, height: 20,
                    borderTop: i < 2 ? "2px solid rgba(16,185,129,0.6)" : "none",
                    borderBottom: i >= 2 ? "2px solid rgba(16,185,129,0.6)" : "none",
                    borderLeft: i % 2 === 0 ? "2px solid rgba(16,185,129,0.6)" : "none",
                    borderRight: i % 2 === 1 ? "2px solid rgba(16,185,129,0.6)" : "none",
                    ...pos,
                    margin: 8,
                  }} />
                ))}

                <video ref={videoRef} muted playsInline style={{ display: cameraActive ? "block" : "none", width: "100%", maxHeight: 280, objectFit: "cover" }} />
                {!cameraActive && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem", gap: 12, textAlign: "center" }}>
                  <Fingerprint size={40} color="rgba(16,185,129,0.45)" />
                  <div style={{ fontSize: "0.8125rem", color: "rgba(16,185,129,0.7)", lineHeight: 1.5 }}>{cameraError || "Start the camera to scan a visitor QR pass, or paste its token below."}</div>
                </div>}
              </div>

              <button type="button" className="btn btn-secondary" onClick={cameraActive ? stopCamera : startCamera} disabled={loading} style={{ width: "100%", justifyContent: "center", marginBottom: "1rem" }}>
                <Scan size={15} /> {cameraActive ? "Stop Camera" : "Start Camera QR Scan"}
              </button>

              <form onSubmit={handleManualVerify}>
                <div style={{ marginBottom: "0.625rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Paste QR Token or Barcode Scan
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    id="qr-token-input"
                    className="form-input"
                    placeholder="Paste visitor QR token here..."
                    value={manualToken}
                    onChange={e => setManualToken(e.target.value)}
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", flex: 1 }}
                  />
                  <button
                    id="qr-verify-btn"
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !manualToken.trim()}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {loading
                      ? <div className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />
                      : <><Scan size={15} /> Verify</>}
                  </button>
                </div>
              </form>

              <div style={{
                marginTop: "1.25rem", padding: "1rem", borderRadius: "var(--radius-md)",
                background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)",
              }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.625rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Entry Flow
                </div>
                {[
                  "Student requests a QR pass from Warden",
                  "Warden generates a signed 8-hour pass",
                  "Visitor shows QR at the gate",
                  "Warden scans / pastes token here to log entry",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.375rem" }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.625rem", fontWeight: 700, color: "white", flexShrink: 0,
                    }}>{i + 1}</div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            {scanResult ? (
              <div className={`qr-result-card ${scanResult.success ? "success" : "failed"}`} style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                    background: scanResult.success ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {scanResult.success
                      ? <CheckCircle2 size={28} color="#10b981" />
                      : <AlertCircle  size={28} color="#ef4444" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 800, fontSize: "1.0625rem", letterSpacing: "0.04em",
                      color: scanResult.success ? "#34d399" : "#f87171",
                    }}>
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
                    marginTop: "1.25rem", paddingTop: "1.25rem",
                    borderTop: "1px solid rgba(16,185,129,0.12)",
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem",
                  }}>
                    {[
                      { icon: User,   label: "Visitor", value: scanResult.visitor.name },
                      { icon: Phone,  label: "Phone",   value: scanResult.visitor.phone },
                      { icon: Heart,  label: "Relation",value: scanResult.visitor.relation },
                      { icon: Shield, label: "Room",    value: scanResult.visitor.student?.room?.roomNo || "—" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem", background: "rgba(16,185,129,0.05)", borderRadius: "var(--radius-sm)" }}>
                        <Icon size={14} color="#10b981" />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}:</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: 600 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className="btn btn-secondary"
                  style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }}
                  onClick={() => setScanResult(null)}
                >
                  <RefreshCw size={14} /> Clear Result
                </button>
              </div>
            ) : (
              <div style={{
                textAlign: "center", padding: "4rem var(--space-xl)",
                background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "var(--radius-lg)",
                  background: "rgba(16,185,129,0.06)", border: "1px dashed rgba(16,185,129,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem",
                }}>
                  <UserCheck size={28} color="rgba(16,185,129,0.3)" />
                </div>
                <div style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Awaiting Scan</div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: 4, maxWidth: 220, margin: "0.5rem auto 0" }}>
                  Scan result and visitor details will appear here after verification.
                </div>
              </div>
            )}

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem",
            }}>
              {[
                { icon: Zap,       label: "Instant",   sub: "Real-time verify" },
                { icon: KeyRound,  label: "Signed",    sub: "JWT cryptographic" },
                { icon: Clock,     label: "8h Valid",  sub: "Auto-expiring pass" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} style={{
                  padding: "0.875rem", borderRadius: "var(--radius-md)",
                  background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                  textAlign: "center",
                }}>
                  <Icon size={20} color="#10b981" style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-primary)" }}>{label}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "generate" && (
        <div className="grid-2" style={{ alignItems: "start", gap: "var(--space-xl)" }}>

          <div className="qr-scan-section">
            <div className="qr-generate-header">
              <div className="qr-section-icon generate">
                <QrCode size={18} color="var(--accent-primary)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>Issue Visitor Pass</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Valid for 8 hours · Cryptographically signed JWT</div>
              </div>
            </div>

            <div className="qr-section-body">
              <form onSubmit={handleGenerateQR}>
                <div className="form-group">
                  <label className="form-label">Student Roll No / ID</label>
                  <input
                    id="gen-student-id"
                    className="form-input"
                    placeholder="e.g. ST20240001 or database ID..."
                    required
                    value={genForm.studentId}
                    onChange={e => setGenForm(f => ({ ...f, studentId: e.target.value }))}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Visitor Full Name</label>
                    <input
                      id="gen-visitor-name"
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
                      id="gen-visitor-phone"
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
                      id="gen-relation"
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
                      id="gen-purpose"
                      className="form-input"
                      placeholder="e.g. Fee payment, Health check"
                      value={genForm.purpose}
                      onChange={e => setGenForm(f => ({ ...f, purpose: e.target.value }))}
                    />
                  </div>
                </div>

                <button
                  id="gen-submit-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", marginTop: "0.5rem", justifyContent: "center" }}
                  disabled={loading}
                >
                  {loading
                    ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating…</>
                    : <><QrCode size={17} /> Generate Signed QR Pass</>}
                </button>
              </form>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            {generatedQR ? (
              <>
                <div style={{
                  background: "linear-gradient(145deg, #1a2035 0%, #1e2a4a 50%, #1a2035 100%)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  borderRadius: "var(--radius-xl)",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.08)",
                }}>
                  <div style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    padding: "1rem 1.5rem",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div>
                      <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        Smart Hostel Management
                      </div>
                      <div style={{ fontWeight: 800, color: "white", fontSize: "1rem", marginTop: 2 }}>
                        🔐 Visitor Entry Pass
                      </div>
                    </div>
                    <div style={{
                      background: "rgba(255,255,255,0.2)", borderRadius: "var(--radius-md)",
                      padding: "0.25rem 0.875rem", fontSize: "0.75rem", fontWeight: 700, color: "white",
                    }}>
                      8h PASS
                    </div>
                  </div>

                  <div style={{ padding: "1.5rem", display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                    <div style={{
                      background: "white", borderRadius: "var(--radius-md)",
                      padding: "0.75rem", flexShrink: 0,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    }}>
                      <img src={generatedQR.qrUrl} alt="QR Pass" style={{ width: 130, height: 130, display: "block" }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: "1.125rem", color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {generatedQR.visitorName}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.875rem" }}>
                        {generatedQR.relation} of Student
                      </div>
                      {[
                        { icon: Phone,  label: "Phone",      value: generatedQR.phone },
                        { icon: Shield, label: "Student ID", value: generatedQR.studentId.substring(0, 20) + (generatedQR.studentId.length > 20 ? "…" : "") },
                        { icon: Heart,  label: "Purpose",    value: generatedQR.purpose },
                        { icon: Clock,  label: "Expires",    value: generatedQR.expiresIn },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                          <Icon size={12} color="rgba(16,185,129,0.8)" />
                          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", minWidth: 65 }}>{label}</span>
                          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    borderTop: "1px dashed rgba(16,185,129,0.2)",
                    padding: "0.875rem 1.5rem",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-mono)" }}>
                      Generated: {generatedQR.generatedAt}
                    </div>
                    <span className="badge badge-success" style={{ fontSize: "0.625rem" }}>● ACTIVE PASS</span>
                  </div>
                </div>

                <div className="qr-scan-section">
                  <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Signed QR Token</span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={copyToken}>
                        <Copy size={13} /> Copy
                      </button>
                    </div>
                  </div>
                  <div style={{ padding: "1rem 1.25rem" }}>
                    <textarea
                      className="form-textarea"
                      readOnly
                      value={generatedQR.token}
                      style={{ minHeight: 64, fontSize: "0.6875rem", fontFamily: "var(--font-mono)", resize: "none", color: "var(--text-muted)" }}
                    />
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", marginBottom: 0 }}>
                      Share this token with the visitor for gate entry. Expires in 8 hours.
                    </p>
                  </div>
                </div>

                <button type="button" className="btn btn-secondary" onClick={() => setGeneratedQR(null)} style={{ width: "100%", justifyContent: "center" }}>
                  <RefreshCw size={15} /> Generate New Pass
                </button>
              </>
            ) : (
              <div style={{
                textAlign: "center", padding: "4rem var(--space-xl)",
                background: "var(--bg-card)", border: "1px dashed rgba(99,102,241,0.2)",
                borderRadius: "var(--radius-xl)",
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "var(--radius-xl)",
                  background: "rgba(99,102,241,0.06)", border: "1px dashed rgba(99,102,241,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem",
                }}>
                  <QrCode size={36} color="rgba(99,102,241,0.35)" />
                </div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  No Pass Generated Yet
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", maxWidth: 260, margin: "0 auto" }}>
                  Fill the form and click <strong style={{ color: "var(--text-secondary)" }}>Generate Signed QR Pass</strong> to issue a cryptographically secured 8-hour visitor entry pass.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
