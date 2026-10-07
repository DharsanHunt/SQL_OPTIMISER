import React, { useState } from 'react';
import { POSTGRES_COMPARISONS } from '../data/benchmarks';
import {
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  Terminal,
  Cpu,
  Layers,
  HardDrive,
  Copy,
  Check,
} from 'lucide-react';

export const PostgresComparePage: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const activeComp = POSTGRES_COMPARISONS[selectedIdx];

  const handleCopyExplain = () => {
    navigator.clipboard.writeText(activeComp.postgresExplain.rawExplainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto select-none font-sans">
      {/* Header */}
      <div className="border-b border-[#E5E3DC] pb-6">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
            EXTERNAL REFERENCE
          </span>
          <span className="text-xs text-[#8E95A5]">
            Cross-Validation against PostgreSQL 16 EXPLAIN (Section 6.2 & 10)
          </span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#181B1F] mt-1">
          PostgreSQL 16 Comparative Benchmark
        </h1>
        <p className="text-xs text-[#525866] mt-1">
          Side-by-side verification comparing our custom dynamic programming optimizer against production PostgreSQL 16 planning trees.
        </p>
      </div>

      {/* Prominent External Reference Disclaimer Badge */}
      <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC] text-xs text-[#525866] flex items-start space-x-3">
        <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#181B1F] uppercase font-mono tracking-wide">
            Independent Reference Notice (Academic Accuracy Rule):
          </span>
          <p className="leading-relaxed">
            PostgreSQL 16 is used exclusively as an external industry baseline. Both systems were fed identical relational schemas and SQL queries to validate join ordering decisions and physical operator choices.
          </p>
        </div>
      </div>

      {/* Query Selector Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#ECE8E0] pb-3 overflow-x-auto">
        {POSTGRES_COMPARISONS.map((comp, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIdx(idx)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              selectedIdx === idx
                ? 'bg-[#181B1F] border-[#181B1F] text-white shadow-sm'
                : 'bg-white border-[#E5E3DC] text-[#525866] hover:text-[#181B1F]'
            }`}
          >
            {comp.queryTitle}
          </button>
        ))}
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Our Custom DP Optimizer */}
        <div className="rounded-2xl bg-white border border-[#E5E3DC] p-6 space-y-4 shadow-card-subtle">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#181B1F]" />
              <h2 className="text-sm font-bold text-[#181B1F]">Our Cost-Based DP Optimizer</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              Exact Selinger DP
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0] space-y-1.5">
              <span className="text-[10px] text-[#8E95A5] uppercase font-semibold">Selected Join Order</span>
              <div className="text-emerald-800 font-semibold flex items-center space-x-1.5">
                {activeComp.optimizerPlan.joinOrder.map((t, i) => (
                  <React.Fragment key={t}>
                    <span>{t}</span>
                    {i < activeComp.optimizerPlan.joinOrder.length - 1 && (
                      <span className="text-[#8E95A5]">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0]">
                <span className="text-[10px] text-[#8E95A5]">Estimated Cost</span>
                <div className="text-base font-bold text-emerald-700 mt-0.5">
                  {activeComp.optimizerPlan.estimatedCost.toLocaleString()}
                </div>
                <span className="text-[9px] text-[#8E95A5]">Page transfers</span>
              </div>

              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0]">
                <span className="text-[10px] text-[#8E95A5]">Optimization Time</span>
                <div className="text-base font-bold text-[#181B1F] mt-0.5">
                  {activeComp.optimizerPlan.optimizationTimeMs} ms
                </div>
                <span className="text-[9px] text-[#8E95A5]">DP search</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0] space-y-1">
              <span className="text-[10px] text-[#8E95A5] uppercase font-semibold">Chosen Physical Operators</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeComp.optimizerPlan.joinMethods.map((m, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-white text-[#181B1F] border border-[#E5E3DC] text-[11px]"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: PostgreSQL 16 EXPLAIN */}
        <div className="rounded-2xl bg-white border border-[#E5E3DC] p-6 space-y-4 shadow-card-subtle">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-[#181B1F]">PostgreSQL 16 EXPLAIN</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-bold">
              External Reference
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0] space-y-1.5">
              <span className="text-[10px] text-[#8E95A5] uppercase font-semibold">PostgreSQL Join Order</span>
              <div className="text-purple-700 font-semibold flex items-center space-x-1.5">
                {activeComp.postgresExplain.joinOrder.map((t, i) => (
                  <React.Fragment key={t}>
                    <span>{t}</span>
                    {i < activeComp.postgresExplain.joinOrder.length - 1 && (
                      <span className="text-[#8E95A5]">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0]">
                <span className="text-[10px] text-[#8E95A5]">PostgreSQL Cost</span>
                <div className="text-base font-bold text-purple-700 mt-0.5">
                  {activeComp.postgresExplain.estimatedCost.toLocaleString()}
                </div>
                <span className="text-[9px] text-[#8E95A5]">seq_page_cost units</span>
              </div>

              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0]">
                <span className="text-[10px] text-[#8E95A5]">Planning Time</span>
                <div className="text-base font-bold text-[#181B1F] mt-0.5">
                  {activeComp.postgresExplain.planningTimeMs} ms
                </div>
                <span className="text-[9px] text-[#8E95A5]">pg_planner time</span>
              </div>
            </div>

            {/* Raw EXPLAIN Output Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-[#8E95A5] uppercase font-semibold">
                <span>Raw PostgreSQL 16 EXPLAIN Output</span>
                <button
                  onClick={handleCopyExplain}
                  className="hover:text-[#181B1F] flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0] font-mono text-[11px] text-[#181B1F] whitespace-pre overflow-x-auto max-h-40">
                {activeComp.postgresExplain.rawExplainText}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synthesis / Analysis Note */}
      <div className="rounded-2xl bg-white border border-[#E5E3DC] p-5 space-y-2 shadow-card-subtle">
        <h3 className="text-xs font-bold font-mono uppercase text-[#181B1F] flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Fidelity Analysis & Conclusion</span>
        </h3>
        <p className="text-xs text-[#525866] leading-relaxed font-mono">
          {activeComp.notes}
        </p>
      </div>
    </div>
  );
};
