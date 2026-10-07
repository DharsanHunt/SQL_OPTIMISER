import React, { createContext, useContext, useState, useEffect } from 'react';
import { OptimizationResult, RelationStats } from '../types/optimizer';
import { SYSTEM_CATALOG } from '../data/catalog';
import { SAMPLE_QUERIES, SampleQuery } from '../data/queries';
import { runSelingerOptimizer } from '../lib/optimizerEngine';
import confetti from 'canvas-confetti';

export type NavTab =
  | 'dashboard'
  | 'query-lab'
  | 'ai-optimizer'
  | 'optimizer'
  | 'join-tree'
  | 'join-graph'
  | 'dp-explorer'
  | 'cost-model'
  | 'catalog'
  | 'execution-plan'
  | 'comparison'
  | 'benchmarks'
  | 'postgres-compare'
  | 'documentation'
  | 'demo-mode';

export type PipelineStage =
  | 'SQL'
  | 'Parser'
  | 'Logical Plan'
  | 'Join Graph'
  | 'Cardinality'
  | 'DP Enumeration'
  | 'Cost Model'
  | 'Best Plan'
  | 'Execution';

export const PIPELINE_STAGES: { id: PipelineStage; label: string; icon: string; desc: string }[] = [
  { id: 'SQL', label: 'SQL Query', icon: 'Code', desc: 'Input declarative SQL query specification' },
  { id: 'Parser', label: 'AST Parser', icon: 'FileCode2', desc: 'Lexical analysis & Relational Algebra extraction' },
  { id: 'Logical Plan', label: 'Logical Plan', icon: 'Layers', desc: 'Abstract relational tree (σ, π, ⋈)' },
  { id: 'Join Graph', label: 'Join Graph', icon: 'GitGraph', desc: 'Connectivity graph & Cartesian product pruning' },
  { id: 'Cardinality', label: 'Cardinality', icon: 'BarChart2', desc: 'Equi-width histograms & containment selectivity' },
  { id: 'DP Enumeration', label: 'DP Enumeration', icon: 'Cpu', desc: 'Selinger bottom-up dynamic programming O(3ⁿ)' },
  { id: 'Cost Model', label: 'Cost Model', icon: 'Calculator', desc: 'System R I/O page transfers + CPU accounting' },
  { id: 'Best Plan', label: 'Cheapest Plan', icon: 'CheckCircle2', desc: 'Optimal physical plan tree selection' },
  { id: 'Execution', label: 'Volcano Executor', icon: 'PlayCircle', desc: 'Iterator-based physical tuple execution' },
];

interface OptimizerContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeQuery: SampleQuery;
  setActiveQuery: (q: SampleQuery) => void;
  customSql: string;
  setCustomSql: (sql: string) => void;
  catalog: Record<string, RelationStats>;
  setCatalog: React.Dispatch<React.SetStateAction<Record<string, RelationStats>>>;
  activeResult: OptimizationResult;
  isOptimizing: boolean;
  activeStage: PipelineStage | null;
  setActiveStage: (stage: PipelineStage | null) => void;
  runOptimization: (queryToRun?: SampleQuery, animate?: boolean) => Promise<void>;
  selectedPlanNodeId: string | null;
  setSelectedPlanNodeId: (id: string | null) => void;
  demoStep: number;
  setDemoStep: (step: number) => void;
  triggerConfetti: () => void;
  resetToDefaultQuery: () => void;
}

const OptimizerContext = createContext<OptimizerContextType | undefined>(undefined);

export const OptimizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [activeQuery, setActiveQuery] = useState<SampleQuery>(SAMPLE_QUERIES[0]);
  const [customSql, setCustomSql] = useState<string>(SAMPLE_QUERIES[0].sql);
  const [catalog, setCatalog] = useState<Record<string, RelationStats>>(SYSTEM_CATALOG);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<PipelineStage | null>('Best Plan');
  const [selectedPlanNodeId, setSelectedPlanNodeId] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState<number>(1);

  // Initialize with the 4-table worked example
  const [activeResult, setActiveResult] = useState<OptimizationResult>(() => {
    return runSelingerOptimizer(
      SAMPLE_QUERIES[0].relations,
      SAMPLE_QUERIES[0].predicates,
      SAMPLE_QUERIES[0].selectionPredicates,
      SYSTEM_CATALOG
    );
  });

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#10B981', '#F59E0B', '#60A5FA']
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  };

  const runOptimization = async (queryToRun: SampleQuery = activeQuery, animate: boolean = true) => {
    setIsOptimizing(true);

    if (animate) {
      // Step through the 9 pipeline stages
      for (let i = 0; i < PIPELINE_STAGES.length; i++) {
        setActiveStage(PIPELINE_STAGES[i].id);
        await new Promise(r => setTimeout(r, 260));
      }
    }

    const result = runSelingerOptimizer(
      queryToRun.relations,
      queryToRun.predicates,
      queryToRun.selectionPredicates,
      catalog
    );
    result.rawSql = customSql;

    setActiveResult(result);
    setIsOptimizing(false);
    setActiveStage('Best Plan');
    triggerConfetti();
  };

  const resetToDefaultQuery = () => {
    const defaultQ = SAMPLE_QUERIES[0];
    setActiveQuery(defaultQ);
    setCustomSql(defaultQ.sql);
    runOptimization(defaultQ, false);
  };

  return (
    <OptimizerContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeQuery,
        setActiveQuery,
        customSql,
        setCustomSql,
        catalog,
        setCatalog,
        activeResult,
        isOptimizing,
        activeStage,
        setActiveStage,
        runOptimization,
        selectedPlanNodeId,
        setSelectedPlanNodeId,
        demoStep,
        setDemoStep,
        triggerConfetti,
        resetToDefaultQuery,
      }}
    >
      {children}
    </OptimizerContext.Provider>
  );
};

export function useOptimizer() {
  const ctx = useContext(OptimizerContext);
  if (!ctx) {
    throw new Error('useOptimizer must be used within an OptimizerProvider');
  }
  return ctx;
}
