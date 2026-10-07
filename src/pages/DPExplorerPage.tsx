import React, { useState, useEffect } from 'react';
import { useOptimizer } from '../context/OptimizerContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  Code,
} from 'lucide-react';

const PSEUDOCODE_LINES = [
  { line: 1, text: 'function DP_JOIN_ENUMERATE(relations R, joinGraph G):' },
  { line: 2, text: '    bestPlan = {}' },
  { line: 3, text: '    for each Ri in R:' },
  { line: 4, text: '        bestPlan[{Ri}] = cheapestAccessPath(Ri)  # Seq vs Index' },
  { line: 5, text: '    for size = 2 to n:' },
  { line: 6, text: '        for each subset S of R with |S| == size:' },
  { line: 7, text: '            for each proper non-empty subset S1 of S:' },
  { line: 8, text: '                S2 = S - S1' },
  { line: 9, text: '                if not connected(S1, S2, G): continue  # Prune cross' },
  { line: 10, text: '               for joinMethod in {BNL, INLJ, HASH}:' },
  { line: 11, text: '                   cand = buildJoin(bestPlan[S1], bestPlan[S2], method)' },
  { line: 12, text: '                   if bestPlan[S] is null or cand.cost < bestPlan[S].cost:' },
  { line: 13, text: '                       bestPlan[S] = cand' },
  { line: 14, text: '    return bestPlan[R]' },
];

