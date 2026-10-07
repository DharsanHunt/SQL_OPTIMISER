import React, { useState } from 'react';
import { useOptimizer } from '../context/OptimizerContext';
import {
  Database,
  Table as TableIcon,
  BarChart2,
  Key,
  Layers,
  HardDrive,
  Info,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';

export const CatalogPage: React.FC = () => {
  const { catalog } = useOptimizer();
  const tableNames = Object.keys(catalog);
  const [selectedTable, setSelectedTable] = useState<string>(tableNames[0]);
  const [testValue, setTestValue] = useState<number>(1500);

  const activeStats = catalog[selectedTable];
  const attributes = Object.values(activeStats.attributes);

  // Active indexed attribute with histogram (or first one)
  const histAttr =
    attributes.find((a) => a.histogram && a.histogram.length > 0) || attributes[0];

  const buckets = histAttr.histogram || [];

  // Find bucket containing testValue
  const matchedBucket = buckets.find(
    (b) => testValue >= b.lowerBound && testValue <= b.upperBound
  ) || buckets[0];

  // Selectivity calculations: Uniform vs Histogram
  const uniformSelectivity = 1 / Math.max(1, histAttr.distinctCount);
  const uniformRows = Math.round(activeStats.rows * uniformSelectivity);

  const bucketWidth = matchedBucket
    ? Math.max(1, matchedBucket.upperBound - matchedBucket.lowerBound + 1)
    : 1;
  const histogramSelectivity = matchedBucket
    ? matchedBucket.frequency / (bucketWidth * activeStats.rows)
    : uniformSelectivity;
  const histogramRows = Math.round(activeStats.rows * histogramSelectivity);

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto select-none font-sans">
      {/* Header */}
      <div className="border-b border-[#E5E3DC] pb-6">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
            SYSTEM CATALOG & METADATA
          </span>
          <span className="text-xs text-[#8E95A5]">
            {tableNames.length} Relations · Equi-Width Histograms · B+-Tree Indexes
          </span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#181B1F] mt-1">
          Catalog & Cardinality Estimation Statistics
        </h1>
        <p className="text-xs text-[#525866] mt-1">
          Database metadata catalog tracking relation cardinalities, disk page block counts B(R), index heights, and histogram bucket distributions.
        </p>
      </div>

      {/* Main Grid: Schema Browser + Table Inspector + Histogram Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Schema Tree Browser */}
        <div className="rounded-2xl bg-white border border-[#E5E3DC] p-4 space-y-3 shadow-card-subtle">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#ECE8E0]">
            <TableIcon className="w-4 h-4 text-[#181B1F]" />
            <h2 className="text-xs font-bold font-mono uppercase text-[#181B1F]">Catalog Relations</h2>
          </div>

          <div className="space-y-1.5">
            {tableNames.map((name) => {
              const t = catalog[name];
              const isSelected = name === selectedTable;
              return (
                <button
                  key={name}
                  onClick={() => setSelectedTable(name)}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-mono transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-[#181B1F] border-[#181B1F] text-white shadow-sm'
                      : 'bg-[#FAF9F6] border-[#E5E3DC] text-[#525866] hover:text-[#181B1F] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Database className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#8E95A5]'}`} />
                    <span className="font-semibold">{name}</span>
                  </div>
                  <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[#8E95A5]'}`}>
                    {t.blocks} blks
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ECE8E0] text-[11px] text-[#525866] space-y-1">
            <span className="font-semibold text-[#181B1F]">Catalog Maintenance:</span>
            <p>Statistics are refreshed via an ANALYZE routine, recording row counts |R|, page blocks B(R), and equi-width histograms.</p>
          </div>
        </div>

        {/* Right 3 Cols: Table Details & Histogram Analysis */}
        <div className="lg:col-span-3 space-y-6">
          {/* Table Header Summary */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5E3DC] shadow-card-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-bold text-[#181B1F]">{activeStats.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FAF9F6] text-[#525866] border border-[#E5E3DC]">
                  Alias: {activeStats.alias || activeStats.name[0]}
                </span>
              </div>
              <p className="text-xs text-[#525866] mt-1">{activeStats.description}</p>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5E3DC] text-center min-w-[90px]">
                <span className="text-[10px] text-[#8E95A5]">Rows |R|</span>
                <div className="text-base font-bold text-[#181B1F] mt-0.5">{activeStats.rows.toLocaleString()}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5E3DC] text-center min-w-[90px]">
                <span className="text-[10px] text-[#8E95A5]">Blocks B(R)</span>
                <div className="text-base font-bold text-emerald-700 mt-0.5">{activeStats.blocks.toLocaleString()}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5E3DC] text-center min-w-[90px]">
                <span className="text-[10px] text-[#8E95A5]">Tuple Size</span>
                <div className="text-base font-bold text-[#525866] mt-0.5">{activeStats.tupleSize} B</div>
              </div>
            </div>
          </div>

          {/* Attributes & Columns Table */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5E3DC] shadow-card-subtle space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase text-[#8E95A5]">
              Attributes & Index Metadata
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#ECE8E0] text-[#8E95A5]">
                    <th className="pb-2 font-semibold">Attribute</th>
                    <th className="pb-2 font-semibold">Distinct Values V(a,R)</th>
                    <th className="pb-2 font-semibold">Index Status</th>
                    <th className="pb-2 font-semibold">Index Height (HTi)</th>
                    <th className="pb-2 font-semibold">Histogram</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE8E0]">
                  {attributes.map((attr) => (
                    <tr key={attr.name}>
                      <td className="py-2.5 text-[#181B1F] font-semibold">{attr.name}</td>
                      <td className="py-2.5 text-[#525866]">{attr.distinctCount.toLocaleString()}</td>
                      <td className="py-2.5">
                        {attr.hasIndex ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            {attr.indexType || 'B+-TREE'}
                          </span>
                        ) : (
                          <span className="text-[#8E95A5] text-[10px]">None (Seq Scan)</span>
                        )}
                      </td>
                      <td className="py-2.5 text-[#525866]">{attr.indexHeight || '—'}</td>
                      <td className="py-2.5">
                        {attr.histogram ? (
                          <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[10px] font-semibold">
                            {attr.histogram.length} Equi-Width Buckets
                          </span>
                        ) : (
                          <span className="text-[#8E95A5] text-[10px]">Uniform</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Equi-Width Histogram Visualizer */}
          {buckets.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-[#E5E3DC] shadow-card-subtle space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#181B1F] flex items-center space-x-2">
                    <BarChart2 className="w-4 h-4 text-purple-600" />
                    <span>Equi-Width Histogram on {histAttr.name}</span>
                  </h3>
                  <p className="text-xs text-[#8E95A5] mt-0.5">
                    Demonstrating frequency distribution across {buckets.length} buckets
                  </p>
                </div>

                {/* Predicate Value Slider / Input */}
                <div className="flex items-center space-x-3 bg-[#FAF9F6] px-3 py-1.5 rounded-xl border border-[#E5E3DC]">
                  <Sliders className="w-3.5 h-3.5 text-[#8E95A5]" />
                  <label className="text-xs text-[#525866] font-mono">
                    Predicate: {histAttr.name} =
                  </label>
                  <input
                    type="number"
                    value={testValue}
                    onChange={(e) => setTestValue(Number(e.target.value))}
                    className="w-20 bg-white border border-[#E5E3DC] text-[#181B1F] text-xs font-mono px-2 py-0.5 rounded text-center focus:outline-none focus:border-[#181B1F]"
                  />
                </div>
              </div>

              {/* Chart */}
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={buckets}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EFEA" vertical={false} />
                    <XAxis
                      dataKey="bucketId"
                      stroke="#8E95A5"
                      fontSize={11}
                      tickFormatter={(id) => `Bucket ${id}`}
                    />
                    <YAxis
                      stroke="#8E95A5"
                      fontSize={11}
                      tickFormatter={(val) => `${(val / 1000).toFixed(0)}k rows`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E3DC',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                      formatter={(val: any) => [`${Number(val).toLocaleString()} tuples`, 'Frequency']}
                    />
                    <Bar dataKey="frequency" radius={[4, 4, 0, 0]}>
                      {buckets.map((b) => (
                        <Cell
                          key={b.bucketId}
                          fill={matchedBucket?.bucketId === b.bucketId ? '#10B981' : '#6366F1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Estimation Comparison: Without vs With Histogram */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#ECE8E0] space-y-1">
                  <div className="text-[11px] font-mono text-[#8E95A5] uppercase font-semibold">
                    Without Histogram (Uniform Assumption)
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs text-[#525866]">Selectivity:</span>
                    <span className="font-mono text-[#181B1F] text-xs">
                      {(uniformSelectivity * 100).toFixed(4)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#525866]">Estimated Rows:</span>
                    <span className="font-mono text-amber-700 font-bold text-xs">
                      {uniformRows.toLocaleString()} rows
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-1">
                  <div className="text-[11px] font-mono text-emerald-800 uppercase flex items-center justify-between font-semibold">
                    <span>With Histogram (Equi-Width)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded">
                      Matched Bucket #{matchedBucket?.bucketId}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs text-[#525866]">Selectivity:</span>
                    <span className="font-mono text-emerald-800 text-xs">
                      {(histogramSelectivity * 100).toFixed(4)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#525866]">Estimated Rows:</span>
                    <span className="font-mono text-emerald-700 font-bold text-xs">
                      {histogramRows.toLocaleString()} rows
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
