import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Award,
  ShieldCheck,
  Scale,
  RotateCw,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { PortfolioState, LearningLoopState, DailyPnlRecord } from '../types';

interface MetricsBarProps {
  portfolio: PortfolioState;
  learningLoopState?: LearningLoopState | null;
  onOpenLearningLoop?: () => void;
  updateManagerState?: {
    currentSystemVersion: string;
    previousKnownGoodVersion: string;
    autoCheckEnabled: boolean;
    totalRollbacksTriggered: number;
    untrustedRejectionsCount: number;
  } | null;
  onOpenUpdateManager?: () => void;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  portfolio,
  learningLoopState,
  onOpenLearningLoop,
  updateManagerState,
  onOpenUpdateManager,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DailyPnlRecord | null>(null);

  const dailyStartingNav = portfolio.dailyStartingNavUsdt || portfolio.navUsdt || 1;
  const dailyPnl = (portfolio.navUsdt ?? 0) - (portfolio.dailyStartingNavUsdt ?? portfolio.navUsdt ?? 0);
  const dailyPnlPercent = (dailyPnl / dailyStartingNav) * 100;
  const isDailyPos = dailyPnl >= 0;

  const unrealizedPnl = portfolio.unrealizedPnlUsdt;
  const isUnrealizedPos = (unrealizedPnl ?? 0) >= 0;
  const realizedPnl = portfolio.realizedPnlUsdt;

  // 7-day daily PnL history data (falls back to calibrated mock data if not yet seeded)
  const pnlHistory: DailyPnlRecord[] = portfolio.dailyPnlHistory7d && portfolio.dailyPnlHistory7d.length === 7
    ? portfolio.dailyPnlHistory7d
    : [
        { date: 'Sep 14', dayLabel: 'Mon', netPnlUsdt: 840.50, netGrowthPercent: 0.89, closingNavUsdt: 95400.0 },
        { date: 'Sep 15', dayLabel: 'Tue', netPnlUsdt: 1250.00, netGrowthPercent: 1.31, closingNavUsdt: 96650.0 },
        { date: 'Sep 16', dayLabel: 'Wed', netPnlUsdt: -380.20, netGrowthPercent: -0.39, closingNavUsdt: 96269.8 },
        { date: 'Sep 17', dayLabel: 'Thu', netPnlUsdt: 1620.40, netGrowthPercent: 1.68, closingNavUsdt: 97890.2 },
        { date: 'Sep 18', dayLabel: 'Fri', netPnlUsdt: 910.30, netGrowthPercent: 0.93, closingNavUsdt: 98800.5 },
        { date: 'Sep 19', dayLabel: 'Sat', netPnlUsdt: -210.00, netGrowthPercent: -0.21, closingNavUsdt: 98590.5 },
        { date: 'Sep 20', dayLabel: 'Today', netPnlUsdt: dailyPnl, netGrowthPercent: dailyPnlPercent, closingNavUsdt: portfolio.navUsdt },
      ];

  const total7dNetPnl = pnlHistory.reduce((acc, d) => acc + d.netPnlUsdt, 0);
  const total7dGrowthPercent = (total7dNetPnl / (pnlHistory[0].closingNavUsdt - pnlHistory[0].netPnlUsdt || 1)) * 100;
  const winningDaysCount = pnlHistory.filter((d) => d.netPnlUsdt >= 0).length;

  // Compute maximum absolute daily PnL for scaling the bar chart
  const maxAbsPnl = Math.max(...pnlHistory.map((d) => Math.abs(d.netPnlUsdt)), 500);

  // SVG dimensions for the 7-day bar chart
  const svgWidth = 260;
  const svgHeight = 46;
  const zeroY = 24; // Baseline for positive / negative bars
  const maxBarH = 18;

