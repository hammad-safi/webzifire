import { callGeminiStructuredJson } from "@/lib/automation/geminiClient";
import { DiscoveredCompanyCandidate } from "./companyFinder";
import { CompanyResearchResult } from "./researchAgent";
import { B2BContact, B2BOpportunity, B2BOutreach, OutreachChannel, OutreachMessageType } from "@/lib/marketing/types";
import { matchPortfolioProof, MatchedPortfolioProof } from "../portfolioMatcher";

interface OutreachGenerationResult {
  messages: Array<{
    channel: OutreachChannel;
    message_type: OutreachMessageType;
    subject?: string;
    message_content: string;
  }>;
}

export interface OutreachGenerationOptions {
  meetingBookingUrl?: string;
  includeMeetingLink?: boolean;
}

export async function generateProspectOutreach(
  candidate: DiscoveredCompanyCandidate,
  research: CompanyResearchResult,
  contact: B2BContact,
  opportunity?: B2BOpportunity,
  companyId?: string,
  options?: OutreachGenerationOptions
): Promise<Array<Omit<B2BOutreach, "id" | "created_at" | "updated_at">>> {
  const cId = companyId || contact.company_id;

  // Idea 3: Smart Portfolio Matching (Select optimal live production case study)
  const matchedProof: MatchedPortfolioProof = matchPortfolioProof(
    candidate.industry,
    `${research.description || candidate.discovery_reason} ${research.business_model}`,
    research.tech_stack
  );

  const meetingUrl = options?.meetingBookingUrl?.trim() || "";
  const shouldIncludeMeeting = Boolean(meetingUrl && options?.includeMeetingLink !== false);

  const prompt = `You are a world-class B2B Enterprise Business Development & Outreach copywriter for WebziFire.

WebziFire Background:
- Founder & Core Team: Senior Full-Stack Engineers & Architects
- Core Technologies: React, Next.js, Node.js, Express, TypeScript, PostgreSQL, MongoDB, Supabase
- Core Services: Custom SaaS Development, Modern Web Applications, Enterprise ERP & POS systems, REST/GraphQL APIs, Engineering Team Augmentation, Bug Fixing & Code Modernization
- Value Proposition: High-velocity, production-grade engineering without agency bloat or communication friction.

Prospect Information:
Company: ${candidate.name}
Industry: ${candidate.industry}
Website: ${candidate.website_url}
Business Model: ${research.business_model}
Tech Stack: ${research.tech_stack.join(", ")}
Growth Signals: ${research.growth_signals.join("; ")}
Potential Needs: ${research.potential_needs.join("; ")}

Contact Person:
Name: ${contact.full_name}
Role: ${contact.job_title}
Department: ${contact.department || "Engineering"}
LinkedIn: ${contact.linkedin_url || "N/A"}

Key Opportunity Identified:
Type: ${opportunity?.opportunity_type || "Custom Dev Project"}
Title: ${opportunity?.title || "Full-Stack Development Acceleration"}
Approach Angle: ${opportunity?.match_rationale || "Direct senior developer support"}

AUTHENTIC SOCIAL PROOF (Idea 3 - Production Case Study Match):
- Featured Project: ${matchedProof.projectTitle}
- Category: ${matchedProof.category}
- Proven Metric: ${matchedProof.metricsSnippet}
- Recommended Proof Sentence: "${matchedProof.proofSentence}"
- Instruction: Naturally integrate a 1-sentence reference to this relevant project in the Cold Email and Follow-Up to provide concrete social proof.

MEETING SCHEDULING LINK (Idea 4):
${
  shouldIncludeMeeting
    ? `- Booking URL: ${meetingUrl}
- Instruction: End the Cold Email and Follow-Up with a frictionless, polite CTA offering them to pick a 10-15 min slot directly at ${meetingUrl} (e.g., "If you're open to a brief chat next week, feel free to pick a time here: ${meetingUrl}, or let me know what day works best for you.").`
    : `- Instruction: End with a lightweight, low-pressure question (e.g., "Would you be open to a 10-minute chat next week, or should I send a quick code sample/case study?").`
}

Outreach Principles:
1. SIMPLE, EASY ENGLISH (STRICT): Write in plain, friendly, conversational English. Never use complex words or corporate buzzwords (STRICTLY NO "synergy", "bespoke", "paradigm", "cutting-edge", "revolutionize", "spearheading", "holistic", "streamline").
2. CONVERSATIONAL DEVELOPER TONE: Sound like a friendly senior software engineer reaching out casually to another engineer or founder. Direct, humble, and polite.
3. CONCISE PARAGRAPHS: Keep paragraphs very short (1-2 sentences each). Total cold email length must be between 60 and 95 words.
4. STRICTLY NO SPAM, generic sales templates, buzzword soup, or aggressive pitches.
5. Reference concrete details (e.g., their tech stack, a recent product feature, or their engineering growth).
6. For LinkedIn Connection Request: MUST be under 300 characters. No pitch, just genuine interest in their work or a specific technical observation. Do NOT include calendar links in LinkedIn connection notes.
7. For Cold Email: Engaging, short subject line (3-6 words, no clickbait); personalized opener acknowledging their product; concise statement of how WebziFire can assist (e.g., accelerating their Next.js roadmap or building an internal tool/API); integrate the matched social proof; finish with the polite CTA.
8. For Follow-Up Email: Scheduled for 4 days later. Gentle, concise bump sharing one additional relevant insight or engineering capability.

Generate 3 personalized message drafts:
1. LinkedIn Connection Request (channel: "linkedin", message_type: "connection_request")
2. Cold Email (channel: "email", message_type: "cold_email")
3. Follow-Up Email (channel: "email", message_type: "follow_up")

Output STRICT JSON matching schema:
{
  "messages": [
    {
      "channel": "linkedin" | "email",
      "message_type": "connection_request" | "cold_email" | "follow_up",
      "subject": "Email subject line (null or omit for LinkedIn)",
      "message_content": "The exact body text of the message"
    }
  ]
}
`;

  try {
    const result = await callGeminiStructuredJson<OutreachGenerationResult>({
      prompt,
      jobType: "b2b_opportunity" // safe registered job type
    });

    if (!result?.data || !Array.isArray(result.data.messages)) {
      return [];
    }

    return result.data.messages.map((msg) => ({
      company_id: cId,
      contact_id: contact.id,
      channel: msg.channel,
      message_type: msg.message_type,
      subject: msg.subject || (msg.channel === "email" ? `Engineering roadmap at ${candidate.name}` : null),
      message_content: msg.message_content.trim(),
      status: "draft" as const,
      notes: `AI drafted with matched proof: ${matchedProof.projectTitle} (${matchedProof.metricsSnippet})`
    }));
  } catch (error) {
    console.error(`[OutreachAgent] Error generating outreach for ${contact.full_name} @ ${candidate.name}:`, error);

    const firstName = contact.full_name.split(" ")[0] || contact.full_name;
    const linkedinConnect = `Hi ${firstName}, noticed your technical leadership at ${candidate.name}. Impressive work with your platform. Would love to connect and follow your updates!`;
    const meetingSnippet = shouldIncludeMeeting ? `\n\nIf you're open to a brief chat next week, feel free to pick a time here: ${meetingUrl}` : "";
    const coldEmail = `Hi ${firstName},\n\nI came across ${candidate.name} while following engineering teams in ${candidate.industry}. Really impressed by what you're building.\n\nI lead engineering at WebziFire, where we help teams accelerate their web apps, SaaS features, and API integrations with Next.js, React, Node.js, and TypeScript.\n\n${matchedProof.proofSentence}\n\nAre you looking to augment your development team or accelerate any upcoming product initiatives?${meetingSnippet}\n\nBest regards,\nWebziFire Engineering Team`;

    return [
      {
        company_id: cId,
        contact_id: contact.id,
        channel: "linkedin" as const,
        message_type: "connection_request" as const,
        subject: null,
        message_content: linkedinConnect,
        status: "draft" as const,
        notes: `Fallback draft with matched proof: ${matchedProof.projectTitle}`
      },
      {
        company_id: cId,
        contact_id: contact.id,
        channel: "email" as const,
        message_type: "cold_email" as const,
        subject: `Engineering support for ${candidate.name}`,
        message_content: coldEmail,
        status: "draft" as const,
        notes: `Fallback cold email with matched proof: ${matchedProof.projectTitle}`
      }
    ];
  }
}
