'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/sandbox', label: 'Sandbox' },
  { href: '/registry', label: 'Threat Registry' },
  { href: '/docs', label: 'Docs' },
];

export default function Navbar({ variant = 'landing' }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link href="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
        <div className="navbar-logo-icon">PR</div>
        <div>
          <div className="navbar-logo-text" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.12em' }}>
            PRISON
          </div>
          <div className="navbar-logo-sub">Security Network</div>
        </div>
      </Link>

      {/* Nav Links */}
      <ul className="navbar-nav" style={{ display: 'flex', gap: '0.25rem', listStyle: 'none' }}>
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="navbar-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="pulse-dot green" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            All Systems Online
          </span>
        </div>
        <Link href="/sandbox" className="btn btn-primary btn-sm">
          ⚡ Detonate PR
        </Link>
      </div>
    </nav>
  );
}
