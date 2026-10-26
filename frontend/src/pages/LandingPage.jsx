import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, BedDouble, Building2, ChefHat, CircleCheck, Clock3,
  GraduationCap, KeyRound, LogIn, Mail, QrCode, ShieldCheck, UsersRound, Wrench,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import ThemeToggle from "../components/ThemeToggle";
import "./LandingPage.css";

const roleOptions = [
  { role: "STUDENT", title: "Student", description: "Your room and hostel services", icon: GraduationCap },
  { role: "WARDEN", title: "Warden", description: "Daily hostel operations", icon: ShieldCheck },
  { role: "ADMIN", title: "Administrator", description: "People, rooms and reports", icon: UsersRound },
];

const workflowFeatures = [
  { icon: BedDouble, title: "Rooms & occupancy", text: "Keep room assignments, bed availability, and student records in sync." },
  { icon: QrCode, title: "Visitor passes", text: "Issue time-limited QR passes and keep a searchable entry and exit record." },
  { icon: Wrench, title: "Maintenance requests", text: "Track priority, ownership, progress, and 48-hour SLA breaches." },
  { icon: ChefHat, title: "Mess & holidays", text: "Collect dish ratings and manage holiday checkout and return confirmation." },
];

const roleDetails = [
  { role: "STUDENT", icon: GraduationCap, title: "For students", text: "Take care of hostel tasks without chasing paper forms.", points: ["View room and profile details", "Request maintenance and visitor passes", "Rate meals and submit holiday plans"] },
  { role: "WARDEN", icon: ShieldCheck, title: "For wardens", text: "See what needs attention and record each decision.", points: ["Monitor occupancy and visitor activity", "Review leave and pass requests", "Assign maintenance and watch SLA status"] },
  { role: "ADMIN", icon: UsersRound, title: "For administrators", text: "Keep access, student records, and room setup organized.", points: ["Manage accounts and role access", "Maintain student and room records", "Review system activity and reports"] },
];

