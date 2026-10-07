import { RLJoinTrajectory, RLStep, RLAction } from '../../types/optimizer';

/**
 * ReJOIN: Reinforcement Learning Join Order Enumeration Agent
 * Based on: Marcus et al., "Towards a Hands-Free Query Optimizer through Deep RL", ACM SIGMOD / VLDB 2018-2019.
 *
 * Traditional Selinger Dynamic Programming searches O(3ⁿ) subset combinations.
 * When joins exceed 7-8 relations, DP runs out of memory and execution time explodes.
 * The RL Agent views query optimization as a Markov Decision Process (MDP):
 *  - State: Set of remaining query sub-trees {T₁, T₂, ...}
 *  - Action: Select connected pair (T_i, T_j) + physical join operator
 *  - Reward: Negative execution cost / latency penalty
 *  - Search Complexity: O(n²) forward inference steps with zero Cartesian products!
 */

export interface ComplexityDataPoint {
  tables: number;
  dpStates: number;          // 3ⁿ - 2ⁿ⁺¹ + 1
  rlInferenceSteps: number;  // n(n-1)/2
  dpTimeMs: number;
  rlTimeMs: number;
}

export const COMPLEXITY_COMPARISON: ComplexityDataPoint[] = [
  { tables: 3, dpStates: 12, rlInferenceSteps: 3, dpTimeMs: 1.2, rlTimeMs: 0.8 },
  { tables: 4, dpStates: 50, rlInferenceSteps: 6, dpTimeMs: 4.2, rlTimeMs: 1.1 },
  { tables: 5, dpStates: 180, rlInferenceSteps: 10, dpTimeMs: 18.0, rlTimeMs: 1.5 },
  { tables: 6, dpStates: 602, rlInferenceSteps: 15, dpTimeMs: 95.0, rlTimeMs: 2.1 },
  { tables: 7, dpStates: 1932, rlInferenceSteps: 21, dpTimeMs: 480.0, rlTimeMs: 2.9 },
  { tables: 8, dpStates: 6050, rlInferenceSteps: 28, dpTimeMs: 2840.0, rlTimeMs: 3.8 },
  { tables: 9, dpStates: 18660, rlInferenceSteps: 36, dpTimeMs: 16500.0, rlTimeMs: 4.9 },
  { tables: 10, dpStates: 57002, rlInferenceSteps: 45, dpTimeMs: 89000.0, rlTimeMs: 6.2 },
];

/**
 * Builds the simulated Deep RL episode trajectory for the canonical 4-table query
 */
