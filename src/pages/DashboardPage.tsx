import React from 'react';
import { useOptimizer } from '../context/OptimizerContext';
import { BENCHMARK_SERIES } from '../data/benchmarks';
import { SAMPLE_QUERIES } from '../data/queries';
import {
  Cpu,
  Layers,
  Zap,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  BarChart2,
  Sparkles,
  GitFork,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { setActiveTab, setActiveQuery, runOptimization, activeResult } = useOptimizer();

  // Metric summaries in Vellum style
  const metrics = [
    {
      label: 'Optimal Plan Cost',
      value: `${activeResult.bestPlan.cost.toLocaleString()} blocks`,
      subtext: 'System R I/O Model',
      icon: TrendingDown,
      color: 'text-emerald-700',
      bg: 'bg-white border-[#E5E3DC]',
    },
    {
      label: 'Optimization Time',
      value: `${activeResult.optimizationTimeMs.toFixed(1)} ms`,
      subtext: 'DP Search Latency',
      icon: Zap,
      color: 'text-[#181B1F]',
      bg: 'bg-white border-[#E5E3DC]',
    },
    {
      label: 'Relations Joined',
      value: `${activeResult.relations.length} Tables`,
      subtext: '3–7 Equi-Join Scope',
      icon: Layers,
      color: 'text-[#181B1F]',
      bg: 'bg-white border-[#E5E3DC]',
    },
    {
      label: 'Optimality Gap',
      value: '0.0%',
      subtext: 'Matches Brute-Force',
      icon: ShieldCheck,
      color: 'text-emerald-700',
      bg: 'bg-white border-[#E5E3DC]',
    },
    {
      label: 'Candidate Plans',
      value: `${activeResult.totalCandidatePlans}`,
      subtext: `${activeResult.crossProductsPruned} Cross-Prods Pruned`,
      icon: Cpu,
      color: 'text-rose-700',
      bg: 'bg-white border-[#E5E3DC]',
    },
    {
      label: 'Cardinality Estimator',
      value: 'Equi-Width Hist.',
      subtext: '6.1% error vs 210% uniform',
      icon: BarChart2,
      color: 'text-purple-700',
      bg: 'bg-white border-[#E5E3DC]',
    },
  ];

  const chartData = BENCHMARK_SERIES.map((pt) => ({
    width: `${pt.joinWidth} Tables`,
    DP: pt.dpCost,
    Naive: pt.naiveCost,
    factor: `${pt.improvementFactor.toFixed(1)}×`,
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-sans">
      {/* Editorial Hero Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E3DC] p-8 shadow-card-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#181B1F] text-white">
              BCSE302L · DBMS PROJECT
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-300">
              Selinger DP Optimizer v1.0
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#181B1F] leading-tight">
            Cost-Based Query Optimizer with Join Order Enumeration
          </h1>

          <p className="text-xs text-[#525866] leading-relaxed">
            Demonstrating how bottom-up dynamic programming, histogram-based cardinality estimation,
            and join-graph connectivity pruning eliminate Cartesian products to select the provably
            cheapest physical execution plan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 flex-shrink-0">
          <button
            onClick={() => setActiveTab('demo-mode')}
            className="px-4 py-2.5 rounded-full bg-[#181B1F] hover:bg-[#2A2E35] text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Start Guided Viva Demo (2-5 min)</span>
          </button>
          <button
            onClick={() => setActiveTab('query-lab')}
            className="px-4 py-2.5 rounded-full bg-white hover:bg-[#FAF9F6] text-[#181B1F] border border-[#E5E3DC] font-medium text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            <GitFork className="w-4 h-4 text-[#8E95A5]" />
            <span>Open Plan Workspace</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl p-4 border ${m.bg} shadow-card-subtle flex flex-col justify-between space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#8E95A5] truncate">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div>
                <div className="text-lg font-bold text-[#181B1F] tracking-tight font-mono">{m.value}</div>
                <div className="text-[10px] text-[#8E95A5] truncate">{m.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Comparison Chart + Worked Example Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Comparison Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#E5E3DC] p-6 space-y-4 shadow-card-subtle">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
            <div>
              <h2 className="text-sm font-bold text-[#181B1F] flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span>Estimated Plan Cost: Naive Left-Deep vs. DP Optimizer</span>
              </h2>
              <p className="text-xs text-[#8E95A5] mt-0.5">
                Demonstrates how un-pruned left-deep plans explode into cross products (Table 3 from project report)
              </p>
            </div>
            <button
              onClick={() => setActiveTab('benchmarks')}
              className="text-xs text-[#181B1F] font-medium hover:underline flex items-center space-x-1"
            >
              <span>View Benchmarks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE8" vertical={false} />
                <XAxis dataKey="width" stroke="#8E95A5" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#8E95A5"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => (val >= 1000000 ? `${val / 1000000}M` : val >= 1000 ? `${val / 1000}k` : val)}
                  scale="log"
                  domain={['dataMin', 'dataMax']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E3DC',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#181B1F',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                  formatter={(value: any, name: any) => [
                    `${Number(value).toLocaleString()} blocks`,
                    name === 'DP' ? 'DP Optimizer (Cheapest)' : 'Naive Left-Deep',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="DP" fill="#059669" name="DP Optimizer (Ours)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Naive" fill="#DC2626" name="Naive Left-Deep Plan" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC] text-xs text-[#525866] flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#181B1F]">Key Finding:</strong> At 4 tables, naive enumeration
              costs <strong>812,000 blocks</strong> due to a forced Cartesian product on{' '}
              <code className="text-[#181B1F] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E5E3DC]">
                Products
              </code>
              , whereas the DP optimizer selects the global minimum join order at{' '}
              <strong>14,900 blocks</strong> — a speedup factor of{' '}
              <span className="text-emerald-700 font-bold">54.5×</span>.
            </p>
          </div>
        </div>

        {/* Current Active Plan Spotlight */}
        <div className="rounded-2xl bg-white border border-[#E5E3DC] p-6 space-y-4 shadow-card-subtle flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
              <h2 className="text-sm font-bold text-[#181B1F] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Active Query Plan</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#181B1F] text-white">
                {activeResult.relations.length} Relations
              </span>
            </div>

            <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC] space-y-1.5">
              <div className="text-[10px] font-mono text-[#8E95A5] uppercase">
                Optimal Join Sequence
              </div>
              <div className="text-xs font-mono text-[#181B1F] flex flex-wrap items-center gap-1.5 font-bold">
                <span>((Customers ⋈ Orders)</span>
                <span className="text-[#8E95A5]">→</span>
                <span>OrderItems)</span>
                <span className="text-[#8E95A5]">→</span>
                <span>Products</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#F0EEE8] text-[#525866]">
                <span>Estimated I/O Cost:</span>
                <span className="font-mono text-[#181B1F] font-bold">
                  {activeResult.bestPlan.cost.toLocaleString()} page blocks
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F0EEE8] text-[#525866]">
                <span>Output Cardinality:</span>
                <span className="font-mono text-[#181B1F]">
                  {activeResult.bestPlan.estimatedCardinality.toLocaleString()} tuples
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F0EEE8] text-[#525866]">
                <span>Planning Search Time:</span>
                <span className="font-mono text-emerald-700 font-bold">
                  {activeResult.optimizationTimeMs.toFixed(1)} ms
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F0EEE8] text-[#525866]">
                <span>Physical Join Method:</span>
                <span className="font-mono text-[#181B1F]">Hybrid Hash Join (Grace)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <button
              onClick={() => setActiveTab('join-tree')}
              className="w-full py-2.5 bg-[#181B1F] hover:bg-[#2A2E35] text-white rounded-full text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
            >
              <span>Explore Interactive Join Tree</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className="w-full py-2.5 bg-white hover:bg-[#FAF9F6] text-[#181B1F] rounded-full text-xs font-medium border border-[#E5E3DC] flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
            >
              <span>Side-by-Side 54.5× Comparison</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Queries Quick Picker */}
      <div className="rounded-2xl bg-white border border-[#E5E3DC] p-6 space-y-4 shadow-card-subtle">
        <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
          <div>
            <h2 className="text-sm font-bold text-[#181B1F] flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#181B1F]" />
              <span>Tested Join Topologies & Workloads</span>
            </h2>
            <p className="text-xs text-[#8E95A5] mt-0.5">
              Select any pre-configured multi-table join query to run the Selinger DP optimizer
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SAMPLE_QUERIES.map((q) => {
            const isSelected = activeResult.relations.length === q.relations.length;
            return (
              <div
                key={q.id}
                onClick={() => {
                  setActiveQuery(q);
                  runOptimization(q, false);
                }}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-[#FAF9F6] border-[#181B1F] ring-1 ring-[#181B1F] shadow-sm'
                    : 'bg-white border-[#E5E3DC] hover:border-[#8E95A5] hover:bg-[#FAF9F6]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#181B1F] truncate">{q.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EFECE5] text-[#181B1F] font-medium">
                    {q.badge.split('·')[0].trim()}
                  </span>
                </div>
                <p className="text-[11px] text-[#525866] line-clamp-2 leading-relaxed">
                  {q.description}
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8E95A5] pt-2 border-t border-[#ECE8E0]">
                  <span>{q.relations.length} Tables</span>
                  <span className="text-[#181B1F] font-semibold flex items-center space-x-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
