import React from 'react';
import { useOptimizer, NavTab } from '../../context/OptimizerContext';
import { SAMPLE_QUERIES } from '../../data/queries';
import {
  Cpu,
  Play,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Activity,
} from 'lucide-react';

interface TabItem {
  id: NavTab;
  label: string;
  isAi?: boolean;
}

const PRIMARY_TABS: TabItem[] = [
  { id: 'query-lab', label: 'Query Lab' },
  { id: 'ai-optimizer', label: 'AI Engine', isAi: true },
  { id: 'join-tree', label: 'Join Tree' },
  { id: 'join-graph', label: 'Join Graph' },
  { id: 'dp-explorer', label: 'DP Explorer' },
  { id: 'comparison', label: 'Plan Comparison' },
  { id: 'benchmarks', label: 'Benchmarks' },
  { id: 'cost-model', label: 'Cost Model' },
  { id: 'demo-mode', label: 'Viva Demo' },
];

export const TopNavbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeQuery,
    setActiveQuery,
    isOptimizing,
    runOptimization,
    resetToDefaultQuery,
  } = useOptimizer();

  return (
    <header className="h-14 bg-white border-b border-[#E5E3DC] px-6 flex items-center justify-between select-none">
      {/* Brand & Query Selector */}
      <div className="flex items-center space-x-5">
        <div
          onClick={() => setActiveTab('query-lab')}
          className="flex items-center space-x-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#181B1F] flex items-center justify-center text-white shadow-sm">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="font-serif text-lg font-bold text-[#181B1F] tracking-tight">
            Optimizer<span className="text-[#8E95A5] font-sans text-xs ml-1 font-semibold">LAB</span>
          </span>
        </div>

        <div className="h-5 w-[1px] bg-[#E5E3DC]" />

        {/* Clean Single Query Dropdown */}
        <div className="relative">
          <select
            value={activeQuery.id}
            onChange={(e) => {
              const q = SAMPLE_QUERIES.find((item) => item.id === e.target.value);
              if (q) {
                setActiveQuery(q);
                runOptimization(q, false);
              }
            }}
            className="bg-[#FAF9F6] border border-[#E5E3DC] rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-[#181B1F] appearance-none cursor-pointer focus:outline-none focus:border-[#181B1F] shadow-sm"
          >
            {SAMPLE_QUERIES.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#8E95A5] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Clean Navigation Pills */}
      <nav className="hidden lg:flex items-center space-x-1">
        {PRIMARY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1 ${
                isActive
                  ? 'bg-[#181B1F] text-white shadow-sm'
                  : tab.isAi
                  ? 'text-purple-700 hover:text-purple-900 bg-purple-50/60 hover:bg-purple-100/60 border border-purple-200'
                  : 'text-[#525866] hover:text-[#181B1F] hover:bg-[#F4F3EE]'
              }`}
            >
              {tab.isAi && <Sparkles className={`w-3 h-3 ${isActive ? 'text-purple-300' : 'text-purple-600'}`} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={resetToDefaultQuery}
          className="p-1.5 text-[#8E95A5] hover:text-[#181B1F] rounded-lg hover:bg-[#FAF9F6] transition-colors"
          title="Reset to 4-Table Primary Query"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => runOptimization(activeQuery, true)}
          disabled={isOptimizing}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
            isOptimizing
              ? 'bg-[#525866] text-white cursor-wait'
              : 'bg-[#181B1F] hover:bg-[#2A2E35] text-white'
          }`}
        >
          {isOptimizing ? (
            <>
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>Optimizing...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Optimizer</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
