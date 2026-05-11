import { ChatWidget } from "./components/ChatWidget/ChatWidget";
import { AdminDashboard } from "./components/AdminDashboard/AdminDashboard";
import { GraduationCap } from "lucide-react";

const isAdmin = window.location.hash === "#admin";

const NAV_LINKS = [
  { label: "About",       href: "https://www.kfueit.edu.pk/kfueit-historical-background" },
  { label: "Programs",    href: "https://www.kfueit.edu.pk/academic-programs" },
  { label: "Admissions",  href: "https://www.kfueit.edu.pk/why-kfueit" },
  { label: "Research",    href: "https://www.kfueit.edu.pk/research-1" },
  { label: "Campus Life", href: "https://www.kfueit.edu.pk/events-attractions" },
];

const STATS = [
  { value: "12K+", label: "Students" },
  { value: "60+",  label: "Programs" },
  { value: "450+", label: "Faculty" },
  { value: "98%",  label: "Satisfaction" },
];

export default function App() {
  if (isAdmin) {
    return <AdminDashboard apiBase={import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/agent"} />;
  }

  return (
    <div className="page-root">
      {/* ── Decorative background blobs ── */}
      <div className="bg-blob bg-blob--tl" />
      <div className="bg-blob bg-blob--br" />
      <div className="bg-noise" />

      {/* ── Navigation ── */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            <div className="nav-logo-icon">
              <GraduationCap size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="nav-logo-name">KFUEIT</div>
              <div className="nav-logo-sub">KHWAJA FAREED UNIVERSITY</div>
            </div>
          </a>

          <ul className="nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="nav-link">{l.label}</a>
              </li>
            ))}
          </ul>

          <a href="https://eportal.kfueit.edu.pk/login" target="_blank" rel="noopener noreferrer" className="nav-cta">
            Apply now <span className="nav-cta-arrow">→</span>
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="hero">
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot">✦</span>
            Now with AI-powered student support
          </div>

          <h1 className="hero-headline">
            A legacy of{" "}
            <em className="hero-headline-gold">excellence</em>,<br />
            built for tomorrow.
          </h1>

          <p className="hero-subline">
            From engineering to the arts, Khwaja Fareed University empowers
            the next generation of changemakers with world-class faculty,
            modern facilities, and a vibrant campus community.
          </p>

          <div className="hero-actions">
            <a href="https://www.kfueit.edu.pk/academic-programs" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Explore Programs <span>→</span>
            </a>
            <a href="https://www.kfueit.edu.pk" target="_blank" rel="noopener noreferrer" className="btn-ghost">Take a virtual tour</a>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="stats-row">
          {STATS.map((s) => (
            <div className="stat-tile" key={s.label}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* ── Chat widget ── */}
      <ChatWidget
        agentName="KFUEIT Assistant"
        description="Online · usually replies instantly"
        apiBase={import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/agent"}
        vapiPublicKey={import.meta.env.VITE_VAPI_PUBLIC_KEY}
        vapiAssistantId={import.meta.env.VITE_VAPI_ASSISTANT_ID}
      />
    </div>
  );
}
