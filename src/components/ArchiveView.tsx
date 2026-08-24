import React from 'react';
import type { Project, ProjectStatus, ViewMode } from '../types/project';
import { calculateProjectFinancials, formatCurrency } from '../utils/formatters';
import { ProjectCard } from './ProjectCard';
import { ProjectTableView } from './ProjectTableView';
import { 
  Archive, 
  Wallet, 
  CheckCircle2, 
  Sparkles, 
  Layers,
  ArrowLeft,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';

interface ArchiveViewProps {
  projects: Project[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenDetail: (project: Project) => void;
  onRestoreProject: (projectId: string) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onGoToActive: () => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  projects,
  viewMode,
  onViewModeChange,
  onOpenDetail,
  onRestoreProject,
  onUpdateStatus,
  onGoToActive
}) => {
  // Aggregate stats for archived projects
  const totalArchived = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed');
  const cancelledProjects = projects.filter(p => p.status === 'cancelled');
  
  const totalRevenue = projects.reduce((sum, p) => {
    const fin = calculateProjectFinancials(p);
    return sum + fin.paid;
  }, 0);

  const totalClosedBudget = completedProjects.reduce((sum, p) => sum + (p.totalBudget || 0), 0);

  return (
    <div className="space-y-6">
      {/* Archive Header Banner & Stats */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/20 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <Archive className="w-3.5 h-3.5" />
                Архив проектов
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {totalArchived} {totalArchived === 1 ? 'проект' : (totalArchived >= 2 && totalArchived <= 4 ? 'проекта' : 'проектов')}
                {cancelledProjects.length > 0 && ` (${completedProjects.length} завершено, ${cancelledProjects.length} отменено)`}
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Архив завершённых и отменённых проектов
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Все проекты со статусом <strong className="text-emerald-400">«Завершён»</strong> и <strong className="text-zinc-300">«Отменён»</strong> автоматически попадают сюда. Здесь можно посмотреть финансовые итоги, чеклисты и материалы, а также при необходимости вернуть любой проект в активную работу.
            </p>
          </div>

          {/* Quick Return to Active Button */}
          <button
            onClick={onGoToActive}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 transition-all text-xs font-semibold self-start md:self-center"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>К активным проектам</span>
          </button>
        </div>

        {/* 3 Metric Pills inside Archive Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-white/10">
          <div className="bg-slate-900/60 rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Всего в архиве</span>
              <span className="text-lg font-bold text-white tracking-tight">{totalArchived} проектов</span>
              <span className="text-[10px] text-slate-500 block">✓ {completedProjects.length} сдано · ✕ {cancelledProjects.length} отменено</span>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-4 border border-indigo-500/20 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Получено оплат (выручка)</span>
              <span className="text-lg font-bold text-emerald-400 tracking-tight">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-4 border border-purple-500/20 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Закрытый бюджет (сданные)</span>
              <span className="text-lg font-bold text-slate-200 tracking-tight">{formatCurrency(totalClosedBudget)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher in Archive (Grid vs Table) */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Отображение архива:</span>
          <div className="glass-panel p-1 rounded-xl flex items-center border border-white/5 bg-slate-900/60">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid' || viewMode === 'kanban'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Вид: Сетка"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Сетка</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Вид: Таблица"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Таблица</span>
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Найдено в архиве: <strong className="text-white">{projects.length}</strong>
        </span>
      </div>

      {/* Main Content Area */}
      {projects.length === 0 ? (
        /* Empty Archive State */
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 max-w-xl mx-auto my-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <Archive className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">В архиве пока нет проектов</h3>
          <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
            Когда вы переведёте любой проект в статус <strong>«Завершён»</strong> или <strong>«Отменён»</strong> (в карточке, деталях или таблице), он автоматически переместится сюда и освободит активный пайплайн.
          </p>
          <button
            onClick={onGoToActive}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all inline-flex items-center gap-2 shadow-lg shadow-emerald-600/30"
          >
            <Layers className="w-4 h-4" />
            Перейти к активным проектам
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <ProjectTableView
          projects={projects}
          onOpenDetail={onOpenDetail}
          onUpdateStatus={onUpdateStatus}
        />
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpenDetail={onOpenDetail}
              onQuickStatusChange={onUpdateStatus}
              isArchived={true}
              onRestoreProject={() => onRestoreProject(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
