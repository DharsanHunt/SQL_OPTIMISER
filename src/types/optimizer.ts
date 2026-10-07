// Core Types for Cost-Based Query Optimizer Workbench (OPTIMIZER LAB)

export type JoinAlgorithm = 'bnl' | 'inlj' | 'hash' | 'nl';
export type ScanType = 'seq_scan' | 'index_scan';

export interface AttributeStats {
  name: string;
  distinctCount: number; // V(a, R)
  hasIndex: boolean;
  indexType?: 'B+_TREE' | 'HASH';
  indexHeight?: number; // HTi
  minVal: number;
  maxVal: number;
  histogram?: HistogramBucket[];
}

export interface HistogramBucket {
  bucketId: number;
  lowerBound: number;
  upperBound: number;
  frequency: number; // rows in this bucket
  selectivity: number; // fraction of table
}

export interface RelationStats {
  name: string;
  alias?: string;
  rows: number; // |R|
  blocks: number; // B(R)
  tupleSize: number; // in bytes
  attributes: Record<string, AttributeStats>;
  description?: string;
}

export interface JoinPredicate {
  id: string;
  leftRelation: string;
  leftAttribute: string;
  rightRelation: string;
  rightAttribute: string;
  operator: '=';
  raw: string; // e.g. "OI.order_id = O.order_id"
}

export interface SelectionPredicate {
  id: string;
  relation: string;
  attribute: string;
  operator: '=' | '<' | '>' | '<=' | '>=';
  value: number | string;
  selectivity: number;
}

export interface JoinGraphEdge {
  id: string;
  source: string;
  target: string;
  predicate: JoinPredicate;
  estimatedSelectivity: number;
}

export interface JoinGraphData {
  nodes: {
    id: string;
    label: string;
    rows: number;
    blocks: number;
  }[];
  edges: JoinGraphEdge[];
}

export interface PlanCostBreakdown {
  ioCost: number; // Page transfers
  cpuCost: number; // CPU tuple operations
  totalCost: number; // I/O + CPU
  formula: string;
  variables: Record<string, number | string>;
}

export interface PlanNode {
  id: string;
  type: 'SCAN' | 'JOIN';
  operator: ScanType | JoinAlgorithm | 'CROSS_PRODUCT';
  operatorLabel: string;
  relation?: string; // For scan
  left?: PlanNode; // For join
  right?: PlanNode; // For join
  joinPredicate?: string;
  predicate?: string;
  
  // Cost & Cardinality
  estimatedCardinality: number; // Output rows
  actualCardinality?: number; // Measured/actual rows (if executed)
  cardinalityError?: number; // |est - act| / act
  
  cost: number; // Total cumulative cost in block transfers
  costBreakdown: PlanCostBreakdown;
  
  // Output properties
  outputAttributes?: string[];
  interestingOrder?: string; // Sorted order if preserved
  status?: 'estimated' | 'executed' | 'awaiting';
  executionTimeMs?: number;
}

export interface DPSubsetCandidate {
  s1: string[];
  s2: string[];
  joinMethod: JoinAlgorithm;
  cost: number;
  cardinality: number;
  isPrunedByConnectivity?: boolean;
  pruneReason?: string;
  isWinner?: boolean;
}

export interface DPSubsetEntry {
  subsetKey: string; // e.g. "C,O" or "{Customers, Orders}"
  relations: string[];
  size: number;
  bestPlan: PlanNode;
  bestCost: number;
  bestCardinality: number;
  chosenMethod: string;
  candidatesEvaluated: DPSubsetCandidate[];
  connectivityValid: boolean;
  interestingOrder?: string;
}

export interface DPLevel {
  level: number; // subset size 1..n
  subsets: DPSubsetEntry[];
}

export interface OptimizationResult {
  queryId: string;
  rawSql: string;
  relations: string[];
  predicates: JoinPredicate[];
  selectionPredicates: SelectionPredicate[];
  joinGraph: JoinGraphData;
  dpLevels: DPLevel[];
  bestPlan: PlanNode;
  naivePlan: PlanNode;
  exhaustiveOptimalCost: number;
  optimalityGap: number; // 0%
  totalCandidatePlans: number;
  crossProductsPruned: number;
  optimizationTimeMs: number;
  estimatedExecutionTimeMs: number;
  actualExecutionTimeMs?: number;
  timestamp: string;
  isDemoData: boolean;
  status: 'OPTIMAL' | 'SUBOPTIMAL' | 'COMPLETED';
}

