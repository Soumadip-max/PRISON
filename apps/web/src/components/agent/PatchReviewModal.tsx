'use client';
import React, { useState } from 'react';

export default function PatchReviewModal({ patch, repoFullName, prNumber, onClose }) {
  const [loading, setLoading]     = useState(false);
  const [applied, setApplied]     = useState(false);
  const [toastMsg, setToastMsg]   = useState(null);

  if (!patch) return null;

  // ── normalise diff field name ─────────────────────────────────────────────
  // page.js stores it as `unified_diff`, legacy code used `diff` — accept both
  const diffText = patch.unified_diff || patch.diff || '# No diff available';

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleApplyPatch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orchestrator/api/v1/agent/apply-patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_full_name: repoFullName || 'demo/repo',
          pr_number:      prNumber     || 42,
          branch_name:    patch.branch_name || 'prison/patch-branch',
          patch_diff:     diffText,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setApplied(true);
        showToast('✅ Patch applied! Redirecting to GitHub PR…', 'success');
        const target = data.pr_url || `https://github.com/${repoFullName || 'demo/repo'}/pull/${prNumber || 42}`;
        setTimeout(() => window.open(target, '_blank'), 1200);
        if (onClose) onClose();
      } else {
        showToast(`❌ Failed to apply patch: ${data.detail || res.status}`, 'error');
      }
    } catch (err) {
      showToast(`❌ Network error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPR = () => {
    const prUrl = `https://github.com/${repoFullName || 'demo/repo'}/pull/${prNumber || 42}`;
    window.open(prUrl, '_blank');
  };

  return (
    <div
      id="anakin-patch-card"
      style={{
        background:    'linear-gradient(135deg, rgba(0,255,163,0.04), rgba(0,255,163,0.01))',
        border:        '1px solid var(--cyan)',
        borderRadius:  12,
        padding:       '1.75rem',
        marginBottom:  '1.5rem',
        position:      'relative',
      }}
    >
      {/* ── Inline toast ──────────────────────────────────── */}
      {toastMsg && (
        <div style={{
          position:     'absolute', top: '1rem', right: '1rem',
          background:   toastMsg.type === 'success' ? 'rgba(0,255,163,0.12)' : 'rgba(255,45,85,0.12)',
          border:       `1px solid ${toastMsg.type === 'success' ? 'var(--green)' : 'var(--red)'}`,
          borderRadius: 8, padding: '0.6rem 1rem',
          fontFamily:   'var(--font-mono)', fontSize: '0.78rem',
          color:        toastMsg.type === 'success' ? 'var(--green)' : 'var(--red)',
          zIndex:       100,
        }}>
          {toastMsg.msg}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{
          fontFamily:     'var(--font-display)', color: 'var(--cyan)',
          textTransform:  'uppercase', letterSpacing: '0.05em',
          margin: 0, fontSize: '0.95rem',
        }}>
          🤖 ANAKIN Security Remediation Patch
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {applied && <span className="badge badge-green">✓ Applied</span>}
          <span className="badge badge-green">Patch Ready</span>
        </div>
      </div>

      {patch.summary && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          {patch.summary}
        </p>
      )}

      {/* ── Diff Viewer ───────────────────────────────────── */}
      <div style={{
        background:    '#0d1117', borderRadius: 8,
        padding:       '1rem',   overflowX: 'auto',
        marginBottom:  '1.5rem', border: '1px solid var(--border)',
        maxHeight:     '340px',  overflowY: 'auto',
      }}>
        <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.78rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {diffText.split('\n').map((line, idx) => {
            let color = '#8b949e';
            if (line.startsWith('+') && !line.startsWith('+++')) color = '#3fb950';
            else if (line.startsWith('-') && !line.startsWith('---'))  color = '#f85149';
            else if (line.startsWith('@@'))  color = '#58a6ff';
            else if (line.startsWith('+++') || line.startsWith('---')) color = '#c9d1d9';
            return (
              <div key={idx} style={{ color }}>
                {line}
              </div>
            );
          })}
        </pre>
      </div>

      {/* ── Branch info ───────────────────────────────────── */}
      {patch.branch_name && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
          color:      'var(--text-muted)',  marginBottom: '1.25rem',
        }}>
          Branch: <span style={{ color: 'var(--cyan)' }}>{patch.branch_name}</span>
          {patch.target_file && (
            <> &nbsp;·&nbsp; File: <span style={{ color: 'var(--cyan)' }}>{patch.target_file}</span></>
          )}
        </div>
      )}

      {/* ── Action Buttons ────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          id="btn-view-pr"
          onClick={handleViewPR}
          className="btn btn-ghost"
          style={{ fontSize: '0.85rem' }}
        >
          🔗 View PR on GitHub
        </button>
        <button
          id="btn-apply-patch"
          onClick={handleApplyPatch}
          className="btn btn-primary"
          disabled={loading || applied}
          style={{ background: applied ? 'var(--bg-secondary)' : 'var(--green)', color: '#000', fontSize: '0.85rem' }}
        >
          {applied ? '✓ Patch Applied' : loading ? '⏳ Applying…' : '🚀 Approve & Apply Patch to GitHub PR'}
        </button>
      </div>
    </div>
  );
}
