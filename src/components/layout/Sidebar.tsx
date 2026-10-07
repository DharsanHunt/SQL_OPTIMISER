import React, { useState } from 'react';
import { useOptimizer, NavTab } from '../../context/OptimizerContext';
import {
  LayoutDashboard,
  Terminal,
  Cpu,
  GitFork,
  Network,
  Binary,
  Calculator,
  Database,
  FileSpreadsheet,
  GitCompare,
  BarChart3,
  ExternalLink,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'query-lab', label: 'Query Lab', icon: Terminal, badge: 'SQL' },
  { id: 'optimizer', label: 'Optimizer Engine', icon: Cpu },
  { id: 'join-tree', label: 'Join Tree Plan', icon: GitFork, badge: 'ReactFlow' },
  { id: 'join-graph', label: 'Join Graph', icon: Network, badge: 'Pruning' },
  { id: 'dp-explorer', label: 'DP Algorithm', icon: Binary, badge: 'Selinger' },
  { id: 'cost-model', label: 'Cost Model & Calc', icon: Calculator },
  { id: 'catalog', label: 'Catalog & Histograms', icon: Database },
  { id: 'execution-plan', label: 'Execution Plan', icon: FileSpreadsheet },
  { id: 'comparison', label: 'Plan Comparison', icon: GitCompare, badge: '54.5×' },
  { id: 'benchmarks', label: 'Benchmark Lab', icon: BarChart3 },
  { id: 'postgres-compare', label: 'PostgreSQL 16 Ref', icon: ExternalLink },
  { id: 'documentation', label: 'Viva Docs & Q&A', icon: BookOpen },
  { id: 'demo-mode', label: 'Guided Viva Demo', icon: Sparkles, badge: '2-5 min', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useOptimizer();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen bg-[#0A0F1D] border-r border-surface-border flex flex-col transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 border-b border-surface-border flex items-center justify-between px-3">
        {!collapsed && (
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-glow-cyan flex-shrink-0">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-wide text-white truncate">
                OPTIMIZER<span className="text-brand-400 font-extrabold">.LAB</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-tight truncate">
                DBMS Project · BCSE302L
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-glow-cyan">
            <Cpu className="w-4 h-4 text-white" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-0' : 'justify-between px-3'
              } py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand-500/10 text-brand-300 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover/80'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-brand-400' : 'text-slate-400'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsed && item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    item.badgeColor ||
                    (isActive
                      ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                      : 'bg-surface-border/50 text-slate-400 border-slate-700/50')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-3 border-t border-surface-border bg-[#070B14]">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate font-medium text-slate-300">Dharsan Udayakumar</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 font-mono">
            VIT · Selinger DP Engine v1.0
          </div>
        </div>
      )}
    </aside>
  );
};
