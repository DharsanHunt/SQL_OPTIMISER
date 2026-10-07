# OPTIMIZER LAB: Cost-Based Query Optimizer with Join Order Enumeration

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A modern, highly visual DBMS Query Optimization Workbench and Viva Defense Platform. Implements Selinger-style dynamic programming join enumeration, join graph connectivity pruning, System R cost modeling, equi-width histograms, physical operator selection, and an **AI Optimization Suite**.

---

## 🚀 Key Highlights

1. **Selinger Bottom-Up Dynamic Programming ($O(3^n)$)**:
   - Evaluates optimal access paths for single relations.
   - Iteratively builds optimal subplans for subset sizes $k = 2 \dots n$.
   - Prunes non-connected cross products in $O(1)$ time using join graph adjacency matrices.
   - Guaranteed $0.0\%$ optimality gap against exhaustive search for queries up to 7 relations.

2. **System R Physical Cost Modeling**:
   - Sequential Scan: $B(R)$
   - B+-Tree Index Scan: $\text{HT}_i + \text{sel} \times B(R)$
   - Block Nested Loop (BNL): $B(R) + \left\lceil \frac{B(R)}{M - 2} \right\rceil \times B(S)$
   - Index Nested Loop (INLJ): $B(R) + |R| \times (\text{HT}_i + \text{sel} \times B(S))$
   - Grace Hash Join: $3 \times (B(R) + B(S))$

3. **Catalog & Cardinality Estimation**:
   - 7-Table E-Commerce Schema (`Orders`, `Customers`, `Products`, `OrderItems`, `Reviews`, `Shipping`, `Suppliers`).
   - Equi-width histograms with frequency distribution tracking.
   - Standard join cardinality formula:
     $$\lvert R \bowtie S \rvert \approx \frac{\lvert R \rvert \times \lvert S \rvert}{\max(V(a, R), V(b, S))}$$

4. **Commercial DBMS Benchmark & EXPLAIN**:
   - Compares Selinger DP plans against naive text order plans and exhaustive search.
   - Side-by-side verification with PostgreSQL 16 EXPLAIN cost formulas.

---

## 🧠 AI Optimization Suite (4 Core Pillars)

To extend traditional 1979 Selinger optimizers with modern database research (SIGMOD / CIDR):

### 1. 🪄 AI Query Rewriter (Improves the SQL)
- **Subquery Decorrelation**: Rewrites nested `WHERE EXISTS` / `IN (SELECT ...)` subqueries into set-oriented Hash Semi-Joins ($99.8\%$ cost reduction / $889\times$ speedup).
- **Sargable Index Transformation**: Unwraps non-sargable functions like `YEAR(order_date) = 2024` into index-seekable range conditions (`order_date >= 20240101 AND order_date <= 20241231`).
- **Predicate Pushdown**: Enforces $\sigma_{\text{cond}}(R \bowtie S) \equiv \sigma_{\text{cond}}(R) \bowtie S$.
- **Custom SQL Sandbox**: Accepts any custom SQL with 1-click **Load & Optimize** pipeline.

### 2. 💬 NL-to-SQL Compiler (Natural Language → SQL)
- **Schema Grounding**: Dynamically maps entities and attributes across the 7-table system catalog.
- **Foreign-Key Bridge Inference**: Automatically inserts bridge joins (e.g., `Customers` to `Products` through `Orders` and `OrderItems`) ensuring **zero Cartesian cross products**.
- **Filter Extraction**: Extracts numeric thresholds, dates, categories, customer tiers, and ratings into ANSI SQL.

### 3. 🎓 AI Viva Copilot (Explains the Optimizer)
- **Dynamic Plan Explanation**: Explains why the optimizer chose specific join orderings, disk page block savings, and why Grace Hash Join was selected over nested loops based on memory buffer limits ($M = 50$ pages).
- **Curated Viva Flashcards**: Examiner traps, mathematical proofs, and literature citations (*Kipf CIDR 2019*, *Leis PVLDB 2015*, *Marcus SIGMOD 2018*).
- **Interactive Q&A Defense**: Ask any theoretical question regarding $O(3^n)$ complexity, bushy vs left-deep trees, or System R equations.

