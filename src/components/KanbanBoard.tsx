import React, { useState } from 'react';
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
  Plus,
  GripVertical,
  CheckSquare,
  Archive,
  Sparkles
} from 'lucide-react';

interface KanbanBoardProps {
  projects: Project[];
  onOpenDetail: (project: Project) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onAddNewProject?: () => void;
}

interface KanbanColumnDef {
  status: ProjectStatus;
  title: string;
  desc: string;
  accent: string;
}

const COLUMNS: KanbanColumnDef[] = [
  { status: 'backlog', title: 'Бэклог', desc: 'Планы и подготовка', accent: 'from-slate-500/20 to-slate-600/10' },
  { status: 'in_progress', title: 'В работе', desc: 'Активная разработка', accent: 'from-blue-500/20 to-indigo-500/10' },
  { status: 'in_review', title: 'На проверке', desc: 'Согласование с клиентом', accent: 'from-amber-500/20 to-orange-500/10' },
  { status: 'waiting_payment', title: 'Ждёт оплаты', desc: 'Ожидание счетов/оплаты', accent: 'from-purple-500/20 to-pink-500/10' },
  { status: 'on_hold', title: 'Ждёт клиента', desc: 'На паузе: данные / созвон', accent: 'from-rose-500/20 to-rose-600/10' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  projects, 
  onOpenDetail, 
  onUpdateStatus, 
  onAddNewProject 
}) => {
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ProjectStatus | 'archive_drop' | null>(null);

  const getNextStatus = (current: ProjectStatus): ProjectStatus | null => {
    const order: ProjectStatus[] = ['backlog', 'in_progress', 'in_review', 'waiting_payment', 'completed'];
    const idx = order.indexOf(current);
    if (idx !== -1 && idx < order.length - 1) return order[idx + 1];
    if (current === 'on_hold') return 'in_progress';
    return null;
  };

  const getPrevStatus = (current: ProjectStatus): ProjectStatus | null => {
    const order: ProjectStatus[] = ['backlog', 'in_progress', 'in_review', 'waiting_payment'];
    const idx = order.indexOf(current);
    if (idx > 0) return order[idx - 1];
    if (current === 'on_hold') return 'backlog';
    return null;
  };

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProjectId(project.id);
    e.dataTransfer.setData('text/plain', project.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedProjectId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnColumn = (e: React.DragEvent, targetStatus: ProjectStatus) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain') || draggedProjectId;
    if (projectId) {
      onUpdateStatus(projectId, targetStatus);
    }
    setDragOverColumn(null);
    setDraggedProjectId(null);
  };

  const handleDropOnArchive = (e: React.DragEvent) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain') || draggedProjectId;
    if (projectId) {
      onUpdateStatus(projectId, 'completed');
    }
    setDragOverColumn(null);
    setDraggedProjectId(null);
  };

  return (
    <div className="space-y-4">
      {/* Optional Top Drag-to-Archive Drop Zone when dragging */}
      {draggedProjectId && (
        <div
          onDragOver={handleDragOver}
          onDragEnter={() => setDragOverColumn('archive_drop')}
          onDragLeave={() => setDragOverColumn(null)}
          onDrop={handleDropOnArchive}
          className={`p-4 rounded-2xl border-2 border-dashed transition-all text-center flex items-center justify-center gap-3 animate-pulse cursor-pointer ${
            dragOverColumn === 'archive_drop'
              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 scale-[1.01] shadow-[0_0_25px_rgba(16,185,129,0.3)]'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
          }`}
        >
          <Archive className="w-5 h-5" />
          <span className="font-bold text-sm">
            Перетащите сюда, чтобы завершить проект и отправить в Архив ✨
          </span>
        </div>
      )}

      {/* Horizontal Scrolling Kanban Board */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-[1250px] items-start">
          {COLUMNS.map((col) => {
            const colProjects = projects.filter(p => p.status === col.status);
            const colSum = colProjects.reduce((sum, p) => sum + calculateProjectFinancials(p).total, 0);
            const statusConfig = STATUS_CONFIG[col.status] || STATUS_CONFIG.in_progress;
            const isColumnHovered = dragOverColumn === col.status;

            return (
              <div 
                key={col.status} 
                onDragOver={handleDragOver}
                onDragEnter={() => setDragOverColumn(col.status)}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverColumn(null);
                  }
                }}
                onDrop={(e) => handleDropOnColumn(e, col.status)}
                className={`flex-1 min-w-[260px] max-w-[320px] glass-panel rounded-2xl p-3 border transition-all duration-200 flex flex-col max-h-[calc(100vh-230px)] ${
                  isColumnHovered
                    ? 'border-indigo-500/80 bg-indigo-500/10 ring-2 ring-indigo-500/50 shadow-[0_0_25px_rgba(99,102,241,0.25)] scale-[1.01]'
                    : 'border-white/10'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-2 mb-2 border-b border-white/5 bg-white/[0.02] rounded-xl">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.bg} ${statusConfig.border} border shadow-sm`} />
                      <h4 className="font-bold text-white text-sm tracking-tight">{col.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                        {colProjects.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{col.desc}</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <span className="block font-semibold text-emerald-400">{formatCurrency(colSum)}</span>
                  </div>
                </div>

                {/* Cards List in Column */}
                <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[160px] scrollbar-thin scrollbar-thumb-white/10">
                  {colProjects.length === 0 ? (
                    <div 
                      className={`h-36 flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-xl transition-all ${
                        isColumnHovered
                          ? 'border-indigo-400/60 bg-indigo-500/10 text-indigo-200'
                          : 'border-white/10 text-slate-500 text-xs'
                      }`}
                    >
                      {isColumnHovered ? (
                        <span className="font-semibold text-xs animate-pulse text-indigo-300">
                          Отпустите, чтобы переместить сюда ⬇
                        </span>
                      ) : (
                        <>
                          <span className="text-xs">Нет проектов</span>
                          {onAddNewProject && (
                            <button 
                              onClick={onAddNewProject}
                              className="mt-2 text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Добавить проект
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    colProjects.map((project) => {
                      const { total } = calculateProjectFinancials(project);
                      const progress = calculateProjectProgress(project);
                      const deadlineInfo = getDeadlineStatus(project.deadline, project.status);
                      const priorityInfo = PRIORITY_CONFIG[project.priority];
                      const theme = COLOR_THEME_GRADIENTS[project.colorTheme] || COLOR_THEME_GRADIENTS.purple;
                      const prev = getPrevStatus(project.status);
                      const next = getNextStatus(project.status);
                      const isBeingDragged = draggedProjectId === project.id;
                      
                      const totalTasks = project.tasks?.length || 0;
                      const completedTasks = project.tasks?.filter(t => t.completed).length || 0;

                      return (
                        <div 
                          key={project.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, project)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onOpenDetail(project)}
                          className={`glass-card-interactive rounded-xl p-3.5 border border-white/10 relative group cursor-grab active:cursor-grabbing hover:border-indigo-500/40 transition-all shadow-md ${
                            isBeingDragged ? 'opacity-40 scale-95 border-dashed border-indigo-400 ring-2 ring-indigo-500/30' : ''
                          }`}
                        >
                          {/* Top accent glow line */}
                          <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${theme.ring}`} />

                          {/* Card Header: Category, Priority, Drag Grip */}
                          <div className="flex items-center justify-between text-[11px] mb-2">
                            <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 font-medium truncate max-w-[120px]">
                              {project.category}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`flex items-center gap-1 font-medium ${priorityInfo.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dotClass}`} />
                                {priorityInfo.label}
                              </span>
                              <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                            </div>
                          </div>

                          {/* Title */}
                          <h5 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-1">
                            {project.title}
                          </h5>

                          {/* Client */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2.5">
                            <User className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <span className="truncate">{project.client}</span>
                          </div>

                          {/* Mini Progress */}
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

                          {/* Tasks & Deadline / Financials */}
                          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5 mb-2.5 gap-2">
                            <span className={`px-1.5 py-0.5 rounded border text-[10px] truncate max-w-[130px] ${deadlineInfo.badgeBg}`}>
                              {deadlineInfo.label}
                            </span>
                            
                            {totalTasks > 0 ? (
                              <span className="flex items-center gap-1 text-[11px] text-slate-400" title="Выполнено задач">
                                <CheckSquare className="w-3 h-3 text-indigo-400" />
                                <span>{completedTasks}/{totalTasks}</span>
                              </span>
                            ) : null}

                            <span className="font-semibold text-emerald-400 ml-auto">
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
                                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                            ) : <div />}

                            <span className="text-[10px] text-slate-500 group-hover:text-indigo-400 flex items-center gap-1">
                              <span>Открыть</span>
                              <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>

                            {next ? (
                              <button
                                title={next === 'completed' ? 'Завершить и отправить в архив 📦' : 'Переместить вперед'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateStatus(project.id, next);
                                }}
                                className={`p-1 rounded hover:bg-white/10 transition-colors cursor-pointer ${
                                  next === 'completed' ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-400 hover:text-white'
                                }`}
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
    </div>
  );
};
