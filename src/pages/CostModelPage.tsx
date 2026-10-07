import React, { useState } from 'react';
import {
  calculateSeqScanCost,
  calculateIndexScanCost,
  calculateBNLCost,
  calculateINLJCost,
  calculateHashJoinCost,
  estimateJoinCardinality,
} from '../lib/costModel';
import { Calculator, HardDrive, Cpu, Layers, Sparkles, RefreshCw } from 'lucide-react';

export const CostModelPage: React.FC = () => {
  // Interactive Calculator Sandbox State
  const [rowsR, setRowsR] = useState<number>(100000);
  const [blocksR, setBlocksR] = useState<number>(400);
  const [rowsS, setRowsS] = useState<number>(10000);
  const [blocksS, setBlocksS] = useState<number>(50);
  const [distinctR, setDistinctR] = useState<number>(10000);
  const [distinctS, setDistinctS] = useState<number>(10000);
  const [buffersM, setBuffersM] = useState<number>(50);
  const [joinType, setJoinType] = useState<'hash' | 'bnl' | 'inlj'>('hash');

  // Dynamic calculations
  const hashCost = calculateHashJoinCost(blocksR, blocksS, rowsR, rowsS);
  const bnlCost = calculateBNLCost(blocksR, blocksS, rowsR, rowsS, buffersM);
  const inljCost = calculateINLJCost(blocksR, rowsR, blocksS, 2, 1 / Math.max(1, distinctS));
  const estimatedCard = estimateJoinCardinality(rowsR, rowsS, distinctR, distinctS);

  const activeCostResult =
    joinType === 'hash' ? hashCost : joinType === 'bnl' ? bnlCost : inljCost;

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto select-none font-sans">
      {/* Header */}
      <div className="border-b border-[#E5E3DC] pb-6">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
            SYSTEM R COST METRICS
          </span>
          <span className="text-xs text-[#8E95A5]">Page Transfers (I/O) + CPU Accounting</span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#181B1F] mt-1">
          Cost Model Formulas & Interactive Sandbox
        </h1>
        <p className="text-xs text-[#525866] mt-1">
          Reference textbook formulas for physical operator evaluation, combined with a live parametric sandbox.
        </p>
      </div>

      {/* Standard Formulas Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Seq Scan */}
        <div className="rounded-2xl bg-white border border-[#E5E3DC] p-5 space-y-3 shadow-card-subtle">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
            <h3 className="text-xs font-bold text-[#181B1F]">Sequential Scan</h3>
            <span className="text-[10px] font-mono text-[#8E95A5] bg-[#FAF9F6] border border-[#E5E3DC] px-2 py-0.5 rounded">
              Access Path
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECE8E0] font-mono text-xs text-emerald-800 font-semibold">
            Cost = B(R)
          </div>
          <p className="text-[11px] text-[#525866] leading-relaxed">
            Reads every page block of relation R once from storage into buffer frames.
          </p>
        </div>

        {/* Index Scan */}
        <div className="rounded-2xl bg-white border border-[#E5E3DC] p-5 space-y-3 shadow-card-subtle">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
            <h3 className="text-xs font-bold text-[#181B1F]">Clustering Index Scan</h3>
            <span className="text-[10px] font-mono text-[#8E95A5] bg-[#FAF9F6] border border-[#E5E3DC] px-2 py-0.5 rounded">
              B+-Tree
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECE8E0] font-mono text-xs text-emerald-800 font-semibold">
            Cost = HT_i(a) + ⌈sel(a) × B(R)⌉
          </div>
          <p className="text-[11px] text-[#525866] leading-relaxed">
            Traverses tree height HT_i, then reads matching fraction of contiguous leaf blocks.
          </p>
        </div>

        {/* Hash Join */}
        <div className="rounded-2xl bg-white border border-[#E5E3DC] p-5 space-y-3 shadow-card-subtle">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
            <h3 className="text-xs font-bold text-[#181B1F]">Grace / Hybrid Hash Join</h3>
            <span className="text-[10px] font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
              Equi-Join
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECE8E0] font-mono text-xs text-purple-800 font-semibold">
            Cost = 3 × (B(R) + B(S))
          </div>
          <p className="text-[11px] text-[#525866] leading-relaxed">
            2-pass partition and probe phase assuming each partition fits in memory buffers.
          </p>
        </div>

        {/* Block Nested Loop */}
        <div className="rounded-2xl bg-white border border-[#E5E3DC] p-5 space-y-3 shadow-card-subtle">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
            <h3 className="text-xs font-bold text-[#181B1F]">Block Nested-Loop Join</h3>
            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              M-2 Chunks
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECE8E0] font-mono text-xs text-amber-800 font-semibold">
            Cost = B(R) + ⌈B(R)/(M−2)⌉ × B(S)
          </div>
          <p className="text-[11px] text-[#525866] leading-relaxed">
            Reads outer relation in chunks of M-2 pages; scans inner relation S per chunk.
          </p>
        </div>

        {/* Index Nested Loop */}
        <div className="rounded-2xl bg-white border border-[#E5E3DC] p-5 space-y-3 shadow-card-subtle">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
            <h3 className="text-xs font-bold text-[#181B1F]">Index Nested-Loop Join</h3>
            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              Inner Index
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECE8E0] font-mono text-xs text-indigo-800 font-semibold">
            Cost = B(R) + |R| × (HT_i + sel × B(S))
          </div>
          <p className="text-[11px] text-[#525866] leading-relaxed">
            For each tuple in outer R, performs an index lookup into inner S. Highly efficient when |R| is small.
          </p>
        </div>

        {/* Join Cardinality */}
        <div className="rounded-2xl bg-white border border-[#E5E3DC] p-5 space-y-3 shadow-card-subtle">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
            <h3 className="text-xs font-bold text-[#181B1F]">Join Cardinality Estimation</h3>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Containment
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#ECE8E0] font-mono text-xs text-emerald-800 font-semibold">
            |R ⋈ S| ≈ (|R| × |S|) / max(V(a,R), V(b,S))
          </div>
          <p className="text-[11px] text-[#525866] leading-relaxed">
            Classical containment assumption used in System R, PostgreSQL, and MySQL optimizers.
          </p>
        </div>
      </div>

      {/* Interactive Sandbox Calculator */}
      <div className="rounded-2xl bg-white border border-[#E5E3DC] p-6 space-y-6 shadow-card-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-[#181B1F]" />
            <h2 className="text-base font-bold text-[#181B1F]">Live Cost Model Calculator Sandbox</h2>
          </div>
          <button
            onClick={() => {
              setRowsR(100000);
              setBlocksR(400);
              setRowsS(10000);
              setBlocksS(50);
              setBuffersM(50);
              setDistinctR(10000);
              setDistinctS(10000);
            }}
            className="text-xs text-[#8E95A5] hover:text-[#181B1F] flex items-center space-x-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Relation R Inputs */}
          <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0] space-y-3">
            <span className="text-xs font-bold font-mono text-[#181B1F] uppercase">
              Outer Relation (R)
            </span>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[#525866]">Rows |R|:</label>
                <input
                  type="number"
                  value={rowsR}
                  onChange={(e) => setRowsR(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-[#E5E3DC] rounded-lg px-2.5 py-1.5 text-[#181B1F] font-mono text-xs focus:outline-none focus:border-[#181B1F]"
                />
              </div>
              <div>
                <label className="text-[#525866]">Blocks B(R):</label>
                <input
                  type="number"
                  value={blocksR}
                  onChange={(e) => setBlocksR(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-[#E5E3DC] rounded-lg px-2.5 py-1.5 text-[#181B1F] font-mono text-xs focus:outline-none focus:border-[#181B1F]"
                />
              </div>
              <div>
                <label className="text-[#525866]">Distinct Values V(a, R):</label>
                <input
                  type="number"
                  value={distinctR}
                  onChange={(e) => setDistinctR(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-[#E5E3DC] rounded-lg px-2.5 py-1.5 text-[#181B1F] font-mono text-xs focus:outline-none focus:border-[#181B1F]"
                />
              </div>
            </div>
          </div>

          {/* Relation S Inputs */}
          <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0] space-y-3">
            <span className="text-xs font-bold font-mono text-purple-700 uppercase">
              Inner Relation (S)
            </span>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[#525866]">Rows |S|:</label>
                <input
                  type="number"
                  value={rowsS}
                  onChange={(e) => setRowsS(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-[#E5E3DC] rounded-lg px-2.5 py-1.5 text-[#181B1F] font-mono text-xs focus:outline-none focus:border-[#181B1F]"
                />
              </div>
              <div>
                <label className="text-[#525866]">Blocks B(S):</label>
                <input
                  type="number"
                  value={blocksS}
                  onChange={(e) => setBlocksS(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-[#E5E3DC] rounded-lg px-2.5 py-1.5 text-[#181B1F] font-mono text-xs focus:outline-none focus:border-[#181B1F]"
                />
              </div>
              <div>
                <label className="text-[#525866]">Distinct Values V(b, S):</label>
                <input
                  type="number"
                  value={distinctS}
                  onChange={(e) => setDistinctS(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-[#E5E3DC] rounded-lg px-2.5 py-1.5 text-[#181B1F] font-mono text-xs focus:outline-none focus:border-[#181B1F]"
                />
              </div>
            </div>
          </div>

          {/* Execution Environment & Operator Selector */}
          <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0] space-y-3">
            <span className="text-xs font-bold font-mono text-emerald-800 uppercase">
              Operator & Buffers
            </span>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[#525866]">Memory Buffers (M pages):</label>
                <input
                  type="number"
                  value={buffersM}
                  onChange={(e) => setBuffersM(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-[#E5E3DC] rounded-lg px-2.5 py-1.5 text-[#181B1F] font-mono text-xs focus:outline-none focus:border-[#181B1F]"
                />
              </div>
              <div>
                <label className="text-[#525866]">Select Join Algorithm:</label>
                <select
                  value={joinType}
                  onChange={(e) => setJoinType(e.target.value as any)}
                  className="w-full mt-1 bg-white border border-[#E5E3DC] rounded-lg px-2.5 py-1.5 text-[#181B1F] font-sans text-xs focus:outline-none focus:border-[#181B1F]"
                >
                  <option value="hash">Hybrid Hash Join (Grace)</option>
                  <option value="bnl">Block Nested-Loop (BNL)</option>
                  <option value="inlj">Index Nested-Loop (INLJ)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Calculated Results Output Banner */}
        <div className="p-5 rounded-xl bg-[#FAF9F6] border border-[#E5E3DC] grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-[11px] font-mono text-[#8E95A5] uppercase">Active Formula</span>
            <div className="text-xs font-mono text-[#181B1F] font-bold mt-1">
              {activeCostResult.formula}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono text-[#8E95A5] uppercase">Estimated Total Cost</span>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-0.5">
              {activeCostResult.totalCost.toLocaleString()}
              <span className="text-xs text-[#8E95A5] ml-1.5 font-normal">blocks (I/O)</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono text-[#8E95A5] uppercase">Estimated Cardinality</span>
            <div className="text-2xl font-bold font-mono text-purple-700 mt-0.5">
              {estimatedCard.toLocaleString()}
              <span className="text-xs text-[#8E95A5] ml-1.5 font-normal">tuples</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
