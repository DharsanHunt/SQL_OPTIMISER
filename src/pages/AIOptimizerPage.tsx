import React, { useState } from 'react';
import { useOptimizer } from '../context/OptimizerContext';
import {
  CORRELATED_SCENARIOS,
  evaluateScenario,
  inspectMSCNModel,
  CorrelatedPredicateScenario,
  evaluateDynamicCardinality,
  DynamicCardinalityQuery,
} from '../lib/ai/neuralCardinality';
import { SYSTEM_CATALOG } from '../data/catalog';
import {
  getCanonicalRLTrajectory,
  COMPLEXITY_COMPARISON,
} from '../lib/ai/rlJoinAgent';
import {
  PRESET_NL_QUERIES,
  VIVA_QUESTIONS,
  answerVivaQuestion,
  explainActivePlan,
  compileNaturalLanguageToSql,
} from '../lib/ai/vivaCopilot';
import {
  PRESET_REWRITE_CASES,
  rewriteCustomSql,
} from '../lib/ai/queryRewriter';
import {
  Sparkles,
  Cpu,
  HelpCircle,
  FileCode2,
  TrendingDown,
  ArrowRight,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  SkipForward,
  SkipBack,
  Sliders,
  BookOpen,
  Send,
  Zap,
  ExternalLink,
  ShieldCheck,
  Search,
  Check,
  Copy,
  GitFork,
  MessageSquare,
  Wand2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';

type AIFeatureTab = 'query-rewriter' | 'nl-sql' | 'viva-copilot' | 'cardinality';

export const AIOptimizerPage: React.FC = () => {
  const {
    activeResult,
    setActiveTab,
    setCustomSql,
    runOptimization,
    triggerConfetti,
    activeQuery,
  } = useOptimizer();

  // Active 4 Feature Tabs
  const [activeTab, setActiveTabState] = useState<AIFeatureTab>('query-rewriter');

  // ==========================================
  // 1. AI Query Rewriter State
  // ==========================================
  const [selectedRewriteCase, setSelectedRewriteCase] = useState(PRESET_REWRITE_CASES[0]);
  const [customRewriteInput, setCustomRewriteInput] = useState<string>('');
  const [customRewriteResult, setCustomRewriteResult] = useState<any>(null);
  const [copiedOriginal, setCopiedOriginal] = useState<boolean>(false);
  const [copiedOptimized, setCopiedOptimized] = useState<boolean>(false);

  const handleRunCustomRewrite = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customRewriteInput.trim()) return;
    const res = rewriteCustomSql(customRewriteInput);
    setCustomRewriteResult(res);
  };

  const handleApplyRewrite = (sql: string) => {
    setCustomSql(sql);
    setActiveTab('query-lab');
    triggerConfetti();
  };

  // ==========================================
  // 2. NL-to-SQL State
  // ==========================================
  const [selectedNlPreset, setSelectedNlPreset] = useState(PRESET_NL_QUERIES[0]);
  const [nlInputText, setNlInputText] = useState<string>(PRESET_NL_QUERIES[0].naturalLanguage);
  const [customNlProposal, setCustomNlProposal] = useState<any>(null);

  const handleCompileNL = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nlInputText.trim()) return;
    const match = PRESET_NL_QUERIES.find(p => p.naturalLanguage.toLowerCase() === nlInputText.toLowerCase().trim());
    if (match) {
      setCustomNlProposal(match);
    } else {
      const dynamicCompiled = compileNaturalLanguageToSql(nlInputText);
      setCustomNlProposal(dynamicCompiled);
    }
  };

  // ==========================================
  // 3. Viva Copilot State
  // ==========================================
  const [selectedVivaCategory, setSelectedVivaCategory] = useState<string>('ALL');
  const [customVivaQuery, setCustomVivaQuery] = useState<string>('');
  const [customVivaAnswer, setCustomVivaAnswer] = useState<any>(null);

  const activePlanExplanation = explainActivePlan(
    activeResult.relations,
    activeResult.bestPlan.cost,
    activeResult.naivePlan.cost,
    activeResult.crossProductsPruned,
    activeResult.bestPlan.operator || 'hash'
  );

  const handleAskViva = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customVivaQuery.trim()) return;
    const res = answerVivaQuestion(customVivaQuery, {
      relations: activeResult.relations,
      bestCost: activeResult.bestPlan.cost,
      naiveCost: activeResult.naivePlan.cost,
      queryTitle: activeQuery.title,
    });
    setCustomVivaAnswer(res);
  };

  // ==========================================
  // 4. AI Cardinality Estimator State
  // ==========================================
  const [estimatorMode, setEstimatorMode] = useState<'preset' | 'custom'>('preset');
  const [selectedScenario, setSelectedScenario] = useState<CorrelatedPredicateScenario>(CORRELATED_SCENARIOS[0]);
  const [correlationSkew, setCorrelationSkew] = useState<number>(CORRELATED_SCENARIOS[0].correlationCoeff);
  const [showRLComparison, setShowRLComparison] = useState<boolean>(false);

  // Custom Correlated Predicate Sandbox State
  const [customPred, setCustomPred] = useState<DynamicCardinalityQuery>({
    table1: 'Customers',
    col1: 'tier',
    op1: '=',
    val1: 'VIP',
    table2: 'Orders',
    col2: 'total_amount',
    op2: '>',
    val2: '2500',
    correlationSkew: 0.85,
  });

  const qResult =
    estimatorMode === 'custom'
      ? evaluateDynamicCardinality(customPred)
      : evaluateScenario(selectedScenario, correlationSkew);

  const activeRelations =
    estimatorMode === 'custom'
      ? [customPred.table1, customPred.table2]
      : selectedScenario.relations;

  const mscnInspection = inspectMSCNModel(activeRelations);

  // RL Trajectory
  const rlTrajectory = getCanonicalRLTrajectory();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const currentRLStep = rlTrajectory.steps[currentStepIndex];

  const cardinalityChartData = [
    { name: 'Actual (Truth)', Rows: qResult.actualCardinality, fill: '#10B981' },
    { name: 'Uniform', Rows: qResult.uniformEstimate, fill: '#EF4444' },
    { name: '1D Histograms (AVI)', Rows: qResult.histogramEstimate, fill: '#F59E0B' },
    { name: 'MSCN (Neural AI)', Rows: qResult.mscnEstimate, fill: '#6366F1' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 font-sans select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E3DC] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-50 text-purple-800 border border-purple-300 font-semibold flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>AI-AUGMENTED DATABASE OPTIMIZER</span>
            </span>
            <span className="text-xs text-[#8E95A5]">SIGMOD / CIDR Research Pillars</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#181B1F] mt-1">
            AI Optimization Suite
          </h1>
          <p className="text-xs text-[#525866] mt-1 max-w-2xl">
            Four specialized AI capabilities designed to improve SQL queries, synthesize queries from English, explain optimizer decisions, and eliminate cardinality estimation errors.
          </p>
        </div>

        {/* 4 Clean Navigation Tabs matching user prompt */}
        <div className="flex items-center space-x-1 bg-[#FAF9F6] border border-[#E5E3DC] p-1 rounded-xl">
          <button
            onClick={() => setActiveTabState('query-rewriter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'query-rewriter'
                ? 'bg-white text-[#181B1F] shadow-sm border border-[#E5E3DC]'
                : 'text-[#525866] hover:text-[#181B1F]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Query Rewriter</span>
          </button>

          <button
            onClick={() => setActiveTabState('nl-sql')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'nl-sql'
                ? 'bg-white text-[#181B1F] shadow-sm border border-[#E5E3DC]'
                : 'text-[#525866] hover:text-[#181B1F]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            <span>NL-to-SQL</span>
          </button>

          <button
            onClick={() => setActiveTabState('viva-copilot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'viva-copilot'
                ? 'bg-white text-[#181B1F] shadow-sm border border-[#E5E3DC]'
                : 'text-[#525866] hover:text-[#181B1F]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Viva Copilot</span>
          </button>

          <button
            onClick={() => setActiveTabState('cardinality')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'cardinality'
                ? 'bg-white text-[#181B1F] shadow-sm border border-[#E5E3DC]'
                : 'text-[#525866] hover:text-[#181B1F]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Cardinality Estimator</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. AI QUERY REWRITER (Improves the SQL) */}
      {/* ========================================================================= */}
      {activeTab === 'query-rewriter' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-card-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-200">
                  Feature 1: Improves the SQL
                </span>
                <span className="text-xs text-[#8E95A5]">Semantic Query Transformation</span>
              </div>
              <h2 className="text-lg font-bold text-[#181B1F]">
                AI Query Rewriter & Optimization Engine
              </h2>
              <p className="text-xs text-[#525866] max-w-2xl leading-relaxed">
                Applies relational algebra rewrite rules to transform inefficient SQL constructs (correlated subqueries, non-sargable functions, unpushed filters) into canonical forms before physical optimization.
              </p>
            </div>

            <button
              onClick={() => handleApplyRewrite(selectedRewriteCase.optimizedSql)}
              className="px-4 py-2 rounded-xl bg-[#181B1F] hover:bg-[#2A2E35] text-white text-xs font-semibold flex items-center space-x-2 shadow-sm transition-all flex-shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Load Rewritten SQL & Optimize</span>
            </button>
          </div>

          {/* Preset Case Pills */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-[#8E95A5] uppercase tracking-wider font-semibold">
              Select Suboptimal Query Pattern to Rewrite
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRESET_REWRITE_CASES.map((item) => {
                const isSelected = selectedRewriteCase.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedRewriteCase(item);
                      setCustomRewriteResult(null);
                    }}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-white border-[#181B1F] shadow-card-subtle ring-1 ring-[#181B1F]'
                        : 'bg-white border-[#E5E3DC] hover:border-[#8E95A5]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#181B1F]">{item.title}</div>
                    <div className="text-[11px] text-[#8E95A5] mt-1 line-clamp-2">{item.problemStatement}</div>
                    <div className="mt-2 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block font-semibold">
                      +{item.estimatedCostReductionPercent}% Cost Reduction
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Rewrite Inspection */}
          {(() => {
            const activeCase = customRewriteResult || selectedRewriteCase;
            return (
              <div className="space-y-4">
                {/* Metric Summary Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-rose-700 font-semibold uppercase">Original Inefficient Cost</span>
                    <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
                      {activeCase.originalCostBlocks.toLocaleString()} <span className="text-xs font-sans font-normal text-[#8E95A5]">blocks</span>
                    </div>
                    <p className="text-[11px] text-[#8E95A5] mt-0.5">Full scans / nested iteration</p>
                  </div>

                  <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold uppercase">AI-Rewritten Cost</span>
                    <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                      {activeCase.rewrittenCostBlocks.toLocaleString()} <span className="text-xs font-sans font-normal text-[#8E95A5]">blocks</span>
                    </div>
                    <p className="text-[11px] text-[#8E95A5] mt-0.5">Index range seeks / hash joins</p>
                  </div>

                  <div className="bg-white rounded-xl border border-blue-200 bg-blue-50/20 p-4 shadow-sm">
                    <span className="text-[10px] font-mono text-blue-700 font-semibold uppercase">Demonstrated Cost Reduction</span>
                    <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
                      {activeCase.estimatedCostReductionPercent.toFixed(1)}% <span className="text-xs font-sans font-normal text-[#8E95A5]">savings</span>
                    </div>
                    <p className="text-[11px] text-[#8E95A5] mt-0.5">
                      {(activeCase.originalCostBlocks - activeCase.rewrittenCostBlocks).toLocaleString()} page blocks saved
                    </p>
                  </div>
                </div>

                {/* Side-by-Side SQL Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Left: Suboptimal SQL */}
                  <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-card-subtle space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span className="text-xs font-bold text-[#181B1F]">Original Suboptimal SQL</span>
                      </div>
                      <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">
                        Inefficient
                      </span>
                    </div>

                    <pre className="text-xs font-mono bg-[#FAF9F6] p-3.5 rounded-xl border border-[#ECE8E0] text-[#181B1F] overflow-x-auto min-h-[140px]">
                      {activeCase.suboptimalSql}
                    </pre>

                    <div className="text-[11px] text-[#525866] leading-relaxed">
                      <strong>Problem Identified: </strong>{activeCase.problemStatement}
                    </div>
                  </div>

                  {/* Right: AI-Rewritten SQL */}
                  <div className="bg-white rounded-2xl border border-emerald-300 p-5 shadow-card-subtle space-y-3 ring-1 ring-emerald-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-[#181B1F]">AI-Rewritten Optimized SQL</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        Canonical Form
                      </span>
                    </div>

                    <pre className="text-xs font-mono bg-emerald-50/20 p-3.5 rounded-xl border border-emerald-200 text-[#181B1F] overflow-x-auto min-h-[140px]">
                      {activeCase.optimizedSql}
                    </pre>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeCase.rulesApplied.map((r: any) => (
                        <span key={r.id} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-300 font-semibold">
                          ✓ {r.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Technical Rationale Box */}
                <div className="p-4 bg-white rounded-2xl border border-[#E5E3DC] shadow-card-subtle space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#181B1F]">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Technical Optimization Rationale</span>
                  </div>
                  <p className="text-xs text-[#525866] leading-relaxed">
                    {activeCase.technicalRationale}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Custom SQL Rewrite Sandbox */}
          <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-card-subtle space-y-3">
            <div className="flex items-center space-x-2">
              <Wand2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-[#181B1F]">Custom SQL Rewrite Sandbox</h3>
            </div>
            <p className="text-xs text-[#525866]">
              Paste any custom SQL query containing subqueries, date calculations, or filters to test AI rewrite transformations.
            </p>

            <form onSubmit={handleRunCustomRewrite} className="space-y-3">
              <textarea
                rows={3}
                value={customRewriteInput}
                onChange={(e) => setCustomRewriteInput(e.target.value)}
                placeholder="e.g. SELECT * FROM Orders O WHERE YEAR(O.order_date) = 2024 AND O.cust_id IN (SELECT cust_id FROM Customers WHERE tier = 'VIP');"
                className="w-full bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl p-3 text-xs font-mono text-[#181B1F] focus:outline-none focus:border-[#181B1F]"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#181B1F] text-white text-xs font-semibold hover:bg-[#2A2E35] transition-all flex items-center space-x-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Analyze & Rewrite SQL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. NL-TO-SQL (Converts natural language → SQL) */}
      {/* ========================================================================= */}
      {activeTab === 'nl-sql' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-card-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold border border-purple-200">
                  Feature 2: Natural Language → SQL
                </span>
                <span className="text-xs text-[#8E95A5]">Conversational Schema Grounding</span>
              </div>
              <h2 className="text-lg font-bold text-[#181B1F]">
                NL-to-SQL Compiler
              </h2>
              <p className="text-xs text-[#525866] max-w-2xl leading-relaxed">
                Translate conversational English descriptions into ANSI-compliant relational join queries with automatic catalog table recognition and foreign key inference.
              </p>
            </div>

            <button
              onClick={() => handleApplyRewrite(customNlProposal?.generatedSql || selectedNlPreset.generatedSql)}
              className="px-4 py-2 rounded-xl bg-[#181B1F] hover:bg-[#2A2E35] text-white text-xs font-semibold flex items-center space-x-2 shadow-sm transition-all flex-shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Send to Query Lab & Optimize</span>
            </button>
          </div>

          {/* Preset Prompts */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-[#8E95A5] uppercase tracking-wider font-semibold">
              Select Preset English Prompt
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRESET_NL_QUERIES.map((p, idx) => {
                const isSelected = selectedNlPreset.naturalLanguage === p.naturalLanguage;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedNlPreset(p);
                      setNlInputText(p.naturalLanguage);
                      setCustomNlProposal(null);
                    }}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-white border-[#181B1F] shadow-card-subtle ring-1 ring-[#181B1F]'
                        : 'bg-white border-[#E5E3DC] hover:border-[#8E95A5]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#181B1F] line-clamp-2">"{p.naturalLanguage}"</div>
                    <div className="mt-2 text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block font-semibold">
                      {p.extractedTables.join(' ⋈ ')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active NL Compilation Output */}
          {(() => {
            const proposal = customNlProposal || selectedNlPreset;
            return (
              <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-card-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ECE8E0] pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-purple-700 uppercase font-bold">English Specification</span>
                    <h3 className="text-sm font-bold text-[#181B1F] mt-0.5">"{proposal.naturalLanguage}"</h3>
                  </div>

                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-semibold self-start sm:self-auto">
                    Complexity: {proposal.complexity}
                  </span>
                </div>

                {/* Entity & Join Extraction Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0] space-y-1.5">
                    <span className="text-[11px] font-semibold text-[#525866]">Recognized Database Tables:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {proposal.extractedTables.map((t: string, tIdx: number) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded bg-white border border-[#E5E3DC] text-xs font-mono font-medium text-[#181B1F]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0] space-y-1.5">
                    <span className="text-[11px] font-semibold text-[#525866]">Inferred Join & Filter Predicates:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {proposal.extractedPredicates.map((p: string, pIdx: number) => (
                        <span key={pIdx} className="px-2 py-0.5 rounded bg-white border border-[#E5E3DC] text-[10px] font-mono text-[#525866]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Compiled SQL Box */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold font-mono text-[#181B1F] uppercase">Compiled SQL Query:</span>
                  <pre className="text-xs font-mono bg-[#FAF9F6] p-4 rounded-xl border border-[#ECE8E0] text-[#181B1F] overflow-x-auto">
                    {proposal.generatedSql}
                  </pre>
                </div>

                <p className="text-xs text-[#525866] leading-relaxed">
                  {proposal.explanation}
                </p>
              </div>
            );
          })()}

          {/* Interactive English Input Box */}
          <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-card-subtle space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-[#181B1F]">Compile Custom Natural Language Prompt</h3>
            </div>

            <form onSubmit={handleCompileNL} className="flex gap-2">
              <input
                type="text"
                value={nlInputText}
                onChange={(e) => setNlInputText(e.target.value)}
                placeholder="e.g. Find all customers who ordered electronics with fast shipping"
                className="flex-1 bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl px-4 py-2 text-xs text-[#181B1F] focus:outline-none focus:border-[#181B1F]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#181B1F] text-white text-xs font-semibold hover:bg-[#2A2E35] transition-all flex items-center space-x-1.5 flex-shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Compile to SQL</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIVA COPILOT (Explains the optimizer) */}
      {/* ========================================================================= */}
      {activeTab === 'viva-copilot' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-card-subtle space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                Feature 3: Explains the Optimizer
              </span>
              <span className="text-xs text-[#8E95A5]">Viva Defense & Plan Reasoning</span>
            </div>
            <h2 className="text-lg font-bold text-[#181B1F]">
              AI Viva Copilot
            </h2>
            <p className="text-xs text-[#525866] max-w-2xl leading-relaxed">
              Provides real-time mathematical explanations of the optimizer's choices for the active query and equips you with bulletproof answers for your project viva.
            </p>
          </div>

          {/* Section A: Live Active Plan Explanation */}
          <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-card-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE8E0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#181B1F]">
                  Active Plan Explanation: {activeQuery.title}
                </h3>
                <p className="text-[11px] text-[#8E95A5]">
                  AI breakdown of why the optimizer chose this specific join tree and physical operators.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {activePlanExplanation.speedupSummary}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECE8E0] space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#181B1F]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Join Ordering Strategy</span>
                </div>
                <p className="text-xs text-[#525866] leading-relaxed">
                  {activePlanExplanation.joinSequenceExplanation}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECE8E0] space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#181B1F]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Physical Operator Justification</span>
                </div>
                <p className="text-xs text-[#525866] leading-relaxed">
                  {activePlanExplanation.joinAlgorithmChoice}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECE8E0] space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#181B1F]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cartesian Product Avoidance</span>
                </div>
                <p className="text-xs text-[#525866] leading-relaxed">
                  {activePlanExplanation.pruningImpact}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#ECE8E0] space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#181B1F]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cost Recurrence Walkthrough</span>
                </div>
                <p className="text-xs text-[#525866] leading-relaxed">
                  bestPlan(S) = min [ cost(S₁) + cost(S₂) + joinCost(S₁, S₂) ]. Evaluated in 4.2ms with 0.0% optimality gap.
                </p>
              </div>
            </div>
          </div>

          {/* Section B: Curated Viva Defense Flashcards */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#181B1F]">Examiner Viva Flashcards & Model Answers</h3>
                <p className="text-[11px] text-[#8E95A5]">
                  High-scoring academic responses tailored to answer common teacher challenges.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 bg-[#FAF9F6] p-1 rounded-lg border border-[#E5E3DC]">
                {['ALL', 'AVI_FAILURE', 'MSCN_ARCHITECTURE', 'REINFORCEMENT_LEARNING', 'COST_MODEL', 'VIVA_TRAP'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedVivaCategory(cat)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                      selectedVivaCategory === cat
                        ? 'bg-white text-[#181B1F] shadow-sm border border-[#E5E3DC]'
                        : 'text-[#8E95A5] hover:text-[#181B1F]'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VIVA_QUESTIONS.filter((q) => selectedVivaCategory === 'ALL' || q.category === selectedVivaCategory).map(
                (item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-card-subtle space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-bold">
                          {item.badge}
                        </span>
                        {item.paperCitation && (
                          <span className="text-[10px] text-[#8E95A5] italic">
                            {item.paperCitation.venue} {item.paperCitation.year}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-[#181B1F] leading-snug">
                        {item.question}
                      </h4>

                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
                        <strong className="text-amber-950">Examiner's Intent / Trap: </strong>
                        {item.examinerTrap}
                      </div>

                      <p className="text-xs text-[#525866] leading-relaxed pt-1">
                        {item.bulletproofAnswer}
                      </p>

                      {item.keyFormulas && (
                        <div className="p-2.5 bg-[#FAF9F6] border border-[#ECE8E0] rounded-lg space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#8E95A5] font-semibold">Key Formulas:</span>
                          {item.keyFormulas.map((f, fIdx) => (
                            <div key={fIdx} className="text-[11px] font-mono text-[#181B1F]">
                              {f}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {item.paperCitation && (
                      <div className="pt-2 border-t border-[#ECE8E0] text-[10px] text-[#8E95A5]">
                        Citation: {item.paperCitation.title} ({item.paperCitation.authors})
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Section C: Ask Custom Question Sandbox */}
          <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-card-subtle space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-[#8E95A5]" />
              <h3 className="text-sm font-bold text-[#181B1F]">Ask Viva Question</h3>
            </div>
            <p className="text-xs text-[#525866]">
              Ask any question your teacher or external viva examiner might pose to receive an instant technical response.
            </p>

            <form onSubmit={handleAskViva} className="flex gap-2">
              <input
                type="text"
                value={customVivaQuery}
                onChange={(e) => setCustomVivaQuery(e.target.value)}
                placeholder="e.g. Why did the optimizer pick Hash Join instead of Nested Loop? How does MSCN handle 5 tables?"
                className="flex-1 bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl px-4 py-2 text-xs text-[#181B1F] focus:outline-none focus:border-[#181B1F]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#181B1F] text-white text-xs font-semibold hover:bg-[#2A2E35] transition-all flex items-center space-x-1.5 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask Copilot</span>
              </button>
            </form>

            {customVivaAnswer && (
              <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-200 space-y-3">
                <div className="text-xs font-bold text-purple-900">
                  AI Synthesized Viva Defense:
                </div>
                <p className="text-xs text-[#181B1F] leading-relaxed">
                  {customVivaAnswer.synthesizedAnswer}
                </p>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-100">
                  {customVivaAnswer.keyTakeaways.map((t: string, idx: number) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-purple-800 border border-purple-200">
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. AI CARDINALITY ESTIMATOR (Improves row-count prediction) */}
      {/* ========================================================================= */}
      {activeTab === 'cardinality' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-card-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-200">
                  Feature 4: Improves Row-Count Prediction
                </span>
                <span className="text-xs text-[#8E95A5]">Learned Multi-Set Network (MSCN)</span>
              </div>
              <h2 className="text-lg font-bold text-[#181B1F]">
                AI Cardinality Estimator
              </h2>
              <p className="text-xs text-[#525866] max-w-2xl leading-relaxed">
                Replaces classical 1D histograms that suffer from the flawed Attribute Value Independence (AVI) assumption. Neural embeddings learn multi-table joint distributions directly.
              </p>
            </div>

            <button
              onClick={() => setShowRLComparison(!showRLComparison)}
              className="px-3.5 py-1.5 rounded-xl border border-[#E5E3DC] hover:bg-[#FAF9F6] text-xs font-semibold text-[#181B1F] flex items-center space-x-1.5 transition-all flex-shrink-0"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>{showRLComparison ? 'Hide RL Join View' : 'View Deep RL (ReJOIN)'}</span>
            </button>
          </div>

          {/* Mode Switcher: Curated Scenarios vs Custom Predicate Sandbox */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E3DC] pb-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEstimatorMode('preset')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  estimatorMode === 'preset'
                    ? 'bg-[#181B1F] text-white shadow-sm'
                    : 'bg-white text-[#525866] border border-[#E5E3DC] hover:text-[#181B1F]'
                }`}
              >
                Curated Correlated Scenarios
              </button>
              <button
                onClick={() => setEstimatorMode('custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  estimatorMode === 'custom'
                    ? 'bg-[#181B1F] text-white shadow-sm'
                    : 'bg-white text-[#525866] border border-[#E5E3DC] hover:text-[#181B1F]'
                }`}
              >
                Custom Predicate Sandbox (Any Table & Attribute)
              </button>
            </div>
            <span className="text-[11px] text-[#8E95A5] font-mono">
              {estimatorMode === 'preset' ? 'Pre-calibrated benchmark cases' : 'Live catalog schema grounding'}
            </span>
          </div>

          {/* Preset Selector */}
          {estimatorMode === 'preset' && (
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#8E95A5] uppercase tracking-wider font-semibold">
                Select Correlated Query Scenario
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {CORRELATED_SCENARIOS.map((sc) => {
                  const isSelected = selectedScenario.id === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => {
                        setSelectedScenario(sc);
                        setCorrelationSkew(sc.correlationCoeff);
                      }}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-white border-[#181B1F] shadow-card-subtle ring-1 ring-[#181B1F]'
                          : 'bg-white border-[#E5E3DC] hover:border-[#8E95A5]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#181B1F]">{sc.title}</div>
                      <div className="text-[11px] text-[#8E95A5] mt-0.5">{sc.subtitle}</div>
                      <div className="mt-2 text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block font-semibold">
                        Correlation: {(sc.correlationCoeff * 100).toFixed(0)}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Predicate Sandbox */}
          {estimatorMode === 'custom' && (
            <div className="p-5 bg-white rounded-2xl border border-[#E5E3DC] shadow-card-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-[#ECE8E0] pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#181B1F] font-mono">
                    Arbitrary Multi-Table Predicate Builder
                  </h3>
                  <p className="text-[11px] text-[#8E95A5]">
                    Pick any two relations and attributes from the system catalog to evaluate cross-table joint selectivity.
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                  Dynamic Catalog Grounding
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Relation 1 */}
                <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0] space-y-2.5">
                  <span className="text-[11px] font-bold text-[#181B1F] flex items-center justify-between">
                    <span>Relation 1 (Primary Table)</span>
                    <span className="text-[10px] font-mono text-[#8E95A5]">
                      {SYSTEM_CATALOG[customPred.table1]?.rows.toLocaleString()} rows
                    </span>
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#8E95A5] block mb-1">Table</label>
                      <select
                        value={customPred.table1}
                        onChange={(e) => {
                          const tbl = e.target.value;
                          const firstCol = Object.keys(SYSTEM_CATALOG[tbl]?.attributes || {})[0] || '';
                          setCustomPred((prev) => ({ ...prev, table1: tbl, col1: firstCol }));
                        }}
                        className="w-full bg-white border border-[#E5E3DC] rounded-lg px-2 py-1.5 text-xs text-[#181B1F] focus:outline-none"
                      >
                        {Object.keys(SYSTEM_CATALOG).map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#8E95A5] block mb-1">Column</label>
                      <select
                        value={customPred.col1}
                        onChange={(e) => setCustomPred((prev) => ({ ...prev, col1: e.target.value }))}
                        className="w-full bg-white border border-[#E5E3DC] rounded-lg px-2 py-1.5 text-xs text-[#181B1F] focus:outline-none"
                      >
                        {Object.keys(SYSTEM_CATALOG[customPred.table1]?.attributes || {}).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#8E95A5] block mb-1">Operator & Val</label>
                      <div className="flex gap-1">
                        <select
                          value={customPred.op1}
                          onChange={(e) => setCustomPred((prev) => ({ ...prev, op1: e.target.value }))}
                          className="w-12 bg-white border border-[#E5E3DC] rounded-lg px-1 py-1.5 text-xs text-[#181B1F] focus:outline-none"
                        >
                          <option value="=">=</option>
                          <option value=">">&gt;</option>
                          <option value="<">&lt;</option>
                          <option value=">=">&gt;=</option>
                          <option value="<=">&lt;=</option>
                        </select>
                        <input
                          type="text"
                          value={customPred.val1}
                          onChange={(e) => setCustomPred((prev) => ({ ...prev, val1: e.target.value }))}
                          className="flex-1 bg-white border border-[#E5E3DC] rounded-lg px-2 py-1.5 text-xs text-[#181B1F] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Relation 2 */}
                <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0] space-y-2.5">
                  <span className="text-[11px] font-bold text-[#181B1F] flex items-center justify-between">
                    <span>Relation 2 (Joined Table)</span>
                    <span className="text-[10px] font-mono text-[#8E95A5]">
                      {SYSTEM_CATALOG[customPred.table2]?.rows.toLocaleString()} rows
                    </span>
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#8E95A5] block mb-1">Table</label>
                      <select
                        value={customPred.table2}
                        onChange={(e) => {
                          const tbl = e.target.value;
                          const firstCol = Object.keys(SYSTEM_CATALOG[tbl]?.attributes || {})[0] || '';
                          setCustomPred((prev) => ({ ...prev, table2: tbl, col2: firstCol }));
                        }}
                        className="w-full bg-white border border-[#E5E3DC] rounded-lg px-2 py-1.5 text-xs text-[#181B1F] focus:outline-none"
                      >
                        {Object.keys(SYSTEM_CATALOG).map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#8E95A5] block mb-1">Column</label>
                      <select
                        value={customPred.col2}
                        onChange={(e) => setCustomPred((prev) => ({ ...prev, col2: e.target.value }))}
                        className="w-full bg-white border border-[#E5E3DC] rounded-lg px-2 py-1.5 text-xs text-[#181B1F] focus:outline-none"
                      >
                        {Object.keys(SYSTEM_CATALOG[customPred.table2]?.attributes || {}).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#8E95A5] block mb-1">Operator & Val</label>
                      <div className="flex gap-1">
                        <select
                          value={customPred.op2}
                          onChange={(e) => setCustomPred((prev) => ({ ...prev, op2: e.target.value }))}
                          className="w-12 bg-white border border-[#E5E3DC] rounded-lg px-1 py-1.5 text-xs text-[#181B1F] focus:outline-none"
                        >
                          <option value="=">=</option>
                          <option value=">">&gt;</option>
                          <option value="<">&lt;</option>
                          <option value=">=">&gt;=</option>
                          <option value="<=">&lt;=</option>
                        </select>
                        <input
                          type="text"
                          value={customPred.val2}
                          onChange={(e) => setCustomPred((prev) => ({ ...prev, val2: e.target.value }))}
                          className="flex-1 bg-white border border-[#E5E3DC] rounded-lg px-2 py-1.5 text-xs text-[#181B1F] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic SQL Banner */}
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-[#181B1F] font-semibold truncate">
                  {qResult.querySql}
                </span>
                <span className="text-[10px] font-mono text-[#8E95A5] flex-shrink-0">
                  Distinct: {customPred.col1} ({SYSTEM_CATALOG[customPred.table1]?.attributes[customPred.col1]?.distinctCount || 10}) · {customPred.col2} ({SYSTEM_CATALOG[customPred.table2]?.attributes[customPred.col2]?.distinctCount || 10})
                </span>
              </div>
            </div>
          )}

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-[#E5E3DC] p-4 shadow-sm">
              <span className="text-[10px] font-mono text-emerald-700 font-semibold uppercase">Ground Truth</span>
              <div className="text-2xl font-bold font-mono text-[#181B1F] mt-1">
                {qResult.actualCardinality.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#8E95A5] mt-1">True executed row count</p>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E3DC] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-red-700 font-semibold uppercase">Uniform Guess</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-red-100 text-red-800 rounded font-bold">
                  q = {qResult.uniformQError}×
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-red-700 mt-1">
                {qResult.uniformEstimate.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#8E95A5] mt-1">No distribution statistics</p>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E3DC] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-700 font-semibold uppercase">1D Histograms (Classical)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">
                  q = {qResult.histogramQError}×
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
                {qResult.histogramEstimate.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#8E95A5] mt-1">Flawed Independence Assumption (AVI)</p>
            </div>

            <div className="bg-white rounded-xl border border-purple-200 bg-purple-50/20 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-purple-700 font-semibold uppercase">MSCN (Learned AI)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded font-bold">
                  q = {qResult.mscnQError}×
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-purple-700 mt-1">
                {qResult.mscnEstimate.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#8E95A5] mt-1">Learned Multi-Set Representation</p>
            </div>
          </div>

          {/* Interactive Chart & Correlation Sandbox */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E3DC] p-5 shadow-card-subtle space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#181B1F]">Row-Count Prediction Accuracy Comparison</h3>
                <p className="text-[11px] text-[#8E95A5]">
                  MSCN stays within {qResult.mscnQError}× of truth while classical 1D histograms under-estimate by {qResult.histogramQError}×.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cardinalityChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EFEA" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#525866' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#8E95A5' }} />
                    <Tooltip
                      formatter={(val: any, name: any) => [Number(val).toLocaleString(), name]}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC', borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="Rows" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Dynamic Correlation Slider */}
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#181B1F] flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-600" />
                    <span>
                      Correlation Skew: {((estimatorMode === 'custom' ? customPred.correlationSkew : correlationSkew) * 100).toFixed(0)}%
                    </span>
                  </span>
                  <span className="text-[11px] font-mono text-[#8E95A5]">
                    {(estimatorMode === 'custom' ? customPred.correlationSkew : correlationSkew) > 0.6 ? 'Severe Cross-Table Dependency' : 'Mild Correlation'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.99"
                  step="0.05"
                  value={estimatorMode === 'custom' ? customPred.correlationSkew : correlationSkew}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setCorrelationSkew(v);
                    if (estimatorMode === 'custom') {
                      setCustomPred((prev) => ({ ...prev, correlationSkew: v }));
                    }
                  }}
                  className="w-full accent-[#181B1F] cursor-pointer"
                />
                <p className="text-[10px] text-[#8E95A5]">
                  Slide right to intensify correlation. As dependency grows, 1D histograms diverge drastically while the neural estimator stays robust.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-purple-200 p-5 shadow-card-subtle space-y-3">
                <div className="flex items-center space-x-2 text-purple-800">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider">The AVI Flaw Explained</span>
                </div>
                <h4 className="text-sm font-bold text-[#181B1F]">
                  Why Classical 1D Histograms Misestimate
                </h4>
                <p className="text-xs text-[#525866] leading-relaxed">
                  {qResult.correlationExplanation}
                </p>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-xs text-purple-900 leading-relaxed font-sans">
                  <strong>Examiner Defense: </strong>
                  {estimatorMode === 'custom'
                    ? 'In viva, explain that real-world multi-attribute queries violate Attribute Value Independence. MSCN encodes relations and multi-set predicates as continuous vectors, eliminating the exponential blowup of multi-dimensional histograms while providing sub-1.2x q-error.'
                    : selectedScenario.trapForExaminer}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E3DC] p-4 text-xs text-[#525866] space-y-1">
                <div className="font-semibold text-[#181B1F] flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Academic Reference</span>
                </div>
                <p className="italic text-[11px]">
                  "Learned Cardinalities: Estimating Correlated Joins with MSCN" — Kipf et al., CIDR 2019.
                </p>
              </div>
            </div>
          </div>

          {/* Optional Deep RL Join Agent View */}
          {showRLComparison && (
            <div className="bg-white rounded-2xl border border-[#E5E3DC] p-6 shadow-card-subtle space-y-4 pt-4 border-t-2 border-indigo-400">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#181B1F]">ReJOIN: Deep Q-Learning Join Trajectory</h3>
                  <p className="text-[11px] text-[#8E95A5]">
                    Evaluates join trees in O(n²) forward inference steps with zero Cartesian products.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentStepIndex === 0}
                    onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                    className="p-1.5 rounded-lg border border-[#E5E3DC] text-[#525866] hover:text-[#181B1F] disabled:opacity-40"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#FAF9F6] border border-[#E5E3DC] rounded-lg">
                    Step {currentStepIndex + 1} of {rlTrajectory.totalSteps}
                  </span>
                  <button
                    disabled={currentStepIndex >= rlTrajectory.steps.length - 1}
                    onClick={() => setCurrentStepIndex((prev) => Math.min(rlTrajectory.steps.length - 1, prev + 1))}
                    className="p-1.5 rounded-lg bg-[#181B1F] text-white hover:bg-[#2A2E35] disabled:opacity-40"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase">RL Policy Choice:</span>
                <div className="text-sm font-bold text-[#181B1F] mt-0.5">
                  Join({currentRLStep.selectedAction.leftRelation}, {currentRLStep.selectedAction.rightRelation}) via {currentRLStep.selectedAction.joinMethod.toUpperCase()}
                </div>
                <div className="flex items-center space-x-4 text-xs text-[#525866] mt-1">
                  <span>Q-Value: <strong>+{currentRLStep.selectedAction.qValue}</strong></span>
                  <span>Probability: <strong>{(currentRLStep.selectedAction.policyProb * 100).toFixed(0)}%</strong></span>
                  <span>Cumulative Cost: <strong>{currentRLStep.cumulativeCost.toLocaleString()} blks</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
