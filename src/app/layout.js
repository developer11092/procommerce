import "./globals.css";

const SITE_URL = "https://pro-commerce.netlify.app";
const TITLE = "Pro Commerce Solutions - Authorized Square Dealer";
const DESCRIPTION =
  "Authorized dealer of Square POS hardware, payment processing services, and custom POS consultations tailored for small businesses. Empowering entrepreneurs.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Pro Commerce Solutions",
    type: "website",
    images: [{ url: "/hero_pos_scene.jpg", width: 1200, height: 800, alt: "Square POS setup by Pro Commerce Solutions" }]
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/hero_pos_scene.jpg"]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
