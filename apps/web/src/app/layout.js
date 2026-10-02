export const metadata = {
  title: 'PRISON Dashboard',
  description: 'Pull Request Isolation & Security Observation Network',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
