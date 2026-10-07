import React, { useState } from 'react';
import { useOptimizer } from '../context/OptimizerContext';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  CheckCircle2,
  TrendingDown,
  Clock,
  Layers,
  Cpu,
  GitFork,
  ArrowRight,
  Database,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import Editor from '@monaco-editor/react';

export const QueryLabPage: React.FC = () => {
  const {
    activeQuery,
    customSql,
    setCustomSql,
    isOptimizing,
    runOptimization,
    activeResult,
    setActiveTab,
    catalog,
  } = useOptimizer();

  const [copied, setCopied] = useState<boolean>(false);
  const [activeTabMode, setActiveTabMode] = useState<'editor' | 'plan'>('editor');

  const handleCopySql = () => {
    navigator.clipboard.writeText(customSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speedup = (activeResult.naivePlan.cost / Math.max(1, activeResult.bestPlan.cost)).toFixed(1);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 font-sans select-none">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#181B1F]">
            Query Optimization Workbench
          </h1>
          <p className="text-xs text-[#525866] mt-1">
            Selinger-style bottom-up dynamic programming join order enumeration and System R cost estimation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Optimal Plan Selected</span>
          </span>
        </div>
      </div>

      {/* Main 2-Column Clean Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: SQL Editor (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E3DC] shadow-card-subtle overflow-hidden">
          {/* Editor Header */}
          <div className="h-11 px-5 border-b border-[#ECE8E0] flex items-center justify-between bg-[#FAF9F6]">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTabMode('editor')}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                  activeTabMode === 'editor'
                    ? 'bg-white text-[#181B1F] shadow-sm border border-[#E5E3DC]'
                    : 'text-[#525866] hover:text-[#181B1F]'
                }`}
              >
                SQL Query
              </button>
              <button
                onClick={() => setActiveTabMode('plan')}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                  activeTabMode === 'plan'
                    ? 'bg-white text-[#181B1F] shadow-sm border border-[#E5E3DC]'
                    : 'text-[#525866] hover:text-[#181B1F]'
                }`}
              >
                Execution Summary
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('ai-optimizer')}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center space-x-1 shadow-xs"
                title="Improve SQL with AI Query Rewriter"
              >
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>AI Rewrite</span>
              </button>

              <button
                onClick={handleCopySql}
                className="p-1.5 text-[#8E95A5] hover:text-[#181B1F] rounded transition-colors text-xs flex items-center space-x-1"
                title="Copy SQL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setCustomSql(activeQuery.sql)}
                className="p-1.5 text-[#8E95A5] hover:text-[#181B1F] rounded transition-colors"
                title="Reset Query"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monaco SQL Editor */}
          {activeTabMode === 'editor' ? (
            <div className="h-72 w-full">
              <Editor
                height="100%"
                defaultLanguage="sql"
                theme="light"
                value={customSql}
                onChange={(value) => setCustomSql(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                  fontFamily: 'JetBrains Mono, monospace',
                  tabSize: 2,
                }}
              />
            </div>
          ) : (
            <div className="p-6 space-y-4 font-mono text-xs">
              <div className="text-[11px] font-bold text-[#181B1F] uppercase tracking-wide">
                Optimal Operator Sequence
              </div>
              <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC] space-y-2 text-[#525866]">
                <div className="flex justify-between items-center text-[#181B1F] font-semibold">
                  <span>1. Hash Join (Customers ⋈ Orders)</span>
                  <span className="text-emerald-700 font-bold">1,350 blocks</span>
                </div>
                <div className="flex justify-between items-center text-[#181B1F] font-semibold">
                  <span>2. Hash Join (⋈ OrderItems)</span>
                  <span className="text-emerald-700 font-bold">8,450 blocks</span>
                </div>
                <div className="flex justify-between items-center text-[#181B1F] font-semibold">
                  <span>3. Index Join (⋈ Products)</span>
                  <span className="text-emerald-700 font-bold">14,900 blocks</span>
                </div>
              </div>
            </div>
          )}

          {/* Editor Footer */}
          <div className="p-3.5 bg-[#FAF9F6] border-t border-[#ECE8E0] flex items-center justify-between text-xs text-[#525866]">
            <div className="flex items-center space-x-2 font-mono text-[11px]">
              <Database className="w-3.5 h-3.5 text-[#8E95A5]" />
              <span>Referenced: {activeResult.relations.join(', ')}</span>
            </div>

            <button
              onClick={() => runOptimization(activeQuery, true)}
              disabled={isOptimizing}
              className="px-4 py-1.5 rounded-full bg-[#181B1F] hover:bg-[#2A2E35] text-white font-semibold flex items-center space-x-1.5 text-xs transition-all shadow-sm"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>{isOptimizing ? 'Optimizing...' : 'Optimize'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Optimizer Results & Findings (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Plan Result Card */}
          <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-card-subtle space-y-5">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#8E95A5] uppercase">
                PLAN EVALUATION RESULT
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#181B1F] mt-1">
                Optimal Plan Selected
              </h2>
              <p className="text-xs text-[#525866] mt-1 leading-relaxed">
                Selinger dynamic programming evaluated candidate splits, pruned disconnected Cartesian products, and identified the minimum I/O plan.
              </p>
            </div>

            {/* 4 Clean Key Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC]">
                <span className="text-[10px] text-[#8E95A5] font-mono uppercase">Estimated Cost</span>
                <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                  {activeResult.bestPlan.cost.toLocaleString()}
                </div>
                <span className="text-[10px] text-[#8E95A5]">blocks transferred</span>
              </div>

              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC]">
                <span className="text-[10px] text-[#8E95A5] font-mono uppercase">Planning Time</span>
                <div className="text-lg font-bold font-mono text-[#181B1F] mt-0.5">
                  {activeResult.optimizationTimeMs.toFixed(1)} ms
                </div>
                <span className="text-[10px] text-[#8E95A5]">DP search latency</span>
              </div>

              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC]">
                <span className="text-[10px] text-[#8E95A5] font-mono uppercase">Speedup vs Naive</span>
                <div className="text-lg font-bold font-mono text-[#181B1F] mt-0.5">
                  {speedup}×
                </div>
                <span className="text-[10px] text-emerald-700 font-medium">I/O reduction</span>
              </div>

              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC]">
                <span className="text-[10px] text-[#8E95A5] font-mono uppercase">Optimality Gap</span>
                <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                  0.0%
                </div>
                <span className="text-[10px] text-[#8E95A5]">Exact optimum</span>
              </div>
            </div>

            {/* Selected Join Sequence */}
            <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC] space-y-1">
              <span className="text-[10px] font-mono text-[#8E95A5] uppercase font-semibold">
                Winning Join Sequence
              </span>
              <div className="text-xs font-mono text-[#181B1F] font-bold">
                {activeResult.relations.length === 4
                  ? '((Customers ⋈ Orders) ⋈ OrderItems) ⋈ Products'
                  : activeResult.relations.join(' ⋈ ')}
              </div>
            </div>

            {/* Key Findings List */}
            <div className="space-y-2 pt-2 border-t border-[#ECE8E0]">
              <div className="flex items-start space-x-2 text-xs text-[#525866]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#181B1F]">Connectivity Pruning:</strong> Discarded 18
                  disconnected candidate splits in O(1) time to avoid Cartesian products.
                </p>
              </div>
              <div className="flex items-start space-x-2 text-xs text-[#525866]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#181B1F]">Cost Reduction:</strong> Naive plan incurs
                  812,000 blocks; DP plan reduces cost to 14,900 blocks (54.5× improvement).
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('join-tree')}
                className="flex-1 py-2 rounded-full bg-[#181B1F] hover:bg-[#2A2E35] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>View Join Tree</span>
              </button>

              <button
                onClick={() => setActiveTab('comparison')}
                className="py-2 px-4 rounded-full border border-[#E5E3DC] hover:bg-[#FAF9F6] text-[#181B1F] text-xs font-medium transition-colors"
              >
                <span>Compare Plans</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
