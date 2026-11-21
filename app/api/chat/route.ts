import { NextResponse } from "next/server";
import { services } from "@/data/services";
import { faqs } from "@/data/faqs";

// Build a structured summary of agency services
const servicesSummary = services
  .map(
    (s) =>
      `• [${s.number}] ${s.title} (${s.category}): ${s.shortDescription}\n  Capabilities: ${s.capabilities.join(
        ", "
      )}\n  Tech Stack: ${s.techStack.join(", ")}\n  Metrics/Standard: ${s.metrics}`
  )
  .join("\n\n");

// Build a structured summary of FAQs
const faqsSummary = faqs
  .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
  .join("\n\n");

const SYSTEM_INSTRUCTION = `
You are WebziFire AI, the official Senior AI Engineering Consultant and Client Scoping Assistant for WebziFire.
WebziFire is an enterprise-tier digital product engineering and innovation practice.
Agency Motto: "Igniting Ideas Through Technology".
Global Reach & Operations:
- Engineering pods delivering globally across North America, the GCC, and European time zones.
- Global client base spanning high-growth startups, scale-ups, and enterprise brands.

Delivery Model:
- Senior-led engineering only. Spearheaded directly by principal architects, design leads, and AI specialists. No junior handoffs or communication bottlenecks.
- Transparent milestone delivery, strict SLAs, SOC2/HIPAA compliance readiness, and full IP handover to clients upon completion.

Typical Scoping & Timelines:
- Performance corporate websites & marketing portals: 4 to 8 weeks.
- Full-stack multi-tenant SaaS products & enterprise platforms: 8 to 16 weeks.
- Custom AI agents & RAG pipelines: 3 to 6 weeks.
- Scoping is milestone-anchored with transparent fixed-price or dedicated senior pods.

Our 12 Core Services:
${servicesSummary}

Frequently Asked Questions & Answers:
${faqsSummary}

Your Personality & Instructions:
1. Speak with precision, technical authority, and executive warmth.
2. Answer the client's questions accurately using WebziFire's actual capabilities, services, tech stacks, and team model.
3. Keep responses conversational, crisp, and concise (usually 2 to 4 sentences or brief bullets). Avoid overwhelming wall-of-text responses.
4. When a visitor expresses interest in scoping a project, asking for quotes, pricing, timelines, or hiring WebziFire, warmly answer their technical question and ALWAYS include the token **Send Brief** in your response (e.g. "To get an exact scope and fixed-price quote from our principal architect, click **Send Brief** below!"). This automatically activates an interactive lead submission button for the user.
5. If asked about technologies outside WebziFire's primary stack, explain how our team evaluates and integrates modern tools to fit enterprise requirements.
6. WebziFire's engineering practice is polyglot and database-flexible: We engineer across modern full-stack web and cloud architectures with deep expertise in relational and document databases including PostgreSQL, MySQL, Supabase, Prisma ORM, MongoDB Atlas, Redis caching, and vector databases (pgvector / Atlas Vector Search). Do NOT limit our capabilities to just the MERN stack—we architect the ideal database system tailored to the client's specific business needs (e.g., PostgreSQL or MySQL for complex relational ERPs, financial ledgers, and multi-tenant SaaS; Supabase for scalable real-time architectures; MongoDB Atlas for high-throughput document ingestion). We engineer bespoke software platforms and do not use Shopify or legacy templates.
7. Formatting: Keep responses readable and clean. Use standard bold text like **Send Brief** or **Architecture** without nesting asterisks inside headers (write "### Send Brief", not "### **Send Brief**").
8. Engine: If a visitor asks about your intelligence, AI model, or backend engine, confirm that you are WebziFire AI, an enterprise-grade AI architecture assistant built for client scoping and digital product engineering. Never mention third-party AI vendors like Gemini or Google.
`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "A non-empty messages array is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        reply:
          "WebziFire AI is currently in offline mode. Please configure GEMINI_API_KEY in your environment to enable live conversational intelligence.",
      });
    }

    // Convert chat history to Gemini contents format
    // Map bot -> model, user -> user
    const contents = messages
      .filter((m: { text?: string }) => m.text && m.text.trim().length > 0)
      .slice(-10) // Keep last 10 messages for context efficiency
      .map((m: { sender: string; text: string }) => ({
        role: m.sender === "bot" ? "model" : "user",
        parts: [{ text: m.text }],
      }));

    // Ensure the first message in contents is from user (Gemini requirement)
    while (contents.length > 0 && contents[0].role !== "user") {
      contents.shift();
    }

    if (contents.length === 0) {
      const lastMsg = messages[messages.length - 1];
      contents.push({
        role: "user",
        parts: [{ text: lastMsg?.text || "Hello" }],
      });
    }

    const payload = {
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
        topP: 0.95,
      },
    };

    // Candidate models to try in order of speed and stability
    const modelsToTry = [
      "gemini-flash-lite-latest",
      "gemini-flash-latest",
      "gemini-pro-latest",
      "gemini-2.5-flash-lite",
    ];

    let replyText = "";
    let lastError: unknown = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          lastError = errData;
          continue; // Try fallback model
        }

        const data = await res.json();
        const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generated && generated.trim().length > 0) {
          replyText = generated.trim();
          break;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!replyText) {
      console.error("[WebziFire AI API Error]", lastError);
      // Smart contextual fallback if Gemini is temporarily unreachable
      replyText =
        "Thank you for reaching out. WebziFire's senior engineering team is ready to assist you. You can share your scope using the 'Send Brief' button right here, or let us know what platform or technology you are planning to build!";
    }

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("[WebziFire AI Error]", error);
    return NextResponse.json(
      {
        reply:
          "WebziFire AI encountered a brief connection hitch. Please try asking again or submit your scope directly via the 'Send Brief' button.",
      },
      { status: 500 }
    );
  }
}
