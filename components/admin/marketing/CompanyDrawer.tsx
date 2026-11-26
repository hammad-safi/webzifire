"use client";

import React, { useState } from "react";
import {
  X,
  ExternalLink,
  Linkedin,
  Mail,
  Copy,
  Check,
  Building,
  MapPin,
  Users,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Layers
} from "lucide-react";
import { CompanyRecord, ContactRecord, OpportunityRecord, OutreachRecord } from "@/lib/marketing/types";

interface CompanyDrawerProps {
  company: CompanyRecord | null;
  contacts: ContactRecord[];
  opportunities: OpportunityRecord[];
  outreach: OutreachRecord[];
  isOpen: boolean;
  onClose: () => void;
  onApproveOutreach: (outreachId: string) => Promise<void>;
  onMarkSentOutreach: (outreachId: string) => Promise<void>;
  onUpdateCompanyStatus: (companyId: string, status: string) => Promise<void>;
}

export function CompanyDrawer({
  company,
  contacts,
  opportunities,
  outreach,
  isOpen,
  onClose,
  onApproveOutreach,
  onMarkSentOutreach,
  onUpdateCompanyStatus
}: CompanyDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "contacts" | "opportunities" | "outreach">("overview");

  if (!isOpen || !company) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Hot Lead":
      case "hot":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "High Priority":
      case "high":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Medium Priority":
      case "medium":
        return "bg-sky-500/20 text-sky-300 border-sky-500/40";
      default:
        return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const techStack: string[] = company.tech_stack || (company as any).technologies || [];
  const needs: string[] = company.potential_needs || [];
  const rationale = company.score_rationale as any;
  const currentStage: string = company.pipeline_stage || (company as any).lead_status || "qualified";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0F080A] border-l border-[#2C181B] h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="sticky top-0 bg-[#140A0D]/95 backdrop-blur-md p-6 border-b border-[#2C181B] flex items-start justify-between gap-4 z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${getPriorityColor(company.lead_priority)}`}>
                {company.lead_priority} ({company.lead_score}/100)
              </span>
              <span className="text-xs font-mono text-[#8A8175] uppercase">
                Stage: {currentStage}
              </span>
            </div>
            <h2 className="text-2xl font-light text-[#F5EFE6] font-display flex items-center gap-3">
              {company.name}
              {company.website_url && (
                <a
                  href={company.website_url.startsWith("http") ? company.website_url : `https://${company.website_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#8A8175] hover:text-[#D6334A] transition-colors"
                  title="Visit Website"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono text-[#B8AEA3]">
              {company.country && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D6334A]" />
                  {company.city ? `${company.city}, ` : ""}{company.country}
                </span>
              )}
              {company.industry && (
                <span className="inline-flex items-center gap-1">
                  <Building className="w-3 h-3 text-[#8A8175]" />
                  {company.industry}
                </span>
              )}
              {company.company_size && (
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#8A8175]" />
                  {company.company_size}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1C0D11] border border-[#2C181B] text-[#B8AEA3] hover:text-white hover:border-[#D6334A]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2C181B] bg-[#12070A] px-6 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "border-[#D6334A] text-white"
                : "border-transparent text-[#8A8175] hover:text-[#B8AEA3]"
            }`}
          >
            Intelligence &amp; Rationale
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contacts")}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === "contacts"
                ? "border-[#D6334A] text-white"
                : "border-transparent text-[#8A8175] hover:text-[#B8AEA3]"
            }`}
          >
            Decision-Makers ({contacts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("opportunities")}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === "opportunities"
                ? "border-[#D6334A] text-white"
                : "border-transparent text-[#8A8175] hover:text-[#B8AEA3]"
            }`}
          >
            Opportunities ({opportunities.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("outreach")}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === "outreach"
                ? "border-[#D6334A] text-white"
                : "border-transparent text-[#8A8175] hover:text-[#B8AEA3]"
            }`}
          >
            Outreach Desk ({outreach.length})
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Score Breakdown Card */}
              {rationale && (
                <div className="p-5 rounded-2xl bg-[#160B0F] border border-[#2C181B] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#D6334A] flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Lead Qualification Rationale
                    </span>
                    <span className="text-xs font-mono text-[#8A8175]">
                      Confidence: {company.confidence_score || 85}%
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-[#E0D8D0]">
                    <p><strong>Executive Summary:</strong> {rationale.summary || rationale.why_selected || "Qualified target company based on technical alignment."}</p>
                    {rationale.recommended_service && (
                      <p><strong>Recommended Offering:</strong> {rationale.recommended_service}</p>
                    )}
                    {rationale.tech_alignment_score && (
                      <p><strong>Tech Alignment Score:</strong> {rationale.tech_alignment_score}/30</p>
                    )}
                  </div>

                  {rationale.tech_alignment_reasons && Array.isArray(rationale.tech_alignment_reasons) && (
                    <div className="pt-2 border-t border-[#2C181B]/60">
                      <span className="text-[11px] font-mono uppercase text-[#8A8175] block mb-1.5">
                        Technical Match Signals:
                      </span>
                      <ul className="list-disc list-inside text-xs text-[#B8AEA3] space-y-1">
                        {rationale.tech_alignment_reasons.map((r: string, idx: number) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Technologies */}
              {techStack.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#8A8175]">
                    Detected Technologies &amp; Stack
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {techStack.map((tech: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[#1B0C10] border border-[#2C181B] text-xs font-mono text-[#E0D8D0]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Overview */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#8A8175]">
                  Company Description &amp; Products
                </h4>
                <p className="text-sm text-[#D6CEC5] leading-relaxed">
                  {company.description || "No description available."}
                </p>
              </div>

              {/* Potential Needs */}
              {needs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#8A8175]">
                    Potential Engineering Needs
                  </h4>
                  <div className="space-y-1.5">
                    {needs.map((need: string, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-[#140A0C] border border-[#2C181B] text-xs text-[#D6CEC5]">
                        {need}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pipeline Status Quick Changer */}
              <div className="p-4 rounded-xl bg-[#140A0C] border border-[#2C181B] flex items-center justify-between">
                <span className="text-xs font-mono text-[#B8AEA3]">Advance Pipeline Stage:</span>
                <select
                  value={currentStage}
                  onChange={(e) => onUpdateCompanyStatus(company.id, e.target.value)}
                  className="bg-[#1C0D11] border border-[#2C181B] rounded-lg px-3 py-1.5 text-xs font-mono text-[#F5EFE6] focus:outline-none focus:border-[#D6334A]"
                >
                  <option value="new">New</option>
                  <option value="researching">Researching</option>
                  <option value="qualified">Qualified</option>
                  <option value="ready_outreach">Ready Outreach</option>
                  <option value="contacted">Contacted</option>
                  <option value="replied">Replied</option>
                  <option value="meeting">Meeting Scheduled</option>
                  <option value="won">Won / Client</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="space-y-4">
              {contacts.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-[#8A8175]">
                  No decision-makers recorded yet. Run a prospecting sprint to identify contacts.
                </div>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-4 rounded-2xl bg-[#160B0F] border border-[#2C181B] space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-medium text-[#F5EFE6]">
                            {contact.full_name}
                          </h4>
                          {contact.is_decision_maker && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#D6334A]/20 text-[#D6334A] border border-[#D6334A]/30">
                              DECISION MAKER
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-[#D6CEC5] mt-0.5">
                          {contact.job_title} {contact.department ? `• ${contact.department}` : ""}
                        </p>
                      </div>

                      <span className="text-xs font-mono px-2 py-1 rounded bg-[#1C0D11] text-[#B8AEA3] border border-[#2C181B]">
                        Relevance: {contact.relevance_score || 85}/100
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                      {contact.email && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#140A0C] border border-[#2C181B] text-[#E0D8D0]">
                          <Mail className="w-3 h-3 text-[#D6334A]" />
                          <span>{contact.email}</span>
                          <button
                            type="button"
                            onClick={() => copyText(contact.email!, contact.id)}
                            className="text-[#8A8175] hover:text-white ml-1 cursor-pointer"
                            title="Copy email"
                          >
                            {copiedId === contact.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      )}

                      {contact.linkedin_url && (
                        <a
                          href={contact.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#140A0C] border border-[#2C181B] text-sky-400 hover:text-sky-300"
                        >
                          <Linkedin className="w-3 h-3" />
                          <span>LinkedIn Profile</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>

                    {contact.selection_reason && (
                      <p className="text-xs text-[#B8AEA3] italic bg-[#120709] p-2.5 rounded-xl border border-[#2C181B]/50">
                        &quot;{contact.selection_reason}&quot;
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "opportunities" && (
            <div className="space-y-4">
              {opportunities.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-[#8A8175]">
                  No opportunities identified yet for this company.
                </div>
              ) : (
                opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-4 rounded-2xl bg-[#160B0F] border border-[#2C181B] space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {opp.opportunity_type}
                        </span>
                        <h4 className="text-base font-medium text-[#F5EFE6] mt-1">
                          {opp.title}
                        </h4>
                      </div>
                      <span className="text-xs font-mono px-2 py-1 rounded bg-[#1C0D11] text-[#D6334A] border border-[#2C181B] font-bold">
                        {opp.match_score}% Match
                      </span>
                    </div>

                    <p className="text-xs text-[#D6CEC5] leading-relaxed">
                      {opp.description}
                    </p>

                    {opp.match_rationale && (
                      <div className="p-2.5 rounded-xl bg-[#120709] border border-[#2C181B]/60 text-xs">
                        <span className="text-[#D6334A] font-mono font-bold block mb-0.5">Recommended Pitch Angle:</span>
                        <p className="text-[#B8AEA3]">{opp.match_rationale}</p>
                      </div>
                    )}

                    {opp.required_skills && opp.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {opp.required_skills.map((skill: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1C0D11] text-[#E0D8D0] border border-[#2C181B]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "outreach" && (
            <div className="space-y-4">
              {outreach.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-[#8A8175]">
                  No outreach messages generated yet. Run a prospecting sprint to draft personalized pitches.
                </div>
              ) : (
                outreach.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-5 rounded-2xl bg-[#160B0F] border border-[#2C181B] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#1C0D11] text-[#D6334A] border border-[#2C181B] font-bold">
                          {msg.channel === "linkedin" ? "LINKEDIN" : "EMAIL"}
                        </span>
                        <span className="text-xs font-mono text-[#8A8175] capitalize">
                          {msg.message_type.replace(/_/g, " ")}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          msg.status === "sent"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : msg.status === "approved"
                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>

                    {msg.subject && (
                      <div className="text-xs font-mono text-[#E0D8D0] bg-[#120709] p-2 rounded-lg border border-[#2C181B]">
                        <strong>Subject:</strong> {msg.subject}
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-[#120709] border border-[#2C181B] text-xs text-[#E0D8D0] whitespace-pre-wrap leading-relaxed font-sans">
                      {msg.message_content}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2C181B]/60">
                      <button
                        type="button"
                        onClick={() => copyText(msg.message_content, msg.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C0D11] border border-[#2C181B] hover:border-[#D6334A]/50 text-xs font-mono text-[#B8AEA3] hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Message</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        {msg.status === "draft" && (
                          <button
                            type="button"
                            onClick={() => onApproveOutreach(msg.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D6334A]/20 hover:bg-[#D6334A] text-white border border-[#D6334A]/50 text-xs font-mono font-medium transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Draft</span>
                          </button>
                        )}

                        {msg.status !== "sent" && (
                          <button
                            type="button"
                            onClick={() => onMarkSentOutreach(msg.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40 text-xs font-mono font-medium transition-all cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Mark as Sent</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
