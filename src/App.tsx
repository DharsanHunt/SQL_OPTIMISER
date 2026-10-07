import React from 'react';
import { OptimizerProvider, useOptimizer } from './context/OptimizerContext';
import { TopNavbar } from './components/layout/TopNavbar';
import { DashboardPage } from './pages/DashboardPage';
import { QueryLabPage } from './pages/QueryLabPage';
import { OptimizerOverviewPage } from './pages/OptimizerOverviewPage';
import { JoinTreePage } from './pages/JoinTreePage';
import { JoinGraphPage } from './pages/JoinGraphPage';
import { DPExplorerPage } from './pages/DPExplorerPage';
import { CostModelPage } from './pages/CostModelPage';
import { CatalogPage } from './pages/CatalogPage';
import { ExecutionPlanPage } from './pages/ExecutionPlanPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { PostgresComparePage } from './pages/PostgresComparePage';
import { DocumentationPage } from './pages/DocumentationPage';
import { DemoModePage } from './pages/DemoModePage';
import { AIOptimizerPage } from './pages/AIOptimizerPage';

const AppContent: React.FC = () => {
  const { activeTab } = useOptimizer();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'query-lab':
        return <QueryLabPage />;
      case 'ai-optimizer':
        return <AIOptimizerPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'optimizer':
        return <OptimizerOverviewPage />;
      case 'join-tree':
        return <JoinTreePage />;
      case 'join-graph':
        return <JoinGraphPage />;
      case 'dp-explorer':
        return <DPExplorerPage />;
      case 'cost-model':
        return <CostModelPage />;
      case 'catalog':
        return <CatalogPage />;
      case 'execution-plan':
        return <ExecutionPlanPage />;
      case 'comparison':
        return <ComparisonPage />;
      case 'benchmarks':
        return <BenchmarkPage />;
      case 'postgres-compare':
        return <PostgresComparePage />;
      case 'documentation':
        return <DocumentationPage />;
      case 'demo-mode':
        return <DemoModePage />;
      default:
        return <QueryLabPage />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F7F4] text-[#181B1F] flex flex-col font-sans select-none">
      {/* Top Header & Workload Pill Carousel (Matching User's Reference Screenshot) */}
      <TopNavbar />

      {/* Main Content Stage Viewport */}
      <main className="flex-1 w-full overflow-y-auto">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <OptimizerProvider>
      <AppContent />
    </OptimizerProvider>
  );
}
