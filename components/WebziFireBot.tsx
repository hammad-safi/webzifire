"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, CheckCircle2, ArrowRight, Loader2, Sparkles } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
}

// Parses inline tokens: **bold**, `code`, [link](url), *italic*, and interactive **Send Brief** triggers
function parseInline(text: string, onOpenBrief?: () => void): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\)|\*.*?\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith("**") && matchedStr.endsWith("**")) {
      const inner = matchedStr.slice(2, -2).trim();
      const isBrief = inner.toLowerCase().includes("send brief") || inner.toLowerCase().includes("submit brief");
      if (isBrief && onOpenBrief) {
        tokens.push(
          <button
            key={match.index}
            type="button"
            onClick={onOpenBrief}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mx-1 rounded-full bg-[#D6334A]/20 hover:bg-[#D6334A]/30 border border-[#D6334A]/50 text-[#F5EFE6] font-mono text-[11px] uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer shadow-sm align-middle"
          >
            <span>{inner}</span>
            <ArrowRight className="w-3 h-3 text-[#D6334A]" />
          </button>
        );
      } else {
        tokens.push(
          <strong key={match.index} className="font-semibold text-[#F5EFE6]">
            {inner}
          </strong>
        );
      }
    } else if (matchedStr.startsWith("`") && matchedStr.endsWith("`")) {
      tokens.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-[#0B0607] border border-[#2C181B] font-mono text-[11px] text-[#E8606F]">
          {matchedStr.slice(1, -1)}
        </code>
      );
    } else if (matchedStr.startsWith("[") && matchedStr.includes("](")) {
      const linkMatch = matchedStr.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        tokens.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D6334A] hover:underline font-medium"
          >
            {linkMatch[1]}
          </a>
        );
      }
    } else if (matchedStr.startsWith("*") && matchedStr.endsWith("*")) {
      tokens.push(
        <em key={match.index} className="italic text-[#C4B5A5]">
          {matchedStr.slice(1, -1)}
        </em>
      );
    }

    lastIndex = match.index + matchedStr.length;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return tokens;
}

// Parses block elements: headings, bullets, numbered lists, paragraphs
function FormattedBotMessage({ text, onOpenBrief }: { text: string; onOpenBrief?: () => void }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={`empty-${i}`} className="h-1.5" />);
      continue;
    }

    // Heading: ### Heading or ## Heading or # Heading
    if (/^#{1,4}\s+/.test(trimmed)) {
      let headingText = trimmed.replace(/^#{1,4}\s+/, "").trim();
      // Clean up any double asterisks wrapped around heading
      if (headingText.startsWith("**") && headingText.endsWith("**")) {
        headingText = headingText.slice(2, -2).trim();
      }
      elements.push(
        <div
          key={`heading-${i}`}
          className="font-display font-medium text-xs sm:text-sm text-[#F5EFE6] mt-2 mb-1 tracking-tight flex items-center gap-1.5"
        >
          <span className="text-[#D6334A] text-[10px]">✦</span>
          <span>{parseInline(headingText, onOpenBrief)}</span>
        </div>
      );
      continue;
    }

    // Bullet point: - item or * item or • item
    if (/^[-*•]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-*•]\s+/, "");
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 my-0.5 pl-1">
          <span className="text-[#D6334A] text-xs leading-relaxed select-none shrink-0 mt-0.5">•</span>
          <div className="flex-1 text-[#C4B5A5] leading-relaxed">
            {parseInline(itemText, onOpenBrief)}
          </div>
        </div>
      );
      continue;
    }

    // Numbered list: 1. item
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 my-0.5 pl-1">
          <span className="font-mono text-[11px] text-[#D6334A] leading-relaxed select-none shrink-0">
            {numberedMatch[1]}.
          </span>
          <div className="flex-1 text-[#C4B5A5] leading-relaxed">
            {parseInline(numberedMatch[2], onOpenBrief)}
          </div>
        </div>
      );
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-[#F5EFE6]/90 leading-relaxed my-0.5">
        {parseInline(line, onOpenBrief)}
      </p>
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
}