function rolePath(role) {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "WARDEN") return "/warden/dashboard";
  return "/student/dashboard";
}

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState(roleOptions[0]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  function selectRole(option) {
    setSelectedRole(option);
    setEmail("");
    setPassword("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      const user = useAuthStore.getState().user;
      toast.success("Welcome back!");
      navigate(rolePath(user?.role || selectedRole.role), { replace: true });
    } else {
      toast.error(result.message || "Login failed");
    }
  }

  return (
    <div className="landing-page home-redesign">
      <header className="home-header">
        <a className="home-brand" href="#home" aria-label="SmartHostel home"><span className="home-brand-mark"><Building2 size={20} /></span><span>Smart<span>Hostel</span></span></a>
        <nav className="home-nav" aria-label="Main navigation"><a href="#workflows">How it works</a><a href="#portals">Portals</a></nav>
        <div className="home-header-actions"><ThemeToggle /><a className="home-header-cta" href="#sign-in">Sign in <ArrowRight size={16} /></a></div>
      </header>

      <main id="home">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <div className="home-eyebrow"><span /> A HOSTEL MANAGEMENT WORKSPACE</div>
            <h1 id="home-title">Hostel life,<br /><em>handled clearly.</em></h1>
            <p>Room assignments, visitor access, maintenance, mess feedback, and holiday plans—connected in one place.</p>
            <div className="home-hero-actions"><a className="home-primary-button" href="#sign-in">Open your portal <ArrowRight size={17} /></a><a className="home-text-link" href="#workflows">Explore the platform <span aria-hidden="true">↓</span></a></div>
            <div className="home-audience" aria-label="Designed for students, wardens, and administrators"><span><GraduationCap size={16} /> Students</span><i /><span><ShieldCheck size={16} /> Wardens</span><i /><span><UsersRound size={16} /> Admins</span></div>
          </div>

          <aside className="home-pass-card" aria-label="Example of the visitor pass process">
            <div className="home-pass-header"><span className="home-pass-icon"><QrCode size={20} /></span><div><span>VISITOR ACCESS</span><strong>From request to entry</strong></div><span className="home-pass-duration"><Clock3 size={14} /> 8 hours</span></div>
            <p className="home-pass-intro">A simple, traceable gate pass flow.</p>
            <ol className="home-timeline">
              <li className="is-complete"><span className="home-timeline-icon"><CircleCheck size={17} /></span><div><strong>Pass requested</strong><small>Student adds visitor details</small></div></li>
              <li className="is-complete"><span className="home-timeline-icon"><CircleCheck size={17} /></span><div><strong>QR pass issued</strong><small>Ready to show at the gate</small></div></li>
              <li><span className="home-timeline-icon"><KeyRound size={16} /></span><div><strong>Entry recorded</strong><small>Guard scans the pass</small></div></li>
            </ol>
            <div className="home-pass-foot"><span /> Expires automatically after 8 hours</div>
          </aside>
        </section>

        <section id="workflows" className="home-workflows" aria-labelledby="workflow-title">
          <div className="home-section-heading"><span className="home-kicker">ONE CONNECTED WORKSPACE</span><h2 id="workflow-title">The everyday work, in one view.</h2><p>Keep requests and records connected to the people responsible for them.</p></div>
          <div className="home-feature-grid">{workflowFeatures.map(({ icon: Icon, title, text }, index) => <article className={"home-feature home-feature-" + (index + 1)} key={title}><span className="home-feature-icon"><Icon size={21} /></span><span className="home-feature-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>

        <section id="portals" className="home-portals" aria-labelledby="portals-title">
          <div className="home-section-heading"><span className="home-kicker">BUILT AROUND YOUR ROLE</span><h2 id="portals-title">A clear place for everyone.</h2><p>Each portal focuses on the tasks that person needs to complete.</p></div>
          <div className="home-role-grid">{roleDetails.map(({ role, icon: Icon, title, text, points }) => <article className={"home-role-card home-role-" + role.toLowerCase()} key={role}>
            <div className="home-role-top"><span className="home-role-icon"><Icon size={21} /></span><span>{role}</span></div><h3>{title}</h3><p className="home-role-copy">{text}</p>
            <ul>{points.map((point) => <li key={point}><CircleCheck size={15} />{point}</li>)}</ul>
            <a href="#sign-in" onClick={() => selectRole(roleOptions.find((option) => option.role === role))}>Sign in as {role.toLowerCase()} <ArrowRight size={15} /></a>
          </article>)}</div>
        </section>

        <section id="sign-in" className="home-signin" aria-labelledby="signin-title">
          <div className="home-signin-copy"><span className="home-kicker">WELCOME BACK</span><h2 id="signin-title">Your hostel,<br />at your fingertips.</h2><p>Use the account issued by your hostel administrator. Choose your role and continue to your workspace.</p><div className="home-signin-note"><span className="home-signin-check"><CircleCheck size={18} /></span><div><strong>One secure sign-in</strong><small>Access is managed by your assigned role.</small></div></div></div>
          <div className="home-login-card">
            <div className="home-login-heading"><span><LogIn size={19} /></span><div><h3>Sign in to SmartHostel</h3><p>Choose your role to get started.</p></div></div>
            <div className="home-role-picker" role="group" aria-label="Choose account role">{roleOptions.map((option) => { const Icon = option.icon; const active = selectedRole.role === option.role; return <button key={option.role} type="button" className={active ? "selected" : ""} aria-pressed={active} onClick={() => selectRole(option)}><Icon size={17} /><span>{option.title}</span></button>; })}</div>
            <form className="home-login-form" onSubmit={handleSubmit}>
              <div className="home-form-field"><label htmlFor="login-email">Email address</label><div><Mail size={17} /><input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@campus.edu" autoComplete="username" required /></div></div>
              <div className="home-form-field"><label htmlFor="login-password">Password</label><div><KeyRound size={17} /><input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required /></div></div>
              <button className="home-primary-button home-submit" type="submit" disabled={isLoading}>{isLoading ? <span className="spinner" aria-label="Signing in" /> : <>Continue as {selectedRole.title} <ArrowRight size={17} /></>}</button>
            </form>
            <p className="home-login-help">Need an account? Contact your hostel administrator.</p>
          </div>
        </section>
      </main>

      <footer className="home-footer"><a className="home-footer-brand" href="#home"><span className="home-brand-mark"><Building2 size={17} /></span>SmartHostel</a><p>Hostel services for students and the teams who support them.</p><span>© {new Date().getFullYear()} SmartHostel</span></footer>
    </div>
  );
}
