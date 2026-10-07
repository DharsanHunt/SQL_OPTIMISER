import { RelationStats } from '../types/optimizer';

export const SYSTEM_CATALOG: Record<string, RelationStats> = {
  Orders: {
    name: 'Orders',
    alias: 'O',
    rows: 100000,
    blocks: 400,
    tupleSize: 32,
    description: 'Central transaction header table storing consumer orders',
    attributes: {
      order_id: {
        name: 'order_id',
        distinctCount: 100000,
        hasIndex: true,
        indexType: 'B+_TREE',
        indexHeight: 3,
        minVal: 1,
        maxVal: 100000,
        histogram: [
          { bucketId: 1, lowerBound: 1, upperBound: 20000, frequency: 20000, selectivity: 0.2 },
          { bucketId: 2, lowerBound: 20001, upperBound: 40000, frequency: 20000, selectivity: 0.2 },
          { bucketId: 3, lowerBound: 40001, upperBound: 60000, frequency: 20000, selectivity: 0.2 },
          { bucketId: 4, lowerBound: 60001, upperBound: 80000, frequency: 20000, selectivity: 0.2 },
          { bucketId: 5, lowerBound: 80001, upperBound: 100000, frequency: 20000, selectivity: 0.2 },
        ]
      },
      cust_id: {
        name: 'cust_id',
        distinctCount: 10000,
        hasIndex: true,
        indexType: 'B+_TREE',
        indexHeight: 2,
        minVal: 1,
        maxVal: 10000,
        histogram: [
          { bucketId: 1, lowerBound: 1, upperBound: 2000, frequency: 25000, selectivity: 0.25 },
          { bucketId: 2, lowerBound: 2001, upperBound: 4000, frequency: 22000, selectivity: 0.22 },
          { bucketId: 3, lowerBound: 4001, upperBound: 6000, frequency: 19000, selectivity: 0.19 },
          { bucketId: 4, lowerBound: 6001, upperBound: 8000, frequency: 18000, selectivity: 0.18 },
          { bucketId: 5, lowerBound: 8001, upperBound: 10000, frequency: 16000, selectivity: 0.16 },
        ]
      },
      order_date: {
        name: 'order_date',
        distinctCount: 730,
        hasIndex: false,
        minVal: 20240101,
        maxVal: 20251231,
      },
      total_amount: {
        name: 'total_amount',
        distinctCount: 8500,
        hasIndex: false,
        minVal: 10,
        maxVal: 5000,
      }
    }
  },

  Customers: {
    name: 'Customers',
    alias: 'C',
    rows: 10000,
    blocks: 50,
    tupleSize: 45,
    description: 'Registered customer demographics and account tiers',
    attributes: {
      cust_id: {
        name: 'cust_id',
        distinctCount: 10000,
        hasIndex: true,
        indexType: 'B+_TREE',
        indexHeight: 2,
        minVal: 1,
        maxVal: 10000,
        histogram: [
          { bucketId: 1, lowerBound: 1, upperBound: 2000, frequency: 2000, selectivity: 0.2 },
          { bucketId: 2, lowerBound: 2001, upperBound: 4000, frequency: 2000, selectivity: 0.2 },
          { bucketId: 3, lowerBound: 4001, upperBound: 6000, frequency: 2000, selectivity: 0.2 },
          { bucketId: 4, lowerBound: 6001, upperBound: 8000, frequency: 2000, selectivity: 0.2 },
          { bucketId: 5, lowerBound: 8001, upperBound: 10000, frequency: 2000, selectivity: 0.2 },
        ]
      },
      tier: {
        name: 'tier',
        distinctCount: 4,
        hasIndex: false,
        minVal: 1,
        maxVal: 4,
      },
      country: {
        name: 'country',
        distinctCount: 50,
        hasIndex: false,
        minVal: 1,
        maxVal: 50,
      }
    }
  },

  Products: {
    name: 'Products',
    alias: 'P',
    rows: 5000,
    blocks: 25,
    tupleSize: 40,
    description: 'Merchandise SKU catalog, pricing and stock reserves',
    attributes: {
      prod_id: {
        name: 'prod_id',
        distinctCount: 5000,
        hasIndex: true,
        indexType: 'B+_TREE',
        indexHeight: 2,
        minVal: 1,
        maxVal: 5000,
        histogram: [
          { bucketId: 1, lowerBound: 1, upperBound: 1000, frequency: 1000, selectivity: 0.2 },
          { bucketId: 2, lowerBound: 1001, upperBound: 2000, frequency: 1000, selectivity: 0.2 },
          { bucketId: 3, lowerBound: 2001, upperBound: 3000, frequency: 1000, selectivity: 0.2 },
          { bucketId: 4, lowerBound: 3001, upperBound: 4000, frequency: 1000, selectivity: 0.2 },
          { bucketId: 5, lowerBound: 4001, upperBound: 5000, frequency: 1000, selectivity: 0.2 },
        ]
      },
      category: {
        name: 'category',
        distinctCount: 25,
        hasIndex: false,
        minVal: 1,
        maxVal: 25,
      },
      price: {
        name: 'price',
        distinctCount: 1200,
        hasIndex: false,
        minVal: 5,
        maxVal: 2000,
      }
    }
  },

  OrderItems: {
    name: 'OrderItems',
    alias: 'OI',
    rows: 500000,
    blocks: 2000,
    tupleSize: 28,
    description: 'High-volume line items linking orders to purchased products',
    attributes: {
      item_id: {
        name: 'item_id',
        distinctCount: 500000,
        hasIndex: true,
        indexType: 'B+_TREE',
        indexHeight: 3,
        minVal: 1,
        maxVal: 500000,
      },
      order_id: {
        name: 'order_id',
        distinctCount: 100000,
        hasIndex: true,
        indexType: 'B+_TREE',
        indexHeight: 3,
        minVal: 1,
        maxVal: 100000,
        histogram: [
          { bucketId: 1, lowerBound: 1, upperBound: 20000, frequency: 105000, selectivity: 0.21 },
          { bucketId: 2, lowerBound: 20001, upperBound: 40000, frequency: 102000, selectivity: 0.204 },
          { bucketId: 3, lowerBound: 4001, upperBound: 60000, frequency: 98000, selectivity: 0.196 },
          { bucketId: 4, lowerBound: 6001, upperBound: 80000, frequency: 99000, selectivity: 0.198 },
          { bucketId: 5, lowerBound: 8001, upperBound: 100000, frequency: 96000, selectivity: 0.192 },
        ]
      },
      prod_id: {
        name: 'prod_id',
        distinctCount: 5000,
        hasIndex: true,
        indexType: 'B+_TREE',
        indexHeight: 2,
        minVal: 1,
        maxVal: 5000,
        histogram: [
          { bucketId: 1, lowerBound: 1, upperBound: 1000, frequency: 180000, selectivity: 0.36 }, // skewed popular products!
          { bucketId: 2, lowerBound: 1001, upperBound: 2000, frequency: 120000, selectivity: 0.24 },
          { bucketId: 3, lowerBound: 2001, upperBound: 3000, frequency: 90000, selectivity: 0.18 },
          { bucketId: 4, lowerBound: 3001, upperBound: 4000, frequency: 65000, selectivity: 0.13 },
          { bucketId: 5, lowerBound: 4001, upperBound: 5000, frequency: 45000, selectivity: 0.09 },
        ]
      },
      quantity: {
        name: 'quantity',
        distinctCount: 20,
        hasIndex: false,
        minVal: 1,
        maxVal: 50,
      }
    }
  },

  Reviews: {
    name: 'Reviews',
    alias: 'R',
    rows: 200000,
    blocks: 800,
    tupleSize: 36,
    description: 'Product ratings and feedback records',
    attributes: {
      review_id: {
        name: 'review_id',
        distinctCount: 200000,
        hasIndex: true,
        indexType: 'B+_TREE',
        indexHeight: 3,
        minVal: 1,
        maxVal: 200000,
      },
      prod_id: {
        name: 'prod_id',
        distinctCount: 5000,
        hasIndex: true,
        indexType: 'B+_TREE',
        indexHeight: 2,
        minVal: 1,
        maxVal: 5000,
      },
      rating: {
        name: 'rating',
        distinctCount: 5,
        hasIndex: false,
        minVal: 1,
        maxVal: 5,
      }
    }
  },

  Shipping: {
    name: 'Shipping',
    alias: 'S',
    rows: 100000,
    blocks: 350,
    tupleSize: 30,
    description: 'Logistics tracking and carrier fulfillment records',
    attributes: {
      ship_id: {
        name: 'ship_id',
        distinctCount: 100000,
        hasIndex: true,
        indexType: 'B+_TREE',
        indexHeight: 3,
        minVal: 1,
        maxVal: 100000,
      },
      order_id: {
        name: 'order_id',
        distinctCount: 100000,
        hasIndex: true,
        indexType: 'B+_TREE',
        indexHeight: 3,
        minVal: 1,
        maxVal: 100000,
      },
      carrier: {
        name: 'carrier',
        distinctCount: 6,
        hasIndex: false,
        minVal: 1,
        maxVal: 6,
      }
    }
  },

  Suppliers: {
    name: 'Suppliers',
    alias: 'SP',
    rows: 2000,
    blocks: 10,
    tupleSize: 48,
    description: 'Wholesale vendors supplying warehouse stock',
    attributes: {
      supplier_id: {
        name: 'supplier_id',
        distinctCount: 2000,
        hasIndex: true,
        indexType: 'B+_TREE',
        indexHeight: 2,
        minVal: 1,
        maxVal: 2000,
      },
      prod_id: {
        name: 'prod_id',
        distinctCount: 5000,
        hasIndex: true,
        indexType: 'B+_TREE',
        indexHeight: 2,
        minVal: 1,
        maxVal: 5000,
      }
    }
  }
};

export const MEMORY_BUFFER_PAGES = 50; // M = 50 pages default in cost model
