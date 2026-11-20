import React, { useState, useEffect } from 'react';
import type { ChecklistItem, DecisionLogEntry, SavedRaciAiTask } from '../../types/raci';
import { decomposeTaskWithRaci, hasDeepSeekConfigured } from '../../services/deepseek';
import { 
  getStoredAiRaciHistory, 
  saveAiRaciHistory, 
  getStoredActiveAiTaskId, 
  saveActiveAiTaskId 
} from '../../utils/raciStorage';
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckSquare, 
  FileSpreadsheet, 
  Loader2, 
  Settings,
  Crown,
  TrendingUp,
  Compass,
  Cpu,
  Stethoscope,
  Check,
  History,
  Trash2,
  PlusCircle,
  Calendar,
  Clock
} from 'lucide-react';

interface AiRaciCopilotWidgetProps {
  onAddToChecklist?: (items: ChecklistItem[]) => void;
  onAddToDecisionLog?: (entry: DecisionLogEntry) => void;
  onOpenAiSettings: () => void;
  onShowToast: (msg: string) => void;
}

const PRESET_EXAMPLES = [
  'Перенести базу пациентов и сайт с турецкого сервера на российский VPS по 152-ФЗ',
  'Отправить спящей базе 90+ дней акцию к 8 марта: подарочный депозит 2000 ₽',
  'Холодный аутрич в Telegram по 30 косметологическим клиникам города',
  'Пациентка оставила негативный отзыв в WhatsApp и пожаловалась на отек после процедуры'
];

