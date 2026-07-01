// Guided chatbot flows — implements the "Pro Commerce Solutions AI Chatbot +
// Google Sheets Lead System Specification" (docs/chatbot-spec): button-based
// first, free-text second. Each step either shows option buttons or collects
// a typed value into the lead record.
//
// Step shape:
//   { id, q, options: [...] }            -> button question, answer saved to lead[id]
//   { id, q, input, placeholder }        -> typed question (input: text|email|tel)
//   { say }  or  { say: (lead)=>str }    -> bot statement, no answer
//   { when: (lead)=>bool }               -> optional guard; step skipped when false
//   { action: "openUpload" }             -> side effect (statement upload modal)

export const OPENING_MESSAGE =
  "Hi, welcome to Pro Commerce Solutions. I can help you choose the right Square POS setup, compare hardware, review your current processing statement, or connect you with Dominique for a consultation. What do you need help with today?";

export const OPENING_OPTIONS = [
  { key: "pos", label: "Square POS system" },
  { key: "hardware", label: "Hardware pricing" },
  { key: "restaurant", label: "Restaurant / café" },
  { key: "retail", label: "Retail or service business" },
  { key: "compare", label: "Compare my processor" },
  { key: "statement", label: "Upload a statement" },
  { key: "human", label: "Speak with a human" }
];

export const DISCLAIMER =
  "Any pricing or hardware estimate shown here is only a general estimate. Final pricing, availability, processing rates, taxes, shipping, financing, and approval should be confirmed before purchase or onboarding.";

const VOLUME_OPTIONS = [
  "Under $10,000/month",
  "$10,000–$25,000/month",
  "$25,000–$75,000/month",
  "$75,000–$250,000/month",
  "Over $250,000/month",
  "Not sure"
];

const PROCESSOR_OPTIONS = ["Square", "Clover", "Toast", "Stripe", "PayPal", "Bank provider", "Other", "Not sure"];

// Plan suggestion from the answers gathered so far (spec §3, option 1).
export function recommendPlan(lead) {
  const vol = lead.cardVolume || "";
  if (vol.startsWith("Over")) return "Square Premium / custom review";
  if (vol.startsWith("$75,000") || vol.startsWith("$25,000")) return "Square Plus";
  const locs = lead.numLocations || "";
  if (locs.includes("4–10") || locs.includes("More than")) return "Square Plus";
  return "Square Free";
}

// Shared lead-capture steps (spec §4) — asked naturally at the end of a flow.
export const LEAD_CAPTURE_STEPS = [
  { say: "To send you the right recommendation, I just need a few quick details." },
  { id: "fullName", q: "What's your full name?", input: "text", placeholder: "First and last name" },
  { id: "email", q: "What's the best email to reach you?", input: "email", placeholder: "you@business.com" },
  { id: "phone", q: "And a phone number? (type 'skip' if you'd rather not)", input: "tel", placeholder: "(000) 000-0000" },
  { id: "businessName", q: "What's your business name?", input: "text", placeholder: "Business name" },
  { id: "cityState", q: "What city and state is your business in?", input: "text", placeholder: "City, State" },
  { id: "preferredContact", q: "How would you like to be contacted?", options: ["Call", "Text", "Email"] }
];

