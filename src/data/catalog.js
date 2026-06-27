// Static product / pricing catalog for the Square hardware + calculator.
// Lives at module scope so it is allocated ONCE (not on every React render),
// and the product media is merged into the spec details a single time below.

export const pricingMatrix = {
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

// Plan info shown under the calculator plan selector.
export const planInfo = {
  free: { title: "Square Free", desc: "Best for businesses that need basic Square POS tools without a monthly software charge. Processing fees still apply." },
  plus: { title: "Square Plus", desc: "Advanced inventory, staff tools, and unlocked KDS / Kiosk app add-ons for active, scaling businesses." },
  premium: { title: "Square Premium", desc: "For high-volume merchants over $250k/year. Lower negotiated rates, API integrations, and a dedicated account manager." }
};

// Trust marquee strip items.
export const trustItems = [
  "Authorized Square Dealer",
  "Credit Card Processing",
  "POS Consultation",
  "Statement Reviews",
  "ATM Placements",
  "Hardware Setup",
  "No Long-Term Contracts",
  "1-on-1 Onboarding"
];

// Fallback gallery for any product without its own media (manual arrows/dots).
export const productGallery = ["/hero_pos_scene.jpg", "/restaurant_path.jpg", "/retail_path.jpg", "/cafe_path.jpg"];

// Real Square product photos/videos committed under /public/Square product images.
// Paths are URL-encoded because the folder names contain spaces.
export const productMedia = {
  register: [
    "/Square%20product%20images/Sqaure-Register-Images/Sqaure-Register-Images-1.avif",
    "/Square%20product%20images/Sqaure-Register-Images/Sqaure-Register-Images-2.avif",
    "/Square%20product%20images/Sqaure-Register-Images/Sqaure-Register-Images-3.avif",
    "/Square%20product%20images/Sqaure-Register-Images/Sqaure-Register-Images-4.avif",
    "/Square%20product%20images/Sqaure-Register-Images/Sqaure-Register-Images-5.avif"
  ],
  handheld: [
    "/Square%20product%20images/Sqaure-Handheld-Images/Sqaure-Handheld-Images-1.avif",
    "/Square%20product%20images/Sqaure-Handheld-Images/Sqaure-Handheld-Images-2.avif",
    "/Square%20product%20images/Sqaure-Handheld-Images/Sqaure-Handheld-Images-3.avif",
    "/Square%20product%20images/Sqaure-Handheld-Images/Sqaure-Handheld-Images-4.avif",
    "/Square%20product%20images/Sqaure-Handheld-Images/Sqaure-Handheld-Images-5.avif",
    "/Square%20product%20images/Sqaure-Handheld-Images/Sqaure-Handheld-Images-6.avif",
    "/Square%20product%20images/Sqaure-Handheld-Images/Sqaure-Handheld-Images-7.avif",
    "/Square%20product%20images/Sqaure-Handheld-Images/Sqaure-Handheld-Images-8.avif",
    "/Square%20product%20images/Sqaure-Handheld-Images/Sqaure-Handheld-Images-9.avif",
    "/Square%20product%20images/Sqaure-Handheld-Images/Sqaure-Handheld-Images-10.avif"
  ],
  terminal: [
    "/Square%20product%20images/Square-Terminal-Images/Square-Terminal-Images-1.png",
    "/Square%20product%20images/Square-Terminal-Images/Square-Terminal-Images-2.png",
    "/Square%20product%20images/Square-Terminal-Images/Square-Terminal-Images-3.png",
    "/Square%20product%20images/Square-Terminal-Images/Square-Terminal-Images-4.png",
    "/Square%20product%20images/Square-Terminal-Images/Square-Terminal-Images-5.avif",
    "/Square%20product%20images/Square-Terminal-Images/Square-Terminal-Images-6.png",
    "/Square%20product%20images/Square-Terminal-Images/Square-Terminal-Images-7.jpg",
    "/Square%20product%20images/Square-Terminal-Images/Square-Terminal-Images-8.avif"
  ],
  stand: [
    "/Square%20product%20images/Sqaure-Stand-Images/Sqaure-Stand-Images-1.jpg",
    "/Square%20product%20images/Sqaure-Stand-Images/Sqaure-Stand-Images-2.png",
    "/Square%20product%20images/Sqaure-Stand-Images/Sqaure-Stand-Images-3.png",
    "/Square%20product%20images/Sqaure-Stand-Images/Sqaure-Stand-Images-4.avif",
    "/Square%20product%20images/Sqaure-Stand-Images/Sqaure-Stand-Images-5.avif",
    "/Square%20product%20images/Sqaure-Stand-Images/Sqaure-Stand-Images-6.jpg",
    "/Square%20product%20images/Sqaure-Stand-Images/Sqaure-Stand-Images-7.jpg",
    "/Square%20product%20images/Sqaure-Stand-Images/Sqaure-Stand-Images-8.jpg",
    "/Square%20product%20images/Sqaure-Stand-Images/Sqaure-Stand-Images-9.jpg"
  ],
  kiosk: [
    "/Square%20product%20images/Square-Kiosk-Images/Square-Kiosk-Images-1.jpg",
    "/Square%20product%20images/Square-Kiosk-Images/Square-Kiosk-Images-2.png",
    "/Square%20product%20images/Square-Kiosk-Images/Square-Kiosk-Images-3.png",
    "/Square%20product%20images/Square-Kiosk-Images/Square-Kiosk-Images-4.png",
    "/Square%20product%20images/Square-Kiosk-Images/Square-Kiosk-Images-5.png",
    "/Square%20product%20images/Square-Kiosk-Images/Square-Kiosk-Images-6.png",
    "/Square%20product%20images/Square-Kiosk-Images/Square-Kiosk-Images-7.png",
    "/Square%20product%20images/Square-Kiosk-Images/Square-Kiosk-Images-8.png"
  ],
  reader: [
    "/Square%20product%20images/Square-Contactless-Chipreader/Contactless-Chipreader-1.avif",
    "/Square%20product%20images/Square-Contactless-Chipreader/Contactless-Chipreader-2.avif",
    "/Square%20product%20images/Square-Contactless-Chipreader/Contactless-Chipreader-3.avif",
    "/Square%20product%20images/Square-Contactless-Chipreader/Contactless-Chipreader-4.avif",
    "/Square%20product%20images/Square-Contactless-Chipreader/Contactless-Chipreader-5.avif"
  ],
  standMount: [
    "/Square%20product%20images/Square-Stand-mount-Images/Square-Stand-mount-Images-1.avif",
    "/Square%20product%20images/Square-Stand-mount-Images/Square-Stand-mount-Images-2.avif",
    "/Square%20product%20images/Square-Stand-mount-Images/Square-Stand-mount-Images-3.avif",
    "/Square%20product%20images/Square-Stand-mount-Images/Square-Stand-mount-Images-4.avif",
    "/Square%20product%20images/Square-Stand-mount-Images/Square-Stand-mount-Images-2.mp4"
  ],
  dock: [
    "/Square%20product%20images/Square-Dock-for-Square-Handheld-images/Square-Dock-for-Square-Handheld-images-1.avif",
    "/Square%20product%20images/Square-Dock-for-Square-Handheld-images/Square-Dock-for-Square-Handheld-images-2.avif",
    "/Square%20product%20images/Square-Dock-for-Square-Handheld-images/Square-Dock-for-Square-Handheld-images-3.avif",
    "/Square%20product%20images/Square-Dock-for-Square-Handheld-images/Square-Dock-for-Square-Handheld-images-4.avif"
  ],
  magReader: [
    "/Square%20product%20images/Square-Reader-for-Magstripe-Images/Square-Reader-for-Magstripe-Images-1.avif",
    "/Square%20product%20images/Square-Reader-for-Magstripe-Images/Square-Reader-for-Magstripe-Images-2.avif",
    "/Square%20product%20images/Square-Reader-for-Magstripe-Images/Square-Reader-for-Magstripe-Images-3.avif",
    "/Square%20product%20images/Square-Reader-for-Magstripe-Images/Square-Reader-for-Magstripe-Images-4.avif",
    "/Square%20product%20images/Square-Reader-for-Magstripe-Images/Square-Reader-for-Magstripe-Images-5.avif"
  ],
  accessories: [
    "/Square%20product%20images/Square-Accessories-Kit-Images/Square-Accessories-Kit-Images-1.webp",
    "/Square%20product%20images/Square-Accessories-Kit-Images/Square-Accessories-Kit-Images-2.webp",
    "/Square%20product%20images/Square-Accessories-Kit-Images/Square-Accessories-Kit-Images-3.webp"
  ]
};

export const isVideoSrc = (s) => /\.(mp4|webm|mov)$/i.test(s || "");

// Spec-modal detail per product. Media is merged in once at module load.
const hardwareBase = {
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
    bestFor: "Full-service restaurants, retail boutiques, and busy counter-service hubs."
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
    bestFor: "Tableside ordering, queue line busting, patio checkouts, and pop-up locations."
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
    bestFor: "Countertop checkouts, medical offices, professional services, and dine-in tables."
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
    bestFor: "Independent boutiques, cafes, fitness studios, and coffee shops."
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
    bestFor: "Quick-service cafes, bakeries, fast-food counters, and high-traffic order hubs."
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
    bestFor: "Mobile vendors, service contractors, taxi drivers, and entry-level merchants."
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
    bestFor: "Cafes, boutiques, and counters that want a permanent, low-profile iPad checkout."
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
    bestFor: "Businesses that run the Handheld both tableside and as a fixed register."
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
    bestFor: "Entry-level sellers, markets, and backup swipe payments on the go."
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
    bestFor: "Retailers and restaurants building out a complete countertop or kitchen station."
  }
};

