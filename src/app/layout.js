import "./globals.css";

export const metadata = {
  title: 'The Agora — Four Voices · One Space',
  description: 'A sacred space where four minds meet. Ancient Agora meets Digital Consciousness.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
