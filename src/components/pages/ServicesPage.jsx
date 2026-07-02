"use client";

import { memo } from "react";
import { Search, FileText, Utensils, ShoppingBag, Settings, Zap } from "lucide-react";
import { stock, onImgError } from "../../data/site";

// Static page — memoized so typing in forms elsewhere never re-renders it.
function ServicesPage({ active, navigateTo, openSurveyWithPath, openUploadModal }) {
  const rows = [
    { icon: <Search size={22} />, img: stock.consult, n: "01", title: "Square POS Consultation", desc: "We review your business type, volume, locations, and hardware needs to map the correct Square configuration — so you invest in exactly what fits how you operate.", cta: "Compare Square Plans", onClick: () => navigateTo("plans") },
    { icon: <FileText size={22} />, img: stock.statement, n: "02", title: "Processing Statement Review", desc: "Send a recent processing statement and we break down standard interchange costs versus your current markup, highlighting where you can save.", cta: "Upload Statement", onClick: openUploadModal },
    { icon: <Utensils size={22} />, img: stock.restaurant, n: "03", title: "Restaurant POS Setup", desc: "Set up table-service, bars, cafés, and quick-service operations. We configure menus, kitchen display terminals, modifiers, and floor maps for fast turnaround.", cta: "Restaurant Survey", onClick: () => openSurveyWithPath("restaurant") },
    { icon: <ShoppingBag size={22} />, img: stock.retail, n: "04", title: "Retail POS Setup", desc: "Connect inventory catalogs, barcodes, scanners, checkout stands, receipt printers, and online store integrations into one synced system.", cta: "Retail Survey", onClick: () => openSurveyWithPath("retail") },
    { icon: <Settings size={22} />, img: stock.hardware, n: "05", title: "Square Hardware Setup", desc: "Browse registers, handhelds, stands, kiosks, and chip readers. We curate complete hardware kits matched to your checkout layout and daily flow.", cta: "View Hardware Catalog", onClick: () => navigateTo("products") },
    { icon: <Zap size={22} />, img: stock.onboarding, n: "06", title: "Square Onboarding", desc: "Ready to sign up? As an authorized Square dealer, we provide a direct path for faster profile creation and hands-on onboarding support.", cta: "Start Onboarding", onClick: () => window.open("https://squareup.com/i/5AC21678BF", "_blank", "noopener,noreferrer") }
  ];

  return (
    <div className={`spa-page ${active ? "active" : ""}`} id="services">
      <section className="container">
        <div className="section-header">
          <span className="kicker">What We Do</span>
          <h2>Our Core POS &amp; Processing Services</h2>
          <p>Professional advisory and onboarding — every service leads to a custom qualification and review tailored to your business.</p>
        </div>

        <div className="service-rows">
          {rows.map((s, i) => (
            <div className={`service-row animate-on-scroll ${i % 2 ? "reverse" : ""}`} key={s.n}>
              <div className="service-media">
                <img src={s.img.src} onError={onImgError(s.img.fb)} alt={s.title} loading="lazy" />
                <span className="service-num">{s.n}</span>
              </div>
              <div className="service-content">
                <div className="icon-circle">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <button className="btn primary" onClick={s.onClick}>
                  {s.cta}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default memo(ServicesPage);
