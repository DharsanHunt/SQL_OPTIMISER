import { JoinPredicate, SelectionPredicate } from '../types/optimizer';

export interface SampleQuery {
  id: string;
  title: string;
  description: string;
  badge: string;
  relations: string[];
  sql: string;
  predicates: JoinPredicate[];
  selectionPredicates?: SelectionPredicate[];
  isPrimaryWorkedExample?: boolean;
}

export const SAMPLE_QUERIES: SampleQuery[] = [
  {
    id: 'q-4-star-worked',
    title: '4-Table Core Worked Example (Project Report)',
    description: 'The canonical 4-table join from Dharsan Udayakumar’s project report. Demonstrates 54.5× cost reduction over naive left-deep ordering.',
    badge: '4 Tables · Primary Viva Demo',
    isPrimaryWorkedExample: true,
    relations: ['Orders', 'Customers', 'Products', 'OrderItems'],
    sql: `SELECT C.customer_name, O.order_id, P.category, OI.quantity
FROM Orders O
JOIN Customers C ON O.cust_id = C.cust_id
JOIN OrderItems OI ON O.order_id = OI.order_id
JOIN Products P ON OI.prod_id = P.prod_id;`,
    predicates: [
      {
        id: 'p1',
        leftRelation: 'Orders',
        leftAttribute: 'cust_id',
        rightRelation: 'Customers',
        rightAttribute: 'cust_id',
        operator: '=',
        raw: 'O.cust_id = C.cust_id',
      },
      {
        id: 'p2',
        leftRelation: 'Orders',
        leftAttribute: 'order_id',
        rightRelation: 'OrderItems',
        rightAttribute: 'order_id',
        operator: '=',
        raw: 'OI.order_id = O.order_id',
      },
      {
        id: 'p3',
        leftRelation: 'OrderItems',
        leftAttribute: 'prod_id',
        rightRelation: 'Products',
        rightAttribute: 'prod_id',
        operator: '=',
        raw: 'OI.prod_id = P.prod_id',
      },
    ],
  },

  {
    id: 'q-3-basic',
    title: '3-Table Basic E-Commerce Join',
    description: 'Linear join chain between Customers, Orders, and OrderItems. Small search space demonstrating baseline DP recurrence.',
    badge: '3 Tables · Minimal',
    relations: ['Customers', 'Orders', 'OrderItems'],
    sql: `SELECT C.customer_name, O.order_id, OI.item_id
FROM Customers C
JOIN Orders O ON C.cust_id = O.cust_id
JOIN OrderItems OI ON O.order_id = OI.order_id;`,
    predicates: [
      {
        id: 'p1',
        leftRelation: 'Customers',
        leftAttribute: 'cust_id',
        rightRelation: 'Orders',
        rightAttribute: 'cust_id',
        operator: '=',
        raw: 'C.cust_id = O.cust_id',
      },
      {
        id: 'p2',
        leftRelation: 'Orders',
        leftAttribute: 'order_id',
        rightRelation: 'OrderItems',
        rightAttribute: 'order_id',
        operator: '=',
        raw: 'O.order_id = OI.order_id',
      },
    ],
  },

  {
    id: 'q-5-reviews',
    title: '5-Table Star Schema with Product Feedback',
    description: 'Includes Reviews relation. Naive order cost blows up to 22.4M blocks; DP optimizer keeps cost to 58,300 blocks (384× speedup).',
    badge: '5 Tables · 384× Gain',
    relations: ['Customers', 'Orders', 'OrderItems', 'Products', 'Reviews'],
    sql: `SELECT C.customer_name, P.category, R.rating, OI.quantity
FROM Customers C
JOIN Orders O ON C.cust_id = O.cust_id
JOIN OrderItems OI ON O.order_id = OI.order_id
JOIN Products P ON OI.prod_id = P.prod_id
JOIN Reviews R ON P.prod_id = R.prod_id;`,
    predicates: [
      {
        id: 'p1',
        leftRelation: 'Customers',
        leftAttribute: 'cust_id',
        rightRelation: 'Orders',
        rightAttribute: 'cust_id',
        operator: '=',
        raw: 'C.cust_id = O.cust_id',
      },
      {
        id: 'p2',
        leftRelation: 'Orders',
        leftAttribute: 'order_id',
        rightRelation: 'OrderItems',
        rightAttribute: 'order_id',
        operator: '=',
        raw: 'O.order_id = OI.order_id',
      },
      {
        id: 'p3',
        leftRelation: 'OrderItems',
        leftAttribute: 'prod_id',
        rightRelation: 'Products',
        rightAttribute: 'prod_id',
        operator: '=',
        raw: 'OI.prod_id = P.prod_id',
      },
      {
        id: 'p4',
        leftRelation: 'Products',
        leftAttribute: 'prod_id',
        rightRelation: 'Reviews',
        rightAttribute: 'prod_id',
        operator: '=',
        raw: 'P.prod_id = R.prod_id',
      },
    ],
  },

  {
    id: 'q-6-snowflake',
    title: '6-Table Snowflake Schema with Logistics Tracking',
    description: 'Includes Shipping logistics. Naive plan incurs catastrophic cross products (610M blocks) while DP optimizer selects clean 141,000 block plan.',
    badge: '6 Tables · 4,326× Gain',
    relations: ['Customers', 'Orders', 'Shipping', 'OrderItems', 'Products', 'Reviews'],
    sql: `SELECT C.customer_name, S.carrier, P.category, R.rating
FROM Customers C
JOIN Orders O ON C.cust_id = O.cust_id
JOIN Shipping S ON O.order_id = S.order_id
JOIN OrderItems OI ON O.order_id = OI.order_id
JOIN Products P ON OI.prod_id = P.prod_id
JOIN Reviews R ON P.prod_id = R.prod_id;`,
    predicates: [
      {
        id: 'p1',
        leftRelation: 'Customers',
        leftAttribute: 'cust_id',
        rightRelation: 'Orders',
        rightAttribute: 'cust_id',
        operator: '=',
        raw: 'C.cust_id = O.cust_id',
      },
      {
        id: 'p2',
        leftRelation: 'Orders',
        leftAttribute: 'order_id',
        rightRelation: 'Shipping',
        rightAttribute: 'order_id',
        operator: '=',
        raw: 'O.order_id = S.order_id',
      },
      {
        id: 'p3',
        leftRelation: 'Orders',
        leftAttribute: 'order_id',
        rightRelation: 'OrderItems',
        rightAttribute: 'order_id',
        operator: '=',
        raw: 'O.order_id = OI.order_id',
      },
      {
        id: 'p4',
        leftRelation: 'OrderItems',
        leftAttribute: 'prod_id',
        rightRelation: 'Products',
        rightAttribute: 'prod_id',
        operator: '=',
        raw: 'OI.prod_id = P.prod_id',
      },
      {
        id: 'p5',
        leftRelation: 'Products',
        leftAttribute: 'prod_id',
        rightRelation: 'Reviews',
        rightAttribute: 'prod_id',
        operator: '=',
        raw: 'P.prod_id = R.prod_id',
      },
    ],
  },

  {
    id: 'q-7-enterprise',
    title: '7-Table Enterprise Star / Snowflake Topology',
    description: 'Maximal scope of the project (3 to 7 relations). Explores 2,187 candidate state transitions in ~480 ms.',
    badge: '7 Tables · Maximal Scope',
    relations: ['Customers', 'Orders', 'Shipping', 'OrderItems', 'Products', 'Suppliers', 'Reviews'],
    sql: `SELECT C.customer_name, S.carrier, SP.supplier_id, R.rating
FROM Customers C
JOIN Orders O ON C.cust_id = O.cust_id
JOIN Shipping S ON O.order_id = S.order_id
JOIN OrderItems OI ON O.order_id = OI.order_id
JOIN Products P ON OI.prod_id = P.prod_id
JOIN Suppliers SP ON P.prod_id = SP.prod_id
JOIN Reviews R ON P.prod_id = R.prod_id;`,
    predicates: [
      {
        id: 'p1',
        leftRelation: 'Customers',
        leftAttribute: 'cust_id',
        rightRelation: 'Orders',
        rightAttribute: 'cust_id',
        operator: '=',
        raw: 'C.cust_id = O.cust_id',
      },
      {
        id: 'p2',
        leftRelation: 'Orders',
        leftAttribute: 'order_id',
        rightRelation: 'Shipping',
        rightAttribute: 'order_id',
        operator: '=',
        raw: 'O.order_id = S.order_id',
      },
      {
        id: 'p3',
        leftRelation: 'Orders',
        leftAttribute: 'order_id',
        rightRelation: 'OrderItems',
        rightAttribute: 'order_id',
        operator: '=',
        raw: 'O.order_id = OI.order_id',
      },
      {
        id: 'p4',
        leftRelation: 'OrderItems',
        leftAttribute: 'prod_id',
        rightRelation: 'Products',
        rightAttribute: 'prod_id',
        operator: '=',
        raw: 'OI.prod_id = P.prod_id',
      },
      {
        id: 'p5',
        leftRelation: 'Products',
        leftAttribute: 'prod_id',
        rightRelation: 'Suppliers',
        rightAttribute: 'prod_id',
        operator: '=',
        raw: 'P.prod_id = SP.prod_id',
      },
      {
        id: 'p6',
        leftRelation: 'Products',
        leftAttribute: 'prod_id',
        rightRelation: 'Reviews',
        rightAttribute: 'prod_id',
        operator: '=',
        raw: 'P.prod_id = R.prod_id',
      },
    ],
  },

  {
    id: 'q-disconnected-warning',
    title: 'Disconnected Query (Cartesian Product Edge Case)',
    description: 'Products table has no join predicate connecting it to Orders or Customers. Used to demonstrate connectivity pruning warnings.',
    badge: 'Edge Case · Disconnected',
    relations: ['Orders', 'Customers', 'Products'],
    sql: `SELECT O.order_id, C.customer_name, P.category
FROM Orders O
JOIN Customers C ON O.cust_id = C.cust_id,
Products P;`,
    predicates: [
      {
        id: 'p1',
        leftRelation: 'Orders',
        leftAttribute: 'cust_id',
        rightRelation: 'Customers',
        rightAttribute: 'cust_id',
        operator: '=',
        raw: 'O.cust_id = C.cust_id',
      }
    ],
  }
];
