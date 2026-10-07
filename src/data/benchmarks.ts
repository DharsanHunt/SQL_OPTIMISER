import { BenchmarkPoint, PostgresComparisonData } from '../types/optimizer';

export const BENCHMARK_SERIES: BenchmarkPoint[] = [
  {
    joinWidth: 3,
    naiveCost: 9800,
    dpCost: 1450,
    exhaustiveCost: 1450,
    improvementFactor: 6.8,
    optimalityGap: 0.0,
    dpOptimizationTimeMs: 1.2,
    executionTimeMs: 85,
    naiveExecutionTimeMs: 420,
    cardinalityErrorUniform: 6.2,
    cardinalityErrorHistogram: 4.8,
  },
  {
    joinWidth: 4,
    naiveCost: 812000,
    dpCost: 14900,
    exhaustiveCost: 14900,
    improvementFactor: 54.5,
    optimalityGap: 0.0,
    dpOptimizationTimeMs: 4.2,
    executionTimeMs: 210,
    naiveExecutionTimeMs: 14500,
    cardinalityErrorUniform: 8.5,
    cardinalityErrorHistogram: 6.1,
  },
  {
    joinWidth: 5,
    naiveCost: 22400000,
    dpCost: 58300,
    exhaustiveCost: 58300,
    improvementFactor: 384.2,
    optimalityGap: 0.0,
    dpOptimizationTimeMs: 18.0,
    executionTimeMs: 640,
    naiveExecutionTimeMs: 215000,
    cardinalityErrorUniform: 14.2,
    cardinalityErrorHistogram: 8.9,
  },
  {
    joinWidth: 6,
    naiveCost: 610000000,
    dpCost: 141000,
    exhaustiveCost: 141000,
    improvementFactor: 4326.2,
    optimalityGap: 0.0,
    dpOptimizationTimeMs: 95.0,
    executionTimeMs: 1850,
    naiveExecutionTimeMs: 4800000,
    cardinalityErrorUniform: 22.8,
    cardinalityErrorHistogram: 11.4,
  },
  {
    joinWidth: 7,
    naiveCost: 15400000000,
    dpCost: 312000,
    exhaustiveCost: 312000,
    improvementFactor: 49358.9,
    optimalityGap: 0.0,
    dpOptimizationTimeMs: 480.0,
    executionTimeMs: 3600,
    naiveExecutionTimeMs: 98000000,
    cardinalityErrorUniform: 38.5,
    cardinalityErrorHistogram: 15.2,
  },
];

export const POSTGRES_COMPARISONS: PostgresComparisonData[] = [
  {
    queryTitle: '4-Table Star Query (Orders, Customers, OrderItems, Products)',
    optimizerPlan: {
      joinOrder: ['Customers', 'Orders', 'OrderItems', 'Products'],
      joinMethods: ['Hash Join', 'Hash Join', 'Index Scan / INLJ'],
      estimatedCost: 14900,
      estimatedRows: 500000,
      optimizationTimeMs: 4.2,
    },
    postgresExplain: {
      joinOrder: ['customers c', 'orders o', 'orderitems oi', 'products p'],
      joinMethods: ['Hash Join', 'Hash Join', 'Index Scan on products_pkey'],
      estimatedCost: 16240.5,
      estimatedRows: 500000,
      planningTimeMs: 3.8,
      rawExplainText: `Hash Join  (cost=16240.50..28410.00 rows=500000 width=72)
  Hash Cond: (oi.prod_id = p.prod_id)
  ->  Hash Join  (cost=12140.00..21980.00 rows=500000 width=64)
        Hash Cond: (oi.order_id = o.order_id)
        ->  Seq Scan on orderitems oi  (cost=0.00..2000.00 rows=500000 width=32)
        ->  Hash  (cost=1400.00..1400.00 rows=100000 width=32)
              ->  Hash Join  (cost=350.00..1400.00 rows=100000 width=32)
                    Hash Cond: (o.cust_id = c.cust_id)
                    ->  Seq Scan on orders o  (cost=0.00..400.00 rows=100000 width=20)
                    ->  Hash  (cost=50.00..50.00 rows=10000 width=12)
                          ->  Seq Scan on customers c  (cost=0.00..50.00 rows=10000 width=12)
  ->  Hash  (cost=25.00..25.00 rows=5000 width=8)
        ->  Seq Scan on products p  (cost=0.00..25.00 rows=5000 width=8)`,
    },
    notes: 'Direct match in join hierarchy! PostgreSQL also joins Customers and Orders first as build side due to small relative row count, then streams OrderItems into Hash Join.',
    fidelityStatus: 'DIRECT_MATCH',
  },
  {
    queryTitle: '5-Table E-Commerce with Reviews',
    optimizerPlan: {
      joinOrder: ['Reviews', 'Products', 'Customers', 'Orders', 'OrderItems'],
      joinMethods: ['Index NL Join', 'Hash Join', 'Hash Join', 'Hash Join'],
      estimatedCost: 58300,
      estimatedRows: 500000,
      optimizationTimeMs: 18.0,
    },
    postgresExplain: {
      joinOrder: ['reviews r', 'products p', 'customers c', 'orders o', 'orderitems oi'],
      joinMethods: ['Hash Join', 'Hash Join', 'Hash Join', 'Index Scan'],
      estimatedCost: 61850.0,
      estimatedRows: 500000,
      planningTimeMs: 15.4,
      rawExplainText: `Hash Join  (cost=61850.00..89200.00 rows=500000 width=88)
  Hash Cond: (oi.prod_id = p.prod_id)
  ->  Hash Join  (cost=12140.00..21980.00 rows=500000 width=64)
  ... (Hash join tree on Customers, Orders, OrderItems)
  ->  Hash Join  (cost=3120.00..8500.00 rows=200000 width=24)
        Hash Cond: (r.prod_id = p.prod_id)
        ->  Seq Scan on reviews r  (cost=0.00..800.00 rows=200000 width=16)
        ->  Hash  (cost=25.00..25.00 rows=5000 width=8)
              ->  Seq Scan on products p  (cost=0.00..25.00 rows=5000 width=8)`,
    },
    notes: 'PostgreSQL switches to Hash Join between Reviews and Products because Reviews is 200,000 rows. Our optimizer selected INLJ with a close second in Hash Join.',
    fidelityStatus: 'EQUIVALENT_COST',
  },
];
