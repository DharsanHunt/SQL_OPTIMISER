import React from 'react';
import { useOptimizer } from '../context/OptimizerContext';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  GitFork,
} from 'lucide-react';

export const ComparisonPage: React.FC = () => {
  const { activeResult, setActiveTab } = useOptimizer();

  const naive = activeResult.naivePlan;
  const optimal = activeResult.bestPlan;

  const costDelta = naive.cost - optimal.cost;
  const factor = (naive.cost / Math.max(1, optimal.cost)).toFixed(1);

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto select-none font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
            HEAD-TO-HEAD EVALUATION
          </span>
          <span className="text-xs text-[#8E95A5]">
            Project Report Table 3 (Section 4.6 & 7.1)
          </span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#181B1F] mt-1">
          Plan Quality: Naive Left-Deep vs. Cost-Based DP Optimizer
        </h1>
      </div>

      {/* Hero Cost Difference Metric Banner */}
      <div className="rounded-2xl bg-white border border-[#E5E3DC] p-6 shadow-card-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-xs font-mono text-emerald-800 uppercase font-semibold">
            Demonstrated I/O Reduction
          </span>
          <div className="text-3xl font-extrabold text-[#181B1F] font-mono flex items-baseline space-x-2">
            <span>{factor}× Cheaper</span>
            <span className="text-xs text-[#8E95A5] font-sans font-normal">
              ({costDelta.toLocaleString()} page blocks saved)
            </span>
          </div>
          <p className="text-xs text-[#525866] max-w-xl leading-relaxed">
            The naive plan follows query text order, introducing a Cartesian product before OrderItems is joined. The Selinger DP engine prunes disconnected sub-trees to find the global optimum.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('join-tree')}
          className="px-4 py-2 rounded-full bg-[#181B1F] hover:bg-[#2A2E35] text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all flex-shrink-0"
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Inspect Selected Join Tree</span>
        </button>
      </div>

      {/* 3-Column Technology Evolution Battle: Naive vs Selinger vs AI-Augmented */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: Naive Plan */}
        <div className="rounded-2xl bg-white border border-rose-200 p-5 space-y-4 shadow-card-subtle relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <h2 className="text-sm font-bold text-[#181B1F]">1. Naive Left-Deep</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-rose-50 text-rose-700 border border-rose-200 uppercase font-bold">
                Text Order
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC]">
                <span className="text-[9px] text-[#8E95A5]">Estimated Cost</span>
                <div className="text-lg font-bold text-rose-600 mt-0.5">
                  {naive.cost.toLocaleString()}
                </div>
                <span className="text-[9px] text-[#8E95A5]">blocks transferred</span>
              </div>

              <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC]">
                <span className="text-[9px] text-[#8E95A5]">Cross Products</span>
                <div className="text-lg font-bold text-amber-600 mt-0.5">
                  1 (Forced)
                </div>
                <span className="text-[9px] text-[#8E95A5]">Cartesian product</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold font-mono text-[#525866] uppercase">
                Join Sequence:
              </span>
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC] space-y-1.5 text-[11px] font-mono">
                <div className="text-[#181B1F]">1. Orders (400 blks)</div>
                <div className="text-[#525866] pl-2 border-l border-[#E5E3DC]">⋈ Customers [cust_id]</div>
                <div className="text-rose-700 pl-2 border-l border-rose-300 bg-rose-50/70 p-1.5 rounded">
                  × Products (FORCED CROSS PRODUCT)
                </div>
                <div className="text-[#525866] pl-2 border-l border-[#E5E3DC]">⋈ OrderItems (2k blks)</div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#8E95A5] leading-relaxed pt-2 border-t border-[#ECE8E0]">
            Suffers an intermediate Cartesian explosion of 50M rows before filtering.
          </p>
        </div>

        {/* Column 2: Classical Cost-Based DP Plan */}
        <div className="rounded-2xl bg-white border border-emerald-300 p-5 space-y-4 shadow-card-subtle relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-[#181B1F]">2. Selinger DP (1979)</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase font-bold">
                Classical Optimal
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC]">
                <span className="text-[9px] text-[#8E95A5]">Estimated Cost</span>
                <div className="text-lg font-bold text-emerald-700 mt-0.5">
                  {optimal.cost.toLocaleString()}
                </div>
                <span className="text-[9px] text-[#8E95A5]">54.5× I/O reduction</span>
              </div>

              <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC]">
                <span className="text-[9px] text-[#8E95A5]">Search Complexity</span>
                <div className="text-lg font-bold text-[#181B1F] mt-0.5">
                  O(3ⁿ)
                </div>
                <span className="text-[9px] text-[#8E95A5]">Subset dynamic prog</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold font-mono text-[#525866] uppercase">
                Join Sequence:
              </span>
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC] space-y-1.5 text-[11px] font-mono">
                <div className="text-[#181B1F]">1. Customers (50 blks) [Build]</div>
                <div className="text-emerald-800 pl-2 border-l border-emerald-300">⋈ Orders [Hash Join]</div>
                <div className="text-emerald-800 pl-2 border-l border-emerald-300">⋈ OrderItems [Hash Join]</div>
                <div className="text-emerald-800 pl-2 border-l border-emerald-300 bg-emerald-50/70 p-1.5 rounded">
                  ⋈ Products [Index Scan Probe]
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#8E95A5] leading-relaxed pt-2 border-t border-[#ECE8E0]">
            Proves textbook optimality, but assumes 1D independence (AVI) and struggles past 8 tables.
          </p>
        </div>

        {/* Column 3: AI-Augmented Engine */}
        <div className="rounded-2xl bg-white border border-purple-300 p-5 space-y-4 shadow-card-subtle relative overflow-hidden flex flex-col justify-between ring-1 ring-purple-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-purple-600 flex items-center justify-center text-white text-[9px] font-bold">
                  AI
                </div>
                <h2 className="text-sm font-bold text-[#181B1F]">3. AI-Augmented (2026)</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-purple-50 text-purple-800 border border-purple-200 uppercase font-bold">
                MSCN + ReJOIN
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC]">
                <span className="text-[9px] text-[#8E95A5]">Cardinality q-Error</span>
                <div className="text-lg font-bold text-purple-700 mt-0.5">
                  1.12×
                </div>
                <span className="text-[9px] text-purple-600">vs 18.4× Histograms</span>
              </div>

              <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC]">
                <span className="text-[9px] text-[#8E95A5]">Search Complexity</span>
                <div className="text-lg font-bold text-purple-700 mt-0.5">
                  O(n²)
                </div>
                <span className="text-[9px] text-purple-600">Deep RL trajectory</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold font-mono text-[#525866] uppercase">
                AI Innovations:
              </span>
              <div className="p-3 bg-purple-50/30 rounded-xl border border-purple-100 space-y-2 text-[11px]">
                <div className="flex items-center space-x-1.5 text-purple-900 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span>Learned Multi-Set Network (MSCN)</span>
                </div>
                <p className="text-[10px] text-[#525866] pl-5 leading-tight">
                  Eliminates the Attribute Value Independence flaw for correlated predicates.
                </p>

                <div className="flex items-center space-x-1.5 text-purple-900 font-semibold pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span>Deep RL Join Agent (ReJOIN)</span>
                </div>
                <p className="text-[10px] text-[#525866] pl-5 leading-tight">
                  Bypasses the O(3ⁿ) combinatorial state explosion using action-masked MDP.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#ECE8E0]">
            <button
              onClick={() => setActiveTab('ai-optimizer')}
              className="w-full py-2 rounded-xl bg-[#181B1F] hover:bg-[#2A2E35] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
            >
              <span>Explore AI Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
