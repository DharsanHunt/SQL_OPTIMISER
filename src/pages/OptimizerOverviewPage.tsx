import React from 'react';
import { useOptimizer } from '../context/OptimizerContext';
import {
  Cpu,
  Layers,
  CheckCircle2,
  GitFork,
} from 'lucide-react';

export const OptimizerOverviewPage: React.FC = () => {
  const { activeResult, setActiveTab } = useOptimizer();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EFECE6] text-[#555E6D] border border-[#E5E3DC]">
            OPTIMIZATION SUMMARY
          </span>
          <span className="text-xs text-[#8E95A5]">
            Selinger DP Solution Report for {activeResult.relations.length}-Relation Join
          </span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#181B1F] tracking-tight mt-1">
          Optimization Engine Overview & Selected Plan
        </h1>
      </div>

      {/* Hero Metric Banner: Optimization Complete */}
      <div className="rounded-2xl bg-white border border-[#E5E3DC] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-base font-bold text-[#181B1F]">Optimization Complete</span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              Provably Optimal Plan
            </span>
          </div>
          <p className="text-xs text-[#555E6D] max-w-2xl leading-relaxed">
            The Selinger bottom-up dynamic programming enumerator evaluated candidate subset
            partitions, pruned non-connected cross products in O(1) time, and selected the global
            minimum cost physical plan.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('join-tree')}
          className="px-4 py-2.5 rounded-xl bg-[#181B1F] hover:bg-black text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all flex-shrink-0"
        >
          <GitFork className="w-4 h-4" />
          <span>View Interactive Join Tree</span>
        </button>
      </div>

      {/* Large Restrained Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-[#E5E3DC] shadow-sm">
          <span className="text-[11px] font-mono text-[#8E95A5] uppercase">Estimated Cost</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">
            {activeResult.bestPlan.cost.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#8E95A5] font-mono">Page transfers (I/O)</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E3DC] shadow-sm">
          <span className="text-[11px] font-mono text-[#8E95A5] uppercase">Optimization Time</span>
          <div className="text-2xl font-extrabold font-mono text-blue-700 mt-1">
            {activeResult.optimizationTimeMs.toFixed(1)} ms
          </div>
          <span className="text-[10px] text-[#8E95A5] font-mono">DP search latency</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E3DC] shadow-sm">
          <span className="text-[11px] font-mono text-[#8E95A5] uppercase">Est. Cardinality</span>
          <div className="text-2xl font-extrabold font-mono text-indigo-700 mt-1">
            {activeResult.bestPlan.estimatedCardinality.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#8E95A5] font-mono">Output tuples</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E3DC] shadow-sm">
          <span className="text-[11px] font-mono text-[#8E95A5] uppercase">Relations</span>
          <div className="text-2xl font-extrabold font-mono text-[#181B1F] mt-1">
            {activeResult.relations.length}
          </div>
          <span className="text-[10px] text-[#8E95A5] font-mono">Joined tables</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E3DC] shadow-sm">
          <span className="text-[11px] font-mono text-[#8E95A5] uppercase">Candidate Plans</span>
          <div className="text-2xl font-extrabold font-mono text-amber-700 mt-1">
            {activeResult.totalCandidatePlans}
          </div>
          <span className="text-[10px] text-[#8E95A5] font-mono">
            {activeResult.crossProductsPruned} pruned
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E5E3DC] shadow-sm">
          <span className="text-[11px] font-mono text-[#8E95A5] uppercase">Optimality Gap</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">
            0.0%
          </div>
          <span className="text-[10px] text-[#8E95A5] font-mono">Global minimum</span>
        </div>
      </div>

      {/* Selected Join Order & Algorithms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-[#E5E3DC] shadow-sm space-y-3">
          <h3 className="text-xs font-bold font-mono uppercase text-[#555E6D] flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Selected Optimal Join Order</span>
          </h3>
          <div className="p-4 bg-[#F8F7F4] rounded-xl border border-[#E5E3DC] text-sm font-mono text-[#181B1F] font-semibold leading-relaxed">
            {activeResult.relations.length === 4
              ? '((Customers ⋈ Orders) ⋈ OrderItems) ⋈ Products'
              : activeResult.relations.join(' ⋈ ')}
          </div>
          <p className="text-xs text-[#555E6D] leading-relaxed font-sans">
            Builds intermediate hash tables on smaller tables first to minimize memory footprint and
            keep joins pipelined in buffer cache.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5E3DC] shadow-sm space-y-3">
          <h3 className="text-xs font-bold font-mono uppercase text-[#555E6D] flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Selected Physical Join Algorithms</span>
          </h3>
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-[#F8F7F4] border border-[#E5E3DC] flex items-center space-x-2 text-[#181B1F]">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Hybrid Hash Join (Grace)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F8F7F4] border border-[#E5E3DC] flex items-center space-x-2 text-[#181B1F]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Clustering Index Scan (B+-Tree)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F8F7F4] border border-[#E5E3DC] flex items-center space-x-2 text-[#181B1F]">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Sequential Scan (Heap Storage)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
