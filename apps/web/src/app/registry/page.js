'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ToastContainer from '@/components/Toast';
import { MOCK_REGISTRY } from '@/lib/api';

const SEVERITY_COLOR = (s) => s >= 80 ? 'var(--red)' : s >= 40 ? 'var(--amber)' : 'var(--green)';
const GATING_BADGE = { BLOCK_PR: 'badge-red', ALLOW_MERGE: 'badge-green', FLAG_MANUAL_REVIEW: 'badge-amber' };
const STATUS_BADGE = { HONEYPOT_HALTED: 'badge-red', COMPLETED: 'badge-green', TIMEOUT: 'badge-amber', ERROR: 'badge-red' };

export default function RegistryPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_REGISTRY.filter((r) => {
    const matchFilter = filter === 'all' || r.status === filter || r.gating === filter;
    const matchSearch = r.repo.toLowerCase().includes(search.toLowerCase()) || String(r.pr).includes(search);
    return matchFilter && matchSearch;
  });

  const stats = {
    total:   MOCK_REGISTRY.length,
    blocked: MOCK_REGISTRY.filter((r) => r.gating === 'BLOCK_PR').length,
    clean:   MOCK_REGISTRY.filter((r) => r.gating === 'ALLOW_MERGE').length,
    review:  MOCK_REGISTRY.filter((r) => r.gating === 'FLAG_MANUAL_REVIEW').length,
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div style={{ padding: '2rem', minHeight: 'calc(100vh - 100px)' }}>

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">🗂 Threat Registry</h1>
          <p className="page-subtitle">Complete history of all PR detonations, threat detections, and remediation patches.</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Scans',  val: stats.total,   color: 'var(--cyan)',  icon: '🔬' },
            { label: 'PRs Blocked',  val: stats.blocked, color: 'var(--red)',   icon: '🚫' },
            { label: 'Clean PRs',    val: stats.clean,   color: 'var(--green)', icon: '✅' },
            { label: 'Under Review', val: stats.review,  color: 'var(--amber)', icon: '⚠️' },
          ].map((s) => (
            <div key={s.label} className="glass-card metric-card">
              <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
              <div className="metric-val" style={{ color: s.color }}>{s.val}</div>
              <div className="metric-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
            <input id="registry-search" className="input-field" placeholder="Search by repo or PR number…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'HONEYPOT_HALTED', 'COMPLETED', 'TIMEOUT', 'BLOCK_PR', 'ALLOW_MERGE'].map((f) => (
              <button id={`filter-${f}`} key={f} className={`btn btn-sm ${filter === f ? 'btn-outline-cyan' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Sandbox ID</th>
                <th>Repository</th>
                <th>PR</th>
                <th>Threat</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Gating Action</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--cyan)' }}>{row.id}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{row.repo}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>#{row.pr}</td>
                  <td>
                    <span style={{ color: row.severity >= 80 ? 'var(--red)' : row.severity >= 40 ? 'var(--amber)' : 'var(--green)', fontSize: '0.8rem', fontWeight: 600 }}>
                      {row.threat}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ height: 6, width: 60, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${row.severity}%`, background: SEVERITY_COLOR(row.severity), borderRadius: 3, transition: 'width 0.5s ease' }} />
                      </div>
                      <span style={{ color: SEVERITY_COLOR(row.severity), fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700 }}>{row.severity}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${STATUS_BADGE[row.status] || 'badge-muted'}`}>{row.status.replace('_', ' ')}</span></td>
                  <td><span className={`badge ${GATING_BADGE[row.gating] || 'badge-muted'}`}>{row.gating.replace(/_/g, ' ')}</span></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(row.ts).toLocaleString()}
                  </td>
                  <td>
                    <Link href="/sandbox" id={`registry-view-${row.id}`} className="btn btn-ghost btn-sm">View →</Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No results found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
