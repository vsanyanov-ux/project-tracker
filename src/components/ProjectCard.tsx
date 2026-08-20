import React from 'react';
import type { Project, ProjectStatus } from '../types/project';
import { 
  formatCurrency, 
  calculateProjectFinancials, 
  calculateProjectProgress, 
  getDeadlineStatus, 
  formatDate, 
  STATUS_CONFIG, 
  PRIORITY_CONFIG,
  COLOR_THEME_GRADIENTS 
} from '../utils/formatters';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  ChevronRight, 
  User, 
  Wallet,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onOpenDetail: (project: Project) => void;
  onQuickStatusChange?: (projectId: string, newStatus: ProjectStatus) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpenDetail }) => {
  const { paid, owed, total, percentPaid } = calculateProjectFinancials(project);
  const progress = calculateProjectProgress(project);
  const deadlineInfo = getDeadlineStatus(project.deadline);
  
  const statusInfo = STATUS_CONFIG[project.status] || STATUS_CONFIG.in_progress;
  const priorityInfo = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG.medium;
  const theme = COLOR_THEME_GRADIENTS[project.colorTheme] || COLOR_THEME_GRADIENTS.purple;

  const completedTasks = project.tasks?.filter(t => t.completed).length || 0;
  const totalTasks = project.tasks?.length || 0;

  return (
    <div 
      onClick={() => onOpenDetail(project)}
      className="glass-card-interactive rounded-2xl p-5 relative flex flex-col justify-between group cursor-pointer border border-white/10 hover:border-indigo-500/40 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden"
    >
      {/* Top Accent Gradient Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.ring}`} />

      {/* Ambient background glow on hover */}
      <div 
        className="absolute -right-20 -bottom-20 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"
        style={{ background: theme.glow }}
      />

      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
              {project.category}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded-full border border-white/5">
              <span className={`w-2 h-2 rounded-full ${priorityInfo.dotClass}`} />
              <span>{priorityInfo.label}</span>
            </div>
          </div>

          <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} flex items-center gap-1`}>
            {project.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            {statusInfo.label}
          </span>
        </div>

        {/* Project Title & Client */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
            {project.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate">{project.client}</span>
            {project.clientContact && (
              <span className="text-[11px] text-indigo-400/80 bg-indigo-950/40 px-1.5 py-0.2 rounded border border-indigo-800/30">
                {project.clientContact}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="mb-3 bg-slate-900/50 p-3 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Готовность:
            </span>
            <span className="font-bold text-white">{progress}%</span>
          </div>
          <div className="w-full bg-slate-800/90 rounded-full h-2 overflow-hidden border border-white/5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {totalTasks > 0 && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-slate-500" />
                Задачи: {completedTasks} из {totalTasks}
              </span>
              <span>{Math.round((completedTasks / totalTasks) * 100)}% чек-листа</span>
            </div>
          )}
        </div>

        {/* Timeline & Deadline Badge */}
        <div className="flex items-center justify-between text-xs py-2 px-1 border-t border-b border-white/5 mb-3">
          <div className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Старт: {formatDate(project.startDate)}</span>
          </div>
          <div className={`px-2 py-0.5 rounded-md border text-[11px] font-medium flex items-center gap-1 ${deadlineInfo.badgeBg}`}>
            <Clock className="w-3 h-3" />
            {deadlineInfo.label}
          </div>
        </div>

        {/* Financials & Prepayment Block */}
        <div className="bg-slate-900/80 rounded-xl p-3.5 border border-white/5 mb-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-indigo-400" />
              Стоимость:
            </span>
            <span className="font-extrabold text-white text-sm">
              {formatCurrency(total, project.currency)}
            </span>
          </div>

          {/* Prepayment vs Debt Progress */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full" 
              style={{ width: `${percentPaid}%` }} 
              title={`Получено: ${formatCurrency(paid, project.currency)}`}
            />
            <div 
              className="bg-amber-500/80 h-full" 
              style={{ width: `${100 - percentPaid}%` }} 
              title={`Долг: ${formatCurrency(owed, project.currency)}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1.5 text-xs">
            <div className="bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 font-semibold block flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                Предоплата:
              </span>
              <span className="font-bold text-emerald-400">
                {formatCurrency(paid, project.currency)}
              </span>
            </div>

            <div className={`p-2 rounded-lg border ${owed > 0 ? 'bg-amber-950/30 border-amber-500/20' : 'bg-slate-900 border-white/5'}`}>
              <span className="text-[10px] text-slate-400 font-semibold block flex items-center gap-1">
                {owed > 0 ? <AlertCircle className="w-2.5 h-2.5 text-amber-400" /> : <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />}
                {owed > 0 ? 'Остаток (долг):' : 'Статус оплаты:'}
              </span>
              <span className={`font-bold ${owed > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {owed > 0 ? formatCurrency(owed, project.currency) : 'Всё оплачено ✓'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Button */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400 group-hover:text-white">
        <span className="text-[11px] text-slate-500">
          Обновлен: {formatDate(project.updatedAt)}
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(project);
          }}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group/btn"
        >
          Провалиться в проект
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
