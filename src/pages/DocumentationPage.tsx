import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  Cpu,
  Layers,
  Network,
  Calculator,
  HardDrive,
  BarChart2,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  icon: React.ElementType;
  summary: string;
  details: string[];
  vivaQuestion: string;
  vivaAnswer: string;
}

const DOC_TOPICS: Topic[] = [
  {
    id: 'why-join-ordering',
    title: 'Why Join Order Matters',
    icon: Layers,
    summary: 'For an n-table join query, there are n! left-deep permutations and (2n-2)!/(n-1)! bushy trees. An improper join order inflates intermediate result sizes and turns a sub-second query into one that takes minutes.',
    details: [
      'Declarative SQL specifies WHAT data is needed, not HOW to execute it.',
      'Intermediate result sizes compound multiplicatively across joins.',
      'Joining large fact tables first creates giant memory structures; joining small, highly selective tables first filters records early.',
    ],
    vivaQuestion: 'Examiner: What is the difference between left-deep and bushy join trees?',
    vivaAnswer: 'Left-deep trees require the right-hand child of every join to be a base relation, making pipelining simple. Bushy trees allow both children to be intermediate join results, expanding the search space from n! to Catalan-number order (2n-2)!/(n-1)!, which can occasionally produce cheaper plans but is harder to pipeline.',
  },

  {
    id: 'selinger-dp',
    title: 'Selinger Dynamic Programming (System R)',
    icon: Cpu,
    summary: 'Published in 1979 by Pat Selinger et al. (IBM System R), this algorithm builds optimal sub-plans over subsets of relations in bottom-up fashion, achieving polynomial O(3^n) search rather than n! factorial search.',
    details: [
      'Recurrence: bestPlan(S) = min over valid splits (S1, S2) of [ cost(S1) + cost(S2) + joinCost(S1, S2) ]',
      'Optimal substructure: The optimal plan for 4 tables {C, O, P, OI} is composed of the optimal plans for its constituent subsets.',
      'Space complexity is O(2^n); time complexity is O(3^n). For our scope of 3 to 7 relations, dynamic programming is exact and exhaustive.',
    ],
    vivaQuestion: 'Examiner: Why is Selinger DP O(3^n) and not O(2^n)?',
    vivaAnswer: 'The number of subsets of size k is C(n, k). For each subset of size k, we test its 2^k non-empty partitions. Summing over all k from 0 to n: ∑ C(n, k) * 2^k = (1 + 2)^n = 3^n via the binomial theorem.',
  },

  {
    id: 'connectivity-pruning',
    title: 'Join Graph Connectivity Pruning',
    icon: Network,
    summary: 'The optimizer constructs an undirected graph where relations are nodes and join predicates are edges. A candidate split (S1, S2) is skipped outright unless at least one join predicate connects a relation in S1 to a relation in S2.',
    details: [
      'Avoids Cartesian products: In our 4-table worked example, joining Products to Orders before OrderItems creates a 50,000,000-row cross product.',
      'Pruning reduces the actual evaluated search space well below the theoretical 3^n bound.',
      'Connected checks run in O(1) using adjacency lists or bitmasks.',
    ],
    vivaQuestion: 'Examiner: When would a real optimizer ever choose a Cartesian cross product?',
    vivaAnswer: 'Only when both relations are tiny (e.g. 1 row each), or when an explicit CROSS JOIN / lack of join predicate is requested by the user, or in star-schema snowflake dimension pre-multiplication under specific cost incentives.',
  },

  {
    id: 'cardinality-histograms',
    title: 'Cardinality Estimation & Equi-Width Histograms',
    icon: BarChart2,
    summary: 'Cost models depend on knowing intermediate result sizes beforehand. Flat uniform-distribution guesses fail on skewed real-world data; equi-width histograms divide attribute domain into buckets to track actual data distribution.',
    details: [
      'Uniform containment join estimator: |R ⋈ S| ≈ (|R| × |S|) / max(V(a,R), V(b,S))',
      'Histogram selectivity: sel(a = v) = (bucket rows) / (bucket width × |R|)',
      'Leis et al. (VLDB 2015) proved that cardinality misestimation—not the join enumeration algorithm—is the dominant cause of slow plans in production optimizers.',
    ],
    vivaQuestion: 'Examiner: What is the difference between equi-width and equi-depth histograms?',
    vivaAnswer: 'Equi-width histograms divide the value domain into equal-range buckets (bucket width is fixed, row counts vary). Equi-depth (equi-height) histograms adjust bucket boundaries so that every bucket holds an equal number of tuples, which handles extreme outliers and high skew better.',
  },

  {
    id: 'cost-model-io-cpu',
    title: 'System R Cost Model (I/O + CPU)',
    icon: Calculator,
    summary: 'Evaluates access paths and physical join algorithms in units of page (block) transfers, plus a constant CPU cost factor per tuple processed.',
    details: [
      'Sequential Scan: B(R)',
      'Index Scan: HT_i + ⌈sel × B(R)⌉',
      'Block Nested Loop (BNL): B(R) + ⌈B(R)/(M-2)⌉ × B(S)',
      'Hash Join: 3 × (B(R) + B(S))',
      'Index Nested Loop (INLJ): B(R) + |R| × (HT_i + sel × B(S))',
    ],
    vivaQuestion: 'Examiner: Why does Hash Join cost 3 × (B(R) + B(S))?',
    vivaAnswer: 'Phase 1 (Partitioning): 1 pass to read both relations from disk + 1 pass to write partitioned buckets to disk = 2 * (B(R) + B(S)). Phase 2 (Build & Probe): 1 pass to read partitioned buckets back into memory = 1 * (B(R) + B(S)). Total = 3 * (B(R) + B(S)).',
  },
];

