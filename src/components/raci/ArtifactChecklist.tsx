import React from 'react';
import type { ChecklistItem } from '../../types/raci';
import { 
  CheckSquare, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  ShieldCheck, 
  Database, 
  FileCheck2, 
  MessageSquare, 
  Link2, 
  FlaskConical, 
  Headphones,
  Sparkles
} from 'lucide-react';

interface ArtifactChecklistProps {
  checklist: ChecklistItem[];
  onToggleItem: (id: string) => void;
  onResetChecklist: () => void;
  onShowToast: (msg: string) => void;
}

export const ArtifactChecklist: React.FC<ArtifactChecklistProps> = ({
  checklist,
  onToggleItem,
  onResetChecklist,
  onShowToast
}) => {
  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const isReadyForLaunch = progressPercent === 100;

  const getCategoryIcon = (cat: ChecklistItem['category']) => {
    switch (cat) {
      case 'data':
        return <Database className="w-4 h-4 text-cyan-400" />;
      case 'consent':
        return <FileCheck2 className="w-4 h-4 text-rose-400" />;
      case 'content':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'links':
        return <Link2 className="w-4 h-4 text-amber-400" />;
      case 'pilot':
        return <FlaskConical className="w-4 h-4 text-indigo-400" />;
      case 'handoff':
        return <Headphones className="w-4 h-4 text-emerald-400" />;
      default:
        return <CheckSquare className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryLabel = (cat: ChecklistItem['category']) => {
    switch (cat) {
      case 'data': return 'Данные';
      case 'consent': return 'Согласия (Consent)';
      case 'content': return 'Тексты & Оффер';
      case 'links': return 'Ссылки & Переменные';
      case 'pilot': return 'Тест 20–50 контактов';
      case 'handoff': return 'Резерв (Администратор)';
      default: return 'Проверка';
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              Артефакт №2
            </span>
            <span className="text-xs text-slate-400">QA & Compliance Контроль</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Чек-лист запуска кампании без ошибок
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Исполнитель (R) отвечает за выполнение каждого пункта по регламенту. Никаких массовых запусков «на авось».
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Сбросить все отметки чек-листа для новой кампании?')) {
              onResetChecklist();
              onShowToast('Чек-лист сброшен к исходному состоянию 🔄');
            }
          }}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Сбросить для новой кампании
        </button>
      </div>

      {/* Progress & Launch Status Banner */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isReadyForLaunch
          ? 'bg-emerald-950/30 border-emerald-500/40'
          : 'bg-slate-900/60 border-white/10'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
              Готовность к старту:
            </span>
            <span className="text-sm font-black text-white">
              {completedCount} из {totalCount} пунктов ({progressPercent}%)
            </span>
          </div>

          <div>
            {isReadyForLaunch ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-4 h-4" /> Готово к боевому запуску!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <AlertTriangle className="w-4 h-4" /> Запуск заблокирован (остались пункты)
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              isReadyForLaunch
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                : 'bg-gradient-to-r from-indigo-500 to-cyan-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Items List */}
      <div className="space-y-3">
        {checklist.map((item, index) => {
          return (
            <div
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                item.completed
                  ? 'bg-slate-900/40 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-slate-900/60 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Checkbox */}
              <div className="pt-0.5 shrink-0">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  item.completed
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-bold'
                    : 'border-2 border-slate-600 bg-slate-800/60 text-transparent hover:border-slate-400'
                }`}>
                  <CheckCircle2 className="w-4 h-4 fill-current" />
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-300 flex items-center gap-1">
                    {getCategoryIcon(item.category)}
                    {getCategoryLabel(item.category)}
                  </span>
                  <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                </div>

                <h4 className={`text-sm font-bold transition-colors ${
                  item.completed ? 'text-slate-200 line-through decoration-emerald-500/50' : 'text-white'
                }`}>
                  {item.title}
                </h4>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Golden Tip Footer */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-200 text-xs flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-indigo-300">Правило стресс-теста: </span>
          Никогда не отправляйте сразу по всем 300–500 клиентам. Первый запуск строго на <strong>20–50 контактов</strong>. 
          Если бот отработал корректно, нет негативных реакций и администратор успевает отвечать — только тогда масштабируйте на оставшуюся базу.
        </div>
      </div>
    </div>
  );
};
