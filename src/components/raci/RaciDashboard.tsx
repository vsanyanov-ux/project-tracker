import React, { useState } from 'react';
import type { RaciStorageState, ClientCardArtifact, DecisionLogEntry, WeeklyReportData } from '../../types/raci';
import { getStoredRaciData, saveRaciData, resetRaciData } from '../../utils/raciStorage';
import { ThreeQuestionsWidget } from './ThreeQuestionsWidget';
import { RaciMatrixTable } from './RaciMatrixTable';
import { ArtifactClientCard } from './ArtifactClientCard';
import { ArtifactChecklist } from './ArtifactChecklist';
import { ArtifactDecisionLog } from './ArtifactDecisionLog';
import { ArtifactWeeklyReport } from './ArtifactWeeklyReport';
import { 
  ShieldCheck, 
  HelpCircle, 
  Table, 
  FileText, 
  CheckSquare, 
  FileSpreadsheet, 
  TrendingUp, 
  RotateCcw, 
  Layers, 
  ArrowRight,
  ExternalLink,
  Users
} from 'lucide-react';

interface RaciDashboardProps {
  onShowToast: (msg: string) => void;
  onGoToProjects?: () => void;
  onGoToCrm?: () => void;
}

export type RaciSubTab = 'questions' | 'matrix' | 'artifacts';
export type ArtifactSubTab = 'card' | 'checklist' | 'decisions' | 'report';

