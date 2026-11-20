import React, { useState } from 'react';
import { RACI_MATRIX_DATA } from '../../utils/raciStorage';
import type { RaciMatrixRow, RaciCode } from '../../types/raci';
import { 
  Users, 
  Crown, 
  Compass, 
  Cpu, 
  Stethoscope, 
  Info, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

export const RaciMatrixTable: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'founder' | 'growth' | 'po' | 'engineer' | 'client'>('all');
  const [selectedTask, setSelectedTask] = useState<RaciMatrixRow | null>(null);

  const getBadgeStyle = (code: RaciCode) => {
    switch (code) {
      case 'A':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-black shadow-[0_0_10px_rgba(244,63,94,0.2)]';
      case 'A + R':
        return 'bg-gradient-to-r from-rose-500/20 to-cyan-500/20 text-white border-rose-500/40 font-black shadow-[0_0_12px_rgba(244,63,94,0.25)]';
      case 'R':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold';
      case 'C':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold';
      case 'I':
        return 'bg-slate-700/40 text-slate-400 border-slate-600/30 font-medium';
      default:
        return 'text-slate-600 border-transparent';
    }
  };

  const getBadgeLabel = (code: RaciCode) => {
    switch (code) {
      case 'A':
        return 'Accountable (Владелец)';
      case 'A + R':
        return 'Accountable + Responsible';
      case 'R':
        return 'Responsible (Исполнитель)';
      case 'C':
        return 'Consulted (Консультант)';
      case 'I':
        return 'Informed (Информируемый)';
      default:
        return '—';
    }
  };

  const filteredTasks = RACI_MATRIX_DATA.filter((item) => {
    if (activeFilter === 'founder') return item.founder === 'A';
    if (activeFilter === 'growth') return item.growth.includes('A');
    if (activeFilter === 'po') return item.productOwner === 'A';
    if (activeFilter === 'engineer') return item.engineer.includes('A');
    if (activeFilter === 'client') return item.clientCosmetologist === 'A';
    return true;
  });

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Матрица ролей
            </span>
            <span className="text-xs text-slate-400">RACI для вашего продукта</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Разделение ролей соло-предпринимателя и клиники
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            На каждую задачу — строго один владелец результата (A). Вы можете совмещать роли, но принимаете решения по правилам каждой конкретной должности.
          </p>
        </div>
      </div>

      {/* Role Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'glass-panel text-slate-400 hover:text-white border-white/5'
          }`}
        >
          Все {RACI_MATRIX_DATA.length} задач
        </button>

        <button
          onClick={() => setActiveFilter('founder')}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeFilter === 'founder'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'glass-panel text-slate-400 hover:text-white border-white/5'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-300" />
          Вы как Founder (A)
        </button>

        <button
          onClick={() => setActiveFilter('growth')}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeFilter === 'growth'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'glass-panel text-slate-400 hover:text-white border-white/5'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
          Вы как Growth (A)
        </button>

        <button
          onClick={() => setActiveFilter('po')}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeFilter === 'po'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'glass-panel text-slate-400 hover:text-white border-white/5'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-purple-300" />
          Вы как Product Owner (A)
        </button>

        <button
          onClick={() => setActiveFilter('engineer')}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeFilter === 'engineer'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'glass-panel text-slate-400 hover:text-white border-white/5'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-300" />
          Вы как Engineer (A+R)
        </button>

        <button
          onClick={() => setActiveFilter('client')}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeFilter === 'client'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'glass-panel text-slate-400 hover:text-white border-white/5'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-rose-300" />
          Клиент-косметолог (A)
        </button>
      </div>

      {/* Interactive Glass Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/80 text-[11px] sm:text-xs text-slate-300 font-extrabold uppercase tracking-wider">
              <th className="py-4 px-4 sm:px-6 w-1/3">Задача</th>
              <th className="py-4 px-3 text-center">
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Crown className="w-3 h-3" /> Founder
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">стратегия</span>
                </div>
              </th>
              <th className="py-4 px-3 text-center">
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1 text-emerald-300">
                    <TrendingUp className="w-3 h-3" /> Growth
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">маркетинг & sales</span>
                </div>
              </th>
              <th className="py-4 px-3 text-center">
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1 text-purple-300">
                    <Compass className="w-3 h-3" /> Product Owner
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">сценарии</span>
                </div>
              </th>
              <th className="py-4 px-3 text-center">
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Cpu className="w-3 h-3" /> Engineer
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">код & интеграции</span>
                </div>
              </th>
              <th className="py-4 px-3 text-center">
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1 text-rose-300">
                    <Stethoscope className="w-3 h-3" /> Клиент-косметолог
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">владелец базы</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
            {filteredTasks.map((row) => {
              const isSelected = selectedTask?.id === row.id;
              return (
                <tr
                  key={row.id}
                  onClick={() => setSelectedTask(isSelected ? null : row)}
                  className={`transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-600/15' 
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <td className="py-4 px-4 sm:px-6">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{row.task}</span>
                      <Info className="w-3.5 h-3.5 text-slate-500 hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {row.description}
                    </div>
                  </td>

                  {/* Founder */}
                  <td className="py-4 px-3 text-center">
                    <span 
                      className={`inline-block px-2.5 py-1 rounded-lg border text-xs ${getBadgeStyle(row.founder)}`}
                      title={`Founder: ${getBadgeLabel(row.founder)}`}
                    >
                      {row.founder}
                    </span>
                  </td>

                  {/* Growth */}
                  <td className="py-4 px-3 text-center">
                    <span 
                      className={`inline-block px-2.5 py-1 rounded-lg border text-xs ${getBadgeStyle(row.growth)}`}
                      title={`Growth: ${getBadgeLabel(row.growth)}`}
                    >
                      {row.growth}
                    </span>
                  </td>

                  {/* Product Owner */}
                  <td className="py-4 px-3 text-center">
                    <span 
                      className={`inline-block px-2.5 py-1 rounded-lg border text-xs ${getBadgeStyle(row.productOwner)}`}
                      title={`Product Owner: ${getBadgeLabel(row.productOwner)}`}
                    >
                      {row.productOwner}
                    </span>
                  </td>

                  {/* Engineer */}
                  <td className="py-4 px-3 text-center">
                    <span 
                      className={`inline-block px-2.5 py-1 rounded-lg border text-xs ${getBadgeStyle(row.engineer)}`}
                      title={`Engineer: ${getBadgeLabel(row.engineer)}`}
                    >
                      {row.engineer}
                    </span>
                  </td>

                  {/* Клиент-косметолог */}
                  <td className="py-4 px-3 text-center">
                    <span 
                      className={`inline-block px-2.5 py-1 rounded-lg border text-xs ${getBadgeStyle(row.clientCosmetologist)}`}
                      title={`Клиент-косметолог: ${getBadgeLabel(row.clientCosmetologist)}`}
                    >
                      {row.clientCosmetologist}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Task Details Card */}
      {selectedTask && (
        <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 animate-fadeIn">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Детали задачи RACI
              </span>
              <h4 className="text-base font-extrabold text-white mt-1">
                {selectedTask.task}
              </h4>
            </div>
            <button
              onClick={() => setSelectedTask(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Закрыть
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {selectedTask.description}
          </p>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-amber-200/90 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Золотое правило: </span>
              {selectedTask.ruleHint}
            </div>
          </div>
        </div>
      )}

      {/* RACI Legend Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-200 text-xs">
          <div className="font-extrabold text-rose-400 mb-0.5">A — Accountable</div>
          <div className="text-[11px] opacity-80">Владелец результата. Всегда ровно 1 на задачу. Несет всю полноту ответственности.</div>
        </div>
        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-200 text-xs">
          <div className="font-extrabold text-cyan-400 mb-0.5">R — Responsible</div>
          <div className="text-[11px] opacity-80">Исполнитель. Делает работу руками по регламенту и в срок.</div>
        </div>
        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs">
          <div className="font-extrabold text-amber-400 mb-0.5">C — Consulted</div>
          <div className="text-[11px] opacity-80">Консультант. Эксперт, чье мнение обязательно запрашивается до принятия решения.</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700 text-slate-300 text-xs">
          <div className="font-extrabold text-slate-400 mb-0.5">I — Informed</div>
          <div className="text-[11px] opacity-80">Информируемый. Получает готовый статус или отчет после выполнения.</div>
        </div>
      </div>
    </div>
  );
};
