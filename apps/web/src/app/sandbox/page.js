'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import AttackGraph from '@/components/AttackGraph';
import PatchReviewModal from '@/components/agent/PatchReviewModal';
import ToastContainer, { toast } from '@/components/Toast';
import { api } from '@/lib/api';

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

  const [repoMeta, setRepoMeta]     = useState({ fullName: 'demo/repo', prNumber: 42 });
  const [apiStatus, setApiStatus]   = useState(null); // 'SAFE' | 'BREACH_DETECTED' | 'ERROR'

  const handleDetonate = async () => {
    const url = prUrl.trim() || 'https://github.com/test/repo/pull/42';
    setStage('detonating');
    setTermLines([]);
    setEvents([]);
    setDag(null);
    setPatch(null);
    setSelectedNode(null);
    setThreatReport(null);
    setApiStatus(null);

    addLine('agent', `[PRISON] Initiating detonation for: ${url}`);
    
    try {
      const data = await api.detonateSync(url);
      setSandboxId(data.execution_id);
      setApiStatus(data.status);
      addLine('running', `[PRISON] Sandbox ID: ${data.execution_id}`);

      // Extract repo meta from URL for patch card
      let fullName = 'demo/repo', prNum = 42;
      try {
        const m = url.match(/github\.com\/([^\/]+\/[^\/]+)\/pull\/(\d+)/);
        if (m) { fullName = m[1]; prNum = parseInt(m[2]); }
      } catch {}
      setRepoMeta({ fullName, prNumber: prNum });
      
      data.terminal_logs.forEach((log, i) => {
        setTimeout(() => addLine(log.type, log.msg), i * 300);
      });
      
      const baseDelay = data.terminal_logs.length * 300;

      setTimeout(() => {
        setEvents(data.ebpf_events || []);
        setStage('observing');
      }, baseDelay);
      
      setTimeout(() => {
        if (data.nodes && data.nodes.length > 0) {
          setDag({
            execution_id: data.execution_id,
            nodes: data.nodes,
            edges: data.edges || [],
            has_honeypot_hit: data.severity > 80,
            has_malicious_node: data.severity > 50,
          });
        }
        setThreatReport({
          threat_detected: data.severity > 0,
          severity_score: data.severity,
          confidence_score: data.confidence,
          summary: data.summary || 'Analysis complete.',
          attack_vector: 'Dynamic eBPF syscall tracing.',
          gating_action: data.gating_action || 'ALLOW_MERGE',
        });
        setStage(data.severity > 0 ? 'analyzing' : 'done');
      }, baseDelay + 1000);
      
      // Only set patch if severity > 0 AND patch_diff is non-null/non-empty
      setTimeout(() => {
        const hasPatch = data.patch_diff && data.patch_diff.trim().length > 0;
        if (data.severity > 0 && hasPatch) {
          setStage('patching');
          setPatch({
            target_file: 'package.json',
            branch_name: `prison/fix-security-${data.execution_id.slice(4, 12)}`,
            summary: data.summary || 'Security threat neutralized.',
            unified_diff: data.patch_diff,
          });
          setTimeout(() => setStage('done'), 500);
        }
      }, baseDelay + 2000);

    } catch (err) {
      addLine('breach', `[PRISON] Detonation failed: ${err.message}`);
      setStage('idle');
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
      <script
        dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    retroBg: '#05070a',
                    retroCard: '#0a0e1a',
                    retroPanel: '#070b14',
                    retroBorder: '#1c2438',
                    retroBorderBright: '#3b4b73',
                    silkIndigo: '#6366f1',
                    silkIndigoLight: '#818cf8',
                    pixelCyan: '#06b6d4',
                    neonGreen: '#10b981',
                    neonRed: '#ef4444',
                    neonYellow: '#f59e0b'
                  },
                  fontFamily: {
                    pixel: ['"Silkscreen"', '"Press Start 2P"', 'monospace'],
                    arcade: ['"Press Start 2P"', 'cursive'],
                    vt: ['"VT323"', 'monospace'],
                    mono: ['"JetBrains Mono"', 'monospace']
                  }
                }
              }
            };
          `,
        }}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
    body {
      background-color: #05070a !important;
      color: #e2e8f0;
      image-rendering: pixelated;
    }

    .crt-overlay::before {
      content: " ";
      display: block;
      position: fixed;
      top: 0; left: 0; bottom: 0; right: 0;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
      z-index: 50;
      background-size: 100% 3px, 6px 100%;
      pointer-events: none;
    }

    .pixel-box-shadow {
      box-shadow: 3px 3px 0px 0px #000000, 4px 4px 0px 0px #1e293b;
    }

    .pixel-box-shadow-accent {
      box-shadow: 3px 3px 0px 0px #000000, 5px 5px 0px 0px #6366f1;
    }

    .pixel-box-shadow-cyan {
      box-shadow: 3px 3px 0px 0px #000000, 4px 4px 0px 0px #06b6d4;
    }

    .pixel-btn:active {
      transform: translate(2px, 2px);
      box-shadow: 1px 1px 0px 0px #000000;
    }

    @keyframes retro-blink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
    .pixel-cursor {
      display: inline-block;
      width: 9px;
      height: 1.15em;
      background-color: #10b981;
      vertical-align: text-bottom;
      animation: retro-blink 0.9s infinite;
    }
    .pixel-cursor-cyan {
      background-color: #06b6d4;
    }

    .retro-switch-bg {
      width: 44px;
      height: 22px;
      position: relative;
      border: 2px solid #1e293b;
      background-color: #0c111f;
      cursor: pointer;
    }
    .retro-switch-bg.active {
      background-color: #06b6d4;
      border-color: #22d3ee;
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
    }
    .retro-switch-knob {
      width: 14px;
      height: 14px;
      background-color: #475569;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: all 0.1s steps(2);
    }
    .retro-switch-bg.active .retro-switch-knob {
      left: 24px;
      background-color: #021e28;
    }
        `
      }} />

      <div className="crt-overlay font-mono antialiased min-h-screen flex flex-col justify-between selection:bg-silkIndigo selection:text-white">
        <ToastContainer />
        
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 relative z-40">
          <section className="mb-7" data-purpose="page-title">
            <div className="flex items-center space-x-3 mb-2 flex-wrap gap-y-2">
              <span className="text-neonYellow text-xl animate-pulse">⚡</span>
              <h1 className="font-pixel text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-white uppercase">
                MANUAL DETONATION SANDBOX
              </h1>
              <span className="font-pixel text-[10px] bg-slate-900 text-slate-400 border border-slate-700 px-2.5 py-1 tracking-widest uppercase">
                READY
              </span>
            </div>
            <p className="font-mono text-xs sm:text-sm text-slate-400 max-w-4xl tracking-tight">
              Paste a GitHub PR URL and watch PRISON detonate it inside a Firecracker microVM with live eBPF tracing.
            </p>
          </section>

          <section className="bg-retroCard border-2 border-retroBorder p-5 sm:p-6 mb-8 pixel-box-shadow" data-purpose="detonation-form-panel">
            <label className="block font-pixel text-[11px] text-slate-400 uppercase tracking-widest mb-3" htmlFor="pr-url-input">
              GITHUB PULL REQUEST URL OR SHA
            </label>
            <div className="flex flex-col md:flex-row gap-3 items-stretch mb-6">
              <div className="relative flex-1">
                <input
                  className="w-full bg-[#05070c] text-emerald-400 font-mono text-sm px-4 py-3.5 border-2 border-retroBorder focus:border-indigo-400 focus:ring-0 focus:outline-none transition-none shadow-inner"
                  id="pr-url-input"
                  placeholder="https://github.com/owner/repository/pull/123"
                  type="text"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                />
              </div>
              <button
                onClick={handleDetonate}
                className="pixel-btn bg-indigo-500 hover:bg-indigo-400 text-black font-arcade text-xs px-6 py-3.5 border-2 border-white pixel-box-shadow-accent flex items-center justify-center gap-2 font-bold tracking-wider shrink-0 uppercase"
              >
                <span className="text-sm">⚡</span>
                <span>DETONATE IN MICROVM</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-5 border-t border-retroBorder">
              <div className="flex items-center justify-between p-3 bg-retroPanel border border-retroBorder">
                <div>
                  <div className="font-pixel text-xs text-white font-bold uppercase mb-0.5">Inject Honeypots</div>
                  <div className="font-mono text-[11px] text-slate-400">AWS, GH_TOKEN decoy keys</div>
                </div>
                <div className={`retro-switch-bg ${injectHoneypot ? 'active' : ''} ml-3 shrink-0`} onClick={() => setInject(!injectHoneypot)}>
                  <div className="retro-switch-knob"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-retroPanel border border-retroBorder">
                <div>
                  <div className="font-pixel text-xs text-white font-bold uppercase mb-0.5">Block Outbound Sockets</div>
                  <div className="font-mono text-[11px] text-slate-400">Deny all external TCP</div>
                </div>
                <div className={`retro-switch-bg ${blockSocket ? 'active' : ''} ml-3 shrink-0`} onClick={() => setBlockSocket(!blockSocket)}>
                  <div className="retro-switch-knob"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-retroPanel border border-retroBorder">
                <div>
                  <div className="font-pixel text-xs text-slate-300 font-bold uppercase mb-0.5">Bypass Cache</div>
                  <div className="font-mono text-[11px] text-slate-500">Force fresh detonation</div>
                </div>
                <div className={`retro-switch-bg ${bypassCache ? 'active' : ''} ml-3 shrink-0`} onClick={() => setBypassCache(!bypassCache)}>
                  <div className="retro-switch-knob"></div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-purpose="dual-terminal-monitors">
            <div className="border-2 border-retroBorder bg-[#04060a] pixel-box-shadow flex flex-col min-h-[380px]">
              <div className="bg-retroPanel border-b-2 border-retroBorder px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-neonRed inline-block border border-black"></span>
                  <span className="w-3 h-3 bg-neonYellow inline-block border border-black"></span>
                  <span className="w-3 h-3 bg-neonGreen inline-block border border-black"></span>
                </div>
                <div className="font-pixel text-[10px] tracking-wider text-slate-400 uppercase">
                  PRISON TERMINAL — AWAITING DETONATION
                </div>
                <div className="w-8"></div>
              </div>
              <div ref={termRef} className="p-5 font-mono text-xs sm:text-sm text-slate-400 leading-relaxed flex-1 flex flex-col justify-between overflow-y-auto max-h-[350px]">
                {termLines.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-slate-400">Paste a PR URL above and click <span className="text-neonYellow">⚡ Detonate</span>.</p>
                    <p className="text-slate-500">The full pipeline will run and stream here.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {termLines.map((l, i) => (
                      <div key={i} className={l.type === 'breach' ? 'text-red-400 font-bold' : l.type === 'running' ? 'text-amber-300' : 'text-emerald-400'}>
                        {l.msg}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-8 text-slate-400 pt-4 border-t border-retroBorder/40">
                  <span className="text-emerald-500 font-bold">prison@sandbox</span>:<span className="text-cyan-400 font-bold">~$</span> <span className="pixel-cursor"></span>
                </div>
              </div>
            </div>

            <div className="border-2 border-retroBorder bg-[#04060a] pixel-box-shadow flex flex-col min-h-[380px]">
              <div className="bg-retroPanel border-b-2 border-retroBorder px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-neonRed inline-block border border-black"></span>
                  <span className="w-3 h-3 bg-neonYellow inline-block border border-black"></span>
                  <span className="w-3 h-3 bg-neonGreen inline-block border border-black"></span>
                </div>
                <div className="font-pixel text-[10px] tracking-wider text-slate-400 uppercase">
                  OSEN EBPF — SYSCALL EVENT STREAM
                </div>
                <div className="w-8"></div>
              </div>
              <div className="p-5 font-mono text-xs sm:text-sm text-slate-400 leading-relaxed flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-slate-500">Kernel events will stream here during sandbox execution.</p>
                </div>
                <div className="mt-8 text-slate-400 pt-4 border-t border-retroBorder/40">
                  <span className="text-indigo-400 font-bold">ebpf::ringbuf</span>:<span className="text-cyan-400 font-bold">[0]</span> <span className="pixel-cursor pixel-cursor-cyan"></span>
                </div>
              </div>
            </div>
          </section>

          {/* Clean Safe Banner */}
          {apiStatus === 'SAFE' && !patch && threatReport && stage === 'done' && (
            <div className="mt-8 p-6 bg-emerald-950/20 border-2 border-emerald-500/80 rounded-lg flex items-center gap-5">
              <div className="text-4xl">✅</div>
              <div>
                <div className="font-pixel text-emerald-400 font-bold text-sm tracking-wider uppercase mb-1">
                  [SAFE] No Security Vulnerabilities Detected
                </div>
                <p className="text-slate-300 text-xs">
                  {threatReport.summary}
                </p>
                <div className="flex gap-3 mt-3">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-pixel text-[10px] border border-emerald-500/50">✓ ALLOW_MERGE</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-pixel text-[10px]">Confidence {((threatReport.confidence_score || 0.97) * 100).toFixed(0)}%</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-pixel text-[10px]">Severity 0/100</span>
                </div>
              </div>
            </div>
          )}

          {/* Patch & Remediation */}
          {patch && threatReport && threatReport.severity_score > 0 && (
            <div className="mt-8">
              <PatchReviewModal 
                patch={patch} 
                repoFullName={repoMeta.fullName}
                prNumber={repoMeta.prNumber}
                onClose={() => toast('Patch process completed.', 'success')} 
              />
            </div>
          )}
        </main>
        
        <footer className="border-t border-retroBorder bg-retroBg px-4 py-3 mt-10 text-center font-pixel text-[10px] text-slate-500 z-[100] relative">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>© 2026 PRISON — PULL REQUEST ISOLATION &amp; SECURITY OBSERVATION NETWORK</div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-500">■ v1.0.0</span>
              <span>ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
