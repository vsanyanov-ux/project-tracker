import React, { useState } from 'react';
import type { DecisionLogEntry } from '../../types/raci';
import { 
  FileSpreadsheet, 
  Plus, 
  ShieldCheck, 
  Trash2, 
  Sparkles,
  Clock
} from 'lucide-react';

interface ArtifactDecisionLogProps {
  entries: DecisionLogEntry[];
  onAddEntry: (entry: DecisionLogEntry) => void;
  onDeleteEntry: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const ArtifactDecisionLog: React.FC<ArtifactDecisionLogProps> = ({
  entries,
  onAddEntry,
  onDeleteEntry,
  onShowToast
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [decision, setDecision] = useState('');
  const [rationale, setRationale] = useState('');
  const [approvedBy, setApprovedBy] = useState('');
  const [approverRole, setApproverRole] = useState<DecisionLogEntry['approverRole']>('Клиент-косметолог');
  const [reviewDate, setReviewDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim() || !approvedBy.trim()) return;

    const newEntry: DecisionLogEntry = {
      id: `dec-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      decision: decision.trim(),
      rationale: rationale.trim(),
      approvedBy: approvedBy.trim(),
      approverRole,
      reviewDate: reviewDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'active'
    };

    onAddEntry(newEntry);
    setDecision('');
    setRationale('');
    setApprovedBy('');
    setReviewDate('');
    setIsAdding(false);
    onShowToast('Новое решение зафиксировано в Журнале решений! 📜');
  };

  const getRoleBadgeStyle = (role: DecisionLogEntry['approverRole']) => {
    switch (role) {
      case 'Клиент-косметолог':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Вы как Founder':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Вы как Product Owner':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Вы как Engineer':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Артефакт №3
            </span>
            <span className="text-xs text-slate-400">Фиксация ответственности (Accountability)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Журнал решений (Decision Log)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Защищает от ситуаций «почему мы так сделали» и «кто это придумал». Любое изменение скидки, скрипта или частоты рассылки фиксируется здесь.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Свернуть форму' : 'Зафиксировать решение'}
        </button>
      </div>

      {/* Quick Add Form Modal/Inline */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Новая запись в Журнал решений
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Что решили? (Суть решения) *
              </label>
              <input
                type="text"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                placeholder="Например: Заменить 30% скидку на подарок 1500 руб"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Почему? (Обоснование и риски)
              </label>
              <input
                type="text"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Обоснование маржинальности или защита от бана WA"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Кто утвердил (Владелец решения — A) *
              </label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="ФИО косметолога или ваша роль"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Роль утверждающего
                </label>
                <select
                  value={approverRole}
                  onChange={(e) => setApproverRole(e.target.value as any)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900"
                >
                  <option value="Клиент-косметолог">Клиент-косметолог</option>
                  <option value="Вы как Founder">Вы как Founder</option>
                  <option value="Вы как Product Owner">Вы как Product Owner</option>
                  <option value="Вы как Engineer">Вы как Engineer</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Дата пересмотра
                </label>
                <input
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md"
            >
              Сохранить в журнал
            </button>
          </div>
        </form>
      )}

      {/* Decisions Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/80 text-[11px] text-slate-300 font-extrabold uppercase tracking-wider">
              <th className="py-3 px-4 w-28">Дата</th>
              <th className="py-3 px-4">Что решили & Почему</th>
              <th className="py-3 px-4">Кто утвердил (A)</th>
              <th className="py-3 px-4 w-32">Пересмотр</th>
              <th className="py-3 px-3 text-right">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="py-4 px-4 font-mono text-slate-400 whitespace-nowrap">
                  {entry.date}
                </td>

                <td className="py-4 px-4">
                  <div className="font-bold text-white text-sm">
                    {entry.decision}
                  </div>
                  {entry.rationale && (
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                      💡 {entry.rationale}
                    </div>
                  )}
                </td>

                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="font-bold text-slate-200">{entry.approvedBy}</div>
                  <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border mt-1 ${getRoleBadgeStyle(entry.approverRole)}`}>
                    {entry.approverRole}
                  </span>
                </td>

                <td className="py-4 px-4 font-mono text-slate-300 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{entry.reviewDate}</span>
                  </div>
                </td>

                <td className="py-4 px-3 text-right">
                  <button
                    onClick={() => {
                      if (window.confirm(`Удалить запись "${entry.decision}"?`)) {
                        onDeleteEntry(entry.id);
                        onShowToast('Запись удалена из Журнала решений');
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Удалить запись"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reminder Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-200 text-xs flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-indigo-300">Правило взаимной безопасности: </span>
          Если косметолог просит: <em>«А давайте запустим рассылку в воскресенье в 22:00»</em> — вы вносите это в Журнал решений с пометкой 
          «Утвердил клиент, риск негатива оценен», и получаете письменное «ОК». Теперь никто не обвинит вас в спаме.
        </div>
      </div>
    </div>
  );
};
