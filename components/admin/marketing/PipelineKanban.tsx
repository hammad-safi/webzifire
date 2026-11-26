"use client";

import React from "react";
import { CompanyRecord } from "@/lib/marketing/types";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface PipelineKanbanProps {
  companies: CompanyRecord[];
  onSelectCompany: (company: CompanyRecord) => void;
  onUpdateStatus: (companyId: string, newStatus: string) => Promise<void>;
}

const STAGES = [
  { id: "new", label: "New Leads", color: "border-zinc-500/30 text-zinc-400" },
  { id: "qualified", label: "Qualified", color: "border-amber-500/30 text-amber-400" },
  { id: "ready_outreach", label: "Ready Outreach", color: "border-sky-500/30 text-sky-400" },
  { id: "contacted", label: "Contacted", color: "border-purple-500/30 text-purple-400" },
  { id: "replied", label: "Replied", color: "border-rose-500/30 text-rose-400" },
  { id: "won", label: "Client Won", color: "border-emerald-500/30 text-emerald-400" }
];

export function PipelineKanban({
  companies,
  onSelectCompany,
  onUpdateStatus
}: PipelineKanbanProps) {
  const getStageCompanies = (stageId: string) => {
    return companies.filter((c) => (c.pipeline_stage || (c as any).lead_status || "qualified") === stageId);
  };

  const getNextStage = (currentStage: string) => {
    const idx = STAGES.findIndex((s) => s.id === currentStage);
    if (idx >= 0 && idx < STAGES.length - 1) {
      return STAGES[idx + 1].id;
    }
    return null;
  };

  const getPrevStage = (currentStage: string) => {
    const idx = STAGES.findIndex((s) => s.id === currentStage);
    if (idx > 0) {
      return STAGES[idx - 1].id;
    }
    return null;
  };

  const getPriorityBadge = (priority: string, score: number) => {
    if (priority === "Hot Lead" || priority === "hot" || score >= 85) {
      return "bg-rose-500/20 text-rose-300 border-rose-500/40";
    }
    if (priority === "High Priority" || priority === "high" || score >= 70) {
      return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    }
    if (priority === "Medium Priority" || priority === "medium" || score >= 50) {
      return "bg-sky-500/20 text-sky-300 border-sky-500/40";
    }
    return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageCompanies = getStageCompanies(stage.id);

        return (
          <div
            key={stage.id}
            className="flex flex-col bg-[#120709] border border-[#2C181B] rounded-2xl min-w-[240px] max-h-[800px]"
          >
            {/* Stage Header */}
            <div className="p-3.5 border-b border-[#2C181B] flex items-center justify-between">
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${stage.color}`}>
                {stage.label}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#1B0C10] border border-[#2C181B] text-[#B8AEA3]">
                {stageCompanies.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="p-3 space-y-3 overflow-y-auto flex-1">
              {stageCompanies.length === 0 ? (
                <div className="text-center py-8 text-[11px] font-mono text-[#8A8175]">
                  No prospects in {stage.label.toLowerCase()}
                </div>
              ) : (
                stageCompanies.map((c) => {
                  const currentStage = c.pipeline_stage || (c as any).lead_status || "qualified";
                  const prevStage = getPrevStage(currentStage);
                  const nextStage = getNextStage(currentStage);

                  return (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-[#180B0F] border border-[#2C181B] hover:border-[#D6334A]/50 transition-all shadow-md group flex flex-col justify-between gap-2.5"
                    >
                      <div
                        onClick={() => onSelectCompany(c)}
                        className="cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-[#F5EFE6] group-hover:text-white line-clamp-1">
                            {c.name}
                          </h4>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getPriorityBadge(
                              c.lead_priority,
                              c.lead_score
                            )}`}
                          >
                            {c.lead_score}
                          </span>
                        </div>

                        <p className="text-[10px] font-mono text-[#8A8175] truncate">
                          {c.domain}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-[#B8AEA3]">
                          {c.country && (
                            <span className="truncate">📍 {c.country}</span>
                          )}
                          {c.industry && (
                            <span className="truncate">🏢 {c.industry}</span>
                          )}
                        </div>
                      </div>

                      {/* Advance Stage Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#2C181B]/50 text-[10px] font-mono">
                        {prevStage ? (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(c.id, prevStage)}
                            className="p-1 rounded bg-[#120709] border border-[#2C181B] text-[#8A8175] hover:text-white cursor-pointer"
                            title="Move back"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        ) : (
                          <span />
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectCompany(c)}
                          className="text-[#D6334A] hover:underline cursor-pointer"
                        >
                          Details →
                        </button>

                        {nextStage ? (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(c.id, nextStage)}
                            className="p-1 rounded bg-[#120709] border border-[#2C181B] text-[#8A8175] hover:text-white hover:border-[#D6334A]/50 cursor-pointer"
                            title="Move forward"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
