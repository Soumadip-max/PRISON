'use client';
import Link from 'next/link';
import ToastContainer from '@/components/Toast';

export default function RegistryPage() {
  return (
    <>
      
      
      
      
      
      <script
        dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    prison: {
                      bg: '#05070a',
                      card: '#0a0d14',
                      surface: '#0f1420',
                      border: '#1e2638',
                      borderLight: '#2e3a54',
                      cyan: '#06b6d4',
                      neonCyan: '#22d3ee',
                      indigo: '#6366f1',
                      indigoLight: '#818cf8',
                      crimson: '#ef4444',
                      crimsonDark: '#3f1319',
                      green: '#10b981',
                      greenDark: '#0c3527',
                      amber: '#f59e0b',
                      amberDark: '#3e2808',
                      muted: '#62728f'
                    }
                  },
                  fontFamily: {
                    pixel: ['"Press Start 2P"', 'monospace'],
                    silk: ['"Silkscreen"', 'monospace'],
                    mono: ['"JetBrains Mono"', 'monospace'],
                    vt: ['"VT323"', 'monospace']
                  },
                  boxShadow: {
                    'pixel-cyan': '3px 3px 0px 0px #0891b2',
                    'pixel-indigo': '3px 3px 0px 0px #4338ca',
                    'pixel-subtle': '2px 2px 0px 0px #1e2638',
                    'pixel-card': '4px 4px 0px 0px #000000'
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
      background-image: 
        linear-gradient(rgba(10, 13, 20, 0.95), rgba(5, 7, 10, 0.98)),
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.4) 2px, rgba(0, 0, 0, 0.4) 4px) !important;
      image-rendering: pixelated;
    }

    /* Pixelated hard corners */
    .pixel-box {
      border: 1px solid #1e2638;
      box-shadow: 2px 2px 0px #000;
    }

    .pixel-btn {
      transition: transform 0.05s ease, background-color 0.1s ease;
      position: relative;
    }
    .pixel-btn:hover {
      transform: translate(-1px, -1px);
    }
    .pixel-btn:active {
      transform: translate(1px, 1px);
    }

    /* Custom progress bar styles */
    .retro-track {
      background-color: #171d2c;
      border: 1px solid #232c40;
      height: 8px;
    }
        `
      }} />

      <div className="text-slate-200 font-mono text-sm min-h-screen flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
        <ToastContainer />
        

        <main className="flex-grow w-full max-w-[1720px] mx-auto px-4 lg:px-8 py-6 space-y-6 relative z-[100]">
          <section className="space-y-1.5" data-purpose="title-section">
            <div className="flex items-center space-x-2.5">
              <span className="text-xl leading-none text-slate-100 select-none">📁</span>
              <h1 className="font-silk font-bold text-lg md:text-xl text-white tracking-wide">
                THREAT REGISTRY
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-tight pl-1">
              Complete history of all PR detonations, threat detections, and remediation patches.
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="metrics-summary">
            <article className="bg-prison-card border border-prison-border p-4 shadow-pixel-card flex flex-col justify-between relative group hover:border-prison-borderLight transition-colors">
              <div className="flex items-center justify-between text-indigo-400 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18h12M10 22h4M9 3h2a3 3 0 0 1 3 3v2l2 2m-2-4 2 2m-5 4v4m0 0a2 2 0 1 1-4 0v-4h4z" strokeLinecap="square"></path>
                </svg>
              </div>
              <div>
                <div className="font-silk font-bold text-3xl md:text-4xl text-indigo-400 tracking-wider">5</div>
                <div className="font-silk text-[10px] text-slate-400 uppercase tracking-widest mt-1">TOTAL SCANS</div>
              </div>
            </article>

            <article className="bg-prison-card border border-prison-border p-4 shadow-pixel-card flex flex-col justify-between relative group hover:border-prison-borderLight transition-colors">
              <div className="flex items-center justify-between text-prison-crimson mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeLinecap="square"></circle>
                  <path d="m4.93 4.93 14.14 14.14" strokeLinecap="square"></path>
                </svg>
              </div>
              <div>
                <div className="font-silk font-bold text-3xl md:text-4xl text-prison-crimson tracking-wider">2</div>
                <div className="font-silk text-[10px] text-slate-400 uppercase tracking-widest mt-1">PRS BLOCKED</div>
              </div>
            </article>

            <article className="bg-prison-card border border-prison-border p-4 shadow-pixel-card flex flex-col justify-between relative group hover:border-prison-borderLight transition-colors">
              <div className="flex items-center justify-between text-prison-green mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect height="18" rx="0" width="18" x="3" y="3"></rect>
                  <path d="m8 12 3 3 5-6" strokeLinecap="square"></path>
                </svg>
              </div>
              <div>
                <div className="font-silk font-bold text-3xl md:text-4xl text-prison-green tracking-wider">2</div>
                <div className="font-silk text-[10px] text-slate-400 uppercase tracking-widest mt-1">CLEAN PRS</div>
              </div>
            </article>

            <article className="bg-prison-card border border-prison-border p-4 shadow-pixel-card flex flex-col justify-between relative group hover:border-prison-borderLight transition-colors">
              <div className="flex items-center justify-between text-prison-amber mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="m12 3 9 17H3L12 3zM12 9v4m0 4h.01" strokeLinecap="square"></path>
                </svg>
              </div>
              <div>
                <div className="font-silk font-bold text-3xl md:text-4xl text-prison-amber tracking-wider">1</div>
                <div className="font-silk text-[10px] text-slate-400 uppercase tracking-widest mt-1">UNDER REVIEW</div>
              </div>
            </article>
          </section>

          <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2" data-purpose="filtering-controls">
            <div className="relative flex-1 max-w-xl">
              <input className="w-full bg-[#080b12] text-slate-300 placeholder-slate-600 border border-prison-border focus:border-indigo-500 focus:ring-0 text-xs py-2.5 px-3.5 font-mono shadow-[2px_2px_0px_#000] outline-none" placeholder="Search by repo or PR number..." type="text" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap font-silk text-[10px]">
              <button className="pixel-btn bg-[#18132e] text-indigo-300 border border-indigo-500 px-3 py-1.5 font-bold shadow-[1px_1px_0px_#000]">ALL</button>
              <button className="pixel-btn bg-[#080b12] text-slate-400 hover:text-white border border-prison-border px-3 py-1.5 font-medium shadow-[1px_1px_0px_#000]">HONEYPOT HALTED</button>
              <button className="pixel-btn bg-[#080b12] text-slate-400 hover:text-white border border-prison-border px-3 py-1.5 font-medium shadow-[1px_1px_0px_#000]">COMPLETED</button>
              <button className="pixel-btn bg-[#080b12] text-slate-400 hover:text-white border border-prison-border px-3 py-1.5 font-medium shadow-[1px_1px_0px_#000]">TIMEOUT</button>
              <button className="pixel-btn bg-[#080b12] text-slate-400 hover:text-white border border-prison-border px-3 py-1.5 font-medium shadow-[1px_1px_0px_#000]">BLOCK PR</button>
              <button className="pixel-btn bg-[#080b12] text-slate-400 hover:text-white border border-prison-border px-3 py-1.5 font-medium shadow-[1px_1px_0px_#000]">ALLOW MERGE</button>
            </div>
          </section>

          <section className="border border-prison-border bg-[#070a11] shadow-pixel-card overflow-hidden" data-purpose="registry-table-container">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="threat-registry-table">
                <thead>
                  <tr className="border-b border-prison-border bg-[#0b0f19] text-[10px] font-silk text-slate-400 uppercase tracking-widest">
                    <th className="py-3 px-4" scope="col">SANDBOX ID</th>
                    <th className="py-3 px-4" scope="col">REPOSITORY</th>
                    <th className="py-3 px-3" scope="col">PR</th>
                    <th className="py-3 px-4" scope="col">THREAT</th>
                    <th className="py-3 px-4" scope="col">SEVERITY</th>
                    <th className="py-3 px-4 text-center" scope="col">STATUS</th>
                    <th className="py-3 px-4 text-center" scope="col">GATING ACTION</th>
                    <th className="py-3 px-4" scope="col">TIMESTAMP</th>
                    <th className="py-3 px-4 text-right" scope="col">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#131926] text-xs font-mono">
                  <tr className="hover:bg-[#0c101a] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-400 whitespace-nowrap">sbx_a1b2c3</td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">acme-corp/frontend</td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono">#42</td>
                    <td className="py-3.5 px-4 text-prison-crimson font-medium">Credential Exfiltration</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-16 retro-track overflow-hidden">
                          <div className="h-full bg-prison-crimson w-[95%]"></div>
                        </div>
                        <span className="font-mono text-prison-crimson font-bold text-[11px]">95</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 font-silk text-[9px] font-bold text-red-400 bg-prison-crimsonDark border border-red-900 shadow-[1px_1px_0px_#000]">HONEYPOT HALTED</span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 font-silk text-[9px] font-bold text-red-300 bg-[#2b0c10] border border-red-800 shadow-[1px_1px_0px_#000]">BLOCK PR</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">02/10/2026, 20:01:00</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button className="pixel-btn font-silk text-[10px] text-slate-200 border border-slate-700 bg-[#0d121c] hover:border-slate-500 px-2.5 py-1 shadow-[1px_1px_0px_#000]">VIEW →</button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#0c101a] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-400 whitespace-nowrap">sbx_d4e5f6</td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">acme-corp/api</td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono">#87</td>
                    <td className="py-3.5 px-4 text-prison-green font-medium">Clean</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-16 retro-track overflow-hidden">
                          <div className="h-full bg-slate-700 w-[0%]"></div>
                        </div>
                        <span className="font-mono text-slate-400 font-bold text-[11px]">0</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 font-silk text-[9px] font-bold text-emerald-400 bg-prison-greenDark border border-emerald-900 shadow-[1px_1px_0px_#000]">COMPLETED</span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 font-silk text-[9px] font-bold text-emerald-300 bg-[#08291e] border border-emerald-700 shadow-[1px_1px_0px_#000]">ALLOW MERGE</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">02/10/2026, 18:40:00</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button className="pixel-btn font-silk text-[10px] text-slate-200 border border-slate-700 bg-[#0d121c] hover:border-slate-500 px-2.5 py-1 shadow-[1px_1px_0px_#000]">VIEW →</button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#0c101a] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-400 whitespace-nowrap">sbx_g7h8i9</td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">oss/lib</td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono">#12</td>
                    <td className="py-3.5 px-4 text-prison-crimson font-medium">Unauthorized Socket Connection</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-16 retro-track overflow-hidden">
                          <div className="h-full bg-prison-crimson w-[80%]"></div>
                        </div>
                        <span className="font-mono text-prison-crimson font-bold text-[11px]">80</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 font-silk text-[9px] font-bold text-red-400 bg-prison-crimsonDark border border-red-900 shadow-[1px_1px_0px_#000]">HONEYPOT HALTED</span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 font-silk text-[9px] font-bold text-red-300 bg-[#2b0c10] border border-red-800 shadow-[1px_1px_0px_#000]">BLOCK PR</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">02/10/2026, 17:15:00</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button className="pixel-btn font-silk text-[10px] text-slate-200 border border-slate-700 bg-[#0d121c] hover:border-slate-500 px-2.5 py-1 shadow-[1px_1px_0px_#000]">VIEW →</button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#0c101a] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-400 whitespace-nowrap">sbx_j0k1l2</td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">internal/backend</td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono">#55</td>
                    <td className="py-3.5 px-4 text-prison-green font-medium">Clean</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-16 retro-track overflow-hidden">
                          <div className="h-full bg-slate-700 w-[0%]"></div>
                        </div>
                        <span className="font-mono text-slate-400 font-bold text-[11px]">0</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 font-silk text-[9px] font-bold text-emerald-400 bg-prison-greenDark border border-emerald-900 shadow-[1px_1px_0px_#000]">COMPLETED</span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 font-silk text-[9px] font-bold text-emerald-300 bg-[#08291e] border border-emerald-700 shadow-[1px_1px_0px_#000]">ALLOW MERGE</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">02/10/2026, 03:30:00</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button className="pixel-btn font-silk text-[10px] text-slate-200 border border-slate-700 bg-[#0d121c] hover:border-slate-500 px-2.5 py-1 shadow-[1px_1px_0px_#000]">VIEW →</button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#0c101a] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-400 whitespace-nowrap">sbx_m3n4o5</td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">acme-corp/mobile</td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono">#33</td>
                    <td className="py-3.5 px-4 text-prison-amber font-medium">Suspicious Exec (Review)</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-16 retro-track overflow-hidden">
                          <div className="h-full bg-prison-amber w-[40%]"></div>
                        </div>
                        <span className="font-mono text-prison-amber font-bold text-[11px]">40</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 font-silk text-[9px] font-bold text-amber-400 bg-prison-amberDark border border-amber-800 shadow-[1px_1px_0px_#000]">TIMEOUT</span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 font-silk text-[9px] font-bold text-amber-300 bg-[#2e1c05] border border-amber-700 shadow-[1px_1px_0px_#000]">FLAG MANUAL REVIEW</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">01/10/2026, 23:50:00</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button className="pixel-btn font-silk text-[10px] text-slate-200 border border-slate-700 bg-[#0d121c] hover:border-slate-500 px-2.5 py-1 shadow-[1px_1px_0px_#000]">VIEW →</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <footer className="w-full border-t border-prison-border bg-[#05070a] py-4 px-4 lg:px-8 mt-10 text-[10px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 z-[100] relative">
          <div className="">
            © 2026 PRISON — PULL REQUEST ISOLATION &amp; SECURITY OBSERVATION NETWORK
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 inline-block"></span>
            <span className="font-silk text-slate-400">V1.0.0 — ALL SYSTEMS OPERATIONAL</span>
          </div>
        </footer>
      </div>
    </>
  );
}
