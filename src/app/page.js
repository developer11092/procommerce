"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  Search,
  FileText,
  Settings,
  CreditCard,
  Mail,
  User, 
  Check, 
  AlertCircle, 
  Send, 
  X, 
  Menu, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight, 
  DollarSign, 
  ArrowUpRight,
  TrendingUp,
  Shield,
  Target,
  Clock,
  Utensils,
  ShoppingBag,
  Zap,
  Info,
  ChevronRight,
  Sparkles,
  Play
} from "lucide-react";
import { motion, useScroll, useSpring, useMotionValue } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

// Magnetic button — cursor-following micro-interaction (Framer Motion springs).
// The pull is clamped to a small radius so the button never travels out from
// under the cursor (which used to cause an enter/leave flicker on hover).
function MagBtn({ className, onClick, children, strength = 0.18, max = 8 }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 200, damping: 22, mass: 0.5 });
  const y = useSpring(my, { stiffness: 200, damping: 22, mass: 0.5 });
  const clamp = (v) => Math.max(-max, Math.min(max, v));
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(clamp((e.clientX - r.left - r.width / 2) * strength));
    my.set(clamp((e.clientY - r.top - r.height / 2) * strength));
  };
  const reset = () => { mx.set(0); my.set(0); };
  return (
    <motion.button
      ref={ref}
      type="button"
      className={className}
      onClick={onClick}
      onPointerMove={(e) => { if (e.pointerType === "mouse") onMove(e); }}
      onPointerLeave={reset}
      onPointerUp={reset}
      style={{ x, y }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

export default function Home() {
  // --- STATE ---
  const [currentPage, setCurrentPage] = useState("home");
  const [currentSection, setCurrentSection] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  // Source for the shared video lightbox. Defaults to the setup walkthrough;
  // the Square Plans page swaps in Square's own videos via openVideo().
  const WALKTHROUGH_VIDEO = "https://drive.google.com/file/d/18Wbv1P9HwI35UsmNl-VUWRZFuQPAEl_c/preview";
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

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hi, welcome to Pro Commerce Solutions. I'm Dominique's B2B POS assistant. I can help you select hardware, estimate monthly costs, or configure Square setups." },
    { sender: "bot", text: "What would you like to explore today?" }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatBodyRef = useRef(null);

  // Pricing Matrix configuration
  const pricingMatrix = {
    plans: { free: 0, plus: 49, premium: 149 },
    plansLabels: { free: "Square Free", plus: "Square Plus", premium: "Square Premium" },
    hardware: {
      register: { name: "Square Register (2nd gen)", price: 44, term: "24 mo." },
      handheld: { name: "Square Handheld", price: 37, term: "12 mo." },
      terminal: { name: "Square Terminal", price: 27, term: "12 mo." },
      stand: { name: "Square Stand", price: 14, term: "12 mo." },
      kioskHardware: { name: "Square Kiosk Hardware", price: 14, term: "12 mo." },
      reader: { name: "Square Reader contactless + chip", price: 59, term: "one-time", onetime: true },
      standMount: { name: "Square Stand Mount", price: 149, term: "one-time", onetime: true },
      dock: { name: "Square Dock for Handheld", price: 99, term: "one-time", onetime: true },
      magReader: { name: "Square Reader for Magstripe", price: 10, term: "one-time", onetime: true },
      accessories: { name: "Square Accessories Kit", price: 89, term: "one-time", onetime: true }
    },
    addons: {
      kds: { free: 0, plus: 30, premium: 20 },
      kiosk: { free: 0, plus: 50, premium: 30 }
    }
  };

  // Plan info shown under the calculator plan selector
  const planInfo = {
    free: { title: "Square Free", desc: "Best for businesses that need basic Square POS tools without a monthly software charge. Processing fees still apply." },
    plus: { title: "Square Plus", desc: "Advanced inventory, staff tools, and unlocked KDS / Kiosk app add-ons for active, scaling businesses." },
    premium: { title: "Square Premium", desc: "For high-volume merchants over $250k/year. Lower negotiated rates, API integrations, and a dedicated account manager." }
  };

  // Trust marquee strip items
  const trustItems = [
    "Authorized Square Dealer",
    "Credit Card Processing",
    "POS Consultation",
    "Statement Reviews",
    "ATM Placements",
    "Hardware Setup",
    "No Long-Term Contracts",
    "1-on-1 Onboarding"
  ];

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
  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;

    if (reduce) {
      root.classList.remove("gsap-ready");
      document.querySelectorAll(".animate-on-scroll").forEach(el => { el.style.opacity = "1"; });
      document.querySelectorAll("[data-count]").forEach(el => {
        el.textContent = (el.dataset.prefix || "") + Number(el.dataset.count).toLocaleString("en-US") + (el.dataset.suffix || "");
      });
      return;
    }

    root.classList.add("gsap-ready");
    const ctx = gsap.context(() => {
      // Directional scroll reveals
      gsap.utils.toArray(".animate-on-scroll").forEach((el) => {
        const dir = el.getAttribute("data-dir");
        const delay = (parseInt(el.getAttribute("data-delay") || "0", 10)) * 0.09;
        const x = dir === "left" ? -64 : dir === "right" ? 64 : 0;
        const y = (dir === "left" || dir === "right") ? 0 : 46;
        gsap.set(el, { opacity: 0, x, y });
        gsap.to(el, {
          opacity: 1, x: 0, y: 0, duration: 1, ease: "power3.out", delay,
          scrollTrigger: { trigger: el, start: "top 86%", once: true }
        });
      });

      // Count-up numbers
      gsap.utils.toArray("[data-count]").forEach((el) => {
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
      gsap.utils.toArray("[data-parallax]").forEach((el) => {
        if (el.classList.contains("float-card") || el.classList.contains("hero-orb")) return;
        const speed = parseFloat(el.getAttribute("data-parallax")) || 0;
        gsap.fromTo(el, { y: 0 }, {
          y: speed * -150, ease: "none",
          scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: 0.6 }
        });
      });

      // Gentle continuous float on hero cards
      gsap.utils.toArray(".float-card").forEach((el, i) => {
        gsap.to(el, { y: i % 2 ? 16 : -16, duration: 3 + i * 0.4, ease: "sine.inOut", repeat: -1, yoyo: true });
      });

      // Animated bars in the hero analytics card
      gsap.utils.toArray(".fc-bars span").forEach((el, i) => {
        gsap.from(el, { scaleY: 0.15, transformOrigin: "bottom", duration: 0.9, delay: 0.4 + i * 0.08, ease: "power3.out" });
      });

      // Cinematic clip-path reveal on the hero photo
      const heroImg = document.querySelector(".hero-photo img");
      if (heroImg) {
        gsap.fromTo(heroImg,
          { clipPath: "inset(0 0 100% 0)", scale: 1.12 },
          { clipPath: "inset(0 0 0% 0)", scale: 1, duration: 1.3, ease: "power3.out", delay: 0.15 });
      }

      // Seamless marquee
      const track = document.querySelector(".marquee-track");
      if (track) gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [currentPage]);

  // --- CHAT SCROLL TO BOTTOM EFFECT ---
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages, isBotTyping]);

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

  // The product spec gallery is manually controlled (arrows / dots) — it does
  // not auto-advance, so the viewer stays on whichever image they choose.

  const closeWelcome = () => {
    setIsWelcomeOpen(false);
    try { window.sessionStorage.setItem("pc_welcome_seen", "1"); } catch {}
  };

  const handleWelcomeSubmit = (e) => {
    e.preventDefault();
    setLoadingAction("welcome");
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
  // Detailed "what this setup includes" lines (prototype-style breakdown)
  const setupIncludes = [];

  // Software line
  if (pricingMatrix.plans[selectedPlan] > 0) {
    setupIncludes.push(`${pricingMatrix.plansLabels[selectedPlan]} software — $${pricingMatrix.plans[selectedPlan]}/mo × ${locations} location${locations > 1 ? "s" : ""} = $${planMonthly}/mo`);
  } else {
    setupIncludes.push(`${pricingMatrix.plansLabels[selectedPlan]} software — $0/mo (processing fees apply) × ${locations} location${locations > 1 ? "s" : ""}`);
  }

  Object.keys(hardwareQty).forEach(key => {
    const qty = hardwareQty[key];
    if (qty <= 0) return;
    const config = pricingMatrix.hardware[key];
    const cost = config.price * qty;
    if (config.onetime) {
      onetimeTotal += cost;
      setupIncludes.push(`${qty} × ${config.name} — $${cost} one-time payment`);
    } else {
      hardwareMonthly += cost;
      setupIncludes.push(`${qty} × ${config.name} — $${cost}/mo financed over ${config.term} (est.)`);
    }
  });

  const kdsQty = selectedPlan === "free" ? 0 : addonQty.kds;
  const kioskQty = selectedPlan === "free" ? 0 : addonQty.kiosk;
  const kdsMonthly = selectedPlan === "free" ? 0 : pricingMatrix.addons.kds[selectedPlan] * kdsQty;
  const kioskMonthly = selectedPlan === "free" ? 0 : pricingMatrix.addons.kiosk[selectedPlan] * kioskQty;

  if (kdsQty > 0) setupIncludes.push(`${kdsQty} × Square KDS app device — $${pricingMatrix.addons.kds[selectedPlan]}/mo each = $${kdsMonthly}/mo`);
  if (kioskQty > 0) setupIncludes.push(`${kioskQty} × Square Kiosk app device — $${pricingMatrix.addons.kiosk[selectedPlan]}/mo each = $${kioskMonthly}/mo`);

  const totalMonthly = planMonthly + hardwareMonthly + kdsMonthly + kioskMonthly;

  const changeLocations = (val) => {
    const parsed = parseInt(val, 10);
    setLocations(isNaN(parsed) || parsed < 1 ? 1 : parsed);
  };

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

  const hardwareDetails = {
    register: {
      name: "Square Register",
      price: "$899 or $44/mo",
      url: "https://squareup.com/us/en/hardware/register",
      desc: "Complete countertop POS system with customer-facing display. Designed for high-volume retail or restaurant checkout.",
      specs: [
        "Merchant screen: 13.3-inch display (1920x1080 resolution)",
        "Customer screen: 7.0-inch display (1024x600 resolution)",
        "Built-in card reader: Chip (EMV), Contactless (NFC), and Magstripe",
        "Connectivity: Wi-Fi, Ethernet, and USB accessory hub (5 ports)",
        "Software: Pre-installed Square POS software"
      ],
      bestFor: "Full-service restaurants, retail boutiques, and busy counter-service hubs.",
      images: [
        "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1556742031-c6961e8560b0?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1556740734-7f95cb6d6119?auto=format&fit=crop&w=600&q=80",
        "/hero_pos_scene.jpg"
      ]
    },
    handheld: {
      name: "Square Terminal / Handheld",
      price: "$399 or $37/mo",
      url: "https://squareup.com/us/en/hardware/handheld",
      desc: "Compact, durable mobile terminal. Perfect for restaurant table ordering, line busting, patio checkouts, and staff on the move.",
      specs: [
        "Screen: 5.5-inch color LCD touch screen",
        "Battery: All-day battery life (up to 8 hours of active use)",
        "Built-in printer: Thermal receipt printer (58mm width)",
        "Connectivity: Wi-Fi, and optional USB hub attachment",
        "Payments: Contactless cards, Apple Pay, Google Pay, and Chip cards"
      ],
      bestFor: "Tableside ordering, queue line busting, patio checkouts, and pop-up locations.",
      images: [
        "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=600&q=80",
        "/restaurant_path.jpg"
      ]
    },
    terminal: {
      name: "Square Terminal",
      price: "$299 or $27/mo",
      url: "https://squareup.com/us/en/hardware/terminal",
      desc: "Compact card payment device with receipt printer built-in. Great for countertops or tableside receipt printing.",
      specs: [
        "Screen: 5.5-inch color LCD touch screen",
        "Printer: Built-in thermal printer for instant receipts",
        "Battery: Rechargeable battery for cordless tableside use",
        "Connectivity: Wi-Fi, Ethernet, and accessory port via hub",
        "Security: Fully encrypted payments out-of-the-box"
      ],
      bestFor: "Countertop checkouts, medical offices, professional services, and dine-in tables.",
      images: [
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=600&q=80",
        "/retail_path.jpg"
      ]
    },
    stand: {
      name: "Square Stand",
      price: "$149 or $14/mo",
      url: "https://squareup.com/us/en/hardware/stand",
      desc: "iPad countertop stand with contactless and chip reader built in. Turn an iPad into a sleek checkout monitor.",
      specs: [
        "iPad compatibility: Fits iPad 10.2\", iPad Air, and iPad Pro 10.5\"",
        "Payments: Contactless and chip reader embedded in the stand bezel",
        "Swivel: 180-degree smooth swivel base for easy customer signing",
        "Connectivity: USB accessory hub included with stand power adapter",
        "Power: Charges iPad continuously when plugged in"
      ],
      bestFor: "Independent boutiques, cafes, fitness studios, and coffee shops.",
      images: [
        "https://images.unsplash.com/photo-1516216628859-9bccecab13ca?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1560264280-88b68371db39?auto=format&fit=crop&w=600&q=80",
        "/cafe_path.jpg"
      ]
    },
    kiosk: {
      name: "Square Kiosk",
      price: "$149 or $14/mo",
      url: "https://squareup.com/us/en/hardware/kiosk",
      desc: "Customer self-service checkout hardware. Shorter lines and faster turnaround for quick-service counters and cafes.",
      specs: [
        "iPad compatibility: Designed to secure standard iPad models",
        "Payments: Integrated contactless tap area and chip slot",
        "Mounting: Desktop mount, wall mount, or pedestal options",
        "Software: Requires Square Kiosk app subscription",
        "Security: Key-locked tamper-proof steel enclosure"
      ],
      bestFor: "Quick-service cafes, bakeries, fast-food counters, and high-traffic order hubs.",
      images: [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
        "/restaurant_path.jpg"
      ]
    },
    reader: {
      name: "Square Reader (Contactless + Chip)",
      price: "$59 one-time payment",
      url: "https://squareup.com/us/en/hardware/reader",
      desc: "Simple pocket-sized card reader. Pairs via Bluetooth to run card checkouts directly on your iOS or Android phone.",
      specs: [
        "Connectivity: Bluetooth Low Energy (BLE) connects to smartphones/tablets",
        "Payments: NFC contactless cards, Apple Pay, Google Pay, and Chip cards",
        "Size: Ultra-compact (2.6\" x 2.6\" x 0.4\" pocket dimensions)",
        "Battery: Rechargeable battery via micro-USB",
        "Stand: Optional dock accessory available for countertop setups"
      ],
      bestFor: "Mobile vendors, service contractors, taxi drivers, and entry-level merchants.",
      images: [
        "https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1556741533-411cf82e4e24?auto=format&fit=crop&w=600&q=80",
        "/hero_pos_scene.jpg"
      ]
    },
    standMount: {
      name: "Square Stand Mount",
      price: "$149 one-time payment",
      url: "https://squareup.com/us/en/hardware/stand-mount",
      desc: "Low-profile countertop mount that locks an iPad in place for a clean, fixed checkout. Pairs with a Square reader for payments.",
      specs: [
        "iPad compatibility: Secures most current-generation iPad models",
        "Design: Low-profile, fixed-angle mount for a tidy counter",
        "Payments: Use with Square Reader for contactless + chip",
        "Cable management: Built-in routing for power and accessories",
        "Mounting: Optional VESA / wall-mount accessory available"
      ],
      bestFor: "Cafes, boutiques, and counters that want a permanent, low-profile iPad checkout.",
      images: [
        "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
        "/retail_path.jpg",
        "/hero_pos_scene.jpg"
      ]
    },
    dock: {
      name: "Square Dock for Square Handheld",
      price: "$99 one-time payment",
      url: "https://squareup.com/us/en/hardware/handheld",
      desc: "Charging dock that turns the Square Handheld into a stationary countertop terminal between mobile shifts.",
      specs: [
        "Compatibility: Designed for the Square Handheld device",
        "Charging: Continuous charging while docked",
        "Design: Weighted base for stable one-handed dips and taps",
        "Connectivity: Keeps the device ready on Wi-Fi",
        "Use: Switch between countertop and mobile service instantly"
      ],
      bestFor: "Businesses that run the Handheld both tableside and as a fixed register.",
      images: [
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=600&q=80",
        "/cafe_path.jpg",
        "/restaurant_path.jpg"
      ]
    },
    magReader: {
      name: "Square Reader for Magstripe",
      price: "$10 one-time payment",
      url: "https://squareup.com/us/en/hardware/reader",
      desc: "Ultra-affordable swipe reader that plugs into a phone or tablet headset jack for quick magstripe card payments.",
      specs: [
        "Connectivity: Plugs into a 3.5mm headset jack (adapter for newer devices)",
        "Payments: Magstripe swipe cards",
        "Size: Pocket-sized and lightweight",
        "Power: No charging required — draws from the device",
        "Backup: A handy spare for any mobile setup"
      ],
      bestFor: "Entry-level sellers, markets, and backup swipe payments on the go.",
      images: [
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?auto=format&fit=crop&w=600&q=80",
        "/hero_pos_scene.jpg",
        "/retail_path.jpg"
      ]
    },
    accessories: {
      name: "Square Accessories Kit",
      price: "From $89 one-time payment",
      url: "https://squareup.com/shop/hardware/v2/us/en/products/accessories",
      desc: "Receipt printers, cash drawers, barcode scanners, and kitchen printers that complete a full countertop or kitchen setup.",
      specs: [
        "Receipt printers: Thermal and impact (kitchen) options",
        "Cash drawers: Heavy-duty drawers that trigger on sale",
        "Barcode scanners: 1D/2D handheld and hands-free scanners",
        "Kitchen printers: Send tickets to the line via KDS or paper",
        "Compatibility: Works with Square Register, Stand, and Terminal"
      ],
      bestFor: "Retailers and restaurants building out a complete countertop or kitchen station.",
      images: [
        "https://images.unsplash.com/photo-1556742208-999815fca738?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80",
        "/hero_pos_scene.jpg"
      ]
    }
  };

  // Rotating gallery shown in the spec modal. Swap these for official Square
  // product photo URLs any time — the modal cross-fades through whatever is here.
  const productGallery = ["/hero_pos_scene.jpg", "/restaurant_path.jpg", "/retail_path.jpg", "/cafe_path.jpg"];

  // Free stock imagery (Unsplash). If a remote image fails to load it falls
  // back to a bundled local photo, so nothing ever appears broken.
  const stock = {
    about:      { src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1280&q=70", fb: "/hero_pos_scene.jpg" },
    about2:     { src: "https://images.unsplash.com/photo-1556745753-b2904692b3cd?auto=format&fit=crop&w=1280&q=70", fb: "/retail_path.jpg" },
    consult:    { src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1280&q=70", fb: "/hero_pos_scene.jpg" },
    statement:  { src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1280&q=70", fb: "/cafe_path.jpg" },
    restaurant: { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1280&q=70", fb: "/restaurant_path.jpg" },
    retail:     { src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1280&q=70", fb: "/retail_path.jpg" },
    hardware:   { src: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1280&q=70", fb: "/hero_pos_scene.jpg" },
    onboarding: { src: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1280&q=70", fb: "/hero_pos_scene.jpg" },
    heroMain:   { src: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1280&q=75", fb: "/hero_pos_scene.jpg" },
    nRestaurant:{ src: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=70", fb: "/restaurant_path.jpg" },
    nCafe:      { src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=70", fb: "/cafe_path.jpg" },
    nRetail:    { src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=70", fb: "/retail_path.jpg" },
    showcase:   { src: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1280&q=75", fb: "/hero_pos_scene.jpg" }
  };
  const onImgError = (fb) => (e) => { e.currentTarget.onerror = null; e.currentTarget.src = fb; };

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

  // Featured Square videos on the Plans page.
  // NOTE: replace `src` with the exact Square video embed URLs you want to use
  // (e.g. https://www.youtube.com/embed/VIDEO_ID). They default to the setup
  // walkthrough so nothing ever appears broken until the real links are added.
  const plansVideos = [
    {
      kicker: "Square in Action",
      heading: "See how Square powers a busy counter",
      body: "Watch how payments, orders, and reporting flow through one connected Square system — from the first tap to end-of-day totals.",
      poster: stock.heroMain,
      src: WALKTHROUGH_VIDEO,
      title: "Square in Action"
    },
    {
      kicker: "Up & Running Fast",
      heading: "Get set up in minutes, not weeks",
      body: "From creating your profile to taking your first payment, see how quickly a Square setup comes together with hands-on guidance from Pro Commerce Solutions.",
      poster: stock.onboarding,
      src: WALKTHROUGH_VIDEO,
      title: "Getting Set Up with Square"
    }
  ];

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

  // --- FORMS SUBMISSION MOCKS ---
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setLoadingAction("contact");
    
    // Simulate API fetch delay
    setTimeout(() => {
      setLoadingAction(null);
      setContactSubmitSuccess(true);
    }, 1200);
  };

  const handleSurveySubmit = (e) => {
    e.preventDefault();
    setLoadingAction("survey");
    
    // Simulate API fetch delay
    setTimeout(() => {
      setLoadingAction(null);
      setSurveySubmitSuccess(true);
    }, 1200);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    setLoadingAction("upload");
    
    // Simulate API fetch delay
    setTimeout(() => {
      setLoadingAction(null);
      setUploadSubmitSuccess(true);
    }, 1200);
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

  // --- CHATBOT LOGIC ---
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: "user", text: userText }]);

    setIsBotTyping(true);

    setTimeout(() => {
      setIsBotTyping(false);
      let reply = "I'm Dominique's B2B POS assistant. I can help configure your Square setup, estimate monthly costs, or submit a request for consultation. Would you like to schedule a free 1-on-1 session with us?";
      const q = userText.toLowerCase();

      if (q.includes("pos") || q.includes("square") || q.includes("system")) {
        reply = "Square offers tailormade POS systems for Restaurants, Retailers, and service-based businesses. Would you like me to open our Business Survey so we can recommend the perfect custom hardware setup?";
      } else if (q.includes("price") || q.includes("pricing") || q.includes("cost") || q.includes("estimate") || q.includes("hardware")) {
        reply = "Our hardware financing starts from $14/mo (Square Stand) up to $44/mo (Square Register). You can use our Setup Estimator on the Products page or I can help collect a custom request here. What industry are you in?";
      } else if (q.includes("restaurant") || q.includes("cafe") || q.includes("food")) {
        reply = "For restaurants, we recommend combining Square Plus ($49/mo) with Register ($44/mo) and Handhelds ($37/mo) for tableside checkout. What is your business name?";
      } else if (q.includes("retail") || q.includes("store") || q.includes("shop")) {
        reply = "For retail operations, the Square Retail POS software manages inventory levels seamlessly. Would you like to schedule a custom statement review to compare rates?";
      } else if (q.includes("upload") || q.includes("statement") || q.includes("rate") || q.includes("fee")) {
        reply = "Uploading a processing statement is the fastest way to check your potential savings. Would you like me to open the secure statement uploader modal right now?";
        setTimeout(() => openUploadModal(), 1500);
      }

      setChatMessages(prev => [...prev, { sender: "bot", text: reply }]);
    }, 1000);
  };

  const chatReply = (text) => {
    setChatMessages(prev => [...prev, { sender: "user", text }]);
    setIsBotTyping(true);
    
    setTimeout(() => {
      setIsBotTyping(false);
      let reply = "Great choice. I can help qualify your business. Dominique Wright specializes in high-trust Square conversions. Would you like to launch the onboarding setup survey now?";
      
      const q = text.toLowerCase();
      if (q.includes("pricing") || q.includes("hardware")) {
        reply = "Understood. Our Setup Estimator on the Products page helps you calculate custom hardware configurations. Or, let me open our Business Survey modal to get a direct advisor review.";
      } else if (q.includes("restaurant")) {
        reply = "Perfect, for restaurant workflows we can pre-tag you for KDS integrations. Shall we launch the recommendation survey?";
      } else if (q.includes("statement") || q.includes("rates")) {
        reply = "Excellent. I will open the upload modal for your processing statement now so we can review the rates.";
        setTimeout(() => openUploadModal(), 1500);
      }

      setChatMessages(prev => [...prev, { sender: "bot", text: reply }]);
    }, 1000);
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
              <button className={`nav-item ${currentPage === "home" ? "active" : ""}`} onClick={() => navigateTo("home")}>Home</button>
              <button className={`nav-item ${currentPage === "about" ? "active" : ""}`} onClick={() => navigateTo("about")}>About Us</button>
              <button className={`nav-item ${currentPage === "services" ? "active" : ""}`} onClick={() => navigateTo("services")}>Services</button>
              <button className={`nav-item ${currentPage === "products" && currentSection !== "calculator" ? "active" : ""}`} onClick={() => navigateTo("products")}>Square Hardware</button>
              <button className={`nav-item ${currentPage === "plans" ? "active" : ""}`} onClick={() => navigateTo("plans")}>Square Plans</button>
              <button className={`nav-item ${currentPage === "contact" ? "active" : ""}`} onClick={() => navigateTo("contact")}>Contact Us</button>
            </div>
            <MagBtn className="btn primary nav-cta" onClick={openSurvey}>
              Get Started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </MagBtn>
          </nav>
        </div>
      </header>

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
              {/* Register */}
              <div className="hardware-card">
                <div className="device-visual">
                  <span className="official-badge">Official Hardware</span>
                  <svg viewBox="0 0 360 180" role="img" aria-label="Square Register visual"><rect x="40" y="35" width="160" height="90" rx="16" fill="#2F3438"/><rect x="58" y="52" width="124" height="55" rx="10" fill="#EAF6FD"/><circle cx="145" cy="80" r="13" fill="#50A8D8"/><rect x="225" y="50" width="72" height="86" rx="13" fill="#FFFFFF" stroke="#2F3438" strokeWidth="8"/><rect x="238" y="65" width="46" height="20" rx="5" fill="#EAF6FD"/><path d="M80 140h170" stroke="#CBD5E1" strokeWidth="10" strokeLinecap="round"/></svg>
                </div>
                <div className="hardware-body">
                  <h3>Square Register</h3>
                  <p>Complete countertop POS system with customer-facing display. Designed for high-volume retail or restaurant checkout.</p>
                  <div className="price-line"><strong>$899 or $44/mo (24 mo. financing)</strong></div>
                  <div className="square-links">
                    <button className="btn ghost small" onClick={openSurvey}>Get Recommendation</button>
                    <button className="btn secondary small" onClick={() => openProduct(hardwareDetails.register)}>View Specs</button>
                  </div>
                </div>
              </div>

              {/* Handheld */}
              <div className="hardware-card">
                <div className="device-visual">
                  <span className="official-badge">Official Hardware</span>
                  <svg viewBox="0 0 360 180" role="img" aria-label="Square Handheld visual"><rect x="130" y="22" width="100" height="138" rx="26" fill="#2F3438"/><rect x="145" y="44" width="70" height="72" rx="10" fill="#EAF6FD"/><circle cx="180" cy="135" r="13" fill="#50A8D8"/><path d="M88 150h184" stroke="#CBD5E1" strokeWidth="10" strokeLinecap="round"/></svg>
                </div>
                <div className="hardware-body">
                  <h3>Square Handheld</h3>
                  <p>Compact, durable mobile terminal. Perfect for restaurant table ordering, line busting, patio checkouts, and staff on the move.</p>
                  <div className="price-line"><strong>$399 or $37/mo (12 mo. financing)</strong></div>
                  <div className="square-links">
                    <button className="btn ghost small" onClick={openSurvey}>Get Recommendation</button>
                    <button className="btn secondary small" onClick={() => openProduct(hardwareDetails.handheld)}>View Specs</button>
                  </div>
                </div>
              </div>

              {/* Terminal */}
              <div className="hardware-card">
                <div className="device-visual">
                  <span className="official-badge">Official Hardware</span>
                  <svg viewBox="0 0 360 180" role="img" aria-label="Square Terminal visual"><rect x="105" y="25" width="150" height="130" rx="28" fill="#FFFFFF" stroke="#2F3438" strokeWidth="9"/><rect x="128" y="50" width="104" height="55" rx="10" fill="#EAF6FD"/><circle cx="180" cy="126" r="14" fill="#50A8D8"/><path d="M118 155h124" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round"/></svg>
                </div>
                <div className="hardware-body">
                  <h3>Square Terminal</h3>
                  <p>Compact card payment device with receipt printer built-in. Great for countertops or tableside receipt printing.</p>
                  <div className="price-line"><strong>$299 or $27/mo (12 mo. financing)</strong></div>
                  <div className="square-links">
                    <button className="btn ghost small" onClick={openSurvey}>Get Recommendation</button>
                    <button className="btn secondary small" onClick={() => openProduct(hardwareDetails.terminal)}>View Specs</button>
                  </div>
                </div>
              </div>

              {/* Stand */}
              <div className="hardware-card">
                <div className="device-visual">
                  <span className="official-badge">Official Hardware</span>
                  <svg viewBox="0 0 360 180" role="img" aria-label="Square Stand visual"><rect x="88" y="35" width="154" height="96" rx="20" fill="#2F3438"/><rect x="107" y="54" width="116" height="58" rx="10" fill="#EAF6FD"/><rect x="150" y="128" width="60" height="18" rx="8" fill="#50A8D8"/><path d="M115 154h130" stroke="#CBD5E1" strokeWidth="10" strokeLinecap="round"/></svg>
                </div>
                <div className="hardware-body">
                  <h3>Square Stand</h3>
                  <p>iPad countertop stand with contactless and chip reader built in. Turn an iPad into a sleek checkout monitor.</p>
                  <div className="price-line"><strong>$149 or $14/mo (12 mo. financing)</strong></div>
                  <div className="square-links">
                    <button className="btn ghost small" onClick={openSurvey}>Get Recommendation</button>
                    <button className="btn secondary small" onClick={() => openProduct(hardwareDetails.stand)}>View Specs</button>
                  </div>
                </div>
              </div>

              {/* Kiosk */}
              <div className="hardware-card">
                <div className="device-visual">
                  <span className="official-badge">Official Hardware</span>
                  <svg viewBox="0 0 360 180" role="img" aria-label="Square Kiosk visual"><rect x="115" y="25" width="130" height="95" rx="20" fill="#2F3438"/><rect x="135" y="45" width="90" height="52" rx="10" fill="#EAF6FD"/><rect x="160" y="118" width="40" height="34" rx="8" fill="#50A8D8"/><path d="M110 158h140" stroke="#CBD5E1" strokeWidth="10" strokeLinecap="round"/></svg>
                </div>
                <div className="hardware-body">
                  <h3>Square Kiosk</h3>
                  <p>Customer self-service checkout hardware. Shorter lines and faster turnaround for quick-service counters and cafes.</p>
                  <div className="price-line"><strong>$149 or $14/mo (12 mo. financing)</strong></div>
                  <div className="square-links">
                    <button className="btn ghost small" onClick={openSurvey}>Get Recommendation</button>
                    <button className="btn secondary small" onClick={() => openProduct(hardwareDetails.kiosk)}>View Specs</button>
                  </div>
                </div>
              </div>

              {/* Reader */}
              <div className="hardware-card">
                <div className="device-visual">
                  <span className="official-badge">Official Hardware</span>
                  <svg viewBox="0 0 360 180" role="img" aria-label="Square Reader contactless and chip visual"><rect x="120" y="40" width="120" height="100" rx="26" fill="#FFFFFF" stroke="#2F3438" strokeWidth="9"/><path d="M168 75c16 16 16 34 0 50M193 65c25 28 25 52 0 80" fill="none" stroke="#50A8D8" strokeWidth="9" strokeLinecap="round"/><path d="M118 154h124" stroke="#CBD5E1" strokeWidth="10" strokeLinecap="round"/></svg>
                </div>
                <div className="hardware-body">
                  <h3>Contactless & Chip Reader</h3>
                  <p>Simple pocket-sized card reader. Pairs via Bluetooth to run card checkouts directly on your iOS or Android phone.</p>
                  <div className="price-line"><strong>$59 one-time payment</strong></div>
                  <div className="square-links">
                    <button className="btn ghost small" onClick={openSurvey}>Get Recommendation</button>
                    <button className="btn secondary small" onClick={() => openProduct(hardwareDetails.reader)}>View Specs</button>
                  </div>
                </div>
              </div>

              {/* Stand Mount */}
              <div className="hardware-card">
                <div className="device-visual">
                  <span className="official-badge">Official Hardware</span>
                  <svg viewBox="0 0 360 180" role="img" aria-label="Square Stand Mount visual"><rect x="95" y="30" width="170" height="104" rx="16" fill="#2F3438"/><rect x="114" y="48" width="132" height="68" rx="9" fill="#EAF6FD"/><rect x="150" y="132" width="60" height="14" rx="6" fill="#2F3438"/><path d="M120 150h120" stroke="#CBD5E1" strokeWidth="10" strokeLinecap="round"/><circle cx="180" cy="82" r="11" fill="#50A8D8"/></svg>
                </div>
                <div className="hardware-body">
                  <h3>Square Stand Mount</h3>
                  <p>Low-profile countertop mount that locks an iPad in place for a clean, fixed checkout station.</p>
                  <div className="price-line"><strong>$149 one-time payment</strong></div>
                  <div className="square-links">
                    <button className="btn ghost small" onClick={openSurvey}>Get Recommendation</button>
                    <button className="btn secondary small" onClick={() => openProduct(hardwareDetails.standMount)}>View Specs</button>
                  </div>
                </div>
              </div>

              {/* Dock for Handheld */}
              <div className="hardware-card">
                <div className="device-visual">
                  <span className="official-badge">Official Hardware</span>
                  <svg viewBox="0 0 360 180" role="img" aria-label="Square Dock for Handheld visual"><rect x="138" y="20" width="84" height="118" rx="20" fill="#2F3438"/><rect x="151" y="38" width="58" height="62" rx="8" fill="#EAF6FD"/><circle cx="180" cy="118" r="10" fill="#50A8D8"/><rect x="120" y="138" width="120" height="20" rx="9" fill="#C4CCD6"/><path d="M150 158h60" stroke="#CBD5E1" strokeWidth="10" strokeLinecap="round"/></svg>
                </div>
                <div className="hardware-body">
                  <h3>Square Dock for Handheld</h3>
                  <p>Charging dock that turns the Square Handheld into a stationary countertop terminal between mobile shifts.</p>
                  <div className="price-line"><strong>$99 one-time payment</strong></div>
                  <div className="square-links">
                    <button className="btn ghost small" onClick={openSurvey}>Get Recommendation</button>
                    <button className="btn secondary small" onClick={() => openProduct(hardwareDetails.dock)}>View Specs</button>
                  </div>
                </div>
              </div>

              {/* Magstripe Reader */}
              <div className="hardware-card">
                <div className="device-visual">
                  <span className="official-badge">Official Hardware</span>
                  <svg viewBox="0 0 360 180" role="img" aria-label="Square Reader for magstripe visual"><rect x="150" y="40" width="60" height="60" rx="10" fill="#2F3438"/><rect x="172" y="100" width="16" height="40" rx="6" fill="#2F3438"/><path d="M165 70h30" stroke="#50A8D8" strokeWidth="8" strokeLinecap="round"/><path d="M118 150h124" stroke="#CBD5E1" strokeWidth="10" strokeLinecap="round"/></svg>
                </div>
                <div className="hardware-body">
                  <h3>Reader for Magstripe</h3>
                  <p>Ultra-affordable swipe reader that plugs into a phone or tablet for quick magstripe card payments.</p>
                  <div className="price-line"><strong>$10 one-time payment</strong></div>
                  <div className="square-links">
                    <button className="btn ghost small" onClick={openSurvey}>Get Recommendation</button>
                    <button className="btn secondary small" onClick={() => openProduct(hardwareDetails.magReader)}>View Specs</button>
                  </div>
                </div>
              </div>

              {/* Accessories */}
              <div className="hardware-card">
                <div className="device-visual">
                  <span className="official-badge">Official Hardware</span>
                  <svg viewBox="0 0 360 180" role="img" aria-label="Square Accessories visual"><rect x="60" y="60" width="86" height="80" rx="10" fill="#2F3438"/><rect x="74" y="76" width="58" height="22" rx="4" fill="#EAF6FD"/><rect x="206" y="84" width="96" height="56" rx="10" fill="#FFFFFF" stroke="#2F3438" strokeWidth="8"/><rect x="222" y="100" width="64" height="10" rx="5" fill="#50A8D8"/><path d="M70 150h220" stroke="#CBD5E1" strokeWidth="10" strokeLinecap="round"/></svg>
                </div>
                <div className="hardware-body">
                  <h3>Accessories Kit</h3>
                  <p>Receipt printers, cash drawers, barcode scanners, and kitchen printers to complete your countertop or kitchen setup.</p>
                  <div className="price-line"><strong>From $89 one-time payment</strong></div>
                  <div className="square-links">
                    <button className="btn ghost small" onClick={openSurvey}>Get Recommendation</button>
                    <button className="btn secondary small" onClick={() => openProduct(hardwareDetails.accessories)}>View Specs</button>
                  </div>
                </div>
              </div>
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

          {/* 3) Square video #1 */}
          <section className="container">
            <div className="showcase-row">
              <div
                className="showcase-media video-poster animate-on-scroll"
                data-dir="left"
                role="button"
                tabIndex={0}
                onClick={() => openVideo(plansVideos[0].src, plansVideos[0].title)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openVideo(plansVideos[0].src, plansVideos[0].title); }}
              >
                <img src={plansVideos[0].poster.src} onError={onImgError(plansVideos[0].poster.fb)} alt={plansVideos[0].heading} loading="lazy" />
                <span className="video-play-btn"><Play size={26} fill="currentColor" /></span>
              </div>
              <div className="showcase-content animate-on-scroll" data-dir="right" data-delay="1">
                <span className="kicker">{plansVideos[0].kicker}</span>
                <h2>{plansVideos[0].heading}</h2>
                <p>{plansVideos[0].body}</p>
                <button className="btn primary" onClick={() => openVideo(plansVideos[0].src, plansVideos[0].title)}>
                  <Play size={16} fill="currentColor" /> Watch the video
                </button>
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

          {/* 5) Square video #2 */}
          <section className="container">
            <div className="showcase-row media-right">
              <div className="showcase-content animate-on-scroll" data-dir="left">
                <span className="kicker">{plansVideos[1].kicker}</span>
                <h2>{plansVideos[1].heading}</h2>
                <p>{plansVideos[1].body}</p>
                <button className="btn primary" onClick={() => openVideo(plansVideos[1].src, plansVideos[1].title)}>
                  <Play size={16} fill="currentColor" /> Watch the video
                </button>
              </div>
              <div
                className="showcase-media video-poster animate-on-scroll"
                data-dir="right"
                data-delay="1"
                role="button"
                tabIndex={0}
                onClick={() => openVideo(plansVideos[1].src, plansVideos[1].title)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openVideo(plansVideos[1].src, plansVideos[1].title); }}
              >
                <img src={plansVideos[1].poster.src} onError={onImgError(plansVideos[1].poster.fb)} alt={plansVideos[1].heading} loading="lazy" />
                <span className="video-play-btn"><Play size={26} fill="currentColor" /></span>
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
              <li><button onClick={() => navigateTo("home")}>Home Page</button></li>
              <li><button onClick={() => navigateTo("about")}>About Us</button></li>
              <li><button onClick={() => navigateTo("services")}>Our Services</button></li>
              <li><button onClick={() => navigateTo("products")}>Square Hardware</button></li>
              <li><button onClick={() => navigateTo("plans")}>Square Plans</button></li>
              <li><button onClick={() => navigateTo("products", "calculator")}>Cost Calculator</button></li>
              <li><button onClick={() => navigateTo("contact")}>Contact Us</button></li>
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

      {/* MODAL: SURVEY MODAL */}
      <div className={`modal-overlay ${isSurveyOpen ? "show" : ""}`}>
        <div className="modal-container">
          <div className="modal-header">
            <div>
              <h3>Merchant Setup Survey</h3>
              <p style={{ fontSize: "0.85rem", marginBottom: 0 }}>Configure your customized Square recommendation.</p>
            </div>
            <button className="modal-close" onClick={() => setIsSurveyOpen(false)}>&times;</button>
          </div>
          <div className="modal-body">
            {surveySubmitSuccess ? (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <div style={{ display: "inline-grid", placeItems: "center", width: "64px", height: "64px", borderRadius: "9999px", background: "var(--success-soft)", color: "var(--success)", marginBottom: "1rem" }}>
                  <ShieldCheck size={36} />
                </div>
                <h3>Survey Captured!</h3>
                <p style={{ margin: "1rem 0 2rem", color: "var(--text-muted)" }}>Your information has been logged securely in our pipeline. The team at Pro Commerce Solutions will evaluate your details and prepare custom POS recommendations.</p>
                <div className="btn-row" style={{ justifyContent: "center" }}>
                  <button className="btn primary" onClick={() => setIsSurveyOpen(false)}>Done</button>
                </div>
              </div>
            ) : (
              <>
                <div className="survey-progress">
                  <div className={`survey-progress-step ${surveyStep >= 1 ? "active" : ""}`}></div>
                  <div className={`survey-progress-step ${surveyStep >= 2 ? "active" : ""}`}></div>
                  <div className={`survey-progress-step ${surveyStep >= 3 ? "active" : ""}`}></div>
                </div>

                <form onSubmit={handleSurveySubmit}>
                  {/* Step 1 */}
                  {surveyStep === 1 && (
                    <div className="survey-step active">
                      <h4 style={{ marginBottom: "1rem" }}>Step 1: Contact Information</h4>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>First Name *</label>
                          <input 
                            type="text" 
                            placeholder="First name" 
                            required 
                            value={surveyForm.firstName}
                            onChange={(e) => setSurveyForm(prev => ({ ...prev, firstName: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Last Name *</label>
                          <input 
                            type="text" 
                            placeholder="Last name" 
                            required 
                            value={surveyForm.lastName}
                            onChange={(e) => setSurveyForm(prev => ({ ...prev, lastName: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Email Address *</label>
                          <input 
                            type="email" 
                            placeholder="Email address" 
                            required 
                            value={surveyForm.email}
                            onChange={(e) => setSurveyForm(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Phone Number <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>(optional)</span></label>
                          <input
                            type="tel"
                            placeholder="Phone number"
                            value={surveyForm.phone}
                            onChange={(e) => setSurveyForm(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                        <button type="button" className="btn primary" onClick={handleStepNext}>Next Step</button>
                      </div>
                    </div>
                  )}

                  {/* Step 2 */}
                  {surveyStep === 2 && (
                    <div className="survey-step active">
                      <h4 style={{ marginBottom: "1rem" }}>Step 2: Business Workflows</h4>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Business Type *</label>
                          <select 
                            value={surveyForm.businessType}
                            onChange={(e) => setSurveyForm(prev => ({ ...prev, businessType: e.target.value }))}
                            required
                          >
                            <option value="Restaurant (table service)">Restaurant (table service)</option>
                            <option value="Restaurant (quick service)">Restaurant (quick service)</option>
                            <option value="Cafés & QSR">Cafés &amp; QSR</option>
                            <option value="Retail">Retail</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Industry *</label>
                          <input 
                            type="text" 
                            placeholder="Industry category" 
                            required 
                            value={surveyForm.industry}
                            onChange={(e) => setSurveyForm(prev => ({ ...prev, industry: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Monthly Revenue ($) *</label>
                          <input 
                            type="text" 
                            placeholder="Estimated revenue" 
                            required 
                            value={surveyForm.monthlyRevenue}
                            onChange={(e) => setSurveyForm(prev => ({ ...prev, monthlyRevenue: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Projected Volume ($) *</label>
                          <input 
                            type="text" 
                            placeholder="Projected monthly volume" 
                            required 
                            value={surveyForm.projectedVolume}
                            onChange={(e) => setSurveyForm(prev => ({ ...prev, projectedVolume: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
                        <button type="button" className="btn ghost" onClick={() => setSurveyStep(1)}>Previous</button>
                        <button type="button" className="btn primary" onClick={handleStepNext}>Next Step</button>
                      </div>
                    </div>
                  )}

                  {/* Step 3 */}
                  {surveyStep === 3 && (
                    <div className="survey-step active">
                      <h4 style={{ marginBottom: "1rem" }}>Step 3: Registration details</h4>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Merchant DBA *</label>
                          <input 
                            type="text" 
                            placeholder="Doing Business As name" 
                            required 
                            value={surveyForm.dbaName}
                            onChange={(e) => setSurveyForm(prev => ({ ...prev, dbaName: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Legal Business Name *</label>
                          <input 
                            type="text" 
                            placeholder="Legal registered entity name" 
                            required 
                            value={surveyForm.legalName}
                            onChange={(e) => setSurveyForm(prev => ({ ...prev, legalName: e.target.value }))}
                          />
                        </div>
                        <div className="form-group full">
                          <label>Street Address *</label>
                          <input 
                            type="text" 
                            placeholder="Business street address" 
                            required 
                            value={surveyForm.streetAddress}
                            onChange={(e) => setSurveyForm(prev => ({ ...prev, streetAddress: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>City *</label>
                          <input 
                            type="text" 
                            placeholder="City" 
                            required 
                            value={surveyForm.city}
                            onChange={(e) => setSurveyForm(prev => ({ ...prev, city: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>State *</label>
                          <input 
                            type="text" 
                            placeholder="State" 
                            required 
                            value={surveyForm.state}
                            onChange={(e) => setSurveyForm(prev => ({ ...prev, state: e.target.value }))}
                          />
                        </div>
                        <div className="form-group">
                          <label>Zip *</label>
                          <input 
                            type="text" 
                            placeholder="Zip code" 
                            required 
                            value={surveyForm.zipCode}
                            onChange={(e) => setSurveyForm(prev => ({ ...prev, zipCode: e.target.value }))}
                          />
                        </div>
                        <div className="form-group full">
                          <label>Processing Statement (Optional)</label>
                          <div className="upload-area" onClick={() => document.getElementById("survey-file-input").click()}>
                            <div className="upload-area-icon">
                              <FileText size={32} />
                            </div>
                            <p>Drag file here or <strong>browse files</strong> to upload statement</p>
                            <input 
                              type="file" 
                              id="survey-file-input" 
                              style={{ display: "none" }} 
                              onChange={(e) => handleFileChange(e, "survey")}
                            />
                            {surveyForm.fileName && (
                              <span className="upload-filename" style={{ display: "block" }}>
                                {surveyForm.fileName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
                        <button type="button" className="btn ghost" onClick={() => setSurveyStep(2)}>Previous</button>
                        <button type="submit" className="btn primary" disabled={loadingAction === "survey"}>
                          {loadingAction === "survey" ? "Submitting..." : "Submit Survey"}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: UPLOAD STATEMENT */}
      <div className={`modal-overlay ${isUploadOpen ? "show" : ""}`}>
        <div className="modal-container" style={{ maxWidth: "600px" }}>
          <div className="modal-header">
            <div>
              <h3>Upload Statement</h3>
              <p style={{ fontSize: "0.85rem", marginBottom: 0 }}>Upload your recent processing statement for rates comparison.</p>
            </div>
            <button className="modal-close" onClick={() => setIsUploadOpen(false)}>&times;</button>
          </div>
          <div className="modal-body">
            {uploadSubmitSuccess ? (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <div style={{ display: "inline-grid", placeItems: "center", width: "64px", height: "64px", borderRadius: "9999px", background: "var(--success-soft)", color: "var(--success)", marginBottom: "1rem" }}>
                  <ShieldCheck size={36} />
                </div>
                <h3>Statement Uploaded Privately</h3>
                <p style={{ margin: "1rem 0 2rem", color: "var(--text-muted)" }}>Your merchant statements have been stored securely in our private drive for analysis. The Pro Commerce Solutions team will build your customized savings estimate.</p>
                <div className="btn-row" style={{ justifyContent: "center" }}>
                  <button className="btn primary" onClick={() => setIsUploadOpen(false)}>Done</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Business Name *</label>
                    <input
                      type="text"
                      placeholder="Your business name"
                      required
                      value={uploadForm.businessName}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, businessName: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      placeholder="Your email address"
                      required
                      value={uploadForm.email}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Processor *</label>
                    <input
                      type="text"
                      placeholder="e.g. Clover, Toast, Chase Paymentech"
                      required
                      value={uploadForm.currentProcessor}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, currentProcessor: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Business Type *</label>
                    <select
                      required
                      value={uploadForm.businessType}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, businessType: e.target.value }))}
                    >
                      <option value="Restaurant (table service)">Restaurant (table service)</option>
                      <option value="Restaurant (quick service)">Restaurant (quick service)</option>
                      <option value="Cafés & QSR">Cafés &amp; QSR</option>
                      <option value="Retail">Retail</option>
                      <option value="Services">Services</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Avg. Monthly Card Volume ($) *</label>
                    <input
                      type="text"
                      placeholder="e.g. 45,000"
                      required
                      value={uploadForm.monthlyVolume}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, monthlyVolume: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Number of Locations *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      required
                      value={uploadForm.numLocations}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, numLocations: e.target.value }))}
                    />
                  </div>
                  <div className="form-group full">
                    <label>Current Monthly Processing Fees ($) <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="text"
                      placeholder="Approx. total monthly fees, if known"
                      value={uploadForm.monthlyFees}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, monthlyFees: e.target.value }))}
                    />
                  </div>
                  <div className="form-group full">
                    <label>Upload Statement File *</label>
                    <div className="upload-area" onClick={() => document.getElementById("modal-file-input").click()}>
                      <div className="upload-area-icon">
                        <FileText size={32} />
                      </div>
                      <p>Drag statement file here or <strong>browse files</strong></p>
                      <input 
                        type="file" 
                        id="modal-file-input" 
                        style={{ display: "none" }} 
                        required 
                        onChange={(e) => handleFileChange(e, "upload")}
                      />
                      {uploadForm.fileName && (
                        <span className="upload-filename" style={{ display: "block" }}>
                          {uploadForm.fileName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "1rem", lineHeight: "1.4" }}><strong>Privacy note:</strong> Your credit card processing statement contains sensitive business identifiers and volume details. Files are uploaded directly to our secure private folder.</p>
                <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                  <button type="button" className="btn ghost" onClick={() => setIsUploadOpen(false)}>Cancel</button>
                  <button type="submit" className="btn primary" disabled={loadingAction === "upload"}>
                    {loadingAction === "upload" ? "Submitting..." : "Submit Statement"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* CHATBOT ASSISTANT */}
      <div className="chat-widget">
        <div className={`chat-panel ${isChatOpen ? "show" : ""}`}>
          <div className="chat-head">
            <div className="chat-head-id">
              <span className="chat-avatar"><Sparkles size={18} /></span>
              <div>
                <h4>Pro Commerce Assistant</h4>
                <span className="chat-status"><span className="chat-status-dot"></span>Online · B2B POS guidance</span>
              </div>
            </div>
            <button className="chat-close" onClick={() => setIsChatOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>
          <div className="chat-body" id="chat-body" ref={chatBodyRef}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-row ${msg.sender === "bot" ? "bot" : "user"}`}>
                {msg.sender === "bot" && <span className="chat-msg-avatar"><Sparkles size={13} /></span>}
                <div className={`chat-msg ${msg.sender === "bot" ? "bot" : "user"}`}>{msg.text}</div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isBotTyping && (
              <div className="chat-row bot">
                <span className="chat-msg-avatar"><Sparkles size={13} /></span>
                <div className="chat-msg bot chat-typing"><span></span><span></span><span></span></div>
              </div>
            )}

            {!isBotTyping && chatMessages[chatMessages.length - 1].sender === "bot" && (
              <div className="chat-quick-replies">
                <button className="chat-quick-btn" onClick={() => chatReply("I need a Square POS system")}>Square POS System</button>
                <button className="chat-quick-btn" onClick={() => chatReply("I want hardware pricing")}>Hardware Pricing</button>
                <button className="chat-quick-btn" onClick={() => chatReply("I run a restaurant")}>Restaurant POS</button>
                <button className="chat-quick-btn" onClick={() => chatReply("I want to upload a statement")}>Compare Rates</button>
              </div>
            )}
          </div>
          <div className="chat-foot">
            <input
              type="text"
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
            />
            <button onClick={sendChatMessage} aria-label="Send message">
              <Send size={16} />
            </button>
          </div>
        </div>
        <button className="chat-bubble" onClick={() => setIsChatOpen(!isChatOpen)} aria-label="Open Chat Assistant">
          {isChatOpen ? <X size={24} /> : <Sparkles size={24} />}
        </button>
      </div>

      {/* MODAL: WATCH VIDEO MODAL */}
      <div className={`modal-overlay ${isVideoModalOpen ? "show" : ""}`} onClick={() => setIsVideoModalOpen(false)}>
        <div className="modal-container video-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h3>{videoTitle}</h3>
              <p style={{ fontSize: "0.85rem", marginBottom: 0 }}>Step-by-step Pro Commerce Solutions setup tutorial.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <a 
                href="https://drive.google.com/file/d/18Wbv1P9HwI35UsmNl-VUWRZFuQPAEl_c/preview" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn ghost small"
                style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem", whiteSpace: "nowrap", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
              >
                Open in New Tab <ArrowUpRight size={12} />
              </a>
              <button className="modal-close" onClick={() => setIsVideoModalOpen(false)}>&times;</button>
            </div>
          </div>
          <div className="modal-body" style={{ padding: 0, overflow: "hidden", background: "#000" }}>
            {isVideoModalOpen && (
              <div className="video-iframe-container">
                <iframe
                  src={videoSrc}
                  width="100%"
                  height="100%"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title={videoTitle}
                  style={{ border: "none" }}
                  loading="lazy"
                ></iframe>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: PRODUCT DETAIL MODAL */}
      <div className={`modal-overlay ${isProductOpen ? "show" : ""}`} onClick={closeProduct}>
        <div className="modal-container product-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h3>Hardware Specifications</h3>
              <p style={{ fontSize: "0.85rem", marginBottom: 0 }}>Official Square Device details and connectivity.</p>
            </div>
            <button className="modal-close" onClick={closeProduct}>&times;</button>
          </div>
          <div className="modal-body">
            {activeProductDetail && (
              <div className="product-detail-wrap">
                <div className="product-detail-visual">
                  <div className="product-gallery">
                    {(activeProductDetail.images || productGallery).map((src, gi) => (
                      <img key={gi} src={src} alt={activeProductDetail.name + " shown in a real Square setup"} className={productSlide === gi ? "active" : ""} />
                    ))}
                    <button type="button" className="gallery-nav prev" aria-label="Previous image" onClick={() => setProductSlide(s => (s - 1 + (activeProductDetail.images || productGallery).length) % (activeProductDetail.images || productGallery).length)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <button type="button" className="gallery-nav next" aria-label="Next image" onClick={() => setProductSlide(s => (s + 1) % (activeProductDetail.images || productGallery).length)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <div className="product-gallery-dots">
                      {(activeProductDetail.images || productGallery).map((_, gi) => (
                        <button key={gi} type="button" aria-label={"Image " + (gi + 1)} className={productSlide === gi ? "active" : ""} onClick={() => setProductSlide(gi)}></button>
                      ))}
                    </div>
                  </div>
                  <div className="product-detail-pricing" style={{ marginTop: "1.5rem", textAlign: "center" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Official Price:</span>
                    <strong style={{ fontSize: "1.35rem", color: "var(--charcoal-dark)" }}>{activeProductDetail.price}</strong>
                  </div>
                </div>
                
                <div className="product-detail-info">
                  <h4 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", color: "var(--charcoal-dark)", fontWeight: 700 }}>{activeProductDetail.name}</h4>
                  <p style={{ fontSize: "0.95rem", color: "var(--text-main)", marginBottom: "1.5rem", lineHeight: "1.5" }}>{activeProductDetail.desc}</p>
                  
                  <div className="specs-section" style={{ marginBottom: "1.5rem" }}>
                    <h5 style={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 700 }}>Technical Specifications</h5>
                    <ul style={{ listStyle: "disc", paddingLeft: "1.2rem", fontSize: "0.85rem", color: "var(--text-main)", lineHeight: "1.6" }}>
                      {activeProductDetail.specs.map((spec, idx) => (
                        <li key={idx} style={{ marginBottom: "0.4rem" }}>{spec}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="best-for-section" style={{ marginBottom: "2rem", background: "var(--blue-soft)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--blue-soft-border)" }}>
                    <h5 style={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "var(--blue-dark)", marginBottom: "0.25rem", fontWeight: 700 }}>Best For</h5>
                    <p style={{ fontSize: "0.85rem", color: "var(--blue-dark)", marginBottom: 0 }}>{activeProductDetail.bestFor}</p>
                  </div>
                  
                  <div className="product-detail-actions" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <button className="btn primary" style={{ width: "100%" }} onClick={() => addProductToCalculator(activeProductDetail.name)}>
                      Add to Monthly Estimate
                    </button>
                    <button className="btn secondary" style={{ width: "100%" }} onClick={() => window.open(activeProductDetail.url, "_blank")}>
                      Open Square Store Checkout <ArrowUpRight size={16} />
                    </button>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center", display: "block", marginTop: "0.25rem" }}>
                      🔒 Security Note: Square&apos;s checkout domain blocks embedded framing. Clicking opens a secure window.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WELCOME LEAD-CAPTURE POPUP (on load) */}
      <div className={`modal-overlay ${isWelcomeOpen ? "show" : ""}`} onClick={closeWelcome}>
        <div className="modal-container welcome-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close welcome-close" onClick={closeWelcome} aria-label="Close">&times;</button>
          <div className="welcome-grid">
            <div className="welcome-visual">
              <Image src="/cafe_path.jpg" alt="Welcoming local business counter powered by Square" fill sizes="(max-width: 760px) 100vw, 45vw" />
              <div className="welcome-visual-overlay">
                <span className="welcome-badge"><span className="dot"></span>Authorized Square Dealer</span>
                <h3>Let&apos;s build your perfect Square setup</h3>
                <p>Tell us a little about your business and Pro Commerce Solutions will recommend the right POS, hardware, and onboarding path — free.</p>
              </div>
            </div>
            <div className="welcome-form">
              {welcomeSubmitted ? (
                <div className="welcome-success">
                  <div className="welcome-success-icon"><ShieldCheck size={34} /></div>
                  <h3>You&apos;re all set!</h3>
                  <p>Thanks{surveyForm.firstName ? `, ${surveyForm.firstName}` : ""}. The team at Pro Commerce Solutions will review your details and reach out shortly with tailored recommendations.</p>
                  <button className="btn primary" style={{ width: "100%" }} onClick={closeWelcome}>Continue Exploring</button>
                </div>
              ) : (
                <>
                  <span className="kicker">Quick Start</span>
                  <h3 style={{ marginBottom: "0.35rem" }}>Get a free recommendation</h3>
                  <p style={{ fontSize: "0.88rem", marginBottom: "1.25rem" }}>It takes under a minute — no obligation.</p>
                  <form onSubmit={handleWelcomeSubmit}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>First name *</label>
                        <input type="text" placeholder="First name" required value={surveyForm.firstName} onChange={(e) => setSurveyForm(prev => ({ ...prev, firstName: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label>Last name *</label>
                        <input type="text" placeholder="Last name" required value={surveyForm.lastName} onChange={(e) => setSurveyForm(prev => ({ ...prev, lastName: e.target.value }))} />
                      </div>
                      <div className="form-group full">
                        <label>Email *</label>
                        <input type="email" placeholder="you@business.com" required value={surveyForm.email} onChange={(e) => setSurveyForm(prev => ({ ...prev, email: e.target.value }))} />
                      </div>
                      <div className="form-group full">
                        <label>Phone <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>(optional)</span></label>
                        <input type="tel" placeholder="(000) 000-0000" value={surveyForm.phone} onChange={(e) => setSurveyForm(prev => ({ ...prev, phone: e.target.value }))} />
                      </div>
                      <div className="form-group full">
                        <label>Business type</label>
                        <select value={surveyForm.businessType} onChange={(e) => setSurveyForm(prev => ({ ...prev, businessType: e.target.value }))}>
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
                    <button type="button" className="welcome-skip" onClick={closeWelcome}>Maybe later — just browsing</button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
