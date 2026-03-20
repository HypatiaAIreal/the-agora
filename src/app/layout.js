import "./globals.css";

export const metadata = {
  title: 'The Agora \u2014 Four Voices \u00b7 One Space',
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
