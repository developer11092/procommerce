"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  FileText,
  Settings,
  CreditCard,
  Mail,
  User,
  Check,
  ShieldCheck,
  TrendingUp,
  Shield,
  Target,
  Clock,
  Utensils,
  ShoppingBag,
  Zap,
  Info,
  Play
} from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import {
  pricingMatrix,
  planInfo,
  trustItems,
  hardwareDetails,
  hardwareBlurbs,
  productMedia
} from "../data/catalog";
import { stock, onImgError, plansVideos, WALKTHROUGH_VIDEO } from "../data/site";
import { submitLead } from "../lib/sheets";
import ChatWidget from "../components/ChatWidget";
import MagBtn from "../components/MagBtn";
import Header from "../components/Header";
import Footer from "../components/Footer";
import VideoModal from "../components/modals/VideoModal";
import ProductModal from "../components/modals/ProductModal";
import WelcomePopup from "../components/modals/WelcomePopup";
import SurveyModal from "../components/modals/SurveyModal";
import UploadModal from "../components/modals/UploadModal";

// Framer Motion entrance variant (used for the hero load-in sequence)
const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.2, 0.7, 0.2, 1] } }
};
const heroStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } }
};
const hoverLift = { whileHover: { y: -3 }, whileTap: { scale: 0.97 } };

