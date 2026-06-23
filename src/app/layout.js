import "./globals.css";

export const metadata = {
  title: "Pro Commerce Solutions - Authorized Square Dealer",
  description: "Authorized dealer of Square POS hardware, payment processing services, and custom POS consultations tailored for small businesses. Empowering entrepreneurs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
