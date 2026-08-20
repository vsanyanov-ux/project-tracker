import React from 'react';
import type { Project, ProjectStatus } from '../types/project';
import { 
  STATUS_CONFIG, 
  PRIORITY_CONFIG, 
  calculateProjectFinancials, 
  calculateProjectProgress, 
  formatCurrency, 
  getDeadlineStatus,
  COLOR_THEME_GRADIENTS
} from '../utils/formatters';
import { 
  ChevronLeft, 
  ChevronRight, 
  User,
  Plus
} from 'lucide-react';

interface KanbanBoardProps {
  projects: Project[];
  onOpenDetail: (project: Project) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onAddNewProject?: () => void;
}

const COLUMNS: { status: ProjectStatus; title: string; desc: string }[] = [
  { status: 'backlog', title: 'Бэклог', desc: 'Планы и подготовка' },
  { status: 'in_progress', title: 'В работе', desc: 'Активная разработка' },
  { status: 'in_review', title: 'На проверке', desc: 'Согласование с клиентом' },
  { status: 'waiting_payment', title: 'Ждёт оплаты', desc: 'Ожидание финального счета' },
  { status: 'completed', title: 'Завершено', desc: 'Сдано и закрыто' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  projects, 
  onOpenDetail, 
  onUpdateStatus,
  onAddNewProject 
}) => {
  const getNextStatus = (current: ProjectStatus): ProjectStatus | null => {
    const order: ProjectStatus[] = ['backlog', 'in_progress', 'in_review', 'waiting_payment', 'completed'];
    const idx = order.indexOf(current);
    if (idx < order.length - 1) return order[idx + 1];
    return null;
  };

  const getPrevStatus = (current: ProjectStatus): ProjectStatus | null => {
    const order: ProjectStatus[] = ['backlog', 'in_progress', 'in_review', 'waiting_payment', 'completed'];
    const idx = order.indexOf(current);
    if (idx > 0) return order[idx - 1];
    return null;
  };

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-[1200px] items-start">
        {COLUMNS.map((col) => {
          const colProjects = projects.filter(p => p.status === col.status);
          const colSum = colProjects.reduce((sum, p) => sum + p.totalBudget, 0);
          const statusConfig = STATUS_CONFIG[col.status];

          return (
            <div 
              key={col.status} 
              className="flex-1 min-w-[280px] max-w-[340px] glass-panel rounded-2xl p-3 border border-white/10 flex flex-col max-h-[calc(100vh-250px)]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-2 mb-2 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.bg} ${statusConfig.border} border`} />
                    <h4 className="font-bold text-white text-sm">{col.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                      {colProjects.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{col.desc}</p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span className="block font-medium text-emerald-400">{formatCurrency(colSum)}</span>
                </div>
              </div>

              {/* Cards List in Column */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[150px]">
                {colProjects.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
                    <span>Нет проектов в этом статусе</span>
                    {onAddNewProject && (
                      <button 
                        onClick={onAddNewProject}
                        className="mt-2 text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                      >
                        <Plus className="w-3 h-3" /> Добавить
                      </button>
                    )}
                  </div>
                ) : (
                  colProjects.map((project) => {
                    const { total } = calculateProjectFinancials(project);
                    const progress = calculateProjectProgress(project);
                    const deadlineInfo = getDeadlineStatus(project.deadline);
                    const priorityInfo = PRIORITY_CONFIG[project.priority];
                    const theme = COLOR_THEME_GRADIENTS[project.colorTheme] || COLOR_THEME_GRADIENTS.purple;
                    const prev = getPrevStatus(project.status);
                    const next = getNextStatus(project.status);

                    return (
                      <div 
                        key={project.id}
                        onClick={() => onOpenDetail(project)}
                        className="glass-card-interactive rounded-xl p-3.5 border border-white/10 relative group cursor-pointer hover:border-indigo-500/40 transition-all shadow-md"
                      >
                        {/* Top glow indicator */}
                        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${theme.ring}`} />

                        <div className="flex items-center justify-between text-[11px] mb-2">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                            {project.category}
                          </span>
                          <span className={`flex items-center gap-1 font-medium ${priorityInfo.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dotClass}`} />
                            {priorityInfo.label}
                          </span>
                        </div>

                        <h5 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-1">
                          {project.title}
                        </h5>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2.5">
                          <User className="w-3 h-3 text-slate-500" />
                          <span className="truncate">{project.client}</span>
                        </div>

                        {/* Mini progress */}
                        <div className="mb-2.5">
                          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                            <span>Готовность:</span>
                            <span className="font-bold text-white">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${theme.bar}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Deadline & Finances */}
                        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5 mb-2.5">
                          <span className={`px-1.5 py-0.5 rounded border text-[10px] ${deadlineInfo.badgeBg}`}>
                            {deadlineInfo.label}
                          </span>
                          <span className="font-semibold text-emerald-400">
                            {formatCurrency(total, project.currency)}
                          </span>
                        </div>

                        {/* Move Actions */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          {prev ? (
                            <button
                              title="Переместить назад"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(project.id, prev);
                              }}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                          ) : <div />}

                          <span className="text-[10px] text-slate-500 group-hover:text-indigo-400">
                            Открыть ➔
                          </span>

                          {next ? (
                            <button
                              title="Переместить вперед"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(project.id, next);
                              }}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          ) : <div />}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
