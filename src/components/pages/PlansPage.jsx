"use client";

import { memo } from "react";
import { CreditCard, Settings, TrendingUp, Check } from "lucide-react";
import { stock, onImgError, plansVideos } from "../../data/site";

// Static page — memoized so typing in forms elsewhere never re-renders it.
function PlansPage({ active, navigateTo, openSurvey, openUploadModal }) {
  return (
    <div className={`spa-page ${active ? "active" : ""}`} id="plans">
      {/* 1) Square plans — the card grid comes first */}
      <section className="container">
        <div className="section-header animate-on-scroll">
          <span className="kicker">Compare Options</span>
          <h2>Select Your Square Plan</h2>
          <p>Choose the tier that fits your volume and scaling needs. Plus and Premium packages unlock advanced operations.</p>
        </div>

        <div className="plans-grid">
          {/* Free */}
          <div className="plan-card animate-on-scroll" data-dir="left">
            <h3 className="plan-name">Square Free</h3>
            <div className="plan-price">$0<span>/location</span></div>
            <p style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>Core POS tools to get your business processing cards immediately.</p>
            <ul>
              <li>Standard transaction checkout app</li>
              <li>Free Square online ordering page</li>
              <li>Invoicing and basic client profiles</li>
              <li>Multi-location inventory tracking</li>
              <li>Offline mode card payments</li>
            </ul>
            <button className="btn ghost" onClick={() => navigateTo("contact")}>Ask About Free</button>
          </div>

          {/* Plus */}
          <div className="plan-card featured animate-on-scroll" data-dir="up" data-delay="1">
            <span className="plan-featured-tag">Recommended</span>
            <h3 className="plan-name">Square Plus</h3>
            <div className="plan-price">$49<span>/location</span></div>
            <p style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>Advanced features and staff tools for active, scaling businesses.</p>
            <ul>
              <li>Includes all features in Free</li>
              <li>Advanced inventory (COGS, vendor orders)</li>
              <li>Staff shift tracking & employee access levels</li>
              <li>Barcode scanner catalog configurations</li>
              <li>Unlocked KDS and Kiosk app add-ons</li>
              <li>Priority customer support access</li>
            </ul>
            <button className="btn primary" onClick={() => navigateTo("contact")}>Get Plus Configuration</button>
          </div>

          {/* Premium */}
          <div className="plan-card animate-on-scroll" data-dir="right" data-delay="2">
            <h3 className="plan-name">Square Premium</h3>
            <div className="plan-price">Custom<span>/custom pricing</span></div>
            <p style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>For high-volume merchants processing over $250k/year.</p>
            <ul>
              <li>Includes all features in Plus</li>
              <li>Lower negotiated transaction card rates</li>
              <li>Custom API integrations and API webhooks</li>
              <li>Dedicated Account Manager assigned</li>
              <li>24/7 emergency hotline priority lines</li>
              <li>Custom contract and hardware setups</li>
            </ul>
            <button className="btn ghost" onClick={() => navigateTo("contact")}>Contact For Premium</button>
          </div>
        </div>
      </section>

      {/* 2) What is Square — intro */}
      <section className="container">
        <div className="section-header animate-on-scroll">
          <span className="kicker">The Basics</span>
          <h2>What is Square?</h2>
          <p>Square is an all-in-one platform that helps businesses accept payments and run day-to-day operations. It brings together point-of-sale software, card readers and hardware, payment processing, and back-office tools — so you can sell in person, online, and on the go from one connected system.</p>
        </div>
        <div className="grid grid-3">
          <div className="card animate-on-scroll" data-dir="left">
            <div className="icon-circle"><CreditCard size={24} /></div>
            <h3>Accept Payments</h3>
            <p>Take tap, chip, and contactless cards, plus Apple Pay and Google Pay. Square handles the processing with clear per-transaction pricing and no long-term contracts.</p>
          </div>
          <div className="card animate-on-scroll" data-dir="up" data-delay="1">
            <div className="icon-circle"><Settings size={24} /></div>
            <h3>Run Your Business</h3>
            <p>Manage inventory, staff, customers, and reporting from the POS. Add online ordering, invoices, loyalty, and gift cards as your needs grow — all in one ecosystem.</p>
          </div>
          <div className="card animate-on-scroll" data-dir="right" data-delay="2">
            <div className="icon-circle"><TrendingUp size={24} /></div>
            <h3>Scale With Confidence</h3>
            <p>Start free and upgrade only when you need advanced features. Square grows with you — from a single counter to multiple locations — with hardware you can buy or finance.</p>
          </div>
        </div>
      </section>

      {/* 3) Square video #1 (plays inline) */}
      <section className="container">
        <div className="showcase-row">
          <div className="showcase-media plans-video landscape animate-on-scroll" data-dir="left">
            <video src={plansVideos[0].src} data-autoplay muted controls playsInline preload="metadata" />
          </div>
          <div className="showcase-content animate-on-scroll" data-dir="right" data-delay="1">
            <span className="kicker">{plansVideos[0].kicker}</span>
            <h2>{plansVideos[0].heading}</h2>
            <p>{plansVideos[0].body}</p>
          </div>
        </div>
      </section>

      {/* 4) Built for every kind of business */}
      <section className="container">
        <div className="showcase-row media-right">
          <div className="showcase-content animate-on-scroll" data-dir="left">
            <span className="kicker">One Platform, Every Counter</span>
            <h2>Built for every kind of business</h2>
            <p>Whether you run a full-service restaurant, a busy café, a quick-service counter, or a multi-location retail store, Square adapts to how you work — with the right software plan, hardware, and apps for your day.</p>
            <ul className="showcase-list">
              <li><Check size={18} /> Restaurants: tableside ordering, KDS, and floor maps</li>
              <li><Check size={18} /> Cafés &amp; QSR: fast checkout, kiosks, and loyalty</li>
              <li><Check size={18} /> Retail: inventory, barcodes, and customer profiles</li>
              <li><Check size={18} /> Services: invoices, appointments, and on-the-go payments</li>
            </ul>
            <button className="btn primary" onClick={openSurvey}>Find My Square Setup</button>
          </div>
          <div className="showcase-media animate-on-scroll" data-dir="right" data-delay="1">
            <img src={stock.showcase.src} onError={onImgError(stock.showcase.fb)} alt="Business owner using Square across different counters" loading="lazy" />
          </div>
        </div>
      </section>

      {/* 5) Square video #2 (plays inline, portrait) */}
      <section className="container">
        <div className="showcase-row media-right">
          <div className="showcase-content animate-on-scroll" data-dir="left">
            <span className="kicker">{plansVideos[1].kicker}</span>
            <h2>{plansVideos[1].heading}</h2>
            <p>{plansVideos[1].body}</p>
          </div>
          <div className="showcase-media plans-video portrait animate-on-scroll" data-dir="right" data-delay="1">
            <video src={plansVideos[1].src} data-autoplay muted controls playsInline preload="metadata" />
          </div>
        </div>
      </section>

      {/* 6) High-volume processing note */}
      <section className="container">
        <div className="official-note animate-on-scroll" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
          <div style={{ maxWidth: "750px" }}>
            <h4>High-Volume Processing?</h4>
            <p style={{ fontSize: "0.9rem", marginBottom: 0 }}>If your business processes over $250,000 annually, you qualify for custom payment processing rates. Upload your merchant statement and Dominique will build a custom rate proposal.</p>
          </div>
          <button className="btn secondary" onClick={openUploadModal}>Upload Processing Statement</button>
        </div>
      </section>
    </div>
  );
}

export default memo(PlansPage);
