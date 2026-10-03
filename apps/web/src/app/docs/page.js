'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import ToastContainer from '@/components/Toast';

export default function DocsPage() {
  useEffect(() => {
    // Smooth scroll for anchor navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetElem = document.querySelector(targetId);
          if (targetElem) {
            e.preventDefault();
            targetElem.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }, []);

  return (
    <>
      
      
      
      
      
      <script
        dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    retro: {
                      bg: '#060814',
                      surface: '#0b0f1e',
                      surfaceHover: '#131b31',
                      border: '#252f4a',
                      indigo: '#6366f1',
                      indigoBright: '#818cf8',
                      indigoLight: '#a5b4fc',
                      emerald: '#10b981',
                      amber: '#f59e0b',
                      crimson: '#ef4444'
                    }
                  },
                  fontFamily: {
                    pixel: ['"Press Start 2P"', 'monospace'],
                    silk: ['"Silkscreen"', 'monospace'],
                    vt: ['"VT323"', 'monospace'],
                    code: ['"Courier Prime"', 'monospace']
                  },
                  boxShadow: {
                    'pixel-btn': '3px 3px 0px #000, 3px 3px 0px 1px #4338ca',
                    'pixel-card': '4px 4px 0px #030408, 0 0 0 1px #1e2640',
                    'pixel-card-glow': '4px 4px 0px #030408, 0 0 12px rgba(99, 102, 241, 0.25)',
                    'pixel-tag': '2px 2px 0px #000'
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
      background-color: #060814 !important;
      color: #cbd5e1;
    }

    .pixel-box {
      border: 2px solid #252f4a;
      box-shadow: 4px 4px 0px #000000;
    }
    .pixel-box-indigo {
      border: 2px solid #6366f1;
      box-shadow: 4px 4px 0px #1e1b4b;
    }
    .pixel-box-interactive {
      border: 2px solid #252f4a;
      box-shadow: 3px 3px 0px #000;
      transition: all 0.1s ease;
    }
    .pixel-box-interactive:hover {
      border-color: #818cf8;
      transform: translate(-1px, -1px);
      box-shadow: 4px 4px 0px #4338ca;
    }
    .pixel-box-interactive:active {
      transform: translate(2px, 2px);
      box-shadow: 1px 1px 0px #000;
    }

    .scanlines {
      background: linear-gradient(
        rgba(18, 16, 16, 0) 50%, 
        rgba(0, 0, 0, 0.25) 50%
      ), linear-gradient(
        90deg,
        rgba(255, 0, 0, 0.03),
        rgba(0, 255, 0, 0.01),
        rgba(0, 0, 255, 0.03)
      );
      background-size: 100% 4px, 6px 100%;
      pointer-events: none;
    }

    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #060814;
      border: 1px solid #1a2236;
    }
    ::-webkit-scrollbar-thumb {
      background: #4f46e5;
      border: 1px solid #818cf8;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #6366f1;
    }
        `
      }} />

      <div className="bg-retro-bg text-slate-300 font-code min-h-screen selection:bg-indigo-600 selection:text-white relative z-0">
        <ToastContainer />
        <div className="fixed inset-0 scanlines pointer-events-none z-50"></div>
        
        

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 relative z-30" data-purpose="developer-documentation" id="docs">
          <section className="space-y-4" data-purpose="docs-hero">
            <div className="inline-block">
              <span className="font-arcade text-[10px] uppercase text-retro-indigoBright bg-retro-indigo/10 px-2 py-1 border border-retro-indigo/40 tracking-widest">
                DOCUMENTATION
              </span>
            </div>
            <h1 className="font-arcade text-2xl sm:text-3xl text-white tracking-wide leading-tight">
              PRISON DEVELOPER DOCS
            </h1>
            <p className="font-vt text-2xl sm:text-2xl text-slate-400 max-w-3xl leading-relaxed">
              Everything you need to understand, configure, and extend the PRISON security platform.
            </p>
          </section>

          <section className="p-6 bg-retro-surface border-2 border-retro-border shadow-[4px_4px_0px_#000]" data-purpose="quick-anchor-nav">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <a className="pixel-box-interactive bg-[#0e1428] px-3.5 py-3 font-arcade text-[9px] text-retro-indigoLight hover:text-white flex items-center justify-between group" href="#section-overview">
                <span>1. OVERVIEW</span>
                <span className="text-retro-indigo group-hover:translate-x-0.5 transition-transform">▸</span>
              </a>
              <a className="pixel-box-interactive bg-[#0e1428] px-3.5 py-3 font-arcade text-[9px] text-retro-indigoLight hover:text-white flex items-center justify-between group" href="#section-architecture">
                <span>2. ARCHITECTURE TRACKS</span>
                <span className="text-retro-indigo group-hover:translate-x-0.5 transition-transform">▸</span>
              </a>
              <a className="pixel-box-interactive bg-[#0e1428] px-3.5 py-3 font-arcade text-[9px] text-retro-indigoLight hover:text-white flex items-center justify-between group" href="#section-api">
                <span>3. API REFERENCE</span>
                <span className="text-retro-indigo group-hover:translate-x-0.5 transition-transform">▸</span>
              </a>
              <a className="pixel-box-interactive bg-[#0e1428] px-3.5 py-3 font-arcade text-[9px] text-retro-indigoLight hover:text-white flex items-center justify-between group" href="#section-sandbox">
                <span>4. USING THE SANDBOX</span>
                <span className="text-retro-indigo group-hover:translate-x-0.5 transition-transform">▸</span>
              </a>
              <a className="pixel-box-interactive bg-[#0e1428] px-3.5 py-3 font-arcade text-[9px] text-retro-indigoLight hover:text-white flex items-center justify-between group" href="#section-env">
                <span>5. ENVIRONMENT VARIABLES</span>
                <span className="text-retro-indigo group-hover:translate-x-0.5 transition-transform">▸</span>
              </a>
            </div>
          </section>

          <section className="space-y-4 pt-4" data-purpose="overview-section" id="section-overview">
            <div className="flex items-center space-x-3 border-b-2 border-retro-border pb-3">
              <h2 className="font-arcade text-base sm:text-lg text-retro-indigoBright uppercase tracking-wide">
                1. OVERVIEW
              </h2>
            </div>
            <div className="p-6 bg-retro-surface/70 border-2 border-retro-border shadow-[4px_4px_0px_#000]">
              <p className="font-code text-slate-300 text-sm sm:text-base leading-relaxed">
                PRISON (Pull Request Isolation &amp; Security Observation Network) is an autonomous DevSecOps platform that detonates every incoming GitHub Pull Request inside an ephemeral Firecracker microVM, traces its execution at the Linux kernel level using eBPF probes, catches credential theft via synthetic honeypots, and uses an AI agent (ANAKIN) to generate and commit remediation patches automatically.
              </p>
            </div>
          </section>

          <section className="space-y-5 pt-4" data-purpose="architecture-section" id="section-architecture">
            <div className="flex items-center space-x-3 border-b-2 border-retro-border pb-3">
              <h2 className="font-arcade text-base sm:text-lg text-retro-indigoBright uppercase tracking-wide">
                2. ARCHITECTURE TRACKS
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <article className="p-5 bg-retro-surface border-2 border-retro-border hover:border-retro-indigo/70 shadow-[4px_4px_0px_#000] transition-colors" data-purpose="track-mantitup">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1 min-w-[200px]">
                    <h3 className="font-arcade text-xs text-white text-retro-indigoLight uppercase tracking-wider">MANTITUP</h3>
                    <p className="font-code text-xs text-slate-500">// MicroVM Engine</p>
                  </div>
                  <p className="font-code text-sm text-slate-300 flex-1 leading-relaxed">
                    Provisions ephemeral Firecracker microVMs in under 150ms. Seeds synthetic honeypot credentials into the execution environment. Enforces hard network isolation and CPU/memory quotas.
                  </p>
                </div>
              </article>

              <article className="p-5 bg-retro-surface border-2 border-retro-border hover:border-retro-indigo/70 shadow-[4px_4px_0px_#000] transition-colors" data-purpose="track-osen">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1 min-w-[200px]">
                    <h3 className="font-arcade text-xs text-white text-retro-indigoLight uppercase tracking-wider">OSEN</h3>
                    <p className="font-code text-xs text-slate-500">// eBPF Kernel Probes</p>
                  </div>
                  <p className="font-code text-sm text-slate-300 flex-1 leading-relaxed">
                    Attaches BPF tracepoints to sys_enter_execve, sys_enter_connect, and sys_enter_openat. Captures raw ring buffer events and streams them into the TRACECOMMON pipeline.
                  </p>
                </div>
              </article>

              <article className="p-5 bg-retro-surface border-2 border-retro-border hover:border-retro-indigo/70 shadow-[4px_4px_0px_#000] transition-colors" data-purpose="track-tracecommon">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1 min-w-[200px]">
                    <h3 className="font-arcade text-xs text-white text-retro-indigoLight uppercase tracking-wider">TRACECOMMON</h3>
                    <p className="font-code text-xs text-slate-500">// Telemetry Pipeline</p>
                    <span className="inline-block font-arcade text-[8px] bg-retro-indigo/20 text-indigo-300 px-1.5 py-0.5 border border-retro-indigo/40">:8001</span>
                  </div>
                  <p className="font-code text-sm text-slate-300 flex-1 leading-relaxed">
                    Normalizes raw eBPF events into typed NormalizedEvent objects. Classifies risk levels (CLEAN, HONEYPOT_HIT, UNAUTHORIZED_SOCKET, SUSPICIOUS_EXEC). Builds an ExecutionDAG.
                  </p>
                </div>
              </article>

              <article className="p-5 bg-retro-surface border-2 border-retro-border hover:border-retro-indigo/70 shadow-[4px_4px_0px_#000] transition-colors" data-purpose="track-anakin">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1 min-w-[200px]">
                    <h3 className="font-arcade text-xs text-white text-retro-indigoLight uppercase tracking-wider">ANAKIN</h3>
                    <p className="font-code text-xs text-slate-500">// AI Remediation Agent</p>
                  </div>
                  <p className="font-code text-sm text-slate-300 flex-1 leading-relaxed">
                    Evaluates the ExecutionDAG using rule-based scoring (Rule R08 confidence gating) or an LLM provider. Generates unified diff patches and pushes them to GitHub via API.
                  </p>
                </div>
              </article>
            </div>
          </section>

          <section className="space-y-5 pt-4" data-purpose="api-reference-section" id="section-api">
            <div className="flex items-center space-x-3 border-b-2 border-retro-border pb-3">
              <h2 className="font-arcade text-base sm:text-lg text-retro-indigoBright uppercase tracking-wide">
                3. API REFERENCE
              </h2>
            </div>
            <div className="bg-retro-surface border-2 border-retro-border shadow-[4px_4px_0px_#000] overflow-x-auto">
              <table className="w-full text-left border-collapse" data-purpose="api-endpoints-table">
                <thead>
                  <tr className="border-b-2 border-retro-border bg-[#0e1428]">
                    <th className="p-4 font-arcade text-[9px] text-slate-400 tracking-wider w-28">METHOD</th>
                    <th className="p-4 font-arcade text-[9px] text-slate-400 tracking-wider">PATH</th>
                    <th className="p-4 font-arcade text-[9px] text-slate-400 tracking-wider">SERVICE</th>
                    <th className="p-4 font-arcade text-[9px] text-slate-400 tracking-wider min-w-[280px]">DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-retro-border font-code text-xs">
                  <tr className="hover:bg-retro-surfaceHover/50 transition-colors">
                    <td className="p-4 align-top">
                      <span className="inline-block px-2 py-1 font-arcade text-[8px] bg-retro-indigo/20 text-indigo-300 border border-retro-indigo/50 shadow-[1px_1px_0px_#000]">POST</span>
                    </td>
                    <td className="p-4 align-top font-arcade text-[9px] text-amber-300 tracking-wider">/api/v1/webhook/github</td>
                    <td className="p-4 align-top text-slate-400">
                      <div className="font-bold text-slate-300">Orchestrator</div>
                      <div className="text-[11px] text-slate-500">:8000</div>
                    </td>
                    <td className="p-4 align-top text-slate-300 leading-relaxed">
                      Receives GitHub PR webhook payload. Verifies HMAC-SHA256 signature. Queues detonation job. Returns HTTP 202.
                    </td>
                  </tr>

                  <tr className="hover:bg-retro-surfaceHover/50 transition-colors">
                    <td className="p-4 align-top">
                      <span className="inline-block px-2 py-1 font-arcade text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-600 shadow-[1px_1px_0px_#000]">GET</span>
                    </td>
                    <td className="p-4 align-top font-arcade text-[9px] text-amber-300 tracking-wider">/api/v1/telemetry/events</td>
                    <td className="p-4 align-top text-slate-400">
                      <div className="font-bold text-slate-300">Telemetry</div>
                      <div className="text-[11px] text-slate-500">:8001</div>
                    </td>
                    <td className="p-4 align-top text-slate-300 leading-relaxed">
                      Returns all in-memory telemetry events and payloads ingested since last restart.
                    </td>
                  </tr>

                  <tr className="hover:bg-retro-surfaceHover/50 transition-colors">
                    <td className="p-4 align-top">
                      <span className="inline-block px-2 py-1 font-arcade text-[8px] bg-retro-indigo/20 text-indigo-300 border border-retro-indigo/50 shadow-[1px_1px_0px_#000]">POST</span>
                    </td>
                    <td className="p-4 align-top font-arcade text-[9px] text-amber-300 tracking-wider">/api/v1/telemetry/events</td>
                    <td className="p-4 align-top text-slate-400">
                      <div className="font-bold text-slate-300">Telemetry</div>
                      <div className="text-[11px] text-slate-500">:8001</div>
                    </td>
                    <td className="p-4 align-top text-slate-300 leading-relaxed">
                      Ingests a TelemetryEventPayload. Triggers TRACECOMMON normalization and ANAKIN triage in background task.
                    </td>
                  </tr>

                  <tr className="hover:bg-retro-surfaceHover/50 transition-colors">
                    <td className="p-4 align-top">
                      <span className="inline-block px-2 py-1 font-arcade text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-600 shadow-[1px_1px_0px_#000]">GET</span>
                    </td>
                    <td className="p-4 align-top font-arcade text-[9px] text-amber-300 tracking-wider">/health</td>
                    <td className="p-4 align-top text-slate-400">
                      <div className="font-bold text-slate-300">Both services</div>
                    </td>
                    <td className="p-4 align-top text-slate-300 leading-relaxed">
                      Health check endpoint. Returns <code className="font-arcade text-[8px] bg-black/60 px-1 py-0.5 text-emerald-300 border border-emerald-800">{"{\"status\": \"healthy\"}"}</code>.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-5 pt-4" data-purpose="sandbox-guide-section" id="section-sandbox">
            <div className="flex items-center space-x-3 border-b-2 border-retro-border pb-3">
              <h2 className="font-arcade text-base sm:text-lg text-retro-indigoBright uppercase tracking-wide">
                4. USING THE SANDBOX
              </h2>
            </div>
            <div className="bg-retro-surface p-6 border-2 border-retro-border shadow-[4px_4px_0px_#000] space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-7 h-7 flex-shrink-0 bg-retro-indigo text-white font-arcade text-xs flex items-center justify-center border border-indigo-300 shadow-[2px_2px_0px_#000]">1</div>
                <p className="font-code text-sm text-slate-300 pt-1 leading-relaxed">
                  Navigate to the Sandbox page from the navbar.
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-7 h-7 flex-shrink-0 bg-retro-indigo text-white font-arcade text-xs flex items-center justify-center border border-indigo-300 shadow-[2px_2px_0px_#000]">2</div>
                <p className="font-code text-sm text-slate-300 pt-1 leading-relaxed">
                  Paste a GitHub Pull Request URL (e.g. <span className="text-amber-300 underline decoration-dotted">https://github.com/org/repo/pull/42</span>) into the input field.
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-7 h-7 flex-shrink-0 bg-retro-indigo text-white font-arcade text-xs flex items-center justify-center border border-indigo-300 shadow-[2px_2px_0px_#000]">3</div>
                <p className="font-code text-sm text-slate-300 pt-1 leading-relaxed">
                  Configure the toggles: <strong className="text-white">Inject Honeypots</strong>, <strong className="text-white">Block Outbound Sockets</strong>, <strong className="text-white">Bypass Cache</strong>.
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-7 h-7 flex-shrink-0 bg-retro-indigo text-white font-arcade text-xs flex items-center justify-center border border-indigo-300 shadow-[2px_2px_0px_#000]">4</div>
                <p className="font-code text-sm text-slate-300 pt-1 leading-relaxed">
                  Click <span className="inline-block px-1.5 py-0.5 bg-retro-indigo/30 border border-retro-indigo text-amber-300 font-arcade text-[9px]">⚡ Detonate in MicroVM</span> to start the pipeline.
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-7 h-7 flex-shrink-0 bg-retro-indigo text-white font-arcade text-xs flex items-center justify-center border border-indigo-300 shadow-[2px_2px_0px_#000]">5</div>
                <p className="font-code text-sm text-slate-300 pt-1 leading-relaxed">
                  Watch the left terminal panel for live pipeline logs and the right panel for real-time eBPF kernel events.
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-7 h-7 flex-shrink-0 bg-retro-indigo text-white font-arcade text-xs flex items-center justify-center border border-indigo-300 shadow-[2px_2px_0px_#000]">6</div>
                <p className="font-code text-sm text-slate-300 pt-1 leading-relaxed">
                  After analysis, review the TRACECOMMON Attack Graph. Click nodes to inspect syscall details.
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-7 h-7 flex-shrink-0 bg-retro-indigo text-white font-arcade text-xs flex items-center justify-center border border-indigo-300 shadow-[2px_2px_0px_#000]">7</div>
                <p className="font-code text-sm text-slate-300 pt-1 leading-relaxed">
                  If a threat is detected, review the ANAKIN-generated unified diff patch.
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-7 h-7 flex-shrink-0 bg-retro-indigo text-white font-arcade text-xs flex items-center justify-center border border-indigo-300 shadow-[2px_2px_0px_#000]">8</div>
                <p className="font-code text-sm text-slate-300 pt-1 leading-relaxed">
                  Click <span className="text-amber-300 font-arcade text-[9px]">✨ Commit Patch &amp; Merge</span> to push the fix to the developer's branch, or <span className="text-retro-crimson font-arcade text-[9px]">✕ Reject &amp; Close PR</span>.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-5 pt-4" data-purpose="env-variables-section" id="section-env">
            <div className="flex items-center space-x-3 border-b-2 border-retro-border pb-3">
              <h2 className="font-arcade text-base sm:text-lg text-retro-indigoBright uppercase tracking-wide">
                5. ENVIRONMENT VARIABLES
              </h2>
            </div>
            <div className="bg-retro-surface border-2 border-retro-border shadow-[4px_4px_0px_#000] overflow-x-auto">
              <table className="w-full text-left border-collapse" data-purpose="env-table">
                <thead>
                  <tr className="border-b-2 border-retro-border bg-[#0e1428]">
                    <th className="p-4 font-arcade text-[9px] text-slate-400 tracking-wider sm:w-1/3">VARIABLE</th>
                    <th className="p-4 font-arcade text-[9px] text-slate-400 tracking-wider">DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-retro-border font-code text-xs">
                  <tr className="hover:bg-retro-surfaceHover/50 transition-colors">
                    <td className="p-4 align-top font-arcade text-[9px] text-emerald-400 tracking-wide break-all">
                      GITHUB_WEBHOOK_SECRET
                    </td>
                    <td className="p-4 align-top text-slate-300 leading-relaxed">
                      HMAC secret for verifying GitHub webhook signatures.
                    </td>
                  </tr>
                  <tr className="hover:bg-retro-surfaceHover/50 transition-colors">
                    <td className="p-4 align-top font-arcade text-[9px] text-emerald-400 tracking-wide break-all">
                      GITHUB_TOKEN
                    </td>
                    <td className="p-4 align-top text-slate-300 leading-relaxed">
                      Personal access token for committing patches and managing PRs.
                    </td>
                  </tr>
                  <tr className="hover:bg-retro-surfaceHover/50 transition-colors">
                    <td className="p-4 align-top font-arcade text-[9px] text-emerald-400 tracking-wide break-all">
                      OPENAI_API_KEY
                    </td>
                    <td className="p-4 align-top text-slate-300 leading-relaxed">
                      (Optional) OpenAI key for ANAKIN LLM triage. Falls back to rule-based.
                    </td>
                  </tr>
                  <tr className="hover:bg-retro-surfaceHover/50 transition-colors">
                    <td className="p-4 align-top font-arcade text-[9px] text-emerald-400 tracking-wide break-all">
                      ANTHROPIC_API_KEY
                    </td>
                    <td className="p-4 align-top text-slate-300 leading-relaxed">
                      (Optional) Anthropic key as alternative LLM provider.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <footer className="mt-20 border-t-2 border-retro-border bg-[#060814] py-8 text-center relative z-40" data-purpose="site-footer">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-retro-indigo inline-block"></span>
              <span className="font-arcade text-[8px] sm:text-[9px] text-slate-400 tracking-wider">
                © 2026 PRISON — PULL REQUEST ISOLATION &amp; SECURITY OBSERVATION NETWORK
              </span>
            </div>
            <div className="font-arcade text-[8px] sm:text-[9px] text-retro-emerald flex items-center space-x-1.5">
              <span>■</span>
              <span>V1.0.0 — ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
