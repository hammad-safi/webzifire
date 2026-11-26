"use client";

import React, { useState } from "react";
import {
  Mail,
  Linkedin,
  Copy,
  Check,
  Send,
  Clock,
  Bell,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Loader2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { OutreachRecord } from "@/lib/marketing/types";

export interface ProspectSequenceGroup {
  key: string;
  contactName: string;
  contactTitle?: string;
  contactEmail?: string;
  linkedinUrl?: string;
  companyName: string;
  companyDomain: string;
  leadScore?: number;
  leadPriority?: string;
  companyId: string;
  contactId?: string;
  linkedinMessage?: OutreachRecord;
  initialEmail?: OutreachRecord;
  followUpEmail?: OutreachRecord;
  hasFollowUpDue: boolean;
  daysUntilFollowUp?: number;
  sequenceStatus: "ready_initial" | "waiting_followup" | "followup_due" | "completed" | "replied";
}

interface ProspectSequenceCardProps {
  sequence: ProspectSequenceGroup;
  copiedId: string | null;
  sendingEmailId: string | null;
  onCopyText: (text: string, id: string) => void;
  onLaunchLinkedIn: (msg: OutreachRecord) => void;
  onDirectSendEmail: (outreachId: string) => Promise<void>;
  onApproveOutreach: (outreachId: string) => Promise<void>;
  onMarkSentOutreach: (outreachId: string) => Promise<void>;
  onMarkReplied: (outreachId: string) => Promise<void>;
}

export function ProspectSequenceCard({
  sequence,
  copiedId,
  sendingEmailId,
  onCopyText,
  onLaunchLinkedIn,
  onDirectSendEmail,
  onApproveOutreach,
  onMarkSentOutreach,
  onMarkReplied
}: ProspectSequenceCardProps) {
  // Active sub-tab inside the sequence card
  const [activeStep, setActiveStep] = useState<"initial_email" | "follow_up" | "linkedin">(
    sequence.hasFollowUpDue && sequence.followUpEmail ? "follow_up" : "initial_email"
  );

  const activeMsg: OutreachRecord | undefined =
    activeStep === "initial_email"
      ? sequence.initialEmail
      : activeStep === "follow_up"
      ? sequence.followUpEmail
      : sequence.linkedinMessage;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-lg ${
        sequence.hasFollowUpDue
          ? "bg-[#180A0E] border-amber-500/60 shadow-amber-500/10 ring-1 ring-amber-500/30"
          : "bg-[#120709] border-[#2C181B] hover:border-[#D6334A]/40"
      }`}
    >
      {/* Card Header: Person & Company */}
      <div className="p-4 sm:p-5 border-b border-[#2C181B] bg-[#140A0D]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-bold text-white font-sans">
              {sequence.contactName}
            </h4>
            <span className="text-xs font-mono text-[#8A8175]">
              {sequence.contactTitle ? `${sequence.contactTitle} @ ` : "@ "}
              <strong className="text-[#FAF7F2]">{sequence.companyName}</strong>
            </span>
            <span className="text-[11px] font-mono text-zinc-500">({sequence.companyDomain})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            {sequence.contactEmail && (
              <span className="inline-flex items-center gap-1 text-[#B8AEA3]">
                <Mail className="w-3 h-3 text-[#D6334A]" />
                {sequence.contactEmail}
              </span>
            )}
            {sequence.linkedinUrl && (
              <a
                href={sequence.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300"
              >
                <Linkedin className="w-3 h-3" />
                <span>LinkedIn Profile</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* Priority & Sequence Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {sequence.hasFollowUpDue ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse">
              <Bell className="w-3.5 h-3.5" />
              Follow-Up Alarm (Due Now)
            </span>
          ) : sequence.sequenceStatus === "waiting_followup" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/30">
              <Clock className="w-3 h-3" />
              Follow-up in {sequence.daysUntilFollowUp} days
            </span>
          ) : sequence.sequenceStatus === "replied" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              <CheckCircle2 className="w-3 h-3" />
              Client Replied
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#1C0D11] text-[#8A8175] border border-[#2C181B]">
              Ready for Review
            </span>
          )}

          {sequence.leadScore !== undefined && (
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#1C0D11] text-[#D6334A] border border-[#2C181B]">
              {sequence.leadScore}/100
            </span>
          )}
        </div>
      </div>

      {/* Sequence Step Tabs (Idea 1: All messages for this person grouped in 1 box) */}
      <div className="flex items-center border-b border-[#2C181B] bg-[#120709] px-4 sm:px-5 text-xs font-mono">
        {sequence.initialEmail && (
          <button
            type="button"
            onClick={() => setActiveStep("initial_email")}
            className={`py-2.5 px-3.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              activeStep === "initial_email"
                ? "border-[#D6334A] text-white font-bold bg-[#1A0C10]"
                : "border-transparent text-[#8A8175] hover:text-[#FAF7F2]"
            }`}
          >
            <Mail className="w-3 h-3 text-[#D6334A]" />
            <span>Step 1: Cold Email</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                sequence.initialEmail.status === "sent"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {sequence.initialEmail.status}
            </span>
          </button>
        )}

        {sequence.followUpEmail && (
          <button
            type="button"
            onClick={() => setActiveStep("follow_up")}
            className={`py-2.5 px-3.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              activeStep === "follow_up"
                ? "border-[#D6334A] text-white font-bold bg-[#1A0C10]"
                : "border-transparent text-[#8A8175] hover:text-[#FAF7F2]"
            }`}
          >
            <Clock className={`w-3 h-3 ${sequence.hasFollowUpDue ? "text-amber-400 animate-bounce" : "text-zinc-500"}`} />
            <span>Step 2: Follow-Up</span>
            {sequence.hasFollowUpDue ? (
              <span className="px-1.5 py-0.2 rounded text-[9px] uppercase bg-amber-500/30 text-amber-200 font-bold border border-amber-400/40">
                DUE NOW
              </span>
            ) : (
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                  sequence.followUpEmail.status === "sent"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {sequence.followUpEmail.status}
              </span>
            )}
          </button>
        )}

        {sequence.linkedinMessage && (
          <button
            type="button"
            onClick={() => setActiveStep("linkedin")}
            className={`py-2.5 px-3.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              activeStep === "linkedin"
                ? "border-[#D6334A] text-white font-bold bg-[#1A0C10]"
                : "border-transparent text-[#8A8175] hover:text-[#FAF7F2]"
            }`}
          >
            <Linkedin className="w-3 h-3 text-sky-400" />
            <span>LinkedIn Connect</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                sequence.linkedinMessage.status === "sent"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {sequence.linkedinMessage.status}
            </span>
          </button>
        )}
      </div>

      {/* Message Content & Preview */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {activeMsg ? (
          <>
            {/* Subject line for emails */}
            {activeMsg.subject && (
              <div className="p-2.5 rounded-xl bg-[#180A0E] border border-[#2C181B] text-xs font-mono text-white flex items-center justify-between gap-2">
                <div>
                  <strong className="text-[#D6334A]">Subject:</strong> {activeMsg.subject}
                </div>
                {activeStep === "follow_up" && (
                  <span className="text-[10px] text-amber-300 font-bold">
                    [Thread Reply]
                  </span>
                )}
              </div>
            )}

            {/* Message Body */}
            <div className="p-4 rounded-xl bg-[#160B0F] border border-[#2C181B] text-xs text-[#FAF7F2] whitespace-pre-wrap leading-relaxed font-sans select-text">
              {activeMsg.message_content}
            </div>

            {/* Sequence Status Hint */}
            <div className="text-[11px] font-mono text-[#8A8175] flex items-center justify-between">
              {activeStep === "initial_email" ? (
                <span>
                  💡 <strong>Recommendation:</strong> Send this initial email today. Once sent, the 4-day follow-up timer will start automatically.
                </span>
              ) : activeStep === "follow_up" ? (
                <span>
                  💡 <strong>Follow-up Strategy:</strong> {sequence.hasFollowUpDue ? "Over 4 days have passed without a reply. Send this bump now!" : `Scheduled for 4 days after Step 1 is delivered.`}
                </span>
              ) : (
                <span>
                  💡 <strong>LinkedIn Strategy:</strong> Short connection invite (under 300 chars). Safe to send on Day 1 alongside Email #1.
                </span>
              )}

              {activeMsg.sent_at && (
                <span className="text-zinc-500">
                  Sent: {new Date(activeMsg.sent_at).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2C181B]/60">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onCopyText(activeMsg.message_content, activeMsg.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C0D11] border border-[#2C181B] hover:border-[#D6334A]/50 text-xs font-mono text-[#B8AEA3] hover:text-white transition-colors cursor-pointer"
                >
                  {copiedId === activeMsg.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                {/* Option A: Direct Send Email via SMTP */}
                {activeMsg.channel === "email" && activeMsg.status !== "sent" && (
                  <button
                    type="button"
                    onClick={() => onDirectSendEmail(activeMsg.id)}
                    disabled={sendingEmailId === activeMsg.id}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {sendingEmailId === activeMsg.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {sendingEmailId === activeMsg.id
                        ? "Sending..."
                        : activeStep === "follow_up"
                        ? "Send Follow-Up via SMTP"
                        : "Send via SMTP (1-Click)"}
                    </span>
                  </button>
                )}

                {/* Option A: Launch on LinkedIn */}
                {activeMsg.channel === "linkedin" && (
                  <button
                    type="button"
                    onClick={() => onLaunchLinkedIn(activeMsg)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-sky-600/20 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch on LinkedIn</span>
                  </button>
                )}
              </div>

              {/* Status Toggles: Mark Sent / Mark Replied */}
              <div className="flex items-center gap-2">
                {activeMsg.status !== "sent" && activeMsg.status !== "replied" && (
                  <button
                    type="button"
                    onClick={() => onMarkSentOutreach(activeMsg.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C0D11] hover:bg-[#2C181B] text-[#B8AEA3] hover:text-white border border-[#2C181B] text-xs font-mono transition-all cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Mark as Sent</span>
                  </button>
                )}

                {activeMsg.status === "sent" && (
                  <button
                    type="button"
                    onClick={() => onMarkReplied(activeMsg.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-medium transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Client Replied!</span>
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-xs font-mono text-[#8A8175]">
            No message draft available for this step.
          </div>
        )}
      </div>
    </div>
  );
}
