"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { submitLead, beaconLead, formatTranscript } from "../lib/sheets";
import { getAIReply } from "../lib/chat";

const INITIAL_MESSAGES = [
  { sender: "bot", text: "Hi, welcome to Pro Commerce Solutions. I'm Dominique's B2B POS assistant. I can help you select hardware, estimate monthly costs, or configure Square setups." },
  { sender: "bot", text: "What would you like to explore today?" }
];

// Built-in keyword replies used when the AI proxy isn't configured / fails.
function cannedReply(text, onOpenUpload) {
  const q = (text || "").toLowerCase();
  if (q.includes("pos") || q.includes("square") || q.includes("system")) {
    return "Square offers tailormade POS systems for Restaurants, Retailers, and service-based businesses. Would you like me to open our Business Survey so we can recommend the perfect custom hardware setup?";
  }
  if (q.includes("price") || q.includes("pricing") || q.includes("cost") || q.includes("estimate") || q.includes("hardware")) {
    return "Our hardware financing starts from $14/mo (Square Stand) up to $44/mo (Square Register). You can use our Setup Estimator on the Products page or I can help collect a custom request here. What industry are you in?";
  }
  if (q.includes("restaurant") || q.includes("cafe") || q.includes("food")) {
    return "For restaurants, we recommend combining Square Plus ($49/mo) with Register ($44/mo) and Handhelds ($37/mo) for tableside checkout. What is your business name?";
  }
  if (q.includes("retail") || q.includes("store") || q.includes("shop")) {
    return "For retail operations, the Square Retail POS software manages inventory levels seamlessly. Would you like to schedule a custom statement review to compare rates?";
  }
  if (q.includes("upload") || q.includes("statement") || q.includes("rate") || q.includes("fee")) {
    if (onOpenUpload) setTimeout(() => onOpenUpload(), 1500);
    return "Uploading a processing statement is the fastest way to check your potential savings. I'll open the secure statement uploader for you now.";
  }
  return "I'm Dominique's B2B POS assistant. I can help configure your Square setup, estimate monthly costs, or submit a request for a consultation. Would you like to schedule a free 1-on-1 session with us?";
}

export default function ChatWidget({ onOpenUpload }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bodyRef = useRef(null);
  const messagesRef = useRef(messages);
  const loggedLenRef = useRef(0);

  // Keep a ref of the latest messages for unload-time logging.
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, isTyping]);

  const userCount = (msgs) => msgs.filter((m) => m.sender === "user").length;

  // Persist the whole conversation to the sheet (once per new content).
  const logConversation = () => {
    const msgs = messagesRef.current;
    if (userCount(msgs) === 0 || msgs.length === loggedLenRef.current) return;
    const transcript = formatTranscript(msgs);
    const emailMatch = transcript.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    submitLead("chat", { email: emailMatch ? emailMatch[0] : "", transcript });
    loggedLenRef.current = msgs.length;
  };

  // Capture an in-progress conversation if the visitor closes the tab.
  useEffect(() => {
    const onUnload = () => {
      const msgs = messagesRef.current;
      if (userCount(msgs) === 0 || msgs.length === loggedLenRef.current) return;
      const transcript = formatTranscript(msgs);
      const emailMatch = transcript.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
      beaconLead("chat", { email: emailMatch ? emailMatch[0] : "", transcript });
      loggedLenRef.current = msgs.length;
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  const respondTo = async (history) => {
    setIsTyping(true);
    const aiReply = await getAIReply(history);
    const reply = aiReply || cannedReply(history[history.length - 1]?.text, onOpenUpload);
    // Small floor so the typing indicator doesn't flash.
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, aiReply ? 250 : 900);
  };

  const pushUserAndRespond = (text) => {
    const next = [...messagesRef.current, { sender: "user", text }];
    setMessages(next);
    respondTo(next);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    pushUserAndRespond(text);
  };

  const submitTranscript = () => {
    logConversation();
    setMessages((prev) => [...prev, {
      sender: "bot",
      text: "Thanks! I've sent this conversation to the Pro Commerce Solutions team — Dominique will follow up by email shortly."
    }]);
  };

  const toggleOpen = () => {
    setIsOpen((open) => {
      if (open) logConversation(); // closing → persist the conversation
      return !open;
    });
  };

  const closeChat = () => {
    logConversation();
    setIsOpen(false);
  };

  const lastIsBot = messages[messages.length - 1]?.sender === "bot";

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

          {!isTyping && lastIsBot && (
            <div className="chat-quick-replies">
              <button className="chat-quick-btn" onClick={() => pushUserAndRespond("I need a Square POS system")}>Square POS System</button>
              <button className="chat-quick-btn" onClick={() => pushUserAndRespond("I want hardware pricing")}>Hardware Pricing</button>
              <button className="chat-quick-btn" onClick={() => pushUserAndRespond("I run a restaurant")}>Restaurant POS</button>
              <button className="chat-quick-btn" onClick={() => pushUserAndRespond("I want to upload a statement")}>Compare Rates</button>
              <button className="chat-quick-btn" onClick={submitTranscript}>Send chat to the team</button>
            </div>
          )}
        </div>
        <div className="chat-foot">
          <input
            type="text"
            placeholder="Type a message..."
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
