export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
      color: "#f0f6fc",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "rgba(22, 27, 34, 0.8)",
        border: "1px solid #30363d",
        borderRadius: "12px",
        padding: "2.5rem",
        maxWidth: "600px",
        width: "100%",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)"
      }}>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: 700,
          background: "linear-gradient(90deg, #58a6ff 0%, #bc8cff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "1rem"
        }}>
          PRISON Control Center
        </h1>
        <p style={{ color: "#8b949e", lineHeight: 1.6 }}>
          Pull Request Isolation &amp; Security Observation Network.
          MicroVM detonation sandboxes, low-level eBPF probes, and synthetic honeypot monitoring.
        </p>

        <div style={{ marginTop: "2rem", display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ background: "#21262d", padding: "1rem", borderRadius: "8px", border: "1px solid #30363d" }}>
            <span style={{ fontSize: "0.85rem", color: "#8b949e" }}>Orchestrator</span>
            <div style={{ color: "#3fb950", fontWeight: 600, marginTop: "4px" }}>Active (Port 8000)</div>
          </div>
          <div style={{ background: "#21262d", padding: "1rem", borderRadius: "8px", border: "1px solid #30363d" }}>
            <span style={{ fontSize: "0.85rem", color: "#8b949e" }}>Telemetry &amp; eBPF</span>
            <div style={{ color: "#3fb950", fontWeight: 600, marginTop: "4px" }}>Active (Port 8001)</div>
          </div>
        </div>
      </div>
    </main>
  );
}