### 4. 📊 AI Cardinality Estimator (MSCN Neural Network)
- **Attribute Value Independence (AVI) Problem**: Exposes how classical 1D histograms fail on correlated columns (e.g., VIP customers ordering high-value electronics).
- **Multi-Set Convolutional Network (MSCN)**: Neural representation that learns multi-table joint distributions directly.
- **Custom Predicate Sandbox**: Pick any two tables and columns from the catalog, adjust correlation skew ($10\% - 99\%$), and compare Ground Truth vs Uniform Guess vs 1D Histograms vs MSCN Neural Network with live $q$-error metrics.

---

## 🎨 UI/UX Design

- **Vellum Light Theme**: Warm editorial backdrop (`#F8F7F4`), crisp white cards, `#E5E3DC` borders, `#181B1F` headings, and Newsreader serif typography.
- **Interactive Visualizers**:
  - Interactive Join Tree visualizer with zoom/pan and node inspection.
  - Relational Join Graph with connectivity edge selectivities.
  - Volcano Iterator Execution Plan hierarchy.
  - Equi-Width Histogram frequency distribution charts.
  - Parametric Cost Model formula sandbox.
  - Guided Viva Demo mode for 2–5 minute presentations.

---

## 🛠️ Project Structure

```text
src/
├── components/          # Reusable UI components & layouts
│   ├── layout/          # TopNavbar, Sidebar, Pipeline visualizers
│   └── plan/            # PlanNodeCard, tree visualizers
├── context/             # Global Optimizer state context
├── data/                # Catalog schema, sample queries, PG benchmarks
├── lib/                 # Core engine implementation
│   ├── ai/              # 4 AI modules (MSCN, Rewriter, Copilot, ReJOIN)
│   ├── catalog.ts       # Table statistics, block counts, histograms
│   ├── costModel.ts     # System R I/O + CPU cost equations
│   ├── dynamicProgramming.ts # Selinger DP enumerator (O(3^n))
│   └── joinGraph.ts     # Graph connectivity and cross product pruning
├── pages/               # Application views
│   ├── AIOptimizerPage.tsx
│   ├── BenchmarkPage.tsx
│   ├── CatalogPage.tsx
│   ├── ComparisonPage.tsx
│   ├── CostModelPage.tsx
│   ├── DemoModePage.tsx
│   ├── DocumentationPage.tsx
│   ├── DPExplorerPage.tsx
│   ├── ExecutionPlanPage.tsx
│   ├── JoinGraphPage.tsx
│   ├── JoinTreePage.tsx
│   ├── PostgresComparePage.tsx
│   └── QueryLabPage.tsx
└── types/               # TypeScript interfaces & types
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/DharsanHunt/SQL_OPTIMISER.git

# Enter project directory
cd SQL_OPTIMISER

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser at `http://localhost:5173/`.

### Build for Production
```bash
npm run build
```

---

## 📚 Academic References

- Selinger, P. G., et al. *"Access Path Selection in a Relational Database Management System."* ACM SIGMOD, 1979.
- Kipf, A., et al. *"Learned Cardinalities: Estimating Correlated Joins with MSCN."* CIDR, 2019.
- Leis, V., et al. *"How Good Are Query Optimizers, Really?"* PVLDB, 2015.
- Marcus, R., et al. *"Neo: A Learned Query Optimizer."* VLDB, 2019.
- Marcus, R., et al. *"Bao: Making Learned Query Optimization Practical."* ACM SIGMOD, 2021.

---

## 👨‍💻 Author

**Dharsan Udayakumar**  
Course: BCSE302L · Database Management Systems  
Vellore Institute of Technology (VIT)