// Merge the real media into each product's spec details, once.
export const hardwareDetails = Object.fromEntries(
  Object.entries(hardwareBase).map(([key, value]) => [
    key,
    { ...value, images: productMedia[key] || productGallery }
  ])
);

// Customer-facing blurbs used in the calculator "what this setup includes" list.
export const hardwareBlurbs = {
  register: "Complete countertop POS system for a busy front counter, restaurant cashier station, or retail checkout.",
  handheld: "Mobile POS device for tableside ordering, line busting, patios, and staff moving around the floor.",
  terminal: "Compact all-in-one device for accepting card payments and printing receipts at a counter or tableside.",
  stand: "iPad-based POS stand for a clean, professional countertop checkout.",
  kioskHardware: "Self-service ordering hardware for quick-service restaurants and cafés that want shorter lines.",
  reader: "Portable reader for tap, contactless, and chip payments — great for lightweight or mobile checkout.",
  standMount: "Low-profile mount that locks an iPad in place for a tidy, fixed checkout station.",
  dock: "Charging dock that turns the Square Handheld into a stationary countertop terminal.",
  magReader: "Affordable swipe reader for quick magstripe card payments and as a mobile backup.",
  accessories: "Receipt printers, cash drawers, scanners, and kitchen printers to complete the station."
};