export default function Home() {
  // --- STATE ---
  const [currentPage, setCurrentPage] = useState("home");
  const [currentSection, setCurrentSection] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  // Source for the shared video lightbox. Defaults to the setup walkthrough
  // (imported); the Square Plans page swaps in Square's own videos via openVideo().
  const [videoSrc, setVideoSrc] = useState(WALKTHROUGH_VIDEO);
  const [videoTitle, setVideoTitle] = useState("Walkthrough & Setup Video");
  const [activeProductDetail, setActiveProductDetail] = useState(null);
  const [surveyStep, setSurveyStep] = useState(1);

  // Welcome lead-capture popup (opens on first load)
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [welcomeSubmitted, setWelcomeSubmitted] = useState(false);

  // Product spec modal (decoupled open flag for smooth close) + rotating gallery
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [productSlide, setProductSlide] = useState(0);

  // Form Submissions states
  const [surveySubmitSuccess, setSurveySubmitSuccess] = useState(false);
  const [uploadSubmitSuccess, setUploadSubmitSuccess] = useState(false);
  const [contactSubmitSuccess, setContactSubmitSuccess] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null); // 'survey' | 'upload' | 'contact'

  // Calculator Selections
  const [locations, setLocations] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [hardwareQty, setHardwareQty] = useState({
    register: 0,
    handheld: 0,
    terminal: 0,
    stand: 0,
    kioskHardware: 0,
    reader: 0,
    standMount: 0,
    dock: 0,
    magReader: 0,
    accessories: 0
  });
  const [addonQty, setAddonQty] = useState({
    kds: 0,
    kiosk: 0
  });

  // Contact Form Inputs
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "Restaurant (table service)",
    monthlyRevenue: "",
    interestedPlan: "free",
    message: "",
    fileName: ""
  });

  // Survey Form Inputs
  const [surveyForm, setSurveyForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessType: "Restaurant (table service)",
    industry: "",
    monthlyRevenue: "",
    projectedVolume: "",
    dbaName: "",
    legalName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    fileName: ""
  });

  // Upload Form Inputs
  const [uploadForm, setUploadForm] = useState({
    businessName: "",
    email: "",
    currentProcessor: "",
    businessType: "Restaurant (table service)",
    monthlyVolume: "",
    numLocations: "1",
    monthlyFees: "",
    fileName: ""
  });

  // The chatbot is a self-contained component (src/components/ChatWidget).

  // pricingMatrix, planInfo, trustItems are imported from ../data/catalog

  // --- HASH ROUTER EFFECT ---
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || "#home";
      const parts = hash.substring(1).split("/");
      const pageId = parts[0];
      const sectionId = parts[1] || null;
      
      setCurrentPage(pageId);
      setCurrentSection(sectionId);
      setMobileMenuOpen(false);

      if (sectionId) {
        window.scrollTo({ top: 0, behavior: "instant" });
        // Retry until the destination section has rendered (page switch may lag a frame)
        let tries = 0;
        const tryScroll = () => {
          const section = document.getElementById(sectionId);
          if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
          } else if (tries++ < 20) {
            setTimeout(tryScroll, 80);
          }
        };
        setTimeout(tryScroll, 120);
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };

    window.addEventListener("hashchange", handleHash);
    handleHash();

    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // --- SCROLL ACTION FOR NAVBAR ---
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll-progress indicator (Framer Motion)
  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  // --- GSAP SCROLL ENGINE (reveals, parallax, count-ups, marquee, float) ---
  // IMPORTANT: `html.gsap-ready .animate-on-scroll { opacity: 0 }` hides content
  // optimistically; the ONLY way it becomes visible is a reveal tween firing.
  // So this effect is written fail-open: any init error, or any element a scroll
  // trigger can't reach (short page, tall/zoomed-out viewport, off-screen on a
  // non-scrollable page), is force-revealed so content is NEVER trapped invisible.
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Fail-open: drop the hiding class and clear inline transforms so everything shows.
    const revealAllStatic = () => {
      root.classList.remove("gsap-ready");
      document.querySelectorAll(".animate-on-scroll").forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    };

    const fillCounts = (scope) => {
      scope.querySelectorAll("[data-count]").forEach((el) => {
        el.textContent = (el.dataset.prefix || "") + Number(el.dataset.count).toLocaleString("en-US") + (el.dataset.suffix || "");
      });
    };

    if (reduce) {
      revealAllStatic();
      fillCounts(document);
      return;
    }

    // Only the visible page can be measured; display:none pages give bogus geometry,
    // which makes once-triggers misfire. Scope everything to the active page.
    const page = document.querySelector(".spa-page.active") || document;

    let ctx;
    let safetyTimer;
    // Reveal anything that is actually within the viewport but still hidden — the
    // exact "stuck" case the scroll trigger can't cover. Off-screen elements are
    // left alone so they still animate on scroll.
    const ensureInViewVisible = () => {
      if (!root.classList.contains("gsap-ready")) return;
      page.querySelectorAll(".animate-on-scroll").forEach((el) => {
        const r = el.getBoundingClientRect();
        const inView = r.top < window.innerHeight && r.bottom > 0;
        if (inView && getComputedStyle(el).opacity === "0") {
          gsap.to(el, { opacity: 1, x: 0, y: 0, duration: 0.5, ease: "power2.out", overwrite: "auto" });
        }
      });
    };

    try {
      root.classList.add("gsap-ready");
      ctx = gsap.context(() => {
        // Directional scroll reveals
        gsap.utils.toArray(page.querySelectorAll(".animate-on-scroll")).forEach((el) => {
          const dir = el.getAttribute("data-dir");
          const delay = (parseInt(el.getAttribute("data-delay") || "0", 10)) * 0.09;
          const x = dir === "left" ? -64 : dir === "right" ? 64 : 0;
          const y = (dir === "left" || dir === "right") ? 0 : 46;
          gsap.set(el, { opacity: 0, x, y });
          gsap.to(el, {
            opacity: 1, x: 0, y: 0, duration: 1, ease: "power3.out", delay,
            scrollTrigger: { trigger: el, start: "top 90%", once: true }
          });
        });

        // Count-up numbers
        gsap.utils.toArray(page.querySelectorAll("[data-count]")).forEach((el) => {
          const target = Number(el.dataset.count) || 0;
          const prefix = el.dataset.prefix || "";
          const suffix = el.dataset.suffix || "";
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target, duration: 1.6, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
            onUpdate: () => { el.textContent = prefix + Math.round(obj.v).toLocaleString("en-US") + suffix; }
          });
        });

        // Parallax drift (scrub) — skip floating cards and orbs (they self-animate)
        gsap.utils.toArray(page.querySelectorAll("[data-parallax]")).forEach((el) => {
          if (el.classList.contains("float-card") || el.classList.contains("hero-orb")) return;
          const speed = parseFloat(el.getAttribute("data-parallax")) || 0;
          gsap.fromTo(el, { y: 0 }, {
            y: speed * -150, ease: "none",
            scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: 0.6 }
          });
        });

        // Gentle continuous float on hero cards
        gsap.utils.toArray(page.querySelectorAll(".float-card")).forEach((el, i) => {
          gsap.to(el, { y: i % 2 ? 16 : -16, duration: 3 + i * 0.4, ease: "sine.inOut", repeat: -1, yoyo: true });
        });

        // Animated bars in the hero analytics card
        gsap.utils.toArray(page.querySelectorAll(".fc-bars span")).forEach((el, i) => {
          gsap.from(el, { scaleY: 0.15, transformOrigin: "bottom", duration: 0.9, delay: 0.4 + i * 0.08, ease: "power3.out" });
        });

        // Cinematic clip-path reveal on the hero photo
        const heroImg = page.querySelector(".hero-photo img");
        if (heroImg) {
          gsap.fromTo(heroImg,
            { clipPath: "inset(0 0 100% 0)", scale: 1.12 },
            { clipPath: "inset(0 0 0% 0)", scale: 1, duration: 1.3, ease: "power3.out", delay: 0.15 });
        }

        // Seamless marquee
        const track = page.querySelector(".marquee-track");
        if (track) gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });

        ScrollTrigger.refresh();
        ensureInViewVisible();
      }, page);

      // Layout can shift after fonts/images load or on resize — re-check that
      // nothing on screen is left hidden. This is the safety net, not the primary path.
      safetyTimer = window.setTimeout(ensureInViewVisible, 1500);
      window.addEventListener("load", ensureInViewVisible);
      window.addEventListener("resize", ensureInViewVisible);
    } catch (err) {
      // If GSAP/ScrollTrigger ever fails to initialize, never trap content behind
      // the opacity:0 rule — show it unanimated instead of a blank page.
      console.error("[reveal] animation init failed; showing content unanimated:", err);
      revealAllStatic();
      fillCounts(document);
    }

    return () => {
      if (safetyTimer) clearTimeout(safetyTimer);
      window.removeEventListener("load", ensureInViewVisible);
      window.removeEventListener("resize", ensureInViewVisible);
      if (ctx) ctx.revert();
    };
  }, [currentPage]);


  // --- WELCOME POPUP ON FIRST LOAD (once per browser session) ---
  useEffect(() => {
    let seen = false;
    try { seen = window.sessionStorage.getItem("pc_welcome_seen") === "1"; } catch { seen = false; }
    if (seen) return;
    const t = setTimeout(() => setIsWelcomeOpen(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Lock background scroll while the mobile menu (or welcome popup) is open
  useEffect(() => {
    const lock = mobileMenuOpen || isWelcomeOpen;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen, isWelcomeOpen]);

  // Autoplay the Plans-page videos (muted) the moment they scroll into view,
  // and pause them when they leave. Users still have full controls to unmute.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const vids = Array.from(document.querySelectorAll("video[data-autoplay]"));
    if (!vids.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          v.muted = true;
          const p = v.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: [0, 0.5, 1] });
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [currentPage]);

  // The product spec gallery is manually controlled (arrows / dots) — it does
  // not auto-advance, so the viewer stays on whichever image they choose.

  const closeWelcome = () => {
    setIsWelcomeOpen(false);
    try { window.sessionStorage.setItem("pc_welcome_seen", "1"); } catch {}
  };

  const handleWelcomeSubmit = (e) => {
    e.preventDefault();
    setLoadingAction("welcome");
    submitLead("welcome", {
      firstName: surveyForm.firstName,
      lastName: surveyForm.lastName,
      email: surveyForm.email,
      phone: surveyForm.phone,
      businessType: surveyForm.businessType
    });
    setTimeout(() => {
      setLoadingAction(null);
      setWelcomeSubmitted(true);
      try { window.sessionStorage.setItem("pc_welcome_seen", "1"); } catch {}
    }, 1000);
  };

  // --- INTERACTION HELPER LINKS ---
  const navigateTo = (pageId, sectionId = null) => {
    const sectionPart = sectionId ? "/" + sectionId : "";
    window.location.hash = pageId + sectionPart;
  };

  // --- CALCULATOR TOTALS COMPUTATION ---
  const planMonthly = pricingMatrix.plans[selectedPlan] * locations;

  let hardwareMonthly = 0;
  let onetimeTotal = 0;

  // Detailed "what this setup includes" lines (uses hardwareBlurbs from catalog).
  const setupIncludes = [];

  // Software line — include the plan description
  const loc = `${locations} location${locations > 1 ? "s" : ""}`;
  if (pricingMatrix.plans[selectedPlan] > 0) {
    setupIncludes.push(`${pricingMatrix.plansLabels[selectedPlan]} for ${loc} — ${planInfo[selectedPlan].desc} Software estimate: $${pricingMatrix.plans[selectedPlan]}/mo × ${locations} = $${planMonthly}/mo.`);
  } else {
    setupIncludes.push(`${pricingMatrix.plansLabels[selectedPlan]} for ${loc} — ${planInfo[selectedPlan].desc} Software estimate: $0/mo (processing fees still apply).`);
  }

  Object.keys(hardwareQty).forEach(key => {
    const qty = hardwareQty[key];
    if (qty <= 0) return;
    const config = pricingMatrix.hardware[key];
    const blurb = hardwareBlurbs[key] || "";
    const cost = config.price * qty;
    if (config.onetime) {
      onetimeTotal += cost;
      setupIncludes.push(`${qty} × ${config.name} — ${blurb} One-time estimate: $${cost} (not financed).`);
    } else {
      hardwareMonthly += cost;
      setupIncludes.push(`${qty} × ${config.name} — ${blurb} Monthly hardware financing estimate: $${cost}/mo over ${config.term}.`);
    }
  });

  const kdsQty = selectedPlan === "free" ? 0 : addonQty.kds;
  const kioskQty = selectedPlan === "free" ? 0 : addonQty.kiosk;
  const kdsMonthly = selectedPlan === "free" ? 0 : pricingMatrix.addons.kds[selectedPlan] * kdsQty;
  const kioskMonthly = selectedPlan === "free" ? 0 : pricingMatrix.addons.kiosk[selectedPlan] * kioskQty;

  if (kdsQty > 0) setupIncludes.push(`${kdsQty} × Square KDS app device — Kitchen Display System that sends orders to the kitchen digitally and speeds up restaurant workflow. Monthly estimate: $${pricingMatrix.addons.kds[selectedPlan]}/device on ${pricingMatrix.plansLabels[selectedPlan]} = $${kdsMonthly}/mo.`);
  if (kioskQty > 0) setupIncludes.push(`${kioskQty} × Square Kiosk app device — Self-service ordering software that lets customers place their own orders. Monthly estimate: $${pricingMatrix.addons.kiosk[selectedPlan]}/device on ${pricingMatrix.plansLabels[selectedPlan]} = $${kioskMonthly}/mo.`);

  const totalMonthly = planMonthly + hardwareMonthly + kdsMonthly + kioskMonthly;

  // Stepper for locations (+/-)
  const bumpLocations = (delta) => setLocations(prev => Math.max(1, Math.min(99, prev + delta)));

  const changePlan = (plan) => {
    if (pricingMatrix.plans[plan] !== undefined) {
      setSelectedPlan(plan);
    }
  };

  const handleQtyChange = (type, key, value) => {
    const val = Math.max(0, parseInt(value, 10) || 0);
    if (type === "hardware") {
      setHardwareQty(prev => ({ ...prev, [key]: val }));
    } else {
      setAddonQty(prev => ({ ...prev, [key]: val }));
    }
  };

  // Stepper for hardware / add-on quantities (+/-)
  const bumpQty = (type, key, delta) => {
    if (type === "hardware") {
      setHardwareQty(prev => ({ ...prev, [key]: Math.max(0, Math.min(99, prev[key] + delta)) }));
    } else {
      if (selectedPlan === "free") return;
      setAddonQty(prev => ({ ...prev, [key]: Math.max(0, Math.min(99, prev[key] + delta)) }));
    }
  };

  // "Request Final Quote" -> prefills contact form and navigates there
  const applyQuoteToContact = () => {
    const summaryText = `Hello Pro Commerce Solutions team,\n\nI used the cost calculator and would like a final quote. Here is my setup:\n- Locations: ${locations}\n- Software plan: ${pricingMatrix.plansLabels[selectedPlan]}\n- What this setup includes:\n  ${setupIncludes.join("\n  ")}\n- Estimated total monthly: $${totalMonthly}/mo\n- One-time hardware: $${onetimeTotal}\n\nPlease review and let me know the next steps.`;

    setContactForm(prev => ({
      ...prev,
      interestedPlan: selectedPlan,
      message: summaryText
    }));
    navigateTo("contact", "consultation-form");
  };

  // Catalog data (hardwareDetails, productMedia, productGallery, stock, plansVideos,
  // pricingMatrix, planInfo, trustItems) is imported from ../data.

  const openProduct = (item) => {
    setActiveProductDetail(item);
    setProductSlide(0);
    setIsProductOpen(true);
  };

  const closeProduct = () => {
    setIsProductOpen(false);
    setTimeout(() => setActiveProductDetail(null), 360);
  };

  // Open the shared video lightbox with a specific source/title
  const openVideo = (src, title) => {
    setVideoSrc(src || WALKTHROUGH_VIDEO);
    setVideoTitle(title || "Walkthrough & Setup Video");
    setIsVideoModalOpen(true);
  };

  const addProductToCalculator = (productName) => {
    let key = "";
    if (productName === "Square Register") key = "register";
    else if (productName === "Square Terminal / Handheld") key = "handheld";
    else if (productName === "Square Terminal") key = "terminal";
    else if (productName === "Square Stand") key = "stand";
    else if (productName === "Square Kiosk") key = "kioskHardware";
    else if (productName === "Square Reader (Contactless + Chip)") key = "reader";

    if (key) {
      setHardwareQty(prev => ({
        ...prev,
        [key]: prev[key] === 0 ? 1 : prev[key]
      }));
    }
    closeProduct();
    navigateTo("products", "calculator");
  };

  // --- FORM SUBMISSIONS → Google Sheets (via src/lib/sheets) ---
  // submitLead never throws; if no endpoint is configured it logs the payload
  // so the success UX still works. A short delay keeps the loading feedback.
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setLoadingAction("contact");
    submitLead("contact", contactForm);
    setTimeout(() => {
      setLoadingAction(null);
      setContactSubmitSuccess(true);
    }, 1000);
  };

  const handleSurveySubmit = (e) => {
    e.preventDefault();
    setLoadingAction("survey");
    submitLead("survey", surveyForm);
    setTimeout(() => {
      setLoadingAction(null);
      setSurveySubmitSuccess(true);
    }, 1000);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    setLoadingAction("upload");
    submitLead("statement", uploadForm);
    setTimeout(() => {
      setLoadingAction(null);
      setUploadSubmitSuccess(true);
    }, 1000);
  };

  // File selection change handler
  const handleFileChange = (e, formType) => {
    const file = e.target.files[0];
    if (file) {
      const label = `${file.name} (${Math.round(file.size / 1024)} KB)`;
      if (formType === "contact") {
        setContactForm(prev => ({ ...prev, fileName: label }));
      } else if (formType === "survey") {
        setSurveyForm(prev => ({ ...prev, fileName: label }));
      } else if (formType === "upload") {
        setUploadForm(prev => ({ ...prev, fileName: label }));
      }
    }
  };

  // Modal control
  const openSurvey = () => {
    setSurveyStep(1);
    setSurveySubmitSuccess(false);
    setIsSurveyOpen(true);
  };

  const openSurveyWithPath = (path) => {
    let type = "Restaurant (table service)";
    if (path === "cafe") type = "Cafés & QSR";
    if (path === "retail") type = "Retail";
    
    setSurveyForm(prev => ({ ...prev, businessType: type }));
    openSurvey();
  };

  const openUploadModal = () => {
    setUploadSubmitSuccess(false);
    setIsUploadOpen(true);
  };

  const handleStepNext = () => {
    // Basic validations
    if (surveyStep === 1) {
      if (!surveyForm.firstName || !surveyForm.lastName || !surveyForm.email) {
        alert("Please fill out all required fields.");
        return;
      }
    } else if (surveyStep === 2) {
      if (!surveyForm.industry || !surveyForm.monthlyRevenue || !surveyForm.projectedVolume) {
        alert("Please fill out all required fields.");
        return;
      }
    }
    setSurveyStep(prev => prev + 1);
  };

  return (
    <>
      {/* Scroll progress indicator */}
      <motion.div className="scroll-progress" style={{ scaleX: progressX }} />

      {/* Sticky Header */}
      <Header
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        currentPage={currentPage}
        currentSection={currentSection}
        navigateTo={navigateTo}
        openSurvey={openSurvey}
      />

      <main>
        {/* PAGE 1: HOME */}
        <div className={`spa-page ${currentPage === "home" ? "active" : ""}`} id="home">
          <section className="container hero-section">
            {/* floating gradient orbs */}
            <div className="hero-orb orb-a" data-parallax="0.18"></div>
            <div className="hero-orb orb-b" data-parallax="0.3"></div>
            {/* animated transaction lines */}
            <svg className="hero-lines" viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true">
              <path d="M-20 380 Q 360 300 720 360 T 1460 320" fill="none" stroke="#478FCC" strokeWidth="1.5" strokeDasharray="6 14" style={{ animation: "pcDash 12s linear infinite", opacity: 0.4 }} />
              <path d="M-20 460 Q 420 520 800 440 T 1460 470" fill="none" stroke="#55A5DB" strokeWidth="1.5" strokeDasharray="4 16" style={{ animation: "pcDash 16s linear infinite", opacity: 0.35 }} />
            </svg>

            <div className="hero-wrap">
              <motion.div className="hero-text" initial="hidden" animate="show" variants={heroStagger}>
                <motion.div className="hero-badge" variants={fadeUp}>
                  <span className="dot"></span>Authorized Square Dealer
                </motion.div>
                <h1 className="hero-title">
                  <motion.span className="line" variants={fadeUp}>Payments &amp; POS,</motion.span>
                  <motion.span className="line" variants={fadeUp}>engineered for the way</motion.span>
                  <motion.span className="line" variants={fadeUp}><span className="accent">small business</span> moves.</motion.span>
                </h1>
                <motion.p className="hero-desc" variants={fadeUp}>Custom Square POS configurations, transparent processing reviews, and 1-on-1 onboarding for entrepreneurs who want to scale — without the guesswork.</motion.p>
                <motion.div className="hero-actions" variants={fadeUp}>
                  <MagBtn className="btn primary" onClick={openSurvey}>
                    Get Started
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </MagBtn>
                  <motion.button className="btn ghost" onClick={() => navigateTo("products", "calculator")} {...hoverLift}>Estimate Monthly Cost</motion.button>
                  <button className="btn-video" onClick={() => openVideo(WALKTHROUGH_VIDEO, "Walkthrough & Setup Video")}>
                    <span className="play"><Play size={13} fill="currentColor" /></span>
                    Watch Video
                  </button>
                </motion.div>
                <motion.div className="hero-stats" variants={fadeUp}>
                  <div className="hero-stat">
                    <strong>$0/mo</strong>
                    <span>Square free software</span>
                  </div>
                  <div className="hero-stat-divider"></div>
                  <div className="hero-stat">
                    <strong>1-on-1</strong>
                    <span>Expert setup support</span>
                  </div>
                  <div className="hero-stat-divider"></div>
                  <div className="hero-stat">
                    <strong>No</strong>
                    <span>Long-term contracts</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* animated composition */}
              <div className="hero-visual">
                <div className="hero-photo" data-parallax="-0.08">
                  <img src={stock.heroMain.src} onError={onImgError(stock.heroMain.fb)} alt="Modern POS system on a countertop" />
                </div>
                {/* payment approved card */}
                <div className="float-card fc-pay" data-parallax="-0.22">
                  <span className="ic">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#1E9E5A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <div>
                    <div className="lbl">Payment approved</div>
                    <div className="val">$48.20</div>
                  </div>
                </div>
                {/* analytics card */}
                <div className="float-card fc-analytics" data-parallax="-0.34">
                  <div className="head">
                    <span className="t">Today&apos;s sales</span>
                    <span className="up">+18%</span>
                  </div>
                  <div className="fc-bars">
                    <span style={{ background: "#DCE7F4", height: "40%", animationDelay: ".1s" }}></span>
                    <span style={{ background: "#DCE7F4", height: "62%", animationDelay: ".2s" }}></span>
                    <span style={{ background: "#B9D2EC", height: "50%", animationDelay: ".3s" }}></span>
                    <span style={{ background: "#478FCC", height: "90%", animationDelay: ".4s" }}></span>
                    <span style={{ background: "#B9D2EC", height: "70%", animationDelay: ".5s" }}></span>
                    <span style={{ background: "#DCE7F4", height: "55%", animationDelay: ".6s" }}></span>
                  </div>
                  <div className="fc-total"><span data-count="3140" data-prefix="$">$3,140</span></div>
                </div>
                {/* $0 software chip */}
                <div className="float-card chip-card" data-parallax="-0.16">
                  <div className="k">Software</div>
                  <div className="v">$0/mo</div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust marquee */}
          <div className="marquee-strip">
            <div className="marquee-track">
              {[...trustItems, ...trustItems].map((item, idx) => (
                <span key={idx}>{item}<span className="sep"></span></span>
              ))}
            </div>
          </div>

          {/* Value Props */}
          <section className="container">
            <div className="section-header left animate-on-scroll">
              <span className="kicker">Why Choose Us</span>
              <h2>Tailormade guidance for modern merchants</h2>
              <p>We bridge the gap between complex payment systems and your business goals — direct advisor access, transparent pricing, and configurations built around how you actually operate.</p>
            </div>
            <div className="grid grid-3">
              <div className="card animate-on-scroll" data-dir="left">
                <div className="icon-circle">
                  <Search size={24} />
                </div>
                <h3>POS Consultation</h3>
                <p>We review your business flow, location setup, and software features to align your business with the best-fitting POS tools.</p>
              </div>
              <div className="card animate-on-scroll" data-dir="up" data-delay="1">
                <div className="icon-circle">
                  <FileText size={24} />
                </div>
                <h3>Statement Review</h3>
                <p>Upload your recent credit card processing statement and get a transparent cost comparison, helping you eliminate hidden markup fees.</p>
              </div>
              <div className="card animate-on-scroll" data-dir="right" data-delay="2">
                <div className="icon-circle">
                  <Settings size={24} />
                </div>
                <h3>Hardware Setup</h3>
                <p>From registers and handhelds to barcode scanners and label printers, we configure hardware setups suited to your daily operations.</p>
              </div>
            </div>
          </section>

          {/* Industry Pathways */}
          <section className="container">
            <div className="section-header animate-on-scroll">
              <span className="kicker">Custom Pathways</span>
              <h2>Select Your Business Niche</h2>
              <p>We design specialized configurations matching the unique workflows of your industry.</p>
            </div>
            <div className="grid grid-3">
              <div className="pathway-card animate-on-scroll" data-dir="left">
                <div className="pathway-img">
                  <img className="pc-nicheimg" src={stock.nRestaurant.src} onError={onImgError(stock.nRestaurant.fb)} alt="Modern restaurant kitchen" loading="lazy" />
                </div>
                <div className="pathway-content">
                  <h3>Restaurants</h3>
                  <p>Tableside ordering, kitchen display screens (KDS), floor mapping, split checks, and hardware that keeps table turnaround times fast.</p>
                  <button className="btn primary small" onClick={() => openSurveyWithPath("restaurant")}>Get Restaurant Survey</button>
                </div>
              </div>
              
              <div className="pathway-card animate-on-scroll" data-dir="up" data-delay="1">
                <div className="pathway-img">
                  <img className="pc-nicheimg" src={stock.nCafe.src} onError={onImgError(stock.nCafe.fb)} alt="Vibrant quick service coffee shop counter" loading="lazy" />
                </div>
                <div className="pathway-content">
                  <h3>Cafés & QSR</h3>
                  <p>Self-ordering kiosks, loyalty integrations, fast payment processing, modifiers, and multi-terminal systems to tackle peak hour rushes.</p>
                  <button className="btn primary small" onClick={() => openSurveyWithPath("cafe")}>Get Café Survey</button>
                </div>
              </div>

              <div className="pathway-card animate-on-scroll" data-dir="right" data-delay="2">
                <div className="pathway-img">
                  <img className="pc-nicheimg" src={stock.nRetail.src} onError={onImgError(stock.nRetail.fb)} alt="Boutique retail shop apparel racks" loading="lazy" />
                </div>
                <div className="pathway-content">
                  <h3>Retail Stores</h3>
                  <p>Barcode scanning, advanced inventory trackers, customer profiles, vendor management, and multi-location product catalog sync.</p>
                  <button className="btn primary small" onClick={() => openSurveyWithPath("retail")}>Get Retail Survey</button>
                </div>
              </div>
            </div>
          </section>

          {/* Ecosystem showcase */}
          <section className="container">
            <div className="showcase-row">
              <div className="showcase-media animate-on-scroll" data-dir="left">
                <img src={stock.showcase.src} onError={onImgError(stock.showcase.fb)} alt="Business owner taking a payment on a Square device" loading="lazy" />
              </div>
              <div className="showcase-content animate-on-scroll" data-dir="right" data-delay="1">
                <span className="kicker">One Connected System</span>
                <h2>Everything your counter needs, working together</h2>
                <p>From the first tap to end-of-day reporting, your hardware, software, and payments stay in sync — so you spend less time wrestling tools and more time serving customers.</p>
                <ul className="showcase-list">
                  <li><Check size={18} /> Take payments in person, online, and on the go</li>
                  <li><Check size={18} /> Track inventory, staff, and sales in real time</li>
                  <li><Check size={18} /> Add invoices, loyalty, and gift cards as you grow</li>
                  <li><Check size={18} /> Transparent pricing with no long-term contracts</li>
                </ul>
                <button className="btn primary" onClick={openSurvey}>Get a Free Recommendation</button>
              </div>
            </div>
          </section>

          {/* How we work */}
          <section className="container">
            <div className="section-header animate-on-scroll">
              <span className="kicker">How We Work</span>
              <h2>A clear path from first call to live checkout</h2>
              <p>No guesswork and no pressure — just a guided process built around your business.</p>
            </div>
            <div className="grid grid-4 process-steps">
              {[
                { n: "01", t: "Discovery", d: "We learn your business type, volume, and goals to understand exactly what you need." },
                { n: "02", t: "Configuration", d: "We map the right Square plan, hardware, and apps into one tailored setup." },
                { n: "03", t: "Onboarding", d: "We get you approved and live, with hands-on help configuring everything." },
                { n: "04", t: "Growth Support", d: "We stay on as your advisor as you add locations, staff, and new tools." }
              ].map((p, i) => (
                <div className="process-step animate-on-scroll" data-delay={String(i % 3)} key={p.n}>
                  <div className="process-num">{p.n}</div>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats band */}
          <section className="stats-band">
            <div className="stats-inner">
              {[
                { c: 500, prefix: "", suffix: "+", label: "Merchants guided" },
                { c: 0, prefix: "$", suffix: "/mo", label: "Square free software" },
                { c: 98, prefix: "", suffix: "%", label: "Would recommend us" },
                { c: 24, prefix: "", suffix: "h", label: "Typical response time" }
              ].map((s, i) => (
                <div className="stat-cell animate-on-scroll" data-delay={String(i % 3)} key={i}>
                  <div className="stat-num"><span data-count={String(s.c)} data-prefix={s.prefix} data-suffix={s.suffix}>{s.prefix}{s.c}{s.suffix}</span></div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA band */}
          <section className="container">
            <div className="cta-band animate-on-scroll">
              <div className="cta-band-orb"></div>
              <div className="cta-band-content">
                <span className="kicker" style={{ color: "var(--blue-light)" }}>Ready when you are</span>
                <h2>Let&apos;s build the right Square setup for your business</h2>
                <p>Get a free, no-obligation recommendation tailored to how you actually operate.</p>
                <div className="hero-actions" style={{ justifyContent: "center" }}>
                  <button className="btn primary" onClick={openSurvey}>
                    Get Started
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button className="btn ghost" onClick={() => navigateTo("products", "calculator")}>Estimate Monthly Cost</button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* PAGE 2: ABOUT US */}
        <div className={`spa-page ${currentPage === "about" ? "active" : ""}`} id="about">
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
              <div className="card value-tile">
                <div className="icon-circle">
                  <Target size={20} />
                </div>
                <h4>Mission</h4>
                <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", marginBottom: 0 }}>Empower small businesses with clean payment tech and direct advice to survive and thrive.</p>
              </div>
              <div className="card value-tile">
                <div className="icon-circle">
                  <Shield size={20} />
                </div>
                <h4>Trust</h4>
                <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", marginBottom: 0 }}>Total transparency on processing margins. We never lock you into multi-year contracts.</p>
              </div>
              <div className="card value-tile">
                <div className="icon-circle">
                  <Clock size={20} />
                </div>
                <h4>Process</h4>
                <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", marginBottom: 0 }}>Step-by-step guidance from review, configuration mapping, to launch and live support.</p>
              </div>
              <div className="card value-tile">
                <div className="icon-circle">
                  <TrendingUp size={20} />
                </div>
                <h4>Growth</h4>
                <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", marginBottom: 0 }}>Scaling Square ecosystem integrations to help you manage staff, loyalty and cashflow.</p>
              </div>
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

        {/* PAGE 3: SERVICES */}
        <div className={`spa-page ${currentPage === "services" ? "active" : ""}`} id="services">
          <section className="container">
            <div className="section-header">
              <span className="kicker">What We Do</span>
              <h2>Our Core POS &amp; Processing Services</h2>
              <p>Professional advisory and onboarding — every service leads to a custom qualification and review tailored to your business.</p>
            </div>

            <div className="service-rows">
              {[
                { icon: <Search size={22} />, img: stock.consult, n: "01", title: "Square POS Consultation", desc: "We review your business type, volume, locations, and hardware needs to map the correct Square configuration — so you invest in exactly what fits how you operate.", cta: "Compare Square Plans", onClick: () => navigateTo("plans") },
                { icon: <FileText size={22} />, img: stock.statement, n: "02", title: "Processing Statement Review", desc: "Send a recent processing statement and we break down standard interchange costs versus your current markup, highlighting where you can save.", cta: "Upload Statement", onClick: openUploadModal },
                { icon: <Utensils size={22} />, img: stock.restaurant, n: "03", title: "Restaurant POS Setup", desc: "Set up table-service, bars, cafés, and quick-service operations. We configure menus, kitchen display terminals, modifiers, and floor maps for fast turnaround.", cta: "Restaurant Survey", onClick: () => openSurveyWithPath("restaurant") },
                { icon: <ShoppingBag size={22} />, img: stock.retail, n: "04", title: "Retail POS Setup", desc: "Connect inventory catalogs, barcodes, scanners, checkout stands, receipt printers, and online store integrations into one synced system.", cta: "Retail Survey", onClick: () => openSurveyWithPath("retail") },
                { icon: <Settings size={22} />, img: stock.hardware, n: "05", title: "Square Hardware Setup", desc: "Browse registers, handhelds, stands, kiosks, and chip readers. We curate complete hardware kits matched to your checkout layout and daily flow.", cta: "View Hardware Catalog", onClick: () => navigateTo("products") },
                { icon: <Zap size={22} />, img: stock.onboarding, n: "06", title: "Square Onboarding", desc: "Ready to sign up? As an authorized Square dealer, we provide a direct path for faster profile creation and hands-on onboarding support.", cta: "Start Onboarding", onClick: () => window.open("https://squareup.com/i/5AC21678BF", "_blank") }
              ].map((s, i) => (
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

        {/* PAGE 4: PRODUCTS */}
        <div className={`spa-page ${currentPage === "products" ? "active" : ""}`} id="products">
          <section className="container" style={{ paddingBottom: "1.5rem" }}>
            <div className="official-note">
              <div className="official-note-icon">
                <Info size={20} />
              </div>
              <div>
                <h4 style={{ marginBottom: "0.25rem" }}>Official Square Hardware Catalog</h4>
                <p style={{ fontSize: "0.85rem", marginBottom: 0, color: "var(--blue-dark)" }}>All hardware products showcased below are official Square devices. Clicking &quot;View Specs&quot; will open official device detail sheets. Select &quot;Get Recommendation&quot; to request Dominique&apos;s review.</p>
              </div>
            </div>

            <div className="section-header" id="hardware-catalog">
              <span className="kicker">Checkout Hardware</span>
              <h2>Explore Official Square Hardware</h2>
              <p>Find the best devices for mobile checkout, countertop setups, self-service kiosks, or lightweight tap terminals.</p>
            </div>

            {/* Hardware Catalog */}
            <div className="grid grid-3 animate-on-scroll">
              {[
                { key: "register", title: "Square Register", desc: "Complete countertop POS system with customer-facing display. Designed for high-volume retail or restaurant checkout.", price: "$899 or $44/mo (24 mo. financing)" },
                { key: "handheld", title: "Square Handheld", desc: "Compact, durable mobile terminal. Perfect for restaurant table ordering, line busting, patio checkouts, and staff on the move.", price: "$399 or $37/mo (12 mo. financing)" },
                { key: "terminal", title: "Square Terminal", desc: "Compact card payment device with receipt printer built-in. Great for countertops or tableside receipt printing.", price: "$299 or $27/mo (12 mo. financing)" },
                { key: "stand", title: "Square Stand", desc: "iPad countertop stand with contactless and chip reader built in. Turn an iPad into a sleek checkout monitor.", price: "$149 or $14/mo (12 mo. financing)" },
                { key: "kiosk", title: "Square Kiosk", desc: "Customer self-service checkout hardware. Shorter lines and faster turnaround for quick-service counters and cafes.", price: "$149 or $14/mo (12 mo. financing)" },
                { key: "reader", title: "Contactless & Chip Reader", desc: "Simple pocket-sized card reader. Pairs via Bluetooth to run card checkouts directly on your iOS or Android phone.", price: "$59 one-time payment" },
                { key: "standMount", title: "Square Stand Mount", desc: "Low-profile countertop mount that locks an iPad in place for a clean, fixed checkout station.", price: "$149 one-time payment" },
                { key: "dock", title: "Square Dock for Handheld", desc: "Charging dock that turns the Square Handheld into a stationary countertop terminal between mobile shifts.", price: "$99 one-time payment" },
                { key: "magReader", title: "Reader for Magstripe", desc: "Ultra-affordable swipe reader that plugs into a phone or tablet for quick magstripe card payments.", price: "$10 one-time payment" },
                { key: "accessories", title: "Accessories Kit", desc: "Receipt printers, cash drawers, barcode scanners, and kitchen printers to complete your countertop or kitchen setup.", price: "From $89 one-time payment" }
              ].map((c) => (
                <div className="hardware-card" key={c.key}>
                  <div className="device-visual">
                    <span className="official-badge">Official Hardware</span>
                    <img
                      className="device-photo"
                      src={(productMedia[c.key] && productMedia[c.key][0]) || "/hero_pos_scene.jpg"}
                      alt={c.title}
                      loading="lazy"
                      onError={onImgError("/hero_pos_scene.jpg")}
                    />
                  </div>
                  <div className="hardware-body">
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                    <div className="price-line"><strong>{c.price}</strong></div>
                    <div className="square-links">
                      <button className="btn ghost small" onClick={openSurvey}>Get Recommendation</button>
                      <button className="btn secondary small" onClick={() => openProduct(hardwareDetails[c.key])}>View Specs</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Cost Estimator / Calculator Section */}
          <section className="container animate-on-scroll" id="calculator" style={{ paddingTop: "1rem" }}>
            <div className="section-header">
              <span className="kicker">Estimate Monthly Cost</span>
              <h2>Setup cost calculator</h2>
              <p>Choose your software plan and calculate your approximate monthly layout. Hardware financing is calculated using standard term values.</p>
            </div>

            <div className="calculator-wrap">
              <div>
                {/* Section 1 */}
                <div className="calc-panel">
                  <div className="calc-section-title">
                    <div className="calc-section-num">1</div>
                    <h4>Locations &amp; software plan</h4>
                  </div>

                  <div className="calc-controls-row">
                    <div className="calc-control">
                      <label>Number of locations</label>
                      <div className="loc-stepper">
                        <button type="button" onClick={() => bumpLocations(-1)} aria-label="Decrease locations">−</button>
                        <span>{locations}</span>
                        <button type="button" onClick={() => bumpLocations(1)} aria-label="Increase locations">+</button>
                      </div>
                    </div>
                    <div className="calc-control grow">
                      <label>Square software plan</label>
                      <div className="seg-control">
                        {["free", "plus", "premium"].map(p => (
                          <button
                            type="button"
                            key={p}
                            className={selectedPlan === p ? "active" : ""}
                            onClick={() => changePlan(p)}
                          >
                            {pricingMatrix.plansLabels[p].replace("Square ", "")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="plan-info-note">
                    <h4>{planInfo[selectedPlan].title}</h4>
                    <p>{planInfo[selectedPlan].desc}</p>
                  </div>
                </div>{/* /panel 1 */}

                {/* Section 2 */}
                <div className="calc-panel">
                  <div className="calc-section-title">
                    <div className="calc-section-num">2</div>
                    <h4>Add hardware <span style={{ fontWeight: 400, color: "var(--text-faint)", fontSize: "0.85rem" }}>(financed monthly)</span></h4>
                  </div>

                  {[
                    { key: "register", name: "Square Register (2nd gen)", desc: "High-volume desktop register with a dedicated buyer-facing screen." },
                    { key: "handheld", name: "Square Handheld", desc: "Mobile checkout terminal — table ordering, line busting, patio." },
                    { key: "terminal", name: "Square Terminal", desc: "All-in-one chip card device with a built-in receipt printer." },
                    { key: "stand", name: "Square Stand", desc: "Turns an iPad into a sleek countertop checkout screen." },
                    { key: "kioskHardware", name: "Square Kiosk Hardware", desc: "iPad wall/stand kiosk frame for self-ordering customers." },
                    { key: "reader", name: "Square Reader (Contactless + Chip)", desc: "Pocket card reader for cards and Apple Pay — one-time, not financed." },
                    { key: "standMount", name: "Square Stand Mount", desc: "Low-profile countertop mount that locks an iPad in place." },
                    { key: "dock", name: "Square Dock for Handheld", desc: "Charging dock that turns the Handheld into a countertop terminal." },
                    { key: "magReader", name: "Square Reader for Magstripe", desc: "Affordable swipe reader for quick magstripe card payments." },
                    { key: "accessories", name: "Square Accessories Kit", desc: "Receipt printers, cash drawers, scanners, and kitchen printers." }
                  ].map(it => {
                    const cfg = pricingMatrix.hardware[it.key];
                    const qty = hardwareQty[it.key];
                    const line = cfg.price * qty;
                    return (
                      <div className="calc-item" key={it.key}>
                        <div className="calc-item-info">
                          <h4>{it.name}</h4>
                          <p>{it.desc}</p>
                          <div className="calc-item-meta">
                            {cfg.onetime
                              ? <><span>${cfg.price} one-time</span><span>Not financed</span></>
                              : <><span>${cfg.price}/mo</span><span>{cfg.term} financing</span></>}
                          </div>
                        </div>
                        <div className="qty-stepper">
                          <button type="button" onClick={() => bumpQty("hardware", it.key, -1)} aria-label={`Decrease ${it.name}`}>−</button>
                          <span>{qty}</span>
                          <button type="button" onClick={() => bumpQty("hardware", it.key, 1)} aria-label={`Increase ${it.name}`}>+</button>
                        </div>
                        <div className="calc-line-total" style={{ color: qty > 0 ? "var(--blue-primary)" : "#B4BCC6" }}>
                          {cfg.onetime ? `$${line}` : `$${line}/mo`}
                        </div>
                      </div>
                    );
                  })}
                </div>{/* /panel 2 */}

                {/* Section 3 */}
                <div className="calc-panel" style={{ opacity: selectedPlan === "free" ? 0.6 : 1, transition: "opacity .4s" }}>
                  <div className="calc-section-title">
                    <div className="calc-section-num">3</div>
                    <h4>Add-on app devices</h4>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-faint)", margin: "-0.6rem 0 1.1rem 2.6rem" }}>{selectedPlan === "free" ? "Add-on apps unlock on the Plus or Premium plan. Select a paid plan above to configure." : "KDS and Kiosk app devices, priced per device for your selected plan."}</p>

                  {[
                    { key: "kds", name: "Square KDS — Kitchen Display App", desc: "Send orders digitally to kitchen monitors." },
                    { key: "kiosk", name: "Square Kiosk App Devices", desc: "Run self-order flows on your kiosk screens." }
                  ].map(it => {
                    const qty = addonQty[it.key];
                    const rate = selectedPlan === "free" ? 0 : pricingMatrix.addons[it.key][selectedPlan];
                    const line = rate * qty;
                    return (
                      <div className="calc-item" key={it.key}>
                        <div className="calc-item-info">
                          <h4>{it.name}</h4>
                          <p>{it.desc}</p>
                          <div className="calc-item-meta">
                            {selectedPlan === "free"
                              ? <span>Requires Plus or Premium plan</span>
                              : <><span>Plus: ${pricingMatrix.addons[it.key].plus}/mo</span><span>Premium: ${pricingMatrix.addons[it.key].premium}/mo</span></>}
                          </div>
                        </div>
                        <div className="qty-stepper">
                          <button type="button" disabled={selectedPlan === "free"} onClick={() => bumpQty("addon", it.key, -1)} aria-label={`Decrease ${it.name}`}>−</button>
                          <span>{qty}</span>
                          <button type="button" disabled={selectedPlan === "free"} onClick={() => bumpQty("addon", it.key, 1)} aria-label={`Increase ${it.name}`}>+</button>
                        </div>
                        <div className="calc-line-total" style={{ color: qty > 0 && selectedPlan !== "free" ? "var(--blue-primary)" : "#B4BCC6" }}>
                          {selectedPlan === "free" ? "—" : `$${line}/mo`}
                        </div>
                      </div>
                    );
                  })}
                </div>{/* /panel 3 */}
              </div>

              {/* Summary Box */}
              <div className="summary-box">
                <h3 className="summary-title">Estimate Summary</h3>
                <div className="summary-row">
                  <span>Locations</span>
                  <strong>{locations}</strong>
                </div>
                <div className="summary-row">
                  <span>Plan level</span>
                  <strong>{pricingMatrix.plansLabels[selectedPlan].replace("Square ", "")}</strong>
                </div>
                <div className="summary-row">
                  <span>Software monthly</span>
                  <strong>${planMonthly}/mo</strong>
                </div>
                <div className="summary-row">
                  <span>Hardware monthly</span>
                  <strong>${hardwareMonthly}/mo</strong>
                </div>
                <div className="summary-row">
                  <span>App add-ons</span>
                  <strong>${kdsMonthly + kioskMonthly}/mo</strong>
                </div>
                <div className="summary-row">
                  <span>One-time hardware</span>
                  <strong>${onetimeTotal}</strong>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Est. total monthly</span>
                  <strong>${totalMonthly}/mo</strong>
                </div>

                <button className="btn primary" style={{ width: "100%", marginTop: "1.25rem" }} onClick={applyQuoteToContact}>Request Final Quote</button>

                <div className="summary-details">
                  <h5>What this setup includes</h5>
                  <ul>
                    {setupIncludes.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>

                <p style={{ fontSize: "0.7rem", color: "#7E8DA0", marginTop: "1rem", lineHeight: "1.5" }}>Financing totals are estimates based on standard Square credit terms. Taxes, processing rates, and shipping fees not included. Final pricing is subject to Square approval.</p>
              </div>
            </div>
          </section>
        </div>

        {/* PAGE 5: SQUARE PLANS */}
        <div className={`spa-page ${currentPage === "plans" ? "active" : ""}`} id="plans">
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

        {/* PAGE 6: CONTACT US */}
        <div className={`spa-page page-dark ${currentPage === "contact" ? "active" : ""}`} id="contact">
          <section className="container">
            <div className="contact-grid">
              <div className="contact-info-card animate-on-scroll" data-dir="left">
                <span className="kicker">Direct Contact</span>
                <h2>Talk to Dominique</h2>
                <p style={{ marginTop: "0.75rem" }}>Get direct, human support for your merchant onboarding. We do not use anonymous ticketing systems — just real guidance over email.</p>

                <a href="mailto:procommercesolutions@gmail.com" className="contact-meta-item" style={{ textDecoration: "none" }}>
                  <div className="contact-meta-icon">
                    <Mail size={18} />
                  </div>
                  <div className="contact-meta-content">
                    <h4>Email Address</h4>
                    <p>procommercesolutions@gmail.com</p>
                  </div>
                </a>

                <div className="contact-meta-item">
                  <div className="contact-meta-icon">
                    <User size={18} />
                  </div>
                  <div className="contact-meta-content">
                    <h4>Lead Advisor</h4>
                    <p>Dominique Wright, Founder &amp; CEO</p>
                  </div>
                </div>
              </div>

              {/* Consultation Form */}
              <div className="card animate-on-scroll" data-dir="right" data-delay="1" id="consultation-form">
                <h3>Request a consultation</h3>
                <p style={{ fontSize: "0.9rem", marginBottom: "2rem" }}>Provide your details below to schedule your consultation call.</p>
                
                {contactSubmitSuccess ? (
                  <div style={{ textAlign: "center", padding: "2rem 0" }}>
                    <div style={{ display: "inline-grid", placeItems: "center", width: "64px", height: "64px", borderRadius: "9999px", background: "var(--success-soft)", color: "var(--success)", marginBottom: "1rem" }}>
                      <ShieldCheck size={36} />
                    </div>
                    <h3>Request Submitted Successfully!</h3>
                    <p style={{ margin: "1rem 0 1.5rem", color: "var(--text-muted)", fontSize: "0.95rem" }}>Thank you for contacting Pro Commerce Solutions. Dominique will review your business information and reach out to you within 24 hours.</p>
                    <button className="btn ghost small" onClick={() => setContactSubmitSuccess(false)}>Send Another Message</button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input 
                          type="text" 
                          placeholder="First name" 
                          required 
                          value={contactForm.firstName} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input 
                          type="text" 
                          placeholder="Last name" 
                          required 
                          value={contactForm.lastName} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input 
                          type="email" 
                          placeholder="Email address" 
                          required 
                          value={contactForm.email} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>(optional)</span></label>
                        <input
                          type="tel"
                          placeholder="Phone number"
                          value={contactForm.phone} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Business Name *</label>
                        <input 
                          type="text" 
                          placeholder="Business name" 
                          required 
                          value={contactForm.businessName} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, businessName: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Business Type</label>
                        <select 
                          value={contactForm.businessType}
                          onChange={(e) => setContactForm(prev => ({ ...prev, businessType: e.target.value }))}
                        >
                          <option value="Restaurant (table service)">Restaurant (table service)</option>
                          <option value="Restaurant (quick service)">Restaurant (quick service)</option>
                          <option value="Cafés & QSR">Cafés &amp; QSR</option>
                          <option value="Retail">Retail</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Monthly Revenue ($)</label>
                        <input 
                          type="text" 
                          placeholder="Monthly revenue" 
                          value={contactForm.monthlyRevenue} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, monthlyRevenue: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Interested Plan</label>
                        <select 
                          value={contactForm.interestedPlan} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, interestedPlan: e.target.value }))}
                        >
                          <option value="free">Square Free</option>
                          <option value="plus">Square Plus</option>
                          <option value="premium">Square Premium / Custom</option>
                        </select>
                      </div>
                      <div className="form-group full">
                        <label>Consultation Notes / Selections</label>
                        <textarea 
                          rows="5" 
                          placeholder="Let us know what hardware or workflow features you need help setting up..."
                          value={contactForm.message} 
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        ></textarea>
                      </div>
                      
                      <div className="form-group full">
                        <label>Current Merchant Statement (Optional)</label>
                        <div className="upload-area" onClick={() => document.getElementById("contact-file-input").click()}>
                          <div className="upload-area-icon">
                            <FileText size={32} />
                          </div>
                          <p>Drag your credit card processing statement here, or <strong>browse files</strong></p>
                          <input 
                            type="file" 
                            id="contact-file-input" 
                            style={{ display: "none" }} 
                            onChange={(e) => handleFileChange(e, "contact")}
                          />
                          {contactForm.fileName && (
                            <span className="upload-filename" style={{ display: "block" }}>
                              {contactForm.fileName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                      <button type="button" className="btn ghost" onClick={openUploadModal}>Upload Statement Only</button>
                      <button type="submit" className="btn primary" disabled={loadingAction === "contact"}>
                        {loadingAction === "contact" ? "Submitting..." : "Submit Request"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer navigateTo={navigateTo} />

      {/* MODAL: SURVEY MODAL */}
      <SurveyModal
        open={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        success={surveySubmitSuccess}
        step={surveyStep}
        setStep={setSurveyStep}
        form={surveyForm}
        setForm={setSurveyForm}
        onSubmit={handleSurveySubmit}
        onNext={handleStepNext}
        onFileChange={handleFileChange}
        loadingAction={loadingAction}
      />

      {/* MODAL: UPLOAD STATEMENT */}
      <UploadModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        success={uploadSubmitSuccess}
        form={uploadForm}
        setForm={setUploadForm}
        onSubmit={handleUploadSubmit}
        onFileChange={handleFileChange}
        loadingAction={loadingAction}
      />

      {/* CHATBOT ASSISTANT (self-contained: AI proxy + canned fallback + sheet logging) */}
      <ChatWidget onOpenUpload={openUploadModal} />

      {/* MODAL: WATCH VIDEO MODAL */}
      <VideoModal
        open={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        src={videoSrc}
        title={videoTitle}
      />

      {/* MODAL: PRODUCT DETAIL MODAL */}
      <ProductModal
        open={isProductOpen}
        product={activeProductDetail}
        slide={productSlide}
        setSlide={setProductSlide}
        onClose={closeProduct}
        onAddToCalculator={addProductToCalculator}
      />

      {/* WELCOME LEAD-CAPTURE POPUP (on load) */}
      <WelcomePopup
        open={isWelcomeOpen}
        onClose={closeWelcome}
        submitted={welcomeSubmitted}
        onSubmit={handleWelcomeSubmit}
        form={surveyForm}
        setForm={setSurveyForm}
        loadingAction={loadingAction}
      />
    </>
  );
}
