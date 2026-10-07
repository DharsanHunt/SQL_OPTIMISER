import React, { useState, useMemo } from 'react';
import { useOptimizer } from '../context/OptimizerContext';
import {
  ReactFlow,
  Controls,
  Background,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PlanNodeCard } from '../components/plan/PlanNodeCard';
import { PlanNode } from '../types/optimizer';
import {
  GitFork,
  Cpu,
  Layers,
  HardDrive,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const nodeTypes = {
  planNode: PlanNodeCard,
};

export const JoinTreePage: React.FC = () => {
  const { activeResult } = useOptimizer();
  const [inspectedNode, setInspectedNode] = useState<PlanNode | null>(activeResult.bestPlan);

  // Convert recursive PlanNode tree into React Flow nodes and edges
  const { nodes, edges } = useMemo(() => {
    const nodeList: Node[] = [];
    const edgeList: Edge[] = [];

    function traverse(node: PlanNode, x: number, y: number, level: number, offsetStep: number): string {
      const id = node.id;
      nodeList.push({
        id,
        type: 'planNode',
        position: { x, y },
        data: {
          node,
          isSelected: inspectedNode?.id === id,
          onSelect: (selected: PlanNode) => setInspectedNode(selected),
        },
      });

      if (node.left) {
        const leftX = x - offsetStep;
        const leftY = y + 150;
        const leftId = traverse(node.left, leftX, leftY, level + 1, offsetStep * 0.55);
        edgeList.push({
          id: `e-${id}-${leftId}`,
          source: id,
          target: leftId,
          animated: true,
          style: { stroke: '#181B1F', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#181B1F' },
          label: 'Outer (Stream)',
          labelStyle: { fill: '#525866', fontSize: 10, fontFamily: 'monospace' },
          labelBgStyle: { fill: '#FFFFFF', fillOpacity: 0.9 },
        });
      }

      if (node.right) {
        const rightX = x + offsetStep;
        const rightY = y + 150;
        const rightId = traverse(node.right, rightX, rightY, level + 1, offsetStep * 0.55);
        edgeList.push({
          id: `e-${id}-${rightId}`,
          source: id,
          target: rightId,
          animated: false,
          style: { stroke: '#181B1F', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#181B1F' },
          label: 'Inner (Build)',
          labelStyle: { fill: '#525866', fontSize: 10, fontFamily: 'monospace' },
          labelBgStyle: { fill: '#FFFFFF', fillOpacity: 0.9 },
        });
      }

      return id;
    }

    traverse(activeResult.bestPlan, 400, 40, 0, 260);

    return { nodes: nodeList, edges: edgeList };
  }, [activeResult, inspectedNode]);

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row overflow-hidden select-none font-sans">
      {/* Canvas Area */}
      <div className="flex-1 relative bg-[#F4F3EE] border-r border-[#E5E3DC]">
        {/* Floating Top Controls Header */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-[#E5E3DC] px-4 py-2 rounded-xl shadow-card-subtle flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <GitFork className="w-4 h-4 text-[#181B1F]" />
            <span className="text-xs font-bold text-[#181B1F]">Physical Join Tree Canvas</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
              Cheapest: {activeResult.bestPlan.cost.toLocaleString()} blocks
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#E5E3DC]" />

          <div className="text-xs text-[#8E95A5] font-mono">
            Click any operator node to inspect I/O & CPU breakdown
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-[#F4F3EE]"
        >
          <Background color="#E0DED7" gap={24} size={1} />
          <Controls position="bottom-right" />
        </ReactFlow>
      </div>

      {/* Right: Operator Node Inspection Drawer */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 border-[#E5E3DC] p-6 overflow-y-auto space-y-5 shadow-card-subtle">
        <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E0]">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-[#181B1F]" />
            <h2 className="text-sm font-bold text-[#181B1F]">Operator Inspector</h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EFECE5] text-[#181B1F] uppercase font-semibold">
            {inspectedNode?.type || 'OPERATOR'}
          </span>
        </div>

        {inspectedNode ? (
          <div className="space-y-4">
            {/* Title card */}
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC] space-y-1.5">
              <span className="text-[10px] font-mono text-[#8E95A5] uppercase">Operator Title</span>
              <div className="text-sm font-bold font-mono text-[#181B1F]">
                {inspectedNode.operatorLabel}
              </div>
              {inspectedNode.joinPredicate && (
                <div className="text-xs text-[#525866] font-mono pt-1">
                  Predicate: <span className="text-[#181B1F] font-semibold">{inspectedNode.joinPredicate}</span>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC]">
                <span className="text-[10px] text-[#8E95A5]">Total Cost</span>
                <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                  {inspectedNode.cost.toLocaleString()}
                </div>
                <span className="text-[9px] text-[#8E95A5]">Page blocks</span>
              </div>

              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC]">
                <span className="text-[10px] text-[#8E95A5]">Estimated Output</span>
                <div className="text-base font-bold font-mono text-[#181B1F] mt-0.5">
                  {inspectedNode.estimatedCardinality.toLocaleString()}
                </div>
                <span className="text-[9px] text-[#8E95A5]">Tuples</span>
              </div>
            </div>

            {/* Cost Formula Breakdown */}
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC] space-y-2.5">
              <span className="text-[10px] font-mono text-[#8E95A5] uppercase flex items-center space-x-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#181B1F]" />
                <span>Cost Model Formula & Variables</span>
              </span>

              <div className="p-2.5 rounded-lg bg-white border border-[#E5E3DC] text-xs font-mono text-[#181B1F] font-semibold">
                {inspectedNode.costBreakdown.formula}
              </div>

              <div className="space-y-1.5 pt-1">
                {Object.entries(inspectedNode.costBreakdown.variables).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs font-mono">
                    <span className="text-[#8E95A5]">{k}:</span>
                    <span className="text-[#181B1F] font-semibold">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Viva Context */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-[#181B1F] space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Viva Defense Point</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#525866]">
                Notice how the optimizer chooses the smaller relation as the build side in hash
                joins, minimizing hash table memory footprint and keeping join partitions in RAM.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-[#8E95A5] text-center space-y-2">
            <Info className="w-8 h-8" />
            <p className="text-xs">Select any node in the canvas to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};
