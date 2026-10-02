'use client';
import Navbar from '@/components/Navbar';
import ToastContainer from '@/components/Toast';

const SECTIONS = [
  {
    id: 'overview', title: '1. Overview',
    content: `PRISON (Pull Request Isolation & Security Observation Network) is an autonomous DevSecOps platform that detonates every incoming GitHub Pull Request inside an ephemeral Firecracker microVM, traces its execution at the Linux kernel level using eBPF probes, catches credential theft via synthetic honeypots, and uses an AI agent (ANAKIN) to generate and commit remediation patches automatically.`
  },
  {
    id: 'tracks', title: '2. Architecture Tracks',
    items: [
      { name: 'MANTITUP', sub: 'MicroVM Engine', desc: 'Provisions ephemeral Firecracker microVMs in under 150ms. Seeds synthetic honeypot credentials into the execution environment. Enforces hard network isolation and CPU/memory quotas.', port: '—' },
      { name: 'OSEN',     sub: 'eBPF Kernel Probes', desc: 'Attaches BPF tracepoints to sys_enter_execve, sys_enter_connect, and sys_enter_openat. Captures raw ring buffer events and streams them into the TRACECOMMON pipeline.', port: '—' },
      { name: 'TRACECOMMON', sub: 'Telemetry Pipeline', desc: 'Normalizes raw eBPF events into typed NormalizedEvent objects. Classifies risk levels (CLEAN, HONEYPOT_HIT, UNAUTHORIZED_SOCKET, SUSPICIOUS_EXEC). Builds an ExecutionDAG.', port: '8001' },
      { name: 'ANAKIN',   sub: 'AI Remediation Agent', desc: 'Evaluates the ExecutionDAG using rule-based scoring (Rule R08 confidence gating) or an LLM provider. Generates unified diff patches and pushes them to GitHub via API.', port: '—' },
    ]
  },
  {
    id: 'api', title: '3. API Reference',
    endpoints: [
      { method: 'POST', path: '/api/v1/webhook/github', svc: 'Orchestrator :8000', desc: 'Receives GitHub PR webhook payload. Verifies HMAC-SHA256 signature. Queues detonation job. Returns HTTP 202.' },
      { method: 'GET',  path: '/api/v1/telemetry/events', svc: 'Telemetry :8001', desc: 'Returns all in-memory telemetry events and payloads ingested since last restart.' },
      { method: 'POST', path: '/api/v1/telemetry/events', svc: 'Telemetry :8001', desc: 'Ingests a TelemetryEventPayload. Triggers TRACECOMMON normalization and ANAKIN triage in background task.' },
      { method: 'GET',  path: '/health', svc: 'Both services', desc: 'Health check endpoint. Returns {"status": "healthy"}.' },
    ]
  },
  {
    id: 'sandbox', title: '4. Using the Sandbox',
    steps: [
      'Navigate to the Sandbox page from the navbar.',
      'Paste a GitHub Pull Request URL (e.g. https://github.com/org/repo/pull/42) into the input field.',
      'Configure the toggles: Inject Honeypots, Block Outbound Sockets, Bypass Cache.',
      'Click ⚡ Detonate in MicroVM to start the pipeline.',
      'Watch the left terminal panel for live pipeline logs and the right panel for real-time eBPF kernel events.',
      'After analysis, review the TRACECOMMON Attack Graph. Click nodes to inspect syscall details.',
      'If a threat is detected, review the ANAKIN-generated unified diff patch.',
      'Click ✨ Commit Patch & Merge to push the fix to the developer\'s branch, or ✕ Reject & Close PR.',
    ]
  },
  {
    id: 'env', title: '5. Environment Variables',
    vars: [
      { key: 'GITHUB_WEBHOOK_SECRET', desc: 'HMAC secret for verifying GitHub webhook signatures.' },
      { key: 'GITHUB_TOKEN',          desc: 'Personal access token for committing patches and managing PRs.' },
      { key: 'OPENAI_API_KEY',        desc: '(Optional) OpenAI key for ANAKIN LLM triage. Falls back to rule-based.' },
      { key: 'ANTHROPIC_API_KEY',     desc: '(Optional) Anthropic key as alternative LLM provider.' },
    ]
  },
];

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <ToastContainer />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>
        <div className="page-header">
          <div className="section-label">Documentation</div>
          <h1 className="page-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.5rem' }}>PRISON Developer Docs</h1>
          <p className="page-subtitle">Everything you need to understand, configure, and extend the PRISON security platform.</p>
        </div>

        {/* Quick Nav */}
        <div className="glass-card glass-card-cyan" style={{ padding: '1.25rem', marginBottom: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="btn btn-ghost btn-sm">{s.title}</a>
          ))}
        </div>

        {SECTIONS.map((sec) => (
          <section key={sec.id} id={sec.id} style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              {sec.title}
            </h2>

            {sec.content && <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>{sec.content}</p>}

            {sec.items && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sec.items.map((item) => (
                  <div key={item.name} className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 120 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--cyan)' }}>{item.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>// {item.sub}</div>
                      {item.port !== '—' && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--green)', marginTop: '4px' }}>:{item.port}</div>}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {sec.endpoints && (
              <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                  <thead><tr><th>Method</th><th>Path</th><th>Service</th><th>Description</th></tr></thead>
                  <tbody>
                    {sec.endpoints.map((e) => (
                      <tr key={e.path}>
                        <td><span className={`badge ${e.method === 'POST' ? 'badge-cyan' : 'badge-green'}`}>{e.method}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--amber)' }}>{e.path}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.svc}</td>
                        <td style={{ fontSize: '0.85rem' }}>{e.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {sec.steps && (
              <ol style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '0' }}>
                {sec.steps.map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span style={{ minWidth: 28, height: 28, borderRadius: '50%', background: 'var(--cyan-dim)', border: '1px solid rgba(0,255,240,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--cyan)', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ color: 'var(--text-secondary)', lineHeight: 1.7, paddingTop: '3px' }}>{step}</span>
                  </li>
                ))}
              </ol>
            )}

            {sec.vars && (
              <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                  <thead><tr><th>Variable</th><th>Description</th></tr></thead>
                  <tbody>
                    {sec.vars.map((v) => (
                      <tr key={v.key}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--green)' }}>{v.key}</td>
                        <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{v.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