export function getCanonicalRLTrajectory(): RLJoinTrajectory {
  const steps: RLStep[] = [
    {
      stepIndex: 1,
      stateDescription: 'Episode Start: 4 unjoined base relations in query graph. Agent evaluates all connected pairs.',
      availableRelations: ['Customers', 'Orders', 'OrderItems', 'Products'],
      joinedSubsets: ['Customers', 'Orders', 'OrderItems', 'Products'],
      candidateActions: [
        {
          id: 'act-1-1',
          leftRelation: 'Customers',
          rightRelation: 'Orders',
          joinMethod: 'hash',
          qValue: 9.42,
          policyProb: 0.74,
          isPruned: false,
          estimatedStepCost: 1350,
        },
        {
          id: 'act-1-2',
          leftRelation: 'Orders',
          rightRelation: 'OrderItems',
          joinMethod: 'hash',
          qValue: 6.18,
          policyProb: 0.22,
          isPruned: false,
          estimatedStepCost: 7200,
        },
        {
          id: 'act-1-3',
          leftRelation: 'OrderItems',
          rightRelation: 'Products',
          joinMethod: 'inlj',
          qValue: 4.05,
          policyProb: 0.04,
          isPruned: false,
          estimatedStepCost: 11400,
        },
        {
          id: 'act-1-4',
          leftRelation: 'Customers',
          rightRelation: 'Products',
          joinMethod: 'bnl',
          qValue: -99.0,
          policyProb: 0.0,
          isPruned: true,
          pruneReason: 'Pruned by RL Action Mask: Disconnected partition in join graph (Cartesian Product)',
          estimatedStepCost: 812000,
        },
      ],
      selectedAction: {
        id: 'act-1-1',
        leftRelation: 'Customers',
        rightRelation: 'Orders',
        joinMethod: 'hash',
        qValue: 9.42,
        policyProb: 0.74,
        isPruned: false,
        estimatedStepCost: 1350,
      },
      stepReward: -3.13, // -log10(1350)
      cumulativeCost: 1350,
    },
    {
      stepIndex: 2,
      stateDescription: 'State: 3 subtrees remaining: {Customers ⋈ Orders}, OrderItems, Products.',
      availableRelations: ['{Customers, Orders}', 'OrderItems', 'Products'],
      joinedSubsets: ['{Customers, Orders}', 'OrderItems', 'Products'],
      candidateActions: [
        {
          id: 'act-2-1',
          leftRelation: '{Customers, Orders}',
          rightRelation: 'OrderItems',
          joinMethod: 'hash',
          qValue: 8.85,
          policyProb: 0.81,
          isPruned: false,
          estimatedStepCost: 6450,
        },
        {
          id: 'act-2-2',
          leftRelation: 'OrderItems',
          rightRelation: 'Products',
          joinMethod: 'inlj',
          qValue: 5.21,
          policyProb: 0.19,
          isPruned: false,
          estimatedStepCost: 12800,
        },
        {
          id: 'act-2-3',
          leftRelation: '{Customers, Orders}',
          rightRelation: 'Products',
          joinMethod: 'bnl',
          qValue: -99.0,
          policyProb: 0.0,
          isPruned: true,
          pruneReason: 'Pruned by RL Action Mask: No predicate connects {C, O} and Products',
          estimatedStepCost: 450000,
        },
      ],
      selectedAction: {
        id: 'act-2-1',
        leftRelation: '{Customers, Orders}',
        rightRelation: 'OrderItems',
        joinMethod: 'hash',
        qValue: 8.85,
        policyProb: 0.81,
        isPruned: false,
        estimatedStepCost: 6450,
      },
      stepReward: -3.81,
      cumulativeCost: 7800,
    },
    {
      stepIndex: 3,
      stateDescription: 'Terminal Step: 2 subtrees remaining: {{Customers ⋈ Orders} ⋈ OrderItems} and Products.',
      availableRelations: ['{{Customers, Orders}, OrderItems}', 'Products'],
      joinedSubsets: ['{{Customers, Orders}, OrderItems}', 'Products'],
      candidateActions: [
        {
          id: 'act-3-1',
          leftRelation: '{{Customers, Orders}, OrderItems}',
          rightRelation: 'Products',
          joinMethod: 'inlj',
          qValue: 9.91,
          policyProb: 0.96,
          isPruned: false,
          estimatedStepCost: 7100,
        },
        {
          id: 'act-3-2',
          leftRelation: '{{Customers, Orders}, OrderItems}',
          rightRelation: 'Products',
          joinMethod: 'hash',
          qValue: 6.70,
          policyProb: 0.04,
          isPruned: false,
          estimatedStepCost: 15400,
        },
      ],
      selectedAction: {
        id: 'act-3-1',
        leftRelation: '{{Customers, Orders}, OrderItems}',
        rightRelation: 'Products',
        joinMethod: 'inlj',
        qValue: 9.91,
        policyProb: 0.96,
        isPruned: false,
        estimatedStepCost: 7100,
      },
      stepReward: -3.85,
      cumulativeCost: 14900,
    },
  ];

  return {
    trajectoryId: 'rejoin-4-table-canonical',
    totalSteps: 3,
    cumulativeCost: 14900,
    dpOptimalCost: 14900,
    optimalityGap: 0.0,
    inferenceLatencyMs: 1.1,
    searchComplexityFormula: 'O(n²) forward passes vs O(3ⁿ) DP state table',
    steps,
  };
}
