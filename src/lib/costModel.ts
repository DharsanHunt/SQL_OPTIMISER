import { RelationStats, JoinAlgorithm, PlanCostBreakdown, HistogramBucket } from '../types/optimizer';
import { MEMORY_BUFFER_PAGES } from '../data/catalog';

/**
 * Sequential Scan Cost:
 * Reads every page block of relation R once.
 * Formula: B(R)
 */
export function calculateSeqScanCost(blocks: number, rows: number): PlanCostBreakdown {
  const ioCost = blocks;
  const cpuCost = Math.round(rows * 0.001);
  return {
    ioCost,
    cpuCost,
    totalCost: ioCost + cpuCost,
    formula: 'B(R) + (0.001 × |R|)',
    variables: { 'B(R)': blocks, '|R|': rows, 'CPU cost': cpuCost },
  };
}

/**
 * Clustering Index Scan Cost:
 * Traverses B+-Tree index height, then fetches matching data blocks.
 * Formula: HTi(a) + ceil(sel(a) × B(R))
 */
export function calculateIndexScanCost(
  blocks: number,
  rows: number,
  indexHeight: number,
  selectivity: number
): PlanCostBreakdown {
  const ioCost = indexHeight + Math.ceil(selectivity * blocks);
  const outRows = Math.round(rows * selectivity);
  const cpuCost = Math.round(outRows * 0.001);
  return {
    ioCost,
    cpuCost,
    totalCost: ioCost + cpuCost,
    formula: 'HTi + ⌈sel × B(R)⌉ + (0.001 × out_rows)',
    variables: {
      HTi: indexHeight,
      sel: selectivity.toFixed(4),
      'B(R)': blocks,
      'out rows': outRows,
    },
  };
}

/**
 * Block Nested-Loop Join (BNL) Cost:
 * Outer relation R held in M-2 buffer frames, inner relation S scanned per outer chunk.
 * Formula: B(R) + ceil(B(R) / (M - 2)) × B(S)
 */
export function calculateBNLCost(
  blocksR: number,
  blocksS: number,
  rowsR: number,
  rowsS: number,
  M: number = MEMORY_BUFFER_PAGES
): PlanCostBreakdown {
  const outerChunks = Math.ceil(blocksR / Math.max(1, M - 2));
  const ioCost = blocksR + outerChunks * blocksS;
  const cpuCost = Math.round((rowsR * rowsS) * 0.00005);
  return {
    ioCost,
    cpuCost,
    totalCost: ioCost + cpuCost,
    formula: 'B(R) + ⌈B(R)/(M - 2)⌉ × B(S)',
    variables: {
      'B(R)': blocksR,
      'B(S)': blocksS,
      'M (buffers)': M,
      'Outer chunks': outerChunks,
      'CPU comparison cost': cpuCost,
    },
  };
}

/**
 * Index Nested-Loop Join (INLJ) Cost:
 * For each tuple in outer R, probes B+-tree index on inner S.
 * Formula: B(R) + |R| × (HTi + sel × B(S))
 */
export function calculateINLJCost(
  blocksR: number,
  rowsR: number,
  blocksS: number,
  indexHeightS: number,
  selectivityS: number
): PlanCostBreakdown {
  const probeCost = indexHeightS + Math.ceil(selectivityS * blocksS);
  const ioCost = blocksR + rowsR * probeCost;
  const cpuCost = Math.round(rowsR * 0.001);
  return {
    ioCost,
    cpuCost,
    totalCost: ioCost + cpuCost,
    formula: 'B(R) + |R| × (HTi + sel × B(S))',
    variables: {
      'B(R)': blocksR,
      '|R|': rowsR,
      'HTi': indexHeightS,
      'sel': selectivityS.toFixed(4),
      'B(S)': blocksS,
      'Per-probe cost': probeCost,
    },
  };
}

/**
 * Grace / Hybrid Hash Join Cost:
 * 2-pass partition and probe phase assuming partitions fit within memory buffers.
 * Formula: 3 × (B(R) + B(S))
 */
export function calculateHashJoinCost(
  blocksR: number,
  blocksS: number,
  rowsR: number,
  rowsS: number
): PlanCostBreakdown {
  const ioCost = 3 * (blocksR + blocksS);
  const cpuCost = Math.round((rowsR + rowsS) * 0.002);
  return {
    ioCost,
    cpuCost,
    totalCost: ioCost + cpuCost,
    formula: '3 × (B(R) + B(S)) + CPU hash build/probe',
    variables: {
      'B(R)': blocksR,
      'B(S)': blocksS,
      'Hash passes': 3,
      'CPU build/probe': cpuCost,
    },
  };
}

/**
 * Join Cardinality Estimator (System R / PostgreSQL containment model):
 * Formula: |R ⋈ S| ≈ (|R| × |S|) / max(V(a, R), V(b, S))
 */
export function estimateJoinCardinality(
  rowsR: number,
  rowsS: number,
  distinctR: number,
  distinctS: number
): number {
  const denom = Math.max(1, Math.max(distinctR, distinctS));
  const estimated = (rowsR * rowsS) / denom;
  return Math.max(1, Math.round(estimated));
}

/**
 * Histogram-based Selectivity Estimation for a predicate:
 */
export function estimatePredicateSelectivity(
  value: number,
  totalRows: number,
  distinctCount: number,
  histogram?: HistogramBucket[]
): {
  selectivityUniform: number;
  selectivityHistogram: number;
  matchedBucket?: HistogramBucket;
} {
  const selectivityUniform = 1 / Math.max(1, distinctCount);
  
  if (!histogram || histogram.length === 0) {
    return {
      selectivityUniform,
      selectivityHistogram: selectivityUniform,
    };
  }

  // Find bucket containing the value
  const matchedBucket = histogram.find(
    b => value >= b.lowerBound && value <= b.upperBound
  ) || histogram[0];

  const bucketWidth = Math.max(1, matchedBucket.upperBound - matchedBucket.lowerBound + 1);
  const selectivityHistogram = matchedBucket.frequency / (bucketWidth * totalRows);

  return {
    selectivityUniform,
    selectivityHistogram: Math.max(0.00001, Math.min(1.0, selectivityHistogram)),
    matchedBucket,
  };
}

/**
 * Computes block count estimate for intermediate relation:
 * B(Intermediate) ≈ ceil(|Intermediate| * tupleSize / pageSize)
 */
export function estimateIntermediateBlocks(cardinality: number, tupleSize: number = 32, pageSize: number = 8192): number {
  const tuplesPerPage = Math.max(1, Math.floor(pageSize / tupleSize));
  return Math.max(1, Math.ceil(cardinality / tuplesPerPage));
}
