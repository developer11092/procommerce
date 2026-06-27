"use client";

import Image from "next/image";
import { Mail } from "lucide-react";

const LINKS = [
  { label: "Home Page", page: "home" },
  { label: "About Us", page: "about" },
  { label: "Our Services", page: "services" },
  { label: "Square Hardware", page: "products" },
  { label: "Square Plans", page: "plans" },
  { label: "Cost Calculator", page: "products", section: "calculator" },
  { label: "Contact Us", page: "contact" }
];

export default function Footer({ navigateTo }) {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand">
          <div className="logo-wrap footer-logo">
            <Image src="/LogoIcon.png" alt="Pro Commerce Solutions" width={60} height={60} className="logo-icon" />
            <span className="logo-text">
              <span className="brand-title">ProCommerce Solutions</span>
              <span className="brand-sub">Authorized Square Dealer</span>
            </span>
          </div>
          <p>Your trusted B2B partner for credit card processing, ATM placements, and official Square POS configuration consultations.</p>
        </div>

        <div className="footer-links">
          <h4>Explore</h4>
          <ul>
            {LINKS.map((l) => (
              <li key={l.label}>
                <button onClick={() => navigateTo(l.page, l.section)}>{l.label}</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Direct Contact</h4>
          <p><strong>Dominique Wright</strong><br />Founder &amp; CEO, Pro Commerce Solutions</p>
          <a href="mailto:procommercesolutions@gmail.com" className="footer-contact-item">
            <Mail size={14} />
            <span>procommercesolutions@gmail.com</span>
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Pro Commerce Solutions. Authorized dealer of Square products and services. All rights reserved.</p>
      </div>
    </footer>
  );
}
