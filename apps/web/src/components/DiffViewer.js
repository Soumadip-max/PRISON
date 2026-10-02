'use client';

const DIFF_LINES = (diff) =>
  diff.split('\n').map((line, i) => {
    let type = 'ctx';
    if (line.startsWith('+') && !line.startsWith('+++')) type = 'add';
    else if (line.startsWith('-') && !line.startsWith('---')) type = 'rem';
    else if (line.startsWith('@@')) type = 'hunk';
    return { line, type, num: i + 1 };
  });

export default function DiffViewer({ patch, onCommit, onReject, loading }) {
  if (!patch) return null;
  const lines = DIFF_LINES(patch.unified_diff);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div className="glass-card glass-card-green" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '0.25rem' }}>
              🤖 ANAKIN Remediation Patch
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Branch: <span style={{ color: 'var(--green)' }}>{patch.branch_name}</span>
            </div>
          </div>
          <span className="badge badge-green">Auto-Generated</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{patch.summary}</p>
      </div>

      {/* Diff */}
      <div className="diff-viewer">
        <div className="diff-header">
          <span className="diff-filename">📄 {patch.target_file}</span>
          <div style={{ display: 'flex', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            <span style={{ color: 'var(--green)' }}>+{lines.filter((l) => l.type === 'add').length} additions</span>
            <span style={{ color: 'var(--red)' }}>-{lines.filter((l) => l.type === 'rem').length} deletions</span>
          </div>
        </div>
        <div className="diff-body">
          {lines.map(({ line, type, num }) => (
            <div key={num} className={`diff-line diff-${type}`}>
              <div className="diff-line-num">{type !== 'hunk' ? num : ''}</div>
              <div className="diff-line-content">{line || ' '}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', padding: '1rem 0', borderTop: '1px solid var(--border)' }}>
        <button id="btn-reject-pr" className="btn btn-danger" onClick={onReject} disabled={loading}>
          ✕ Reject & Close PR
        </button>
        <button id="btn-view-github" className="btn btn-ghost" onClick={() => window.open('https://github.com', '_blank')}>
          ↗ View on GitHub
        </button>
        <button id="btn-commit-patch" className="btn btn-success" onClick={onCommit} disabled={loading}>
          {loading ? '⏳ Committing…' : '✨ Commit Patch & Merge'}
        </button>
      </div>
    </div>
  );
}