export const DocumentationPage: React.FC = () => {
  const [expandedTopic, setExpandedTopic] = useState<string>(DOC_TOPICS[0].id);

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto select-none font-sans">
      {/* Header */}
      <div className="border-b border-[#E5E3DC] pb-6">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
            ACADEMIC REFERENCE & VIVA GUIDE
          </span>
          <span className="text-xs text-[#8E95A5]">
            BCSE302L · Database Management Systems
          </span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#181B1F] mt-1">
          Query Optimizer Engineering Documentation & Defense Prep
        </h1>
        <p className="text-xs text-[#525866] mt-1">
          Complete textbook theory, algorithm proofs, and sample questions for your university viva evaluation.
        </p>
      </div>

      {/* Topics Accordion List */}
      <div className="space-y-4">
        {DOC_TOPICS.map((topic) => {
          const Icon = topic.icon;
          const isExpanded = expandedTopic === topic.id;

          return (
            <div
              key={topic.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-white border-[#181B1F] shadow-card-subtle'
                  : 'bg-white border-[#E5E3DC] hover:border-[#8E95A5]'
              }`}
            >
              {/* Header Toggle */}
              <button
                onClick={() => setExpandedTopic(isExpanded ? '' : topic.id)}
                className="w-full p-5 text-left flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#181B1F] text-white flex items-center justify-center shadow-sm">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#181B1F]">{topic.title}</h3>
                    <p className="text-xs text-[#525866] line-clamp-1 mt-0.5">
                      {topic.summary}
                    </p>
                  </div>
                </div>

                <div className="p-1 rounded-lg text-[#8E95A5]">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#181B1F]" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 space-y-4 border-t border-[#ECE8E0]">
                  <p className="text-xs text-[#525866] leading-relaxed font-sans">
                    {topic.summary}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-purple-700 uppercase font-semibold">
                      Key Technical Tenets:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#525866] font-mono list-disc list-inside">
                      {topic.details.map((d, i) => (
                        <li key={i} className="leading-relaxed">
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Examiner Viva Defense Q&A Box */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold font-mono">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{topic.vivaQuestion}</span>
                    </div>
                    <p className="text-xs text-[#525866] leading-relaxed font-sans pl-6 border-l-2 border-emerald-300">
                      {topic.vivaAnswer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