export interface BenchmarkPoint {
  joinWidth: number;
  naiveCost: number;
  dpCost: number;
  exhaustiveCost: number;
  improvementFactor: number;
  optimalityGap: number; // 0.0%
  dpOptimizationTimeMs: number;
  executionTimeMs: number;
  naiveExecutionTimeMs: number;
  cardinalityErrorUniform: number;
  cardinalityErrorHistogram: number;
}

export interface PostgresComparisonData {
  queryTitle: string;
  optimizerPlan: {
    joinOrder: string[];
    joinMethods: string[];
    estimatedCost: number;
    estimatedRows: number;
    optimizationTimeMs: number;
  };
  postgresExplain: {
    joinOrder: string[];
    joinMethods: string[];
    estimatedCost: number;
    estimatedRows: number;
    planningTimeMs: number;
    rawExplainText: string;
  };
  notes: string;
  fidelityStatus: 'DIRECT_MATCH' | 'EQUIVALENT_COST' | 'VARIATION_DUE_TO_INDEX';
}

// ==========================================
// AI & Learned Query Optimizer Types
// ==========================================

export interface QErrorResult {
  scenarioId: string;
  title: string;
  querySql: string;
  actualCardinality: number;
  uniformEstimate: number;
  histogramEstimate: number;
  mscnEstimate: number;
  uniformQError: number;
  histogramQError: number;
  mscnQError: number;
  correlationExplanation: string;
}

export interface NeuralLayerActivation {
  layerName: string;
  dim: string;
  description: string;
  sampleWeights: number[];
}

export interface MSCNModelInspection {
  tableVector: { name: string; active: boolean; weight: number }[];
  predicateCount: number;
  joinEdgeCount: number;
  layers: NeuralLayerActivation[];
  rawPrediction: number;
  denormalizedCardinality: number;
  inferenceTimeMs: number;
}

export interface RLAction {
  id: string;
  leftRelation: string;
  rightRelation: string;
  joinMethod: JoinAlgorithm;
  qValue: number;
  policyProb: number;
  isPruned: boolean;
  pruneReason?: string;
  estimatedStepCost: number;
}

export interface RLStep {
  stepIndex: number;
  stateDescription: string;
  availableRelations: string[];
  joinedSubsets: string[];
  candidateActions: RLAction[];
  selectedAction: RLAction;
  stepReward: number;
  cumulativeCost: number;
}

export interface RLJoinTrajectory {
  trajectoryId: string;
  totalSteps: number;
  cumulativeCost: number;
  dpOptimalCost: number;
  optimalityGap: number;
  inferenceLatencyMs: number;
  searchComplexityFormula: string;
  steps: RLStep[];
}

export interface VivaQAItem {
  id: string;
  category: 'AVI_FAILURE' | 'MSCN_ARCHITECTURE' | 'REINFORCEMENT_LEARNING' | 'COST_MODEL' | 'VIVA_TRAP';
  badge: string;
  question: string;
  examinerTrap: string;
  bulletproofAnswer: string;
  keyFormulas?: string[];
  paperCitation?: {
    title: string;
    authors: string;
    venue: string;
    year: number;
  };
}

export interface NLQueryProposal {
  naturalLanguage: string;
  generatedSql: string;
  extractedTables: string[];
  extractedPredicates: string[];
  complexity: 'SIMPLE' | 'INTERMEDIATE' | 'CORRELATED_COMPLEX';
  explanation: string;
}

export interface RewriteRule {
  id: string;
  name: string;
  category: 'PREDICATE_PUSHDOWN' | 'DECORRELATION' | 'SARGABILITY' | 'JOIN_ELIMINATION' | 'INDEX_TRANSFORMATION';
  badge: string;
  description: string;
  speedupEstimate: string;
}

export interface QueryRewriteResult {
  id: string;
  title: string;
  suboptimalSql: string;
  optimizedSql: string;
  problemStatement: string;
  rulesApplied: RewriteRule[];
  estimatedCostReductionPercent: number;
  originalCostBlocks: number;
  rewrittenCostBlocks: number;
  technicalRationale: string;
}

