"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { submitLead, beaconLead, formatTranscript } from "../lib/sheets";
import { getAIReply } from "../lib/chat";
import {
  OPENING_MESSAGE,
  OPENING_OPTIONS,
  FLOWS,
  LEAD_CAPTURE_STEPS,
  NEXT_ACTIONS,
  scoreLead,
  summarizeLead
} from "../data/chatFlows";

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;

// Fallback for free-typed questions when the AI proxy isn't configured / fails.
function cannedReply(text) {
  const q = (text || "").toLowerCase();
  if (q.includes("price") || q.includes("cost") || q.includes("hardware")) {
    return "Hardware financing starts around $14/mo (Square Stand) up to $44/mo (Square Register), with one-time options like the $59 Reader. Want me to walk you through a quick hardware match?";
  }
  if (q.includes("plan") || q.includes("free") || q.includes("plus") || q.includes("premium")) {
    return "Square Free is $0/mo per location, Square Plus is $49/mo, and Square Premium is custom for high-volume businesses. I can help figure out which fits — tap an option below.";
  }
  if (q.includes("statement") || q.includes("rate") || q.includes("fee")) {
    return "A statement review is the fastest way to compare your current rates. Tap “Upload a statement” below and I'll open the secure uploader.";
  }
  return "I can help with Square plans, hardware, statement reviews, or booking time with Dominique — pick an option below, or keep typing and I'll do my best.";
}

