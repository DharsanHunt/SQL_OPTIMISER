import React, { useState } from 'react';
import { useOptimizer } from '../context/OptimizerContext';
import {
  Network,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';

export const JoinGraphPage: React.FC = () => {
  const { activeResult, catalog } = useOptimizer();
  const [explainPruning, setExplainPruning] = useState<boolean>(true);
  const [selectedSplitIndex, setSelectedSplitIndex] = useState<number>(0);

  const exampleSplits = [
    {
      s1: ['Customers', 'Orders'],
      s2: ['OrderItems'],
      connected: true,
      predicate: 'OI.order_id = O.order_id',
      explanation: 'VALID: Direct join edge connects Orders in S1 to OrderItems in S2. Evaluated in DP level 3.',
    },
    {
      s1: ['Customers'],
      s2: ['Products'],
      connected: false,
      predicate: 'None (Disconnected)',
      explanation: 'PRUNED: Candidate split skipped because no join predicate connects {Customers} and {Products}. Avoids severe Cartesian cross product of 10,000 × 5,000 = 50,000,000 rows!',
    },
    {
      s1: ['Orders'],
      s2: ['Products'],
      connected: false,
      predicate: 'None (Disconnected)',
      explanation: 'PRUNED: No direct predicate between Orders and Products. (They only connect indirectly via OrderItems). DP skips this split outright.',
    },
    {
      s1: ['Customers', 'Orders', 'OrderItems'],
      s2: ['Products'],
      connected: true,
      predicate: 'OI.prod_id = P.prod_id',
      explanation: 'VALID: OrderItems in S1 connects directly to Products in S2 via prod_id. Evaluated in DP level 4.',
    },
  ];

  const currentSplit = exampleSplits[selectedSplitIndex];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#EFECE5] text-[#181B1F] font-semibold">
              JOIN TOPOLOGY
            </span>
            <span className="text-xs text-[#8E95A5]">
              {activeResult.relations.length} Nodes · {activeResult.predicates.length} Equi-Join Edges
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#181B1F] mt-1">
            Join Graph & Connectivity Pruning Engine
          </h1>
        </div>

        {/* Explain connectivity toggle */}
        <button
          onClick={() => setExplainPruning(!explainPruning)}
          className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center space-x-2 transition-all border ${
            explainPruning
              ? 'bg-[#181B1F] text-white shadow-sm'
              : 'bg-white hover:bg-[#FAF9F6] text-[#525866] border-[#E5E3DC]'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Explain Pruning: {explainPruning ? 'ACTIVE' : 'INACTIVE'}</span>
        </button>
      </div>

      {/* Main Grid: Topology Canvas + Pruning Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topology Graph Representation */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#E5E3DC] p-6 shadow-card-subtle flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
            <div className="flex items-center space-x-2">
              <Network className="w-4 h-4 text-[#181B1F]" />
              <h2 className="text-sm font-bold text-[#181B1F]">Relational Join Graph</h2>
            </div>
            <div className="flex items-center space-x-4 text-[11px] font-mono">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#181B1F]" />
                <span className="text-[#525866]">Base Relation</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-[#525866]">Equi-Join Edge</span>
              </span>
            </div>
          </div>

          {/* Visual Node Stack on warm canvas */}
          <div className="py-8 px-4 bg-[#F4F3EE] rounded-xl border border-[#E0DED7] flex flex-col items-center justify-center space-y-4">
            <div className="w-full max-w-md space-y-3">
              {activeResult.relations.map((rel, idx) => {
                const stats = catalog[rel];
                const isS1 = currentSplit.s1.includes(rel);
                const isS2 = currentSplit.s2.includes(rel);
                const isHighlighted = isS1 || isS2;

                return (
                  <div key={rel} className="flex flex-col items-center">
                    <div
                      className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between shadow-card-subtle ${
                        explainPruning && isS1
                          ? 'bg-white border-[#181B1F] ring-2 ring-[#181B1F]/30'
                          : explainPruning && isS2
                          ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-300/40'
                          : explainPruning && !isHighlighted
                          ? 'opacity-40 bg-white border-[#E5E3DC]'
                          : 'bg-white border-[#E5E3DC]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            isS1
                              ? 'bg-[#181B1F] text-white'
                              : isS2
                              ? 'bg-purple-800 text-white'
                              : 'bg-[#EFECE5] text-[#181B1F]'
                          }`}
                        >
                          {rel[0]}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#181B1F] flex items-center space-x-2">
                            <span>{rel}</span>
                            {explainPruning && isS1 && (
                              <span className="text-[10px] font-mono text-[#181B1F] bg-[#EFECE5] px-2 py-0.5 rounded font-semibold">
                                Subset S1
                              </span>
                            )}
                            {explainPruning && isS2 && (
                              <span className="text-[10px] font-mono text-purple-900 bg-purple-100 px-2 py-0.5 rounded font-semibold">
                                Subset S2
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-[#8E95A5]">
                            {stats ? `${stats.rows.toLocaleString()} rows · ${stats.blocks} blocks` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-[10px] font-mono text-[#8E95A5]">
                        PK: <code className="text-[#181B1F]">id</code>
                      </div>
                    </div>

                    {/* Edge between tables */}
                    {idx < activeResult.relations.length - 1 && (
                      <div className="flex flex-col items-center my-1.5 space-y-0.5">
                        <div className="w-[1.5px] h-3 bg-[#181B1F]" />
                        <div className="px-3 py-1 rounded-full bg-white border border-[#E5E3DC] text-[10px] font-mono text-[#181B1F] shadow-sm font-semibold">
                          {activeResult.predicates[idx]?.raw || 'Join Predicate'}
                        </div>
                        <div className="w-[1.5px] h-3 bg-[#181B1F]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graph Legend & Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[#525866] font-mono">
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E3DC] flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Connected Splits Allowed</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E3DC] flex items-center space-x-2">
              <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
              <span>Cartesian Splits Pruned</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E3DC] flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#181B1F] flex-shrink-0" />
              <span>Exact Selinger Recurrence</span>
            </div>
          </div>
        </div>

        {/* Right Pane: Pruning Simulator */}
        <div className="rounded-2xl bg-white border border-[#E5E3DC] p-6 space-y-4 shadow-card-subtle flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
              <h2 className="text-sm font-bold text-[#181B1F] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Pruning Simulator</span>
              </h2>
              <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Viva Focus
              </span>
            </div>

            <p className="text-xs text-[#525866] leading-relaxed">
              During Dynamic Programming level evaluation, the optimizer splits subset $S$ into
              disjoint $S_1$ and $S_2$. If no join predicate connects them, the split is pruned
              immediately.
            </p>

            {/* Split Candidate Selector */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#8E95A5] uppercase">
                Test Candidate Split:
              </span>
              <div className="space-y-2">
                {exampleSplits.map((split, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSplitIndex(i)}
                    className={`w-full p-3 rounded-xl text-left text-xs font-mono transition-all flex items-center justify-between border ${
                      selectedSplitIndex === i
                        ? 'bg-[#FAF9F6] border-[#181B1F] ring-1 ring-[#181B1F]'
                        : 'bg-white border-[#E5E3DC] text-[#525866] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <span className="font-semibold text-[#181B1F]">
                      {`{${split.s1.join(',')}} ⋈ {${split.s2.join(',')}}`}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        split.connected
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {split.connected ? 'Connected' : 'Pruned'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation box */}
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                currentSplit.connected
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-rose-50/50 border-rose-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                {currentSplit.connected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
                <span
                  className={`text-xs font-bold font-mono ${
                    currentSplit.connected ? 'text-emerald-900' : 'text-rose-900'
                  }`}
                >
                  {currentSplit.connected ? 'Candidate Retained' : 'Candidate Pruned'}
                </span>
              </div>
              <p className="text-xs text-[#181B1F] leading-relaxed font-sans">
                {currentSplit.explanation}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC] text-[11px] text-[#525866] flex items-start space-x-2">
            <Info className="w-3.5 h-3.5 text-[#8E95A5] flex-shrink-0 mt-0.5" />
            <p>
              In our project report (Section 4.6), evaluating Products before OrderItems causes an
              unintended Cartesian product costing <strong>~812,000 blocks</strong>. Connectivity
              pruning skips this split in $O(1)$ time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
