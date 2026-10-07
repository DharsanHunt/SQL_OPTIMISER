import React from 'react';
import { useOptimizer, PIPELINE_STAGES, PipelineStage, NavTab } from '../../context/OptimizerContext';
import {
  Code,
  FileCode2,
  Layers,
  Network,
  BarChart2,
  Cpu,
  Calculator,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
} from 'lucide-react';

const STAGE_ICONS: Record<PipelineStage, React.ElementType> = {
  SQL: Code,
  Parser: FileCode2,
  'Logical Plan': Layers,
  'Join Graph': Network,
  Cardinality: BarChart2,
  'DP Enumeration': Cpu,
  'Cost Model': Calculator,
  'Best Plan': CheckCircle2,
  Execution: PlayCircle,
};

const STAGE_TO_TAB: Record<PipelineStage, NavTab> = {
  SQL: 'query-lab',
  Parser: 'query-lab',
  'Logical Plan': 'query-lab',
  'Join Graph': 'join-graph',
  Cardinality: 'catalog',
  'DP Enumeration': 'dp-explorer',
  'Cost Model': 'cost-model',
  'Best Plan': 'join-tree',
  Execution: 'execution-plan',
};

export const PipelineVisualizer: React.FC = () => {
  const { activeStage, setActiveStage, setActiveTab, isOptimizing } = useOptimizer();

  return (
    <div className="bg-[#0B1120] border-b border-surface-border py-2.5 px-4 overflow-x-auto select-none">
      <div className="flex items-center min-w-max space-x-1 sm:space-x-2">
        {PIPELINE_STAGES.map((stage, index) => {
          const Icon = STAGE_ICONS[stage.id];
          const isActive = activeStage === stage.id;
          const isPassed = !isOptimizing || (index <= PIPELINE_STAGES.findIndex(s => s.id === activeStage));

          return (
            <React.Fragment key={stage.id}>
              <button
                onClick={() => {
                  setActiveStage(stage.id);
                  setActiveTab(STAGE_TO_TAB[stage.id]);
                }}
                className={`group flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border transition-all text-left ${
                  isActive
                    ? 'bg-brand-500/15 border-brand-500 text-white shadow-glow-cyan'
                    : isPassed
                    ? 'bg-surface-card/80 border-surface-border text-slate-300 hover:border-slate-600 hover:bg-surface-card'
                    : 'bg-surface-card/30 border-surface-border/40 text-slate-500'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono ${
                    isActive
                      ? 'bg-brand-500 text-white'
                      : isPassed
                      ? 'bg-surface-border text-brand-300'
                      : 'bg-surface-border/50 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono text-slate-400">0{index + 1}</span>
                    <span className={`text-xs font-semibold ${isActive ? 'text-brand-300' : 'text-slate-200'}`}>
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono hidden md:block max-w-[120px] truncate">
                    {stage.desc}
                  </span>
                </div>

                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping ml-1" />
                )}
              </button>

              {index < PIPELINE_STAGES.length - 1 && (
                <ChevronRight
                  className={`w-4 h-4 flex-shrink-0 ${
                    isPassed ? 'text-brand-500/60' : 'text-slate-700'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
