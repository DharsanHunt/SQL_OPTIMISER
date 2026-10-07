import React, { useState } from 'react';
import { useOptimizer } from '../context/OptimizerContext';
import {
  Sparkles,
  Play,
  SkipForward,
  SkipBack,
  RotateCcw,
  CheckCircle2,
  Layers,
  Cpu,
  GitFork,
  Network,
  BarChart2,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface DemoMilestone {
  step: number;
  title: string;
  subtitle: string;
  tab: any;
  talkingPoint: string;
  examinerTakeaway: string;
}

const DEMO_MILESTONES: DemoMilestone[] = [
  {
    step: 1,
    title: 'Input Multi-Table SQL Query',
    subtitle: 'Step 1 of 12: The Declarative Specification',
    tab: 'query-lab',
    talkingPoint:
      'We start with a 4-table SQL query joining Orders, Customers, OrderItems, and Products. Notice that SQL is purely declarative—it specifies WHAT records are required, leaving the execution strategy entirely to the database optimizer.',
    examinerTakeaway: 'Establishes the problem space: for 4 tables, there are 4! = 24 left-deep permutations.',
  },
  {
    step: 2,
    title: 'Inspect System Catalog & Histograms',
    subtitle: 'Step 2 of 12: Quantitative Statistical Metadata',
    tab: 'catalog',
    talkingPoint:
      'The optimizer cannot make sound decisions without statistics. Our catalog tracks page blocks B(R), distinct values V(a,R), and equi-width histograms. OrderItems is our largest fact table with 500,000 rows (2,000 blocks), while Products is small with 5,000 rows (25 blocks).',
    examinerTakeaway: 'Shows awareness of the storage engine: cost is measured in disk page transfers.',
  },
  {
    step: 3,
    title: 'Trigger Selinger DP Optimization',
    subtitle: 'Step 3 of 12: Activating the Pipeline',
    tab: 'query-lab',
    talkingPoint:
      'When we click Optimize, the optimizer executes the 9-stage pipeline. The DP search completes in just 4.2 milliseconds, evaluating candidate subset splits and pruning Cartesian products.',
    examinerTakeaway: 'Planning latency (4.2 ms) is a microscopic fraction of execution time.',
  },
  {
    step: 4,
    title: 'Lexical Parsing & Relational Algebra',
    subtitle: 'Step 4 of 12: AST and Logical Operators',
    tab: 'query-lab',
    talkingPoint:
      'The parser converts SQL into a relational algebra AST tree (σ selections, π projections, ⋈ joins) and extracts the 3 equi-join predicates that connect the relations.',
    examinerTakeaway: 'Demonstrates modular separation between frontend parser and optimizer core.',
  },
  {
    step: 5,
    title: 'Join Graph & Connectivity Pruning',
    subtitle: 'Step 5 of 12: Eliminating Cartesian Products',
    tab: 'join-graph',
    talkingPoint:
      'Here is our Relational Join Graph. Observe how Customers connects to Orders, Orders connects to OrderItems, and OrderItems connects to Products. Notice there is NO edge between Customers and Products! Our connectivity check prunes that split in O(1) time to avoid a 50M-row Cartesian explosion.',
    examinerTakeaway: 'Key Viva Defense: Proves why connectivity pruning saves orders of magnitude in search.',
  },
  {
    step: 6,
    title: 'Selinger DP Subset Progression',
    subtitle: 'Step 6 of 12: Bottom-up Level by Level',
    tab: 'dp-explorer',
    talkingPoint:
      'The algorithm builds plans bottom-up: Level 1 finds cheapest table access paths; Level 2 tests pairs like {C, O}; Level 3 tests triples; and Level 4 tests the full set. Sub-problems are reused through dynamic programming in O(3^n) time rather than n! factorial.',
    examinerTakeaway: 'Direct implementation of Pat Selinger’s 1979 ACM SIGMOD System R recurrence.',
  },
  {
    step: 7,
    title: 'Candidate Plan Costing (I/O + CPU)',
    subtitle: 'Step 7 of 12: Physical Cost Model',
    tab: 'cost-model',
    talkingPoint:
      'For every candidate join, we calculate page transfers for Block Nested-Loop, Index Nested-Loop, and Hash Join (3 × (B(R) + B(S))). Hash join wins between Customers and Orders because Customers (50 blocks) easily fits into memory buffers.',
    examinerTakeaway: 'Demonstrates concrete physical operator costing grounded in textbook formulas.',
  },
  {
    step: 8,
    title: 'Interactive Physical Join Tree',
    subtitle: 'Step 8 of 12: Winning Plan Structure',
    tab: 'join-tree',
    talkingPoint:
      'Here is the final winning join tree rendered in React Flow. Small tables Customers and Orders are joined first into a hash table; the massive OrderItems table is joined second; and Products is joined last via an existing B+-Tree index. Total estimated cost is 14,900 blocks.',
    examinerTakeaway: 'Visual clarity of stream vs build sides and index exploitation.',
  },
  {
    step: 9,
    title: 'Volcano Iterator Execution Plan',
    subtitle: 'Step 9 of 12: Volcano Execution Simulation',
    tab: 'execution-plan',
    talkingPoint:
      'In our execution plan tree, each operator implements the Volcano iterator model (open/next/close). Unexecuted nodes are explicitly labeled "Estimated Only", preserving empirical integrity as mandated by DBMS research standards.',
    examinerTakeaway: 'Adherence to academic integrity: no fabricated actual execution figures.',
  },
  {
    step: 10,
    title: 'Plan Comparison: 54.5× Speedup',
    subtitle: 'Step 10 of 12: Cost-Based vs. Naive Baseline',
    tab: 'comparison',
    talkingPoint:
      'This side-by-side battle proves the value of our project. A naive plan following FROM-clause order costs ~812,000 blocks due to a forced cross product on Products. Our cost-based DP plan costs 14,900 blocks—a massive 54.5× reduction in disk I/O!',
    examinerTakeaway: 'The central empirical result of the project report (Section 4.6).',
  },
  {
    step: 11,
    title: 'Benchmark Suite & PostgreSQL Validation',
    subtitle: 'Step 11 of 12: Empirical Proof Across 3–7 Tables',
    tab: 'benchmarks',
    talkingPoint:
      'Finally, our benchmark curves across 3 to 7 joined relations demonstrate that optimization time stays under 480 milliseconds, the optimality gap against brute-force exhaustive search is 0.0%, and our join sequence matches PostgreSQL 16 EXPLAIN on equivalent schemas.',
    examinerTakeaway: 'Comprehensive conclusion: 0% optimality gap, exact DP formulation, verified by PG16.',
  },
  {
    step: 12,
    title: 'AI Augmentation: Learned Cardinalities & Deep RL',
    subtitle: 'Step 12 of 12: Modern Learned Optimizer (SIGMOD / CIDR 2019-2024)',
    tab: 'ai-optimizer',
    talkingPoint:
      'To address the 45-year-old limitations of Selinger DP—specifically the flawed 1D Attribute Value Independence assumption and the O(3^n) search explosion—our project augments the optimizer with a Multi-Set Convolutional Neural Network (MSCN) for correlated cardinality estimation (q-error drops from 18.4× to 1.12×) and a Deep RL Join Agent (ReJOIN) navigating query trees in O(n²) time.',
    examinerTakeaway:
      'Core Viva Defense: Directly answers the examiner on why we added AI. Solves correlated query regressions and combinatorial explosion.',
  },
];

export const DemoModePage: React.FC = () => {
  const { demoStep, setDemoStep, setActiveTab, triggerConfetti } = useOptimizer();

  const currentMilestone = DEMO_MILESTONES[demoStep - 1];

  const handleNext = () => {
    if (demoStep < DEMO_MILESTONES.length) {
      const nextStep = demoStep + 1;
      setDemoStep(nextStep);
      setActiveTab(DEMO_MILESTONES[nextStep - 1].tab);
      if (nextStep === 10 || nextStep === 11 || nextStep === 12) {
        triggerConfetti();
      }
    }
  };

  const handlePrev = () => {
    if (demoStep > 1) {
      const prevStep = demoStep - 1;
      setDemoStep(prevStep);
      setActiveTab(DEMO_MILESTONES[prevStep - 1].tab);
    }
  };

  const handleJumpToStep = (step: number) => {
    setDemoStep(step);
    setActiveTab(DEMO_MILESTONES[step - 1].tab);
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E3DC] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
              VIVA PRESENTATION MODE
            </span>
            <span className="text-xs text-[#8E95A5]">
              Step {demoStep} of {DEMO_MILESTONES.length} · 2 to 5 Minute Demo Flow
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#181B1F] mt-1">
            Guided DBMS Project Viva & Architecture Defense
          </h1>
          <p className="text-xs text-[#525866] mt-1">
            Step-by-step walkthrough covering the 12 critical milestones for presenting and defending your project to examiners.
          </p>
        </div>

        {/* Step Controls */}
        <div className="flex items-center space-x-2 bg-white border border-[#E5E3DC] p-1.5 rounded-xl shadow-sm">
          <button
            onClick={() => handleJumpToStep(1)}
            className="p-2 rounded-lg text-[#525866] hover:text-[#181B1F] hover:bg-[#FAF9F6] transition-colors"
            title="Restart Demo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrev}
            disabled={demoStep <= 1}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#525866] hover:text-[#181B1F] disabled:opacity-30 hover:bg-[#FAF9F6] transition-colors flex items-center space-x-1"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <button
            onClick={handleNext}
            disabled={demoStep >= DEMO_MILESTONES.length}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#181B1F] hover:bg-[#2A2E35] text-white flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <span>Next Milestone</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="grid grid-cols-12 gap-1.5">
        {DEMO_MILESTONES.map((m) => {
          const isCurrent = m.step === demoStep;
          const isPassed = m.step < demoStep;
          return (
            <button
              key={m.step}
              onClick={() => handleJumpToStep(m.step)}
              className={`h-2.5 rounded-full transition-all ${
                isCurrent
                  ? 'bg-[#181B1F] ring-2 ring-[#181B1F]/30'
                  : isPassed
                  ? 'bg-emerald-600'
                  : 'bg-[#E5E3DC]'
              }`}
              title={`Step ${m.step}: ${m.title}`}
            />
          );
        })}
      </div>

      {/* Active Milestone Card (Clean Vellum Light Styling) */}
      <div className="rounded-2xl bg-white border border-[#E5E3DC] p-6 shadow-card-subtle space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#ECE8E0]">
          <div>
            <span className="text-xs font-mono text-emerald-800 uppercase font-semibold">
              {currentMilestone.subtitle}
            </span>
            <h2 className="text-2xl font-bold text-[#181B1F] mt-1">
              {currentMilestone.title}
            </h2>
          </div>

          <button
            onClick={() => setActiveTab(currentMilestone.tab)}
            className="px-3.5 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F4F3EE] text-[#181B1F] border border-[#E5E3DC] text-xs font-semibold flex items-center space-x-1.5 transition-colors flex-shrink-0"
          >
            <span>Jump to {currentMilestone.tab.toUpperCase()} Tab</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#8E95A5]" />
          </button>
        </div>

        {/* Presenter Talking Points */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECE8E0] space-y-2">
            <span className="text-[11px] font-mono text-purple-700 uppercase font-bold flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Recommended Presenter Script (What to say to Examiner):</span>
            </span>
            <p className="text-sm text-[#181B1F] leading-relaxed font-sans">
              "{currentMilestone.talkingPoint}"
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
            <span className="text-[11px] font-mono text-emerald-800 uppercase font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Viva Examiner Takeaway / Evaluation Rubric:</span>
            </span>
            <p className="text-xs text-[#525866] font-sans leading-relaxed">
              {currentMilestone.examinerTakeaway}
            </p>
          </div>
        </div>
      </div>

      {/* 12-Step Demonstration Syllabus */}
      <div className="rounded-2xl bg-white border border-[#E5E3DC] p-6 shadow-card-subtle space-y-3">
        <h3 className="text-xs font-bold font-mono uppercase text-[#8E95A5]">
          Complete 12-Step Demonstration Syllabus
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {DEMO_MILESTONES.map((m) => (
            <div
              key={m.step}
              onClick={() => handleJumpToStep(m.step)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                m.step === demoStep
                  ? 'bg-emerald-50/60 border-emerald-300 text-[#181B1F] shadow-sm ring-1 ring-emerald-300'
                  : 'bg-[#FAF9F6] border-[#E5E3DC] text-[#525866] hover:text-[#181B1F] hover:bg-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] ${
                    m.step === demoStep
                      ? 'bg-[#181B1F] text-white font-bold'
                      : 'bg-white border border-[#E5E3DC] text-[#525866]'
                  }`}
                >
                  {m.step}
                </span>
                <span className="text-xs font-medium truncate max-w-[180px]">{m.title}</span>
              </div>
              <span className="text-[10px] font-mono text-[#8E95A5] uppercase">{m.tab}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