export const FLOWS = {
  pos: {
    intro: "Great. I can help recommend a Square setup based on your business type, number of locations, and sales volume.",
    steps: [
      {
        id: "businessType", q: "What type of business do you run?",
        options: ["Restaurant - table service", "Restaurant - quick service", "Café / coffee shop", "Food truck", "Retail store", "Salon / barbershop", "Service business", "Other"]
      },
      {
        id: "numLocations", q: "How many business locations do you have?",
        options: ["1 location", "2–3 locations", "4–10 locations", "More than 10 locations", "Not open yet"]
      },
      {
        id: "mainNeed", q: "What do you mainly need help with?",
        options: ["New Square setup", "Replacing my current POS", "Hardware recommendation", "Processing rate review", "Staff / inventory / reporting", "Not sure yet"]
      },
      {
        id: "processesCards", q: "Do you already process card payments?",
        options: ["Yes", "No", "Opening soon", "Not sure"]
      },
      {
        id: "currentProcessor", q: "Who is your current processor?",
        options: PROCESSOR_OPTIONS,
        when: (lead) => lead.processesCards === "Yes"
      },
      { id: "cardVolume", q: "What is your estimated monthly card volume?", options: VOLUME_OPTIONS },
      {
        say: (lead) => `Based on what you shared, you may be a good fit for ${recommendPlan(lead)}. Dominique can review your setup and confirm the best option.`,
        set: (lead) => ({ interestedPlan: recommendPlan(lead) })
      }
    ],
    capture: true
  },

  hardware: {
    intro: "Sure. I can help you compare common Square hardware options like Square Register, Square Terminal, Square Stand, Square Handheld, Square Reader, and Square Kiosk.",
    steps: [
      {
        id: "checkoutSetup", q: "What kind of checkout setup do you need?",
        options: ["Countertop register", "Mobile checkout", "Handheld ordering", "Kitchen / restaurant setup", "Self-service kiosk", "Simple card reader", "Not sure"]
      },
      {
        id: "deviceCount", q: "How many devices do you think you need?",
        options: ["1 device", "2–3 devices", "4–5 devices", "More than 5 devices", "Not sure"]
      },
      {
        id: "costPreference", q: "Do you want a one-time hardware cost or monthly financing estimate?",
        options: ["One-time cost", "Monthly estimate", "Show both", "Not sure"]
      },
      { say: "For a simple setup, many small businesses start with a Square Terminal or Square Stand. Restaurants may need Register, Handheld, KDS, or Kiosk depending on the workflow. Final pricing should be confirmed before purchase." },
      {
        id: "wantsRecommendation", q: "Would you like Dominique to recommend the best hardware bundle for your business?",
        options: ["Yes, send recommendation", "No, just browsing", "I want to speak with someone"]
      }
    ],
    // Lead capture only if they said yes / want a human (spec §3 option 2)
    captureWhen: (lead) => lead.wantsRecommendation !== "No, just browsing",
    browsingExit: "No problem — feel free to explore the Square Hardware page, and I'm here if you want a recommendation later.",
    capture: true
  },

  restaurant: {
    intro: "Perfect. Restaurants and cafés usually need a setup that handles ordering, payments, staff, tips, receipts, kitchen flow, and sometimes online ordering or kiosks.",
    steps: [
      {
        id: "businessType", q: "What type of food business do you run?",
        options: ["Full-service restaurant", "Quick-service restaurant", "Café / coffee shop", "Food truck", "Bakery", "Bar / lounge", "Catering", "Other"]
      },
      {
        id: "posNeeds", q: "What do you need your POS to handle?",
        options: ["Counter orders", "Table service", "Kitchen tickets / KDS", "Online ordering", "Staff management", "Inventory", "Customer loyalty", "Self-service kiosk", "All of the above"]
      },
      {
        id: "timeline", q: "How soon do you need this setup?",
        options: ["Immediately", "This week", "This month", "In 1–3 months", "Just researching"]
      },
      {
        id: "currentPOS", q: "Do you already have a POS system?",
        options: ["Yes, Square", "Yes, Toast", "Yes, Clover", "Yes, another system", "No", "Not sure"]
      },
      { say: "Thanks. Based on this, Dominique can recommend whether you need Square Free, Square Plus, restaurant add-ons, hardware, KDS, or kiosk support." }
    ],
    capture: true
  },

  retail: {
    intro: "Great. Retail and service businesses usually need checkout, inventory, receipts, customer management, staff access, and simple payment processing.",
    steps: [
      {
        id: "businessType", q: "What type of business do you run?",
        options: ["Retail store", "Clothing / boutique", "Convenience store", "Salon / barbershop", "Spa / beauty", "Repair shop", "Professional service", "Other"]
      },
      {
        id: "mainNeed", q: "What do you need help with most?",
        options: ["Accepting payments", "Choosing hardware", "Inventory management", "Staff permissions", "Customer loyalty", "Multi-location setup", "Reviewing processing fees", "Not sure"]
      },
      {
        id: "usingSquare", q: "Are you currently using Square?",
        options: ["Yes", "No", "I used it before", "Not sure"]
      },
      { id: "cardVolume", q: "What is your estimated monthly card volume?", options: VOLUME_OPTIONS }
    ],
    capture: true
  },

  compare: {
    intro: "I can help start a processing review. Dominique can compare your current setup and help you understand whether Square may be a better fit.",
    steps: [
      { id: "currentProcessor", q: "Who is your current processor?", options: ["Clover", "Toast", "Stripe", "PayPal", "Square", "Bank provider", "Other", "Not sure"] },
      {
        id: "hasStatement", q: "Do you have a recent processing statement?",
        options: ["Yes, I can upload it", "Yes, but later", "No", "Not sure what that is"]
      },
      {
        say: "Great. You can upload your statement securely, and Dominique can review it.",
        action: "openUpload",
        when: (lead) => lead.hasStatement === "Yes, I can upload it",
        set: () => ({ statementUploaded: "Yes" })
      },
      {
        say: "No problem. Dominique can still do a basic consultation, but a statement helps give a more accurate review.",
        when: (lead) => lead.hasStatement !== "Yes, I can upload it"
      }
    ],
    capture: true
  },

  statement: {
    intro: "Sure. Processing statements can include sensitive business and payment information, so uploads are stored privately. I'll open the secure upload form for you — it collects your business details and the statement file together.",
    steps: [
      { say: "Once it's submitted, Dominique or the Pro Commerce Solutions team will review it and follow up with next steps.", action: "openUpload", set: () => ({ statementUploaded: "Yes" }) }
    ],
    capture: false
  },

  human: {
    intro: "Of course. I can connect you with Dominique or the Pro Commerce Solutions team. To make sure they can follow up properly, please share a few details.",
    steps: [
      {
        id: "businessType", q: "First — what type of business do you run?",
        options: ["Restaurant / café", "Retail store", "Salon / barbershop", "Service business", "Food truck", "Other", "Not open yet"]
      },
      {
        id: "mainNeed", q: "What do you need help with?",
        options: ["Choosing a Square plan", "Hardware / setup", "Processing rates / statement", "Onboarding", "Something else"]
      },
      { id: "bestTime", q: "What's the best time to contact you?", options: ["Morning", "Afternoon", "Evening", "Anytime"] }
    ],
    humanRequested: true,
    capture: true
  }
};

