import "./globals.css";
import { Toaster } from 'sonner';

export const metadata = {
  title: "Motus | AI-Native Outbound OS",
  description: "Motus is an AI-native outbound operating system for founders, small sales teams, and agencies.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-brand-background font-sans text-brand-foreground antialiased">
        {children}
        <Toaster theme="dark" position="bottom-right" className="!font-sans" />
      </body>
    </html>
  );
}