export const RaciDashboard: React.FC<RaciDashboardProps> = ({
  onShowToast,
  onGoToProjects,
  onGoToCrm
}) => {
  const [raciState, setRaciState] = useState<RaciStorageState>(() => getStoredRaciData());
  const [subTab, setSubTab] = useState<RaciSubTab>('matrix');
  const [artifactTab, setArtifactTab] = useState<ArtifactSubTab>('card');

  const updateAndSave = (newState: RaciStorageState) => {
    setRaciState(newState);
    saveRaciData(newState);
  };

  const handleUpdateCard = (card: ClientCardArtifact) => {
    updateAndSave({ ...raciState, clientCard: card });
  };

  const handleToggleChecklistItem = (id: string) => {
    const updated = raciState.checklist.map((item) => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    updateAndSave({ ...raciState, checklist: updated });
  };

  const handleResetChecklist = () => {
    const reset = raciState.checklist.map((item) => ({ ...item, completed: false }));
    updateAndSave({ ...raciState, checklist: reset });
  };

  const handleAddDecision = (entry: DecisionLogEntry) => {
    const updated = [entry, ...raciState.decisionLog];
    updateAndSave({ ...raciState, decisionLog: updated });
  };

  const handleDeleteDecision = (id: string) => {
    const updated = raciState.decisionLog.filter((d) => d.id !== id);
    updateAndSave({ ...raciState, decisionLog: updated });
  };

  const handleUpdateReport = (report: WeeklyReportData) => {
    updateAndSave({ ...raciState, weeklyReport: report });
  };

  const handleResetAll = () => {
    if (window.confirm('Сбросить все данные RACI фреймворка к демонстрационным эталонам?')) {
      const initial = resetRaciData();
      setRaciState(initial);
      onShowToast('RACI фреймворк сброшен к эталонным данным для клиники «Gladkaya»! 🔄');
    }
  };

  const checklistProgress = Math.round(
    (raciState.checklist.filter((c) => c.completed).length / raciState.checklist.length) * 100
  );

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Соло-Фреймворк RACI
              </span>
              <span className="text-xs text-slate-400 font-medium">
                C:\Users\vanya\Antigravity Projects\Corporate\AI Admin
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              AI Admin для косметологов: Возврат спящей базы
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="font-bold text-white">Формально вы один, но процессно — маленькая компания с четким разделением ролей.</span> 
              {' '}RACI защищает вас от смешивания «я придумал», «я сделал», «я проверил» и исключает риск сделать неудачную рассылку за счет репутации косметолога.
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {onGoToProjects && (
                <button
                  onClick={onGoToProjects}
                  className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Открыть проект AI Admin в трекере</span>
                </button>
              )}
              {onGoToCrm && (
                <button
                  onClick={onGoToCrm}
                  className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/5 transition-all"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Клиники в CRM</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Snapshot KPIs */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="glass-card px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[120px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Владелец решения (A)</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5">
                {raciState.clientCard.isApprovedWritten ? '✓ Утверждено' : '⚠️ Требует аппрув'}
              </div>
            </div>

            <div className="glass-card px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[110px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Чек-лист QA</div>
              <div className="text-xs font-black text-cyan-400 mt-0.5">{checklistProgress}% готово</div>
            </div>

            <div className="glass-card px-4 py-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-center min-w-[130px]">
              <div className="text-[10px] uppercase font-bold text-emerald-400">Возврат выручки</div>
              <div className="text-xs font-black text-white mt-0.5">
                {raciState.weeklyReport.generatedRevenue.toLocaleString('ru')} ₽
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        
        {/* Sub-tabs switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSubTab('matrix')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'matrix'
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'glass-panel text-slate-400 hover:text-white border-white/5'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>RACI Матрица продукта</span>
          </button>

          <button
            onClick={() => setSubTab('questions')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'questions'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30'
                : 'glass-panel text-slate-400 hover:text-white border-white/5'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
            <span>3 Вопроса Соло-фаундера</span>
          </button>

          <button
            onClick={() => setSubTab('artifacts')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'artifacts'
                ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-cyan-600/30'
                : 'glass-panel text-slate-400 hover:text-white border-white/5'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-300" />
            <span>4 Артефакта системы</span>
          </button>
        </div>

        {/* Global Reset Button */}
        <button
          onClick={handleResetAll}
          className="p-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/5 transition-all self-end sm:self-center"
          title="Сбросить все данные RACI к эталонным"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Сбросить демо</span>
        </button>

      </div>

      {/* Artifacts Sub-Switcher when 'artifacts' is active */}
      {subTab === 'artifacts' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setArtifactTab('card')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              artifactTab === 'card'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'glass-panel text-slate-400 hover:text-white border-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Карточка клиента (Кампания)</span>
          </button>

          <button
            onClick={() => setArtifactTab('checklist')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              artifactTab === 'checklist'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'glass-panel text-slate-400 hover:text-white border-white/5'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>2. Чек-лист запуска (QA)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-extrabold">
              {checklistProgress}%
            </span>
          </button>

          <button
            onClick={() => setArtifactTab('decisions')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              artifactTab === 'decisions'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'glass-panel text-slate-400 hover:text-white border-white/5'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>3. Журнал решений (Decision Log)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-extrabold">
              {raciState.decisionLog.length}
            </span>
          </button>

          <button
            onClick={() => setArtifactTab('report')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              artifactTab === 'report'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'glass-panel text-slate-400 hover:text-white border-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>4. Еженедельный отчет (Воронка)</span>
          </button>
        </div>
      )}

      {/* View Content Rendering */}
      {subTab === 'questions' ? (
        <ThreeQuestionsWidget
          onGoToChecklist={() => {
            setSubTab('artifacts');
            setArtifactTab('checklist');
          }}
          onGoToDecisionLog={() => {
            setSubTab('artifacts');
            setArtifactTab('decisions');
          }}
        />
      ) : subTab === 'matrix' ? (
        <div className="space-y-6">
          <RaciMatrixTable />
          
          {/* Quick Access to 3 Questions Widget */}
          <div className="glass-panel rounded-2xl p-5 border border-amber-500/20 bg-amber-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Сомневаетесь перед запуском или действием?</h4>
                <p className="text-xs text-slate-300">Пройдите быстрый интерактивный чекер из 3 вопросов соло-фаундера.</p>
              </div>
            </div>

            <button
              onClick={() => setSubTab('questions')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0 self-start sm:self-center"
            >
              <span>Открыть 3 Вопроса</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Artifacts Rendering */
        <div>
          {artifactTab === 'card' && (
            <ArtifactClientCard
              card={raciState.clientCard}
              onUpdateCard={handleUpdateCard}
              onShowToast={onShowToast}
            />
          )}

          {artifactTab === 'checklist' && (
            <ArtifactChecklist
              checklist={raciState.checklist}
              onToggleItem={handleToggleChecklistItem}
              onResetChecklist={handleResetChecklist}
              onShowToast={onShowToast}
            />
          )}

          {artifactTab === 'decisions' && (
            <ArtifactDecisionLog
              entries={raciState.decisionLog}
              onAddEntry={handleAddDecision}
              onDeleteEntry={handleDeleteDecision}
              onShowToast={onShowToast}
            />
          )}

          {artifactTab === 'report' && (
            <ArtifactWeeklyReport
              report={raciState.weeklyReport}
              onUpdateReport={handleUpdateReport}
              onShowToast={onShowToast}
            />
          )}
        </div>
      )}

    </div>
  );
};