export default function WebziFireBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I am WebziFire AI. Ask me about our 12 engineering practices, project scoping, architecture, or custom tech stacks!",
      time: "Just now",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [leadFormData, setLeadFormData] = useState({
    name: "",
    email: "",
    number: "",
    message: "",
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenBot = () => setIsOpen(true);
    window.addEventListener("open-webzifire-bot", handleOpenBot);
    return () => window.removeEventListener("open-webzifire-bot", handleOpenBot);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, showLeadForm, isThinking]);

  const suggestions = [
    {
      label: "Find my best service",
      query: "Which WebziFire capability is best suited for enterprise scaling?",
    },
    {
      label: "Portal pricing & scope",
      query: "What does an enterprise web application or SaaS platform typically cost and how long does it take?",
    },
    {
      label: "AI Services & Agents",
      query: "What specific AI automation, custom agents, and RAG pipelines does WebziFire engineer?",
    },
    {
      label: "Senior-led model",
      query: "How does WebziFire's senior-led delivery model differ from traditional agencies?",
    },
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: text.trim(),
      time: "Just now",
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInputValue("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const botReply =
        data.reply ||
        "Thank you for sharing. WebziFire's senior engineering team can scope this directly. Would you like to share a quick project brief?";

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botReply,
        time: "Just now",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("[WebziFire AI Error]", err);
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "I am having trouble reaching our AI engine right now. However, you can submit your project brief using the 'Send Brief' button below, and our senior directors will review it within 24 hours!",
        time: "Just now",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadSubmitted(true);
    try {
      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadFormData),
      });
      const data = await res.json();
      const refId = data.referenceId || "WBZ-DIRECT";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "bot",
          text: `Thank you, ${leadFormData.name}! Your brief [${refId}] has been routed directly to our senior directors. A dedicated lead architect will review your scope and follow up at ${leadFormData.email} within 24 hours.`,
          time: "Just now",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "bot",
          text: `Thank you, ${leadFormData.name}! Your brief has been captured. Our team will follow up at ${leadFormData.email} shortly.`,
          time: "Just now",
        },
      ]);
    } finally {
      setShowLeadForm(false);
      setLeadSubmitted(false);
      setLeadFormData({ name: "", email: "", number: "", message: "" });
    }
  };

  return (
    <>
      {/* Floating Bottom-Right Launcher Orb (Desktop) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex fixed bottom-6 right-6 z-50 group items-center justify-center p-3 rounded-full bg-[#140A0C] border border-[#2C181B] hover:border-[#D6334A]/60 shadow-[0_4px_28px_rgba(214,51,74,0.35)] hover:shadow-[0_4px_36px_rgba(214,51,74,0.6)] hover:scale-105 transition-all duration-300 cursor-pointer"
        aria-label="Open WebziFire AI Assistant"
      >
        <div className="relative">
          <span className="absolute -inset-1 rounded-full bg-[#D6334A]/30 animate-ping" />
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-black border border-white/10">
            {isOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/webzifire-icon.png"
                alt="WebziFire"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
        <div className="hidden md:flex flex-col text-left ml-3 pr-2">
          <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#F5EFE6] leading-tight">
            WebziFire AI
          </span>
    
        </div>
      </button>

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[600px] max-h-[85vh] bg-[#140A0C] border border-[#2C181B] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden backdrop-blur-2xl animate-fade-in">
          {/* Header */}
          <div className="p-4 px-5 bg-[#0B0607] border-b border-[#2C181B] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-black border border-[#D6334A]/40 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/webzifire-icon.png"
                  alt="WebziFire Icon"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-medium text-[#F5EFE6]">
                    WebziFire AI
                  </span>
        
                </div>
                <span className="font-mono text-[10px] text-[#8A8175] flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_#10B981]" />
                  Senior Engineering &amp; Scoping Consultant
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#8A8175] hover:text-[#F5EFE6] hover:bg-[#1B0E10] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* WhatsApp Direct Strip */}
          <div className="px-5 py-2 bg-[#1B0E10] border-b border-[#2C181B] flex items-center justify-between font-mono text-[11px]">
            <span className="text-[#8A8175] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
              Prefer chatting directly?
            </span>
            <a
              href="https://wa.me/923145660928?text=Hello%20WebziFire!%20I%20am%20chatting%20with%20WebziFire%20AI%20and%20would%20like%20to%20connect%20with%20a%20director."
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>WhatsApp Us</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-6 h-6 rounded-full bg-[#1B0E10] border border-[#2C181B] flex items-center justify-center shrink-0 mt-0.5 text-[#D6334A]">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm font-sans leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#D6334A] text-white rounded-br-none shadow-sm font-normal whitespace-pre-wrap"
                      : "bg-[#1B0E10] border border-[#2C181B] text-[#F5EFE6] rounded-bl-none"
                  }`}
                >
                  {msg.sender === "bot" ? (
                    <FormattedBotMessage
                      text={msg.text}
                      onOpenBrief={() => setShowLeadForm(true)}
                    />
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
              </div>
            ))}

            {/* AI Thinking Animation */}
            {isThinking && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-6 h-6 rounded-full bg-[#1B0E10] border border-[#2C181B] flex items-center justify-center shrink-0 text-[#D6334A]">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="bg-[#1B0E10] border border-[#2C181B] text-[#8A8175] px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D6334A] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D6334A] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D6334A] animate-bounce" />
                  </div>
                  <span className="font-mono text-[10px] text-[#8A8175]">WebziFire AI is thinking...</span>
                </div>
              </div>
            )}

            {/* Suggestions Chips */}
            {messages.length <= 3 && !showLeadForm && !isThinking && (
              <div className="pt-2">
                <span className="font-mono text-[10px] uppercase text-[#8A8175] font-semibold block mb-2">
                  Suggested topics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(s.query)}
                      className="px-3 py-1.5 rounded-full bg-[#1B0E10] hover:bg-[#2C181B] border border-[#2C181B] font-mono text-[11px] text-[#C4B5A5] hover:text-[#F5EFE6] transition-colors text-left cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Brief Form Toggle */}
            {!showLeadForm && (
              <div className="p-3 bg-[#1B0E10] rounded-xl border border-[#2C181B] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-[#F5EFE6] font-semibold">
                    Have a live project brief?
                  </span>
                  <span className="font-sans text-[11px] text-[#8A8175]">
                    Send directly to our senior leads
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLeadForm(true)}
                  className="px-3.5 py-1.5 rounded-full bg-[#F5EFE6] hover:bg-white font-sans text-xs font-medium text-[#0A0707] transition-colors cursor-pointer shadow-sm"
                >
                  Send Brief ↗
                </button>
              </div>
            )}

            {/* Interactive Lead Form */}
            {showLeadForm && (
              <div className="p-4 bg-[#1B0E10] rounded-2xl border border-[#D6334A]/50 shadow-[0_8px_24px_rgba(0,0,0,0.6)] animate-fade-in">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#2C181B]">
                  <span className="font-mono text-xs text-[#D6334A] font-semibold uppercase">
                    Submit Project Scope
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowLeadForm(false)}
                    className="text-[#8A8175] hover:text-[#F5EFE6] text-xs font-mono cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={leadFormData.name}
                    onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0607] border border-[#2C181B] text-xs font-sans text-[#F5EFE6] placeholder:text-[#8A8175] focus:outline-none focus:border-[#D6334A]"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Business Email *"
                    value={leadFormData.email}
                    onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0607] border border-[#2C181B] text-xs font-sans text-[#F5EFE6] placeholder:text-[#8A8175] focus:outline-none focus:border-[#D6334A]"
                  />
                  <input
                    type="tel"
                    placeholder="Phone / WhatsApp Number"
                    value={leadFormData.number}
                    onChange={(e) => setLeadFormData({ ...leadFormData, number: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0607] border border-[#2C181B] text-xs font-sans text-[#F5EFE6] placeholder:text-[#8A8175] focus:outline-none focus:border-[#D6334A]"
                  />
                  <textarea
                    rows={2}
                    required
                    placeholder="Tell us what you are building and desired timeline *"
                    value={leadFormData.message}
                    onChange={(e) => setLeadFormData({ ...leadFormData, message: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0607] border border-[#2C181B] text-xs font-sans text-[#F5EFE6] placeholder:text-[#8A8175] focus:outline-none focus:border-[#D6334A] resize-none"
                  />
                  <button
                    type="submit"
                    disabled={leadSubmitted}
                    className="w-full py-2.5 rounded-lg bg-[#F5EFE6] hover:bg-white text-[#0A0707] font-sans text-xs uppercase font-medium tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {leadSubmitted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#0A0707]" />
                        <span>Submitting Brief...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Brief to Team</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-[#0B0607] border-t border-[#2C181B]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={isThinking ? "WebziFire AI is thinking..." : "Ask WebziFire AI.."}
                disabled={isThinking}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-full bg-[#140A0C] border border-[#2C181B] text-xs font-sans text-[#F5EFE6] placeholder:text-[#8A8175] focus:outline-none focus:border-[#D6334A] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isThinking}
                className="w-8 h-8 rounded-full bg-[#D6334A] disabled:opacity-40 text-white flex items-center justify-center hover:bg-[#ff3b3b] transition-colors shrink-0 cursor-pointer"
              >
                {isThinking ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>
            <div className="flex items-center justify-between pt-2 px-1 text-[10px] font-mono text-[#8A8175]">
              <span>Press Enter to send</span>
              <span className="text-[#C4B5A5] font-medium flex items-center gap-1.5 bg-[#1B0E10] px-2.5 py-0.5 rounded-full border border-[#2C181B]">
                <Sparkles className="w-2.5 h-2.5 text-[#D6334A]" />
                <span className="text-[#F5EFE6] font-semibold">WebziFire AI</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