export const AiRaciCopilotWidget: React.FC<AiRaciCopilotWidgetProps> = ({
  onAddToChecklist,
  onAddToDecisionLog,
  onOpenAiSettings,
  onShowToast
}) => {
  const [history, setHistory] = useState<SavedRaciAiTask[]>(() => getStoredAiRaciHistory());
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    const savedId = getStoredActiveAiTaskId();
    const storedHistory = getStoredAiRaciHistory();
    if (savedId && storedHistory.some((t) => t.id === savedId)) {
      return savedId;
    }
    return storedHistory.length > 0 ? storedHistory[0].id : null;
  });

  const [taskInput, setTaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(true);

  // Current active task from persistent history
  const activeTask = history.find((t) => t.id === activeTaskId) || null;
  const analysisResult = activeTask?.result || null;

  // Sync active task id to storage
  useEffect(() => {
    saveActiveAiTaskId(activeTaskId);
  }, [activeTaskId]);

  // Sync history to storage
  const updateHistoryAndSave = (updated: SavedRaciAiTask[]) => {
    setHistory(updated);
    saveAiRaciHistory(updated);
  };

  const handleDecompose = async (textToAnalyze?: string) => {
    const text = (textToAnalyze || taskInput).trim();
    if (!text) return;

    if (!hasDeepSeekConfigured()) {
      setError('AI не настроен. Пожалуйста, укажите API-ключ DeepSeek или AI-Tunnel в настройках.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await decomposeTaskWithRaci(text);
      
      const newSavedTask: SavedRaciAiTask = {
        id: `ai-task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        rawPrompt: text,
        result,
        isChecklistAdded: false,
        isDecisionAdded: false
      };

      const updatedHistory = [newSavedTask, ...history];
      updateHistoryAndSave(updatedHistory);
      setActiveTaskId(newSavedTask.id);
      setTaskInput('');
      onShowToast('Задача разложена по ролям и надежно сохранена в истории! 💾🤖');
    } catch (err) {
      console.error('RACI Copilot error:', err);
      setError(err instanceof Error ? err.message : 'Не удалось получить ответ от ИИ');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTasksToChecklist = () => {
    if (!activeTask || !analysisResult?.actionChecklist || !onAddToChecklist) return;

    const newItems: ChecklistItem[] = analysisResult.actionChecklist.map((act, idx) => ({
      id: `ai-chk-${Date.now()}-${idx}`,
      category: act.roleTag === 'QA' ? 'pilot' : act.roleTag === 'Клиент-косметолог' ? 'consent' : 'content',
      title: `[${act.roleTag}] ${act.title}`,
      description: `Сформировано AI RACI Диспетчером для задачи: "${analysisResult.taskSummary}"`,
      completed: false,
      requiredForLaunch: act.required
    }));

    onAddToChecklist(newItems);

    // Update active task status in storage
    const updatedHistory = history.map((t) => 
      t.id === activeTask.id ? { ...t, isChecklistAdded: true } : t
    );
    updateHistoryAndSave(updatedHistory);
    onShowToast(`Добавлено ${newItems.length} задач в Чек-лист запуска! 📋`);
  };

  const handleSaveToDecisionLog = () => {
    if (!activeTask || !analysisResult?.decisionLogDraft || !onAddToDecisionLog) return;

    const draft = analysisResult.decisionLogDraft;
    const newEntry: DecisionLogEntry = {
      id: `dec-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      decision: draft.decision,
      rationale: draft.rationale,
      approvedBy: draft.approvedBy,
      approverRole: draft.approverRole,
      reviewDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'active'
    };

    onAddToDecisionLog(newEntry);

    // Update active task status in storage
    const updatedHistory = history.map((t) => 
      t.id === activeTask.id ? { ...t, isDecisionAdded: true } : t
    );
    updateHistoryAndSave(updatedHistory);
    onShowToast('Решение зафиксировано в Журнале решений! 📜');
  };

  const handleDeleteTaskFromHistory = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Удалить эту задачу из истории AI-разборов?')) {
      const updated = history.filter((t) => t.id !== idToDelete);
      updateHistoryAndSave(updated);
      if (activeTaskId === idToDelete) {
        setActiveTaskId(updated.length > 0 ? updated[0].id : null);
      }
      onShowToast('Задача удалена из истории');
    }
  };

  const handleStartNewTask = () => {
    setActiveTaskId(null);
    setTaskInput('');
    setError(null);
  };

  const formatTaskDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getRoleIcon = (roleName: string) => {
    const lower = roleName.toLowerCase();
    if (lower.includes('founder')) return <Crown className="w-4 h-4 text-amber-300" />;
    if (lower.includes('growth')) return <TrendingUp className="w-4 h-4 text-emerald-300" />;
    if (lower.includes('product')) return <Compass className="w-4 h-4 text-purple-300" />;
    if (lower.includes('engineer')) return <Cpu className="w-4 h-4 text-cyan-300" />;
    if (lower.includes('qa')) return <CheckSquare className="w-4 h-4 text-indigo-300" />;
    return <Stethoscope className="w-4 h-4 text-rose-300" />;
  };

  const getRoleBadgeStyle = (roleName: string) => {
    const lower = roleName.toLowerCase();
    if (lower.includes('founder')) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (lower.includes('growth')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (lower.includes('product')) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if (lower.includes('engineer')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    if (lower.includes('qa')) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              AI RACI Copilot
            </span>
            <span className="text-xs text-slate-400">Умный диспетчер ролей с автосохранением в историю</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Опишите задачу — ИИ разложит её по ролям и RACI
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Все разобранные задачи навсегда сохраняются в истории вашего браузера: вы никогда не потеряете план действий при перезагрузке.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenAiSettings}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Настройки AI</span>
          </button>

          <button
            onClick={handleStartNewTask}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Новая задача</span>
          </button>
        </div>
      </div>

      {/* History Ribbon (Saved Decompositions) */}
      {history.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Сохранённая история разборов ({history.length})</span>
            </div>

            <button
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              {showHistoryDrawer ? 'Свернуть историю' : 'Развернуть историю'}
            </button>
          </div>

          {showHistoryDrawer && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {history.map((item) => {
                const isSelected = item.id === activeTaskId;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveTaskId(item.id);
                      setError(null);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 text-left relative group ${
                      isSelected
                        ? 'bg-indigo-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                        : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatTaskDate(item.createdAt)}
                        </span>

                        <button
                          onClick={(e) => handleDeleteTaskFromHistory(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                          title="Удалить из истории"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-xs font-bold text-white line-clamp-2 leading-snug">
                        {item.result.taskSummary || item.rawPrompt}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/5 text-[10px]">
                      <span className="text-cyan-300 font-semibold truncate max-w-[150px]">
                        {item.result.raciBreakdown.accountable.split(' ')[0]} (A)
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.isChecklistAdded && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Чек-лист ✓
                          </span>
                        )}
                        {item.isDecisionAdded && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Журнал ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Input Section (When creating or switching) */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
          Сформулируйте новую задачу для анализа:
        </label>
        
        <div className="relative">
          <textarea
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Например: Хочу запустить акцию к 8 марта по спящей базе 120+ дней с депозитом 2000 ₽..."
            rows={2}
            className="w-full glass-input px-4 py-3 rounded-2xl text-xs sm:text-sm placeholder:text-slate-500 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleDecompose();
              }
            }}
          />
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <div className="text-[11px] text-slate-400 font-semibold">Быстрые примеры:</div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-wrap">
            {PRESET_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTaskInput(ex);
                  handleDecompose(ex);
                }}
                className="text-[11px] px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all text-left whitespace-nowrap"
              >
                💡 {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={() => handleDecompose()}
            disabled={loading || !taskInput.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>ИИ раскладывает по ролям...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Разложить по ролям через AI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={onOpenAiSettings}
              className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold hover:bg-rose-500/30"
            >
              Открыть настройки AI
            </button>
          </div>
        )}
      </div>

      {/* Analysis Results Display (Loaded from Active Task or New Run) */}
      {analysisResult ? (
        <div className="space-y-6 pt-4 border-t border-white/10 animate-fadeIn">
          
          {/* Header Summary */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Активная задача из истории {activeTask && `(${formatTaskDate(activeTask.createdAt)})`}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                {analysisResult.taskSummary}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStartNewTask}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Сформулировать другую</span>
              </button>
            </div>
          </div>

          {/* Risks & Stop Flags Banner */}
          <div className={`p-5 rounded-2xl border ${
            analysisResult.risksAndStopFlags.requiresClientApproval
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-100'
              : analysisResult.risksAndStopFlags.requiresPilotTest
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-100'
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
          }`}>
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-white/10 shrink-0 mt-0.5">
                {analysisResult.risksAndStopFlags.requiresClientApproval ? (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                ) : analysisResult.risksAndStopFlags.requiresPilotTest ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs uppercase font-black px-2 py-0.5 rounded-full bg-white/10">
                    Анализ рисков & Стоп-краны
                  </span>
                  {analysisResult.risksAndStopFlags.requiresClientApproval && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      🛑 Требуется письменный аппрув косметолога!
                    </span>
                  )}
                  {analysisResult.risksAndStopFlags.requiresPilotTest && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      🧪 Сначала тест на 20–50 контактов!
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                  {analysisResult.risksAndStopFlags.warningText}
                </p>
              </div>
            </div>
          </div>

          {/* 1. Цепочка шляп (Порядок действий) */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
              <span>🎩 Цепочка шляп соло-фаундера (Порядок действий)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {analysisResult.hatsSequence.map((step, idx) => (
                <div 
                  key={idx}
                  className="glass-card p-4 rounded-2xl border border-white/10 space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-extrabold flex items-center gap-1.5 ${getRoleBadgeStyle(step.role)}`}>
                      {getRoleIcon(step.role)}
                      {step.role}
                    </span>
                    <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                  </div>

                  <div className="text-xs font-bold text-slate-200">
                    {step.stage}
                  </div>

                  <div className="text-xs text-white font-medium leading-snug">
                    {step.action}
                  </div>

                  <div className="text-[11px] text-slate-400 italic pt-1 border-t border-white/5">
                    💡 {step.hatExplanation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. RACI Матрица для задачи */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
              <span>⚖️ Матрица ответственности RACI для этой задачи</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-200">
                <div className="text-xs font-extrabold text-rose-400 mb-1">A — Владелец (Accountable)</div>
                <div className="text-xs font-bold text-white mb-1">{analysisResult.raciBreakdown.accountable}</div>
                <div className="text-[11px] text-slate-400">Финальная ответственность за результат.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-200">
                <div className="text-xs font-extrabold text-cyan-400 mb-1">R — Исполнитель (Responsible)</div>
                <div className="text-xs font-bold text-white mb-1">{analysisResult.raciBreakdown.responsible}</div>
                <div className="text-[11px] text-slate-400">Делает работу руками по регламенту.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200">
                <div className="text-xs font-extrabold text-amber-400 mb-1">C — Консультант (Consulted)</div>
                <div className="text-xs font-bold text-white mb-1">{analysisResult.raciBreakdown.consulted}</div>
                <div className="text-[11px] text-slate-400">Мнение запрашивается до принятия решения.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700 text-slate-300">
                <div className="text-xs font-extrabold text-slate-400 mb-1">I — Информируемый (Informed)</div>
                <div className="text-xs font-bold text-white mb-1">{analysisResult.raciBreakdown.informed}</div>
                <div className="text-[11px] text-slate-400">Получает отчет об успешном выполнении.</div>
              </div>
            </div>
          </div>

          {/* 3. Готовый пошаговый чек-лист */}
          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                  Пошаговый чек-лист действий
                </h4>
                <p className="text-xs text-slate-400">
                  {analysisResult.actionChecklist.length} конкретных шагов для быстрого выполнения.
                </p>
              </div>

              {onAddToChecklist && (
                <button
                  onClick={handleAddTasksToChecklist}
                  disabled={activeTask?.isChecklistAdded}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeTask?.isChecklistAdded
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md cursor-pointer'
                  }`}
                >
                  {activeTask?.isChecklistAdded ? <Check className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
                  <span>{activeTask?.isChecklistAdded ? 'Уже добавлено в Чек-лист ✓' : '➕ Добавить в Чек-лист запуска'}</span>
                </button>
              )}
            </div>

            <div className="space-y-2 pt-1">
              {analysisResult.actionChecklist.map((item, i) => (
                <div 
                  key={i}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3 text-xs"
                >
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${getRoleBadgeStyle(item.roleTag)}`}>
                    {item.roleTag}
                  </span>
                  <span className="text-slate-200 font-medium leading-relaxed">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Проект записи в Журнал решений (Decision Log) */}
          {analysisResult.decisionLogDraft && (
            <div className="glass-card p-5 rounded-2xl border border-purple-500/30 bg-purple-950/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                  <FileSpreadsheet className="w-4 h-4" />
                  Проект записи в Журнал решений
                </div>

                {onAddToDecisionLog && (
                  <button
                    onClick={handleSaveToDecisionLog}
                    disabled={activeTask?.isDecisionAdded}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTask?.isDecisionAdded
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md cursor-pointer'
                    }`}
                  >
                    {activeTask?.isDecisionAdded ? <Check className="w-3.5 h-3.5" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                    <span>{activeTask?.isDecisionAdded ? 'Уже зафиксировано в журнале ✓' : '📜 Сохранить в Журнал решений'}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Что решаем:</span>
                  <span className="font-bold text-white">{analysisResult.decisionLogDraft.decision}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Кто утверждает (A):</span>
                  <span className="font-bold text-purple-300">
                    {analysisResult.decisionLogDraft.approvedBy} ({analysisResult.decisionLogDraft.approverRole})
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Обоснование:</span>
                  <span className="text-slate-300 italic">{analysisResult.decisionLogDraft.rationale}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : null}

    </div>
  );
};