// Post-answer follow-up buttons (spec §15) shown when a flow finishes.
export const NEXT_ACTIONS = [
  { key: "pos", label: "Recommend a setup" },
  { key: "calculator", label: "Estimate cost" },
  { key: "statement", label: "Upload statement" },
  { key: "human", label: "Speak with human" },
  { key: "restart", label: "Start over" }
];

// Lead scoring (spec §6).
export function scoreLead(lead) {
  const vol = lead.cardVolume || "";
  const highVolume = vol.startsWith("$25,000") || vol.startsWith("$75,000") || vol.startsWith("Over");
  const multiLocation = (lead.numLocations || "").match(/2–3|4–10|More than/);
  const urgent = lead.timeline === "Immediately" || lead.timeline === "This week";

  if (lead.humanRequested === "Yes" || lead.statementUploaded === "Yes" || highVolume || urgent || multiLocation || lead.quoteRequested === "Yes") {
    return "High";
  }
  const gaveContact = Boolean(lead.email || lead.phone);
  const comparing = Boolean(lead.currentProcessor) || lead.mainNeed === "Processing rate review" || lead.mainNeed === "Reviewing processing fees";
  const opening = lead.timeline === "In 1–3 months" || lead.numLocations === "Not open yet";
  const askedPlanOrHardware = Boolean(lead.interestedPlan || lead.checkoutSetup || lead.wantsRecommendation);
  if (gaveContact || comparing || opening || askedPlanOrHardware) return "Medium";
  return "Low";
}

// One-line summary for Dominique (spec §4 "Chatbot summary", §13).
export function summarizeLead(lead) {
  const parts = [];
  if (lead.businessType) parts.push(`Business: ${lead.businessType}`);
  if (lead.businessName) parts.push(`Name: ${lead.businessName}`);
  if (lead.numLocations) parts.push(`Locations: ${lead.numLocations}`);
  if (lead.mainNeed) parts.push(`Need: ${lead.mainNeed}`);
  if (lead.posNeeds) parts.push(`POS needs: ${lead.posNeeds}`);
  if (lead.checkoutSetup) parts.push(`Checkout: ${lead.checkoutSetup}`);
  if (lead.deviceCount) parts.push(`Devices: ${lead.deviceCount}`);
  if (lead.currentProcessor) parts.push(`Processor: ${lead.currentProcessor}`);
  if (lead.currentPOS) parts.push(`Current POS: ${lead.currentPOS}`);
  if (lead.cardVolume) parts.push(`Volume: ${lead.cardVolume}`);
  if (lead.timeline) parts.push(`Timeline: ${lead.timeline}`);
  if (lead.interestedPlan) parts.push(`Suggested plan: ${lead.interestedPlan}`);
  if (lead.statementUploaded === "Yes") parts.push("Statement: uploading");
  if (lead.humanRequested === "Yes") parts.push(`Human requested (${lead.preferredContact || "any"}${lead.bestTime ? ", " + lead.bestTime.toLowerCase() : ""})`);
  return parts.join(" · ");
}
