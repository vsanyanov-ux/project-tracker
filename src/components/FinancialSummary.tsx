import React from 'react';
import type { Project } from '../types/project';
import { calculateFinancials, formatCurrency, calculateProjectProgress } from '../utils/formatters';
import { Wallet, Clock, TrendingUp, CheckCircle2, ArrowUpRight, Flame } from 'lucide-react';

interface FinancialSummaryProps {
  projects: Project[];
  onFilterStatus?: (status: string) => void;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ projects, onFilterStatus }) => {
  const { totalEarned, totalOwed, totalBudget, paymentRate } = calculateFinancials(projects);

  const activeProjects = projects.filter(p => p.status === 'in_progress');
  const reviewProjects = projects.filter(p => p.status === 'in_review');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const urgentProjects = projects.filter(p => p.priority === 'urgent');

  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + calculateProjectProgress(p), 0) / projects.length)
    : 0;

  return (
    <div className="space-y-4 mb-8">
      {/* 4 Main Glass Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Earned */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('all')}
          className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden group cursor-pointer border border-emerald-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Получено денег
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-1">
            {formatCurrency(totalEarned)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-white/5">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {paymentRate}% от бюджета
            </span>
            <span>{projects.filter(p => p.payments.some(pay => pay.isPaid)).length} проектов оплачивали</span>
          </div>
        </div>

        {/* Card 2: Total Owed / Pending */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('waiting_payment')}
          className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden group cursor-pointer border border-amber-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              Ожидается / Долг
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-1">
            {formatCurrency(totalOwed)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-white/5">
            <span className="text-amber-400 font-medium">
              Остаток к получению
            </span>
            <span>{projects.filter(p => p.payments.some(pay => !pay.isPaid)).length} проекта ждут выплат</span>
          </div>
        </div>

        {/* Card 3: Total Portfolio Contract Value */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('all')}
          className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden group cursor-pointer border border-cyan-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              Общий бюджет
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-1">
            {formatCurrency(totalBudget)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-white/5">
            <span className="text-cyan-400 font-medium">
              Всего: {projects.length} проектов
            </span>
            {urgentProjects.length > 0 && (
              <span className="text-rose-400 flex items-center gap-0.5">
                <Flame className="w-3 h-3" />
                {urgentProjects.length} срочных
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Average Completion Progress */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('in_progress')}
          className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden group cursor-pointer border border-purple-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400/90 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              Средняя готовность
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {avgProgress}%
            </div>
            <span className="text-xs text-purple-300">по всем задачам</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden mt-3 border border-white/5">
            <div 
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              style={{ width: `${avgProgress}%` }}
            />
          </div>
        </div>

      </div>

      {/* Cashflow Bar & Active Status Quick Indicators */}
      <div className="glass-panel rounded-xl p-3.5 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border border-white/5">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Денежный поток:</span>
            <span className="font-semibold text-emerald-400">{paymentRate}% оплачено</span>
          </div>
          <div className="flex-1 sm:w-64 bg-slate-800/90 rounded-full h-2.5 overflow-hidden flex border border-white/10">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-700" 
              style={{ width: `${paymentRate}%` }} 
              title={`Оплачено: ${formatCurrency(totalEarned)}`}
            />
            <div 
              className="bg-gradient-to-r from-amber-500/80 to-purple-500/80 h-full transition-all duration-700" 
              style={{ width: `${100 - paymentRate}%` }} 
              title={`Ожидается: ${formatCurrency(totalOwed)}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button 
            onClick={() => onFilterStatus && onFilterStatus('in_progress')}
            className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-all flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            В работе: <span className="font-bold">{activeProjects.length}</span>
          </button>
          
          <button 
            onClick={() => onFilterStatus && onFilterStatus('in_review')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-all flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            На проверке: <span className="font-bold">{reviewProjects.length}</span>
          </button>

          <button 
            onClick={() => onFilterStatus && onFilterStatus('completed')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-all flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Завершено: <span className="font-bold">{completedProjects.length}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