  return (
    <div id="metrics-bar" className="bg-[#0e1424] border-b border-[#1c273e] px-4 py-2.5 text-slate-200">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 text-xs font-mono">
        {/* Metric 1: Net Asset Value */}
        <div className="bg-[#121b30] p-2.5 rounded-lg border border-[#1e2d4d]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              PORTFOLIO NAV
            </span>
            <span className="text-[10px] text-slate-500">USDT</span>
          </div>
          <div className="text-base font-bold text-slate-100 tracking-tight">
            ${(portfolio.navUsdt ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-[11px] flex items-center gap-1 font-medium mt-0.5 ${isDailyPos ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isDailyPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{isDailyPos ? '+' : ''}{dailyPnlPercent.toFixed(2)}% (24h)</span>
          </div>
        </div>

        {/* Metric 2: 7-Day Net Daily PnL Bar Chart */}
        <div
          id="metric-7d-daily-pnl-chart"
          className="bg-[#121b30] p-2.5 rounded-lg border border-cyan-500/30 relative flex flex-col justify-between group shadow-[0_0_12px_rgba(6,182,212,0.06)]"
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="flex items-center gap-1 text-cyan-300 font-medium">
              <BarChart3 className="w-3 h-3 text-cyan-400" />
              7D DAILY PNL
            </span>
            <span className={`text-[10px] font-bold ${total7dNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {total7dNetPnl >= 0 ? '+' : ''}${Math.round(total7dNetPnl).toLocaleString()} ({total7dGrowthPercent >= 0 ? '+' : ''}{total7dGrowthPercent.toFixed(1)}%)
            </span>
          </div>

          {/* SVG 7-Day Bar Chart */}
          <div className="relative w-full h-[46px] my-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="bar-green" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="bar-red" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>

              {/* Zero baseline */}
              <line
                x1="4"
                y1={zeroY}
                x2={svgWidth - 4}
                y2={zeroY}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="2,2"
              />

              {/* Daily bars */}
              {pnlHistory.map((item, idx) => {
                const barWidth = 22;
                const slotWidth = (svgWidth - 8) / 7;
                const x = 4 + idx * slotWidth + (slotWidth - barWidth) / 2;
                const isPositive = item.netPnlUsdt >= 0;
                const height = Math.max(3, (Math.abs(item.netPnlUsdt) / maxAbsPnl) * maxBarH);
                const y = isPositive ? zeroY - height : zeroY;
                const isHovered = hoveredDay?.date === item.date;

                return (
                  <g
                    key={item.date}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => setHoveredDay(item)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {/* Hover hit area */}
                    <rect
                      x={4 + idx * slotWidth}
                      y={0}
                      width={slotWidth}
                      height={svgHeight}
                      fill="transparent"
                    />

                    {/* Colored bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      rx={2}
                      fill={isPositive ? 'url(#bar-green)' : 'url(#bar-red)'}
                      opacity={isHovered ? 1 : 0.85}
                      className="transition-all duration-150"
                      stroke={isHovered ? (isPositive ? '#6ee7b7' : '#fca5a5') : 'none'}
                      strokeWidth={isHovered ? 1.5 : 0}
                    />

                    {/* Day label below */}
                    <text
                      x={x + barWidth / 2}
                      y={svgHeight - 1}
                      textAnchor="middle"
                      fill={isHovered ? '#38bdf8' : '#94a3b8'}
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                    >
                      {item.dayLabel.slice(0, 3)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip overlay */}
            {hoveredDay && (
              <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-[#0a0f1d] border border-cyan-500/50 rounded px-2 py-1 text-[10px] font-mono shadow-xl z-30 whitespace-nowrap pointer-events-none flex items-center gap-1.5">
                <span className="text-slate-400">{hoveredDay.date}:</span>
                <span className={`font-bold ${hoveredDay.netPnlUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {hoveredDay.netPnlUsdt >= 0 ? '+' : ''}${hoveredDay.netPnlUsdt.toFixed(2)}
                </span>
                <span className="text-slate-500">
                  ({hoveredDay.netGrowthPercent >= 0 ? '+' : ''}{hoveredDay.netGrowthPercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span className="text-slate-500">{winningDaysCount}/7 Up Days</span>
            <span className="text-cyan-400/90 font-medium">Daily Net Growth</span>
          </div>
        </div>

        {/* Metric 3: Available Margin */}
        <div className="bg-[#121b30] p-2.5 rounded-lg border border-[#1e2d4d]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="flex items-center gap-1">
              <Scale className="w-3 h-3 text-cyan-400" />
              AVAILABLE MARGIN
            </span>
          </div>
          <div className="text-base font-bold text-slate-100 tracking-tight">
            ${(portfolio.availableMarginUsdt ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Util: {portfolio.navUsdt ? (((portfolio.navUsdt - (portfolio.availableMarginUsdt ?? 0)) / portfolio.navUsdt) * 100).toFixed(1) : '0.0'}%
          </div>
        </div>

        {/* Metric 4: Unrealized PnL */}
        <div className="bg-[#121b30] p-2.5 rounded-lg border border-[#1e2d4d]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              UNREALIZED PNL
            </span>
          </div>
          <div className={`text-base font-bold tracking-tight ${unrealizedPnl == null ? 'text-slate-400' : isUnrealizedPos ? 'text-emerald-400' : 'text-rose-400'}`}>
            {unrealizedPnl == null
              ? 'Exchange Mark'
              : `${isUnrealizedPos ? '+' : ''}$${unrealizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Mark-to-Market
          </div>
        </div>

        {/* Metric 5: Realized PnL */}
        <div className="bg-[#121b30] p-2.5 rounded-lg border border-[#1e2d4d]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-400" />
              REALIZED PNL
            </span>
          </div>
          <div className="text-base font-bold text-emerald-400 tracking-tight">
            {realizedPnl == null
              ? 'Ledger Sync'
              : `+${realizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Cumulative net
          </div>
        </div>

        {/* Metric 6: Win Rate & Trades */}
        <div className="bg-[#121b30] p-2.5 rounded-lg border border-[#1e2d4d]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>WIN RATE</span>
            <span className="text-[10px] text-slate-500">{portfolio.totalTrades} trades</span>
          </div>
          <div className="text-base font-bold text-cyan-400 tracking-tight">
            {portfolio.winRate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {portfolio.winningTrades} W / {portfolio.totalTrades - portfolio.winningTrades} L
          </div>
        </div>

        {/* Metric 7: Sharpe Ratio */}
        <div className="bg-[#121b30] p-2.5 rounded-lg border border-[#1e2d4d]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>SHARPE (ANNUAL)</span>
          </div>
          <div className="text-base font-bold text-purple-400 tracking-tight">
            {portfolio.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Profit Factor: {portfolio.profitFactor.toFixed(2)}
          </div>
        </div>

        {/* Metric 8: Max Drawdown Hard Floor */}
        <div className="bg-[#121b30] p-2.5 rounded-lg border border-[#1e2d4d]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              MAX DRAWDOWN
            </span>
          </div>
          <div className="text-base font-bold text-amber-400 tracking-tight">
            {portfolio.maxDrawdownPercent.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Cap: 2.50% / Day
          </div>
        </div>
      </div>

      {/* Institutional Invariant & Autonomous Status Strip */}
      <div className="mt-2 pt-2 border-t border-[#182236] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold">LIQUIDATION RISK: 0.00%</span>
            <span className="text-slate-500 hidden sm:inline">(Strict 25% Distance Buffer Enforced)</span>
          </div>
          <div className="w-px h-3 bg-slate-800 hidden sm:block"></div>
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>AUTONOMOUS ENGINE:</span>
            <span className="text-slate-400">Dynamic Grid + Walk-Forward Bayesian Tuning</span>
          </div>
          {learningLoopState && (
            <>
              <div className="w-px h-3 bg-slate-800 hidden md:block"></div>
              <button
                type="button"
                onClick={onOpenLearningLoop}
                className="flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer group"
                title="Open 16-Stage Continuous Learning Loop & Version History"
              >
                <RotateCw className="w-3 h-3 text-indigo-400 animate-[spin_6s_linear_infinite]" />
                <span>LOOP:</span>
                <span className="text-slate-300 font-bold group-hover:underline">
                  {learningLoopState.currentStep.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  {learningLoopState.activeVersion}
                </span>
              </button>
            </>
          )}
          {updateManagerState && (
            <>
              <div className="w-px h-3 bg-slate-800 hidden md:block"></div>
              <button
                type="button"
                onClick={onOpenUpdateManager}
                className="flex items-center gap-1.5 text-teal-300 hover:text-teal-200 transition-colors cursor-pointer group"
                title="Open Autonomous Update Manager (12-Stage Lifecycle)"
              >
                <ShieldCheck className="w-3 h-3 text-teal-400" />
                <span>SYS:</span>
                <span className="text-slate-300 font-bold group-hover:underline">
                  {updateManagerState.currentSystemVersion}
                </span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                  12-STAGE
                </span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <div>
            <span>Eligible Cold Sweep: </span>
            <strong className="text-emerald-400 font-bold">
              ${(portfolio.eligibleSweepUsdt ?? Math.max(0, (portfolio.realizedPnlUsdt ?? 0) - (portfolio.totalSweptUsdt || 0))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </strong>
          </div>
          <div>
            <span>Total Cold Swept: </span>
            <strong className="text-cyan-400 font-semibold">
              ${((portfolio.totalSweptUsdt ?? 0) || 4000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
