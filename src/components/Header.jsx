"use client";

import Image from "next/image";
import { X, Menu } from "lucide-react";
import MagBtn from "./MagBtn";

const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "services", label: "Services" },
  { id: "products", label: "Square Hardware" },
  { id: "plans", label: "Square Plans" },
  { id: "contact", label: "Contact Us" }
];

export default function Header({
  scrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
  currentPage,
  currentSection,
  navigateTo,
  openSurvey
}) {
  const isActive = (id) =>
    id === "products"
      ? currentPage === "products" && currentSection !== "calculator"
      : currentPage === id;

  return (
    <header className={`topbar ${scrolled ? "scrolled" : ""}`}>
      <div className="topbar-inner">
        <div className="logo-wrap">
          <Image src="/LogoIcon.png" alt="Pro Commerce Solutions" width={56} height={56} className="logo-icon" priority />
          <span className="logo-text">
            <span className="brand-title">ProCommerce Solutions</span>
            <span className="brand-sub">Authorized Square Dealer</span>
          </span>
        </div>

        <button
          className="mobile-toggle"
          aria-label="Toggle Navigation Menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`nav-menu ${mobileMenuOpen ? "active" : ""}`}>
          <div className="nav-links">
            {NAV.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${isActive(item.id) ? "active" : ""}`}
                onClick={() => navigateTo(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <MagBtn className="btn primary nav-cta" onClick={openSurvey}>
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </MagBtn>
        </nav>
      </div>
    </header>
  );
}