export default function ChatWidget({ onOpenUpload }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: "bot", text: OPENING_MESSAGE }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Flow engine state
  const [phase, setPhase] = useState("menu");        // menu | flow | capture | done
  const [flowKey, setFlowKey] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);         // index within current step list
  const [currentStep, setCurrentStep] = useState(null); // question step awaiting an answer
  const leadRef = useRef({});                        // structured answers (spec §4)
  const submittedRef = useRef(false);                // lead row already sent
  const bodyRef = useRef(null);
  const messagesRef = useRef(messages);
  const loggedLenRef = useRef(0);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, isTyping, currentStep, phase]);

  const say = (text) => setMessages((prev) => [...prev, { sender: "bot", text }]);
  const sayUser = (text) => setMessages((prev) => [...prev, { sender: "user", text }]);

  const stepsFor = (key, ph) => (ph === "capture" ? LEAD_CAPTURE_STEPS : (FLOWS[key]?.steps || []));

  // Build the final payload and send it to the Google Sheet (spec §4, §5 Tab 1).
  const finalizeLead = useCallback((extra = {}) => {
    const lead = { ...leadRef.current, ...extra };
    const transcript = formatTranscript(messagesRef.current);
    const score = scoreLead(lead);
    const payload = {
      ...lead,
      leadSource: "Chatbot",
      leadStatus: "New Lead",
      priority: score,
      leadScore: score,
      chatSummary: summarizeLead(lead),
      transcript
    };
    submitLead("chat", payload);
    submittedRef.current = true;
    loggedLenRef.current = messagesRef.current.length;
    return lead;
  }, []);

  // Walk the step list from `from`, emitting statements and stopping at the
  // first question that needs an answer. Handles when/set/action semantics.
  // (Function declaration so it can recurse into the capture phase.)
  function advance(key, ph, from) {
    const steps = stepsFor(key, ph);
    let i = from;
    while (i < steps.length) {
      const step = steps[i];
      if (step.when && !step.when(leadRef.current)) { i++; continue; }
      if (step.set) leadRef.current = { ...leadRef.current, ...step.set(leadRef.current) };
      if (step.say !== undefined) {
        say(typeof step.say === "function" ? step.say(leadRef.current) : step.say);
        if (step.action === "openUpload" && onOpenUpload) setTimeout(() => onOpenUpload(), 900);
        i++;
        continue;
      }
      // Question step — show it and wait.
      say(step.q);
      setCurrentStep(step);
      setStepIdx(i);
      setPhase(ph);
      return;
    }

    // Step list exhausted.
    if (ph === "flow") {
      const flow = FLOWS[key];
      if (flow.humanRequested) leadRef.current = { ...leadRef.current, humanRequested: "Yes" };
      const wantsCapture = flow.capture && (!flow.captureWhen || flow.captureWhen(leadRef.current));
      if (wantsCapture) {
        advance(key, "capture", 0);
        return;
      }
      if (flow.captureWhen && !flow.captureWhen(leadRef.current) && flow.browsingExit) {
        say(flow.browsingExit);
      }
      setCurrentStep(null);
      setPhase("done");
      return;
    }

    // Capture finished → save + success message (spec §13).
    const lead = finalizeLead();
    if (lead.humanRequested === "Yes") {
      say("Thanks. I've marked this for human follow-up. Someone from Pro Commerce Solutions will contact you using your preferred contact method.");
    } else if (lead.statementUploaded === "Yes") {
      say("Thanks — I've saved your details. Once your statement is submitted it will be reviewed privately, and someone from Pro Commerce Solutions will follow up with next steps.");
    } else {
      say("Thanks. I've saved your details for Pro Commerce Solutions. Dominique or the team can review your information and follow up with the best Square POS, hardware, or processing recommendation.");
    }
    setCurrentStep(null);
    setPhase("done");
  }

  function startFlow(key) {
    const flow = FLOWS[key];
    if (!flow) return;
    setFlowKey(key);
    say(flow.intro);
    if (flow.humanRequested) leadRef.current = { ...leadRef.current, humanRequested: "Yes" };
    // "statement"-style flows may have no questions at all.
    setTimeout(() => advance(key, "flow", 0), 350);
  }

  const restart = () => {
    leadRef.current = {};
    submittedRef.current = false;
    setFlowKey(null);
    setCurrentStep(null);
    setPhase("menu");
    say("No problem — starting over. What do you need help with today?");
  };

  const handleOption = (label) => {
    sayUser(label);
    const step = currentStep;
    if (!step) return;
    leadRef.current = { ...leadRef.current, [step.id]: label };
    setCurrentStep(null);
    setTimeout(() => advance(flowKey, phase, stepIdx + 1), 300);
  };

  const handleMenuPick = (key, label) => {
    sayUser(label);
    setTimeout(() => startFlow(key), 300);
  };

  const handleNextAction = (key, label) => {
    if (key === "restart") { sayUser(label); restart(); return; }
    if (key === "calculator") {
      sayUser(label);
      say("Opening the cost estimator for you — pick your plan and hardware and it calculates the monthly total live.");
      window.location.assign("#products/calculator");
      return;
    }
    sayUser(label);
    setTimeout(() => startFlow(key), 300);
  };

  // Typed input: answers the current input step, or falls through to the AI.
  const handleTyped = async (text) => {
    const step = currentStep;
    if (step && step.input) {
      if (step.input === "email" && !EMAIL_RE.test(text)) {
        say("That doesn't look like an email — mind checking it? (e.g. you@business.com)");
        return;
      }
      const val = text.trim();
      const updates = {};
      if (step.id === "fullName") {
        const [first, ...rest] = val.split(/\s+/);
        updates.firstName = first;
        updates.lastName = rest.join(" ");
        updates.fullName = val;
      } else if (step.id === "cityState") {
        const [city, state] = val.split(",").map((s) => s.trim());
        updates.city = city || val;
        updates.state = state || "";
        updates.cityState = val;
      } else if (step.id === "phone" && /^skip$/i.test(val)) {
        updates.phone = "";
      } else {
        updates[step.id] = val;
      }
      leadRef.current = { ...leadRef.current, ...updates };
      setCurrentStep(null);
      setTimeout(() => advance(flowKey, phase, stepIdx + 1), 300);
      return;
    }

    // Free text outside an input step → AI (or canned), then re-show options.
    setIsTyping(true);
    const aiReply = await getAIReply([...messagesRef.current]);
    const reply = aiReply || cannedReply(text);
    setTimeout(() => {
      setIsTyping(false);
      say(reply);
    }, aiReply ? 250 : 800);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    sayUser(text);
    handleTyped(text);
  };

  // Persist the conversation if the visitor leaves mid-chat (spec §4 transcript).
  const logConversation = useCallback(() => {
    const msgs = messagesRef.current;
    const hasUser = msgs.some((m) => m.sender === "user");
    if (!hasUser || submittedRef.current || msgs.length === loggedLenRef.current) return;
    const lead = leadRef.current;
    const transcript = formatTranscript(msgs);
    const emailMatch = lead.email || (transcript.match(EMAIL_RE) || [])[0] || "";
    submitLead("chat", {
      ...lead,
      email: emailMatch,
      leadSource: "Chatbot",
      leadStatus: "New Lead",
      priority: scoreLead(lead),
      leadScore: scoreLead(lead),
      chatSummary: summarizeLead(lead) || "Abandoned chat (partial)",
      transcript
    });
    loggedLenRef.current = msgs.length;
  }, []);

  useEffect(() => {
    const onUnload = () => {
      const msgs = messagesRef.current;
      const hasUser = msgs.some((m) => m.sender === "user");
      if (!hasUser || submittedRef.current || msgs.length === loggedLenRef.current) return;
      const lead = leadRef.current;
      beaconLead("chat", {
        ...lead,
        leadSource: "Chatbot",
        priority: scoreLead(lead),
        chatSummary: summarizeLead(lead) || "Abandoned chat (partial)",
        transcript: formatTranscript(msgs)
      });
      loggedLenRef.current = msgs.length;
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  const closeChat = () => { logConversation(); setIsOpen(false); };
  const toggleOpen = () => setIsOpen((open) => { if (open) logConversation(); return !open; });

  // Which buttons to show under the newest bot message.
  const showMenu = phase === "menu" && !isTyping;
  const showStepOptions = currentStep && currentStep.options && !isTyping;
  const showNextActions = phase === "done" && !isTyping;
  const inputPlaceholder = currentStep?.input ? (currentStep.placeholder || "Type your answer…") : "Type a message…";

  return (
    <div className="chat-widget">
      <div className={`chat-panel ${isOpen ? "show" : ""}`}>
        <div className="chat-head">
          <div className="chat-head-id">
            <span className="chat-avatar"><Sparkles size={18} /></span>
            <div>
              <h4>Pro Commerce Assistant</h4>
              <span className="chat-status"><span className="chat-status-dot"></span>Online · B2B POS guidance</span>
            </div>
          </div>
          <button className="chat-close" onClick={closeChat} aria-label="Close chat">
            <X size={18} />
          </button>
        </div>
        <div className="chat-body" id="chat-body" ref={bodyRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-row ${msg.sender === "bot" ? "bot" : "user"}`}>
              {msg.sender === "bot" && <span className="chat-msg-avatar"><Sparkles size={13} /></span>}
              <div className={`chat-msg ${msg.sender === "bot" ? "bot" : "user"}`}>{msg.text}</div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-row bot">
              <span className="chat-msg-avatar"><Sparkles size={13} /></span>
              <div className="chat-msg bot chat-typing"><span></span><span></span><span></span></div>
            </div>
          )}

          {showMenu && (
            <div className="chat-quick-replies">
              {OPENING_OPTIONS.map((o) => (
                <button key={o.key} className="chat-quick-btn" onClick={() => handleMenuPick(o.key, o.label)}>{o.label}</button>
              ))}
            </div>
          )}

          {showStepOptions && (
            <div className="chat-quick-replies">
              {currentStep.options.map((label) => (
                <button key={label} className="chat-quick-btn" onClick={() => handleOption(label)}>{label}</button>
              ))}
              {/* Human escape hatch stays visible during flows (spec §8) */}
              {flowKey !== "human" && phase === "flow" && (
                <button className="chat-quick-btn chat-quick-human" onClick={() => handleNextAction("human", "Speak with a human")}>Speak with a human</button>
              )}
            </div>
          )}

          {showNextActions && (
            <div className="chat-quick-replies">
              {NEXT_ACTIONS.map((a) => (
                <button key={a.key} className="chat-quick-btn" onClick={() => handleNextAction(a.key, a.label)}>{a.label}</button>
              ))}
            </div>
          )}
        </div>
        <div className="chat-foot">
          <input
            type={currentStep?.input === "email" ? "email" : currentStep?.input === "tel" ? "tel" : "text"}
            placeholder={inputPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} aria-label="Send message">
            <Send size={16} />
          </button>
        </div>
      </div>
      <button className="chat-bubble" onClick={toggleOpen} aria-label="Open Chat Assistant">
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>
    </div>
  );
}
