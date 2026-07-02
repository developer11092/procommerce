"use client";

import { memo } from "react";
import Image from "next/image";
import { Target, Shield, Clock, TrendingUp } from "lucide-react";
import { stock, onImgError } from "../../data/site";

// Static page — memoized so typing in forms elsewhere never re-renders it.
function AboutPage({ active, navigateTo }) {
  return (
    <div className={`spa-page ${active ? "active" : ""}`} id="about">
      <section className="container">
        {/* Intro — part 1: who we are */}
        <div className="story-block">
          <div className="hero-text animate-on-scroll" data-dir="left">
            <span className="kicker">Our Journey</span>
            <h2>About Pro Commerce Solutions</h2>
            <div className="story-text">
              <p>Welcome to Pro Commerce Solutions, your trusted partner in modern payment processing. We specialize in credit card processing, ATM machines, and state-of-the-art POS systems tailored specifically for small businesses. We focus on helping small businesses simplify how they accept payments, manage transactions, and prepare for long-term growth using Square-powered solutions.</p>
              <p>Our mission is to revolutionize the way small businesses manage transactions by introducing innovative and trending solutions designed for the black business community. We understand the unique challenges faced by entrepreneurs in our community, and we are dedicated to empowering them with the latest technology and personalized support they need to thrive in today’s fast-paced digital economy.</p>
            </div>
            <div className="hero-actions" style={{ marginTop: "2rem" }}>
              <button className="btn primary" onClick={() => navigateTo("contact")}>Request a Consultation</button>
              <button className="btn ghost" onClick={() => navigateTo("services")}>Explore Our Services</button>
            </div>
          </div>
          <div className="hero-image-container animate-on-scroll" data-dir="right" data-delay="1">
            <img src={stock.about.src} onError={onImgError(stock.about.fb)} alt="Modern Square-powered payments for small business" loading="lazy" />
            <div className="hero-overlay">
              <div className="overlay-metric">
                <strong>Square-powered</strong>
                <span>Payments built for small business</span>
              </div>
            </div>
          </div>
        </div>

        {/* Intro — part 2: how we help (reversed layout, second image) */}
        <div className="story-block reverse">
          <div className="hero-image-container animate-on-scroll" data-dir="left">
            <img src={stock.about2.src} onError={onImgError(stock.about2.fb)} alt="Small business owner serving customers at the counter" loading="lazy" />
            <div className="hero-overlay">
              <div className="overlay-metric">
                <strong>Built around you</strong>
                <span>Configurations that fit how you operate</span>
              </div>
            </div>
          </div>
          <div className="hero-text animate-on-scroll" data-dir="right" data-delay="1">
            <span className="kicker">How We Help</span>
            <h2>A setup built around how you operate</h2>
            <div className="story-text">
              <p>We understand that every business operates differently. A dine-in restaurant may need kitchen coordination and table-service tools. A fast-service concept may need speed, kiosks, and efficient checkout. A retail store may need strong front-counter flows, customer payments, and hardware that fits daily operations.</p>
              <p>That is why Dominique works as a practical advisor — not just a salesperson. He helps business owners understand their options, choose the right setup, and move through onboarding with clarity and confidence — fostering growth, sustainability, and lasting impact for the community he serves.</p>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-4 animate-on-scroll">
          {[
            { icon: <Target size={20} />, t: "Mission", d: "Empower small businesses with clean payment tech and direct advice to survive and thrive." },
            { icon: <Shield size={20} />, t: "Trust", d: "Total transparency on processing margins. We never lock you into multi-year contracts." },
            { icon: <Clock size={20} />, t: "Process", d: "Step-by-step guidance from review, configuration mapping, to launch and live support." },
            { icon: <TrendingUp size={20} />, t: "Growth", d: "Scaling Square ecosystem integrations to help you manage staff, loyalty and cashflow." }
          ].map((v) => (
            <div className="card value-tile" key={v.t}>
              <div className="icon-circle">{v.icon}</div>
              <h4>{v.t}</h4>
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", marginBottom: 0 }}>{v.d}</p>
            </div>
          ))}
        </div>

        {/* Founder bio */}
        <div className="founder-block animate-on-scroll">
          <div className="founder-photo">
            <Image src="/dominique_profile.jpg" alt="Dominique Wright, Founder & CEO" fill sizes="(max-width: 900px) 100vw, 40vw" />
          </div>
          <div className="founder-bio">
            <span className="kicker">Meet the Founder</span>
            <h2>Dominique Wright</h2>
            <p className="founder-role">Founder &amp; CEO, Pro Commerce Solutions</p>
            <p>As a dedicated payments professional, Dominique is passionate about driving innovation and excellence in the financial sector. He founded Pro Commerce Solutions to provide businesses with streamlined payment solutions that enhance efficiency and customer experience.</p>
            <p>In addition to his work at Pro Commerce Solutions, Dominique serves as the CFO on the board of the nonprofit organization “It Takes A Village MN.” In this role, he leverages his financial expertise to help guide the organization’s mission to support and uplift the community.</p>
            <p>A strong advocate for financial literacy, he is committed to empowering the next generation with essential money management skills. He facilitates financial literacy classes for children and young adults, ensuring they have the knowledge needed to thrive financially. He also co-authored “Nourish to Flourish,” a program that taught 14 young individuals about basic financial skills while promoting healthy food choices.</p>
            <p>Through his work, Dominique aims to inspire others to take charge of their financial futures and make informed decisions that enhance their quality of life.</p>
            <p>Feel free to connect with him to learn more about his journey or to explore collaboration opportunities.</p>
            <a href="#contact" onClick={() => navigateTo("contact")} className="btn primary" style={{ marginTop: "0.5rem" }}>Connect with Dominique</a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default memo(AboutPage);
