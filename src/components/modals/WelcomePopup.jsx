"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function WelcomePopup({ open, onClose, submitted, onSubmit, form, setForm, loadingAction }) {
  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className={`modal-overlay ${open ? "show" : ""}`} onClick={onClose}>
      <div className="modal-container welcome-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close welcome-close" onClick={onClose} aria-label="Close">&times;</button>
        <div className="welcome-grid">
          <div className="welcome-visual">
            <Image src="/pop-up.jpg" alt="Welcoming local business counter powered by Square" fill sizes="(max-width: 760px) 100vw, 45vw" />
            <div className="welcome-visual-overlay">
              <span className="welcome-badge"><span className="dot"></span>Authorized Square Dealer</span>
              <h3>Let&apos;s build your perfect Square setup</h3>
              <p>Tell us a little about your business and Pro Commerce Solutions will recommend the right POS, hardware, and onboarding path — free.</p>
            </div>
          </div>
          <div className="welcome-form">
            {submitted ? (
              <div className="welcome-success">
                <div className="welcome-success-icon"><ShieldCheck size={34} /></div>
                <h3>You&apos;re all set!</h3>
                <p>Thanks{form.firstName ? `, ${form.firstName}` : ""}. The team at Pro Commerce Solutions will review your details and reach out shortly with tailored recommendations.</p>
                <button className="btn primary" style={{ width: "100%" }} onClick={onClose}>Continue Exploring</button>
              </div>
            ) : (
              <>
                <span className="kicker">Quick Start</span>
                <h3 style={{ marginBottom: "0.35rem" }}>Get a free recommendation</h3>
                <p style={{ fontSize: "0.88rem", marginBottom: "1.25rem" }}>It takes under a minute — no obligation.</p>
                <form onSubmit={onSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First name *</label>
                      <input type="text" placeholder="First name" required value={form.firstName} onChange={set("firstName")} />
                    </div>
                    <div className="form-group">
                      <label>Last name *</label>
                      <input type="text" placeholder="Last name" required value={form.lastName} onChange={set("lastName")} />
                    </div>
                    <div className="form-group full">
                      <label>Email *</label>
                      <input type="email" placeholder="you@business.com" required value={form.email} onChange={set("email")} />
                    </div>
                    <div className="form-group full">
                      <label>Phone <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>(optional)</span></label>
                      <input type="tel" placeholder="(000) 000-0000" value={form.phone} onChange={set("phone")} />
                    </div>
                    <div className="form-group full">
                      <label>Business type</label>
                      <select value={form.businessType} onChange={set("businessType")}>
                        <option value="Restaurant (table service)">Restaurant (table service)</option>
                        <option value="Restaurant (quick service)">Restaurant (quick service)</option>
                        <option value="Cafés & QSR">Cafés &amp; QSR</option>
                        <option value="Retail">Retail</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn primary" style={{ width: "100%", marginTop: "1.1rem" }} disabled={loadingAction === "welcome"}>
                    {loadingAction === "welcome" ? "Submitting..." : "Get My Recommendation"}
                  </button>
                  <button type="button" className="welcome-skip" onClick={onClose}>Maybe later — just browsing</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
