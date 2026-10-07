import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, GitFork, Cpu, Layers, HardDrive } from 'lucide-react';
import { PlanNode } from '../../types/optimizer';

interface PlanNodeCardProps {
  data: {
    node: PlanNode;
    isSelected: boolean;
    onSelect: (node: PlanNode) => void;
  };
}

export const PlanNodeCard = memo(({ data }: PlanNodeCardProps) => {
  const { node, isSelected, onSelect } = data;
  const isJoin = node.type === 'JOIN';
  const isCross = node.operator === 'CROSS_PRODUCT';

  return (
    <div
      onClick={() => onSelect(node)}
      className={`relative min-w-[210px] rounded-xl p-3.5 border transition-all cursor-pointer shadow-card-subtle select-none ${
        isSelected
          ? 'bg-white border-[#181B1F] ring-2 ring-[#181B1F]/30 shadow-card-hover'
          : isCross
          ? 'bg-rose-50 border-rose-300 hover:border-rose-400'
          : isJoin
          ? 'bg-white border-[#E5E3DC] hover:border-[#181B1F]'
          : 'bg-[#FAF9F6] border-[#E5E3DC] hover:border-[#8E95A5]'
      }`}
    >
      {/* Top handles for joins */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[#181B1F] !w-2.5 !h-2.5 !border-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
        <div className="flex items-center space-x-1.5">
          {isCross ? (
            <div className="w-5 h-5 rounded bg-rose-100 text-rose-700 flex items-center justify-center">
              <GitFork className="w-3 h-3" />
            </div>
          ) : isJoin ? (
            <div className="w-5 h-5 rounded bg-[#181B1F] text-white flex items-center justify-center">
              <Cpu className="w-3 h-3" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded bg-[#EFECE5] text-[#181B1F] flex items-center justify-center">
              <Database className="w-3 h-3" />
            </div>
          )}

          <span className="text-xs font-bold font-mono text-[#181B1F] truncate max-w-[140px]">
            {isJoin ? node.operator.toUpperCase() : node.relation}
          </span>
        </div>

        <span
          className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
            isCross
              ? 'bg-rose-100 text-rose-800'
              : isJoin
              ? 'bg-[#EFECE5] text-[#181B1F]'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {isJoin ? 'Join' : 'Scan'}
        </span>
      </div>

      {/* Node stats */}
      <div className="pt-2 space-y-1.5 text-[11px] font-mono">
        <div className="flex justify-between items-center text-[#525866]">
          <span className="flex items-center space-x-1">
            <HardDrive className="w-3 h-3 text-[#8E95A5]" />
            <span>Cost:</span>
          </span>
          <span className="text-emerald-700 font-bold">{node.cost.toLocaleString()} b</span>
        </div>

        <div className="flex justify-between items-center text-[#525866]">
          <span className="flex items-center space-x-1">
            <Layers className="w-3 h-3 text-[#8E95A5]" />
            <span>Card:</span>
          </span>
          <span className="text-[#181B1F] font-semibold">
            {node.estimatedCardinality.toLocaleString()} r
          </span>
        </div>

        {node.joinPredicate && (
          <div className="pt-1 text-[10px] text-[#8E95A5] border-t border-[#ECE8E0] truncate">
            {node.joinPredicate}
          </div>
        )}
      </div>

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[#181B1F] !w-2.5 !h-2.5 !border-white"
      />
    </div>
  );
});
