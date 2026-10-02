import './globals.css';
import ToastContainer from '@/components/Toast';

export const metadata = {
  title: 'PRISON — Pull Request Isolation & Security Observation Network',
  description: 'Autonomous AI-powered supply chain attack detection. Detonate PRs in microVMs, trace with eBPF, remediate with ANAKIN AI.',
  keywords: 'DevSecOps, supply chain security, eBPF, microVM, CI/CD security, AI remediation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
