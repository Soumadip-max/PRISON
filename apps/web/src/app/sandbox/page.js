'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import AttackGraph from '@/components/AttackGraph';
import DiffViewer from '@/components/DiffViewer';
import ToastContainer, { toast } from '@/components/Toast';
import { mockDetonation, buildMockDAG, MOCK_PATCH, MOCK_EVENTS } from '@/lib/api';

const STAGES = ['idle', 'detonating', 'observing', 'analyzing', 'patching', 'done'];

export default function SandboxPage() {
  const [prUrl, setPrUrl]               = useState('');
  const [injectHoneypot, setInject]     = useState(true);
  const [blockSocket, setBlockSocket]   = useState(true);
  const [bypassCache, setBypassCache]   = useState(false);
  const [stage, setStage]               = useState('idle');
  const [termLines, setTermLines]       = useState([]);
  const [events, setEvents]             = useState([]);
  const [dag, setDag]                   = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [patch, setPatch]               = useState(null);
  const [commitLoading, setCommitLoad]  = useState(false);
  const [sandboxId, setSandboxId]       = useState(null);
  const [threatReport, setThreatReport] = useState(null);
  const termRef = useRef(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [termLines]);

  const addLine = (type, msg) =>
    setTermLines((prev) => [...prev, { type, msg, ts: new Date().toISOString() }]);

  const handleDetonate = async () => {
    const url = prUrl.trim() || 'https://github.com/test/repo/pull/42';
    const id = `sbx_${Math.random().toString(36).slice(2, 14)}`;
    setSandboxId(id);
    setStage('detonating');
    setTermLines([]);
    setEvents([]);
    setDag(null);
    setPatch(null);
    setSelectedNode(null);
    setThreatReport(null);

    addLine('agent', `[PRISON] Initiating detonation for: ${url}`);
    addLine('running', `[PRISON] Sandbox ID: ${id}`);

    const duration = mockDetonation(id, ({ type, msg }) => {
      const termTypeMap = { PASS: 'success', BREACH: 'breach', RUNNING: 'running', AGENT: 'agent', SYSTEM: 'line' };
      addLine(termTypeMap[type] || 'line', msg);

      // Stage transitions based on messages
      if (msg.includes('Probes attached')) setStage('observing');
      if (msg.includes('TRACECOMMON')) {
        setStage('analyzing');
        setEvents(MOCK_EVENTS);
      }
      if (msg.includes('ANAKIN')) {
        setThreatReport({
          threat_detected: true,
          severity_score: 95,
          confidence_score: 0.98,
          summary: "Decoy Honeypot secret key AWS_ACCESS_KEY_ID accessed by process 'node' (PID: 2042).",
          attack_vector: "Process node executed sys_enter_openat targeting honeypot key.",
          gating_action: 'BLOCK_PR',
        });
        setDag(buildMockDAG(id));
      }
      if (msg.includes('patch committed') || msg.includes('Patch committed')) {
        setStage('patching');
        setPatch({ ...MOCK_PATCH, branch_name: `prison/fix-security-${id.slice(4, 12)}` });
        setTimeout(() => setStage('done'), 300);
      }
    });

    // Try real backend (falls back to mock seamlessly)
    try {
      const res = await fetch('/api/orchestrator/api/v1/webhook/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Hub-Signature-256': 'sha256=demo' },
        body: JSON.stringify({
          action: 'opened', number: 42,
          pull_request: { number: 42, state: 'open', title: 'feat: test sandbox', head: { ref: 'test', sha: 'abc123', clone_url: url } },
          repository: { id: 1, name: 'repo', full_name: 'test/repo', clone_url: url, default_branch: 'main' },
        }),
      });
      if (res.ok) addLine('success', '[PRISON] ✓ Backend orchestrator acknowledged (HTTP 202)');
    } catch {
      addLine('line', '[PRISON] Running in offline demo mode — mock pipeline active.');
    }
  };

  const handleCommit = async () => {
    setCommitLoad(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast('Patch committed to GitHub successfully! PR blocked.', 'success');
    setCommitLoad(false);
  };

  const handleReject = () => {
    toast('PR rejected and closed on GitHub.', 'error');
  };

  const stageBadge = {
    idle:       { label: 'READY', cls: 'badge-muted' },
    detonating: { label: '⚡ DETONATING', cls: 'badge-amber' },
    observing:  { label: '👁 OBSERVING', cls: 'badge-amber' },
    analyzing:  { label: '⬡ ANALYZING', cls: 'badge-cyan' },
    patching:   { label: '🤖 PATCHING', cls: 'badge-green' },
    done:       { label: '✓ COMPLETE', cls: 'badge-green' },
  }[stage];

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div style={{ padding: '2rem', minHeight: 'calc(100vh - 64px - 36px)' }}>
        {/* ── Page Header ────────────────────── */}
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1 className="page-title">⚡ Manual Detonation Sandbox</h1>
            <span className={`badge ${stageBadge.cls}`}>{stageBadge.label}</span>
          </div>
          <p className="page-subtitle">Paste a GitHub PR URL and watch PRISON detonate it inside a Firecracker microVM with live eBPF tracing.</p>
        </div>

        {/* ── Input Panel ───────────────────── */}
        <div className="glass-card glass-card-cyan" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="pr-url-input">GitHub Pull Request URL or SHA</label>
              <input
                id="pr-url-input"
                className="input-field"
                type="text"
                placeholder="https://github.com/org/repo/pull/42"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && stage === 'idle' && handleDetonate()}
                disabled={stage !== 'idle' && stage !== 'done'}
              />
            </div>
            <button
              id="btn-detonate"
              className={`btn ${stage === 'idle' || stage === 'done' ? 'btn-primary' : 'btn-ghost'} btn-lg`}
              onClick={() => { setStage('idle'); setTimeout(handleDetonate, 50); }}
              disabled={stage !== 'idle' && stage !== 'done'}
              style={{ whiteSpace: 'nowrap' }}
            >
              {stage === 'idle' || stage === 'done' ? '⚡ Detonate in MicroVM' : '⏳ Running…'}
            </button>
          </div>

          {/* Config Toggles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[
              { id: 'toggle-honeypot', label: 'Inject Honeypots', sub: 'AWS, GH_TOKEN decoy keys', val: injectHoneypot, set: setInject },
              { id: 'toggle-socket',   label: 'Block Outbound Sockets', sub: 'Deny all external TCP', val: blockSocket,   set: setBlockSocket },
              { id: 'toggle-cache',    label: 'Bypass Cache', sub: 'Force fresh detonation', val: bypassCache,   set: setBypassCache },
            ].map((t) => (
              <div key={t.id} className="toggle-row" style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div className="toggle-label">{t.label}</div>
                  <div className="toggle-sub">{t.sub}</div>
                </div>
                <label className="toggle">
                  <input id={t.id} type="checkbox" checked={t.val} onChange={(e) => t.set(e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ── Split Window: Terminal + eBPF Stream ── */}
        <div className="sandbox-split" style={{ marginBottom: '1.5rem' }}>
          {/* Left: Live Terminal */}
          <div className="terminal" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div className="terminal-header">
              <div className="terminal-dot red" />
              <div className="terminal-dot amber" />
              <div className="terminal-dot green" />
              <span className="terminal-title">
                {sandboxId ? `PRISON Terminal — ${sandboxId}` : 'PRISON Terminal — Awaiting Detonation'}
              </span>
            </div>
            <div className="terminal-body" ref={termRef} style={{ flex: 1, overflowY: 'auto' }}>
              {termLines.length === 0 && (
                <div className="term-prompt" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                  Paste a PR URL above and click ⚡ Detonate.<br />
                  <span style={{ opacity: 0.5 }}>The full pipeline will run and stream here.</span>
                </div>
              )}
              {termLines.map((line, i) => (
                <div key={i} className={`term-${line.type}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginBottom: '2px', wordBreak: 'break-all' }}>
                  <span style={{ color: 'var(--text-muted)', marginRight: '0.75rem', fontSize: '0.65rem' }}>
                    {new Date(line.ts).toLocaleTimeString()}
                  </span>
                  {line.msg}
                </div>
              ))}
              {stage !== 'idle' && stage !== 'done' && (
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                  <span className="term-prompt" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>prison@kernel:~$</span>
                  <span className="cursor-blink" style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>█</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: eBPF Event Stream */}
          <div className="terminal" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div className="terminal-header">
              <div className="terminal-dot red" />
              <div className="terminal-dot amber" />
              <div className="terminal-dot green" />
              <span className="terminal-title">OSEN eBPF — Syscall Event Stream</span>
              {events.length > 0 && (
                <span className="badge badge-amber" style={{ marginLeft: 'auto' }}>{events.length} events</span>
              )}
            </div>
            <div className="terminal-body" style={{ flex: 1, overflowY: 'auto' }}>
              {events.length === 0 && (
                <div className="term-prompt" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                  Kernel events will stream here during sandbox execution.
                </div>
              )}
              {events.map((ev, i) => {
                const isAnomaly = ev.is_anomaly;
                const typeColors = { EXECVE: 'var(--cyan)', CONNECT: 'var(--red)', OPENAT: 'var(--amber)', HONEYPOT_TRIGGER: 'var(--red)' };
                const c = typeColors[ev.event_type] || 'var(--text-secondary)';
                const details = ev.details;
                const detailStr = details.argv ? details.argv.join(' ') : details.ip ? `${details.ip}:${details.port}` : details.filename || details.honeypot_key || '';
                return (
                  <div key={i} style={{ marginBottom: '6px', padding: '6px 8px', borderRadius: 6, background: isAnomaly ? 'rgba(255,45,85,0.06)' : 'transparent', borderLeft: isAnomaly ? '2px solid var(--red)' : '2px solid transparent', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ color: c, fontWeight: 700 }}>{ev.event_type}</span>
                      <span style={{ color: 'var(--text-muted)' }}>PID {ev.pid}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{ev.comm}</span>
                      {isAnomaly && <span className="badge badge-red" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>ANOMALY</span>}
                    </div>
                    {detailStr && <div style={{ color: 'var(--text-secondary)', marginTop: '2px', paddingLeft: '0.5rem', wordBreak: 'break-all' }}>→ {detailStr}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Attack Graph (shown after analysis) ── */}
        {dag && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  TRACECOMMON Attack Graph
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Click any node to inspect its syscall details.</p>
              </div>
              {threatReport && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span className="badge badge-red">
                    <span className="pulse-dot red" />
                    Severity {threatReport.severity_score}/100
                  </span>
                  <span className="badge badge-amber">Confidence {(threatReport.confidence_score * 100).toFixed(0)}%</span>
                  <span className="badge badge-red">{threatReport.gating_action?.replace('_', ' ')}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}>
              <AttackGraph dag={dag} onNodeClick={setSelectedNode} />

              {/* Node Inspector */}
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)' }}>
                  Node Inspector
                </div>
                {selectedNode ? (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      ['PID', selectedNode.pid],
                      ['PPID', selectedNode.ppid],
                      ['COMM', selectedNode.comm],
                      ['SYSCALL', selectedNode.syscall],
                      ['TYPE', selectedNode.node_type],
                      ['RISK', selectedNode.details?.risk_level],
                      ['PATH', selectedNode.details?.resolved_path || '—'],
                      ['IP', selectedNode.details?.destination_ip || '—'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                        <span style={{ color: selectedNode.node_type.includes('RED') ? 'var(--red)' : selectedNode.node_type.includes('AMBER') ? 'var(--amber)' : 'var(--text-primary)' }}>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Click a node in the graph to inspect its syscall details.</p>
                )}

                {threatReport && (
                  <div style={{ marginTop: '0.5rem', padding: '0.875rem', background: 'var(--red-dim)', borderRadius: 8, border: '1px solid rgba(255,45,85,0.25)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--red)', marginBottom: '0.4rem' }}>ANAKIN TRIAGE SUMMARY</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{threatReport.summary}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Patch & Remediation ─────────────── */}
        {patch && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              🤖 ANAKIN Patch & Remediation
            </h2>
            <DiffViewer patch={patch} onCommit={handleCommit} onReject={handleReject} loading={commitLoading} />
          </div>
        )}
      </div>
    </>
  );
}