export const DPExplorerPage: React.FC = () => {
  const { activeResult } = useOptimizer();
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [selectedSubsetKey, setSelectedSubsetKey] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState<number>(1200);

  const maxLevel = activeResult.dpLevels.length;
  const currentLevelData = activeResult.dpLevels.find((l) => l.level === currentLevel);

  useEffect(() => {
    if (currentLevelData && currentLevelData.subsets.length > 0) {
      setSelectedSubsetKey(currentLevelData.subsets[0].subsetKey);
    }
  }, [currentLevel, activeResult]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentLevel((prev) => {
          if (prev >= maxLevel) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeedMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, maxLevel, playbackSpeedMs]);

  const activeCodeLine =
    currentLevel === 1 ? 4 : currentLevel < maxLevel ? 11 : 14;

  const selectedSubset = currentLevelData?.subsets.find(
    (s) => s.subsetKey === selectedSubsetKey
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none font-sans">
      {/* Header & Playback Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#EFECE5] text-[#181B1F] font-semibold">
              SELINGER DYNAMIC PROGRAMMING
            </span>
            <span className="text-xs text-[#8E95A5]">
              Complexity: O(3ⁿ) · Levels 1 to {maxLevel}
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#181B1F] mt-1">
            Dynamic Programming Algorithm Explorer
          </h1>
        </div>

        {/* Step Controls with black primary button */}
        <div className="flex items-center space-x-2 bg-white border border-[#E5E3DC] px-3 py-1.5 rounded-full shadow-card-subtle">
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentLevel(1);
            }}
            className="p-1.5 rounded-full text-[#8E95A5] hover:text-[#181B1F] hover:bg-[#FAF9F6] transition-colors"
            title="Reset to Level 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentLevel((prev) => Math.max(1, prev - 1));
            }}
            disabled={currentLevel <= 1}
            className="p-1.5 rounded-full text-[#8E95A5] hover:text-[#181B1F] disabled:opacity-30 transition-colors"
            title="Previous Level"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1 rounded-full bg-[#181B1F] hover:bg-[#2A2E35] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Auto Play</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentLevel((prev) => Math.min(maxLevel, prev + 1));
            }}
            disabled={currentLevel >= maxLevel}
            className="p-1.5 rounded-full text-[#8E95A5] hover:text-[#181B1F] disabled:opacity-30 transition-colors"
            title="Next Level"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-[#E5E3DC] mx-1" />

          <select
            value={playbackSpeedMs}
            onChange={(e) => setPlaybackSpeedMs(Number(e.target.value))}
            className="bg-[#FAF9F6] border border-[#E5E3DC] text-[#181B1F] text-xs rounded px-2 py-0.5 focus:outline-none font-mono"
          >
            <option value={2000}>0.5x</option>
            <option value={1200}>1.0x</option>
            <option value={600}>2.0x</option>
          </select>
        </div>
      </div>

      {/* Level Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-[#ECE8E0] pb-3 overflow-x-auto">
        {activeResult.dpLevels.map((lvl) => {
          const isCurrent = lvl.level === currentLevel;
          const isPassed = lvl.level <= currentLevel;
          return (
            <button
              key={lvl.level}
              onClick={() => {
                setIsPlaying(false);
                setCurrentLevel(lvl.level);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium flex items-center space-x-2 transition-all border ${
                isCurrent
                  ? 'bg-[#181B1F] text-white shadow-sm border-[#181B1F]'
                  : isPassed
                  ? 'bg-white border-[#E5E3DC] text-[#181B1F] hover:bg-[#FAF9F6]'
                  : 'bg-[#FAF9F6] border-[#E5E3DC] text-[#8E95A5]'
              }`}
            >
              <span>Level {lvl.level}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isCurrent ? 'bg-[#2A2E35] text-slate-200' : 'bg-[#EFECE5] text-[#8E95A5]'}`}>
                |S|={lvl.level}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Split: Subsets Cards + Pseudocode */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#181B1F] flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#181B1F]" />
              <span>
                Level {currentLevel}: Subsets of Size {currentLevel} (
                {currentLevelData?.subsets.length} Subsets)
              </span>
            </h2>
            <span className="text-xs font-mono text-[#8E95A5]">
              Click subset to inspect winning splits
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentLevelData?.subsets.map((sub) => {
              const isSelected = sub.subsetKey === selectedSubsetKey;
              return (
                <div
                  key={sub.subsetKey}
                  onClick={() => setSelectedSubsetKey(sub.subsetKey)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-3 shadow-card-subtle ${
                    isSelected
                      ? 'bg-[#FAF9F6] border-[#181B1F] ring-1 ring-[#181B1F]'
                      : 'bg-white border-[#E5E3DC] hover:border-[#8E95A5] hover:bg-[#FAF9F6]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-[#181B1F] truncate max-w-[130px]">
                      {`{${sub.relations.join(',')}}`}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase font-semibold">
                      {sub.chosenMethod}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-[#525866]">
                      <span>Cheapest:</span>
                      <span className="text-emerald-700 font-bold">
                        {sub.bestCost.toLocaleString()} b
                      </span>
                    </div>
                    <div className="flex justify-between text-[#525866]">
                      <span>Output:</span>
                      <span className="text-[#181B1F] font-semibold">
                        {sub.bestCardinality.toLocaleString()} r
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-[#8E95A5] pt-2 border-t border-[#ECE8E0] truncate">
                    Plan: {sub.bestPlan.operatorLabel}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Evaluated splits table */}
          {selectedSubset && selectedSubset.candidatesEvaluated.length > 0 && (
            <div className="rounded-2xl bg-white border border-[#E5E3DC] p-6 space-y-3 shadow-card-subtle">
              <h3 className="text-xs font-bold font-mono uppercase text-[#181B1F] flex items-center space-x-2">
                <Cpu className="w-3.5 h-3.5 text-[#181B1F]" />
                <span>
                  Evaluated Candidate Splits for {`{${selectedSubset.relations.join(',')}}`}
                </span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#ECE8E0] text-[#8E95A5]">
                      <th className="pb-2">Split (S1 ⋈ S2)</th>
                      <th className="pb-2">Join Method</th>
                      <th className="pb-2">Estimated Cost</th>
                      <th className="pb-2">Pruned / Valid</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EEE8]">
                    {selectedSubset.candidatesEvaluated.map((c, idx) => (
                      <tr key={idx} className={c.isWinner ? 'bg-emerald-50/60' : ''}>
                        <td className="py-2.5 text-[#181B1F] font-semibold">
                          {`{${c.s1.join(',')}} ⋈ {${c.s2.join(',')}}`}
                        </td>
                        <td className="py-2.5 text-[#525866] uppercase">{c.joinMethod}</td>
                        <td className="py-2.5 text-[#181B1F]">
                          {c.cost === Infinity ? '∞' : `${c.cost.toLocaleString()} b`}
                        </td>
                        <td className="py-2.5">
                          {c.isPrunedByConnectivity ? (
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-semibold">
                              Pruned (No edge)
                            </span>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold">
                              Connected
                            </span>
                          )}
                        </td>
                        <td className="py-2.5">
                          {c.isWinner ? (
                            <span className="text-emerald-800 font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>WINNER</span>
                            </span>
                          ) : (
                            <span className="text-[#8E95A5]">Discarded</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Pseudocode Engine */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-[#E5E3DC] p-6 space-y-3 shadow-card-subtle">
            <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-[#181B1F]" />
                <h3 className="text-sm font-bold text-[#181B1F]">Selinger Algorithm Pseudocode</h3>
              </div>
              <span className="text-[10px] font-mono text-[#8E95A5]">Section 4.2</span>
            </div>

            <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC] font-mono text-xs space-y-1 overflow-x-auto">
              {PSEUDOCODE_LINES.map((item) => {
                const isExecuting = item.line === activeCodeLine;
                return (
                  <div
                    key={item.line}
                    className={`flex items-center space-x-2.5 px-2 py-0.5 rounded transition-colors ${
                      isExecuting
                        ? 'bg-[#181B1F] text-white font-bold'
                        : 'text-[#525866]'
                    }`}
                  >
                    <span className="text-[10px] text-[#8E95A5] w-4 text-right select-none">
                      {item.line}
                    </span>
                    <span className="whitespace-pre">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mathematical Recurrence Callout */}
          <div className="rounded-2xl bg-white border border-[#E5E3DC] p-6 space-y-2.5 text-xs shadow-card-subtle">
            <div className="text-xs font-bold text-[#181B1F] uppercase font-mono">
              The DP Recurrence Equation
            </div>
            <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E5E3DC] font-mono text-emerald-800 text-xs font-bold leading-relaxed">
              {"bestPlan(S) = min_{(S1, S2)} [ cost(S1) + cost(S2) + joinCost(S1, S2) ]"}
            </div>
            <p className="text-[11px] text-[#525866] leading-relaxed font-sans">
              Sub-problems exhibit optimal substructure: the cheapest join for S uses the cheapest
              pre-computed sub-plans for S1 and S2. Because subsets are processed in increasing
              cardinality, S1 and S2 are guaranteed available in the DP table.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
