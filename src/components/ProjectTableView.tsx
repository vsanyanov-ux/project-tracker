import React, { useState } from 'react';
import type { Project, ProjectStatus } from '../types/project';
import { 
  STATUS_CONFIG, 
  PRIORITY_CONFIG, 
  PRIORITY_WEIGHTS,
  calculateProjectFinancials, 
  calculateProjectProgress, 
  formatCurrency, 
  getDeadlineStatus, 
  formatDate, 
  COLOR_THEME_GRADIENTS 
} from '../utils/formatters';
import { ArrowUpDown, ChevronRight, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProjectTableViewProps {
  projects: Project[];
  onOpenDetail: (project: Project) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
}

type SortField = 'title' | 'client' | 'priority' | 'deadline' | 'progress' | 'budget' | 'paid' | 'owed';

export const ProjectTableView: React.FC<ProjectTableViewProps> = ({ 
  projects, 
  onOpenDetail, 
  onUpdateStatus 
}) => {
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      // For priority, default to descending (urgent first) on first click
      setSortAsc(field === 'priority' ? false : true);
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    let res = 0;
    if (sortField === 'title') {
      res = a.title.localeCompare(b.title, 'ru');
    } else if (sortField === 'client') {
      res = a.client.localeCompare(b.client, 'ru');
    } else if (sortField === 'priority') {
      const pA = PRIORITY_WEIGHTS[a.priority] || 0;
      const pB = PRIORITY_WEIGHTS[b.priority] || 0;
      res = pA - pB;
    } else if (sortField === 'deadline') {
      const timeA = a.deadline ? new Date(a.deadline).getTime() : 0;
      const timeB = b.deadline ? new Date(b.deadline).getTime() : 0;
      res = timeA - timeB;
    } else if (sortField === 'progress') {
      res = calculateProjectProgress(a) - calculateProjectProgress(b);
    } else if (sortField === 'budget') {
      res = calculateProjectFinancials(a).total - calculateProjectFinancials(b).total;
    } else if (sortField === 'paid') {
      const paidA = calculateProjectFinancials(a).paid;
      const paidB = calculateProjectFinancials(b).paid;
      res = paidA - paidB;
    } else if (sortField === 'owed') {
      const owedA = calculateProjectFinancials(a).owed;
      const owedB = calculateProjectFinancials(b).owed;
      res = owedA - owedB;
    }
    return sortAsc ? res : -res;
  });

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl mb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
            <tr>
              <th scope="col" className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('title')}>
                <div className="flex items-center gap-1.5">
                  Проект
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('client')}>
                <div className="flex items-center gap-1.5">
                  Клиент
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('priority')}>
                <div className="flex items-center gap-1.5">
                  Приоритет
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4">Статус</th>
              <th scope="col" className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('deadline')}>
                <div className="flex items-center gap-1.5">
                  Дедлайн / Срок
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('progress')}>
                <div className="flex items-center gap-1.5">
                  Готовность
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('budget')}>
                <div className="flex items-center gap-1.5">
                  Бюджет
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('paid')}>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  Предоплата (получено)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('owed')}>
                <div className="flex items-center gap-1.5 text-amber-400">
                  Остаток (Долг)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedProjects.map((project) => {
              const { paid, owed, total } = calculateProjectFinancials(project);
              const progress = calculateProjectProgress(project);
              const deadlineInfo = getDeadlineStatus(project.deadline, project.status);
              const statusConfig = STATUS_CONFIG[project.status];
              const priorityInfo = PRIORITY_CONFIG[project.priority];
              const theme = COLOR_THEME_GRADIENTS[project.colorTheme] || COLOR_THEME_GRADIENTS.purple;

              return (
                <tr 
                  key={project.id}
                  onClick={() => onOpenDetail(project)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  {/* Title */}
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {project.title}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {project.category}
                      </span>
                    </div>
                  </td>

                  {/* Client */}
                  <td className="py-4 px-4 text-slate-300">
                    <div className="flex items-center gap-1.5 text-xs">
                      <User className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{project.client}</span>
                    </div>
                  </td>

                  {/* Priority Badge */}
                  <td className="py-4 px-4">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${priorityInfo.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dotClass}`} />
                      {priorityInfo.label}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={project.status}
                      onChange={(e) => onUpdateStatus(project.id, e.target.value as ProjectStatus)}
                      className={`text-xs px-2.5 py-1 rounded-lg border bg-slate-900 text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${statusConfig.border}`}
                    >
                      <option value="backlog">Бэклог</option>
                      <option value="in_progress">В работе</option>
                      <option value="in_review">На проверке</option>
                      <option value="waiting_payment">Ждёт оплаты</option>
                      <option value="completed">Завершён (В архив 📦)</option>
                      <option value="on_hold">На паузе</option>
                      <option value="cancelled">Отменён (В архив ✕)</option>
                    </select>
                  </td>

                  {/* Deadline */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-300">{formatDate(project.deadline)}</span>
                      <span className={`text-[11px] font-medium ${deadlineInfo.color}`}>
                        {deadlineInfo.label}
                      </span>
                    </div>
                  </td>

                  {/* Progress */}
                  <td className="py-4 px-4">
                    <div className="w-28">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-white">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${theme.bar}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Budget */}
                  <td className="py-4 px-4 font-semibold text-white">
                    {formatCurrency(total, project.currency)}
                    {project.status === 'cancelled' && (
                      <span className="text-[10px] text-zinc-400 block font-normal">(сброшено)</span>
                    )}
                  </td>

                  {/* Prepayment Paid */}
                  <td className="py-4 px-4">
                    <span className="font-semibold text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      {formatCurrency(paid, project.currency)}
                    </span>
                  </td>

                  {/* Owed */}
                  <td className="py-4 px-4">
                    {project.status === 'cancelled' ? (
                      <span className="text-xs text-zinc-400 font-medium">
                        Сброшен (0 {project.currency})
                      </span>
                    ) : owed > 0 ? (
                      <span className="font-semibold text-amber-400 text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center gap-1 w-fit">
                        <AlertCircle className="w-3 h-3" />
                        {formatCurrency(owed, project.currency)}
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-400 font-medium">
                        Всё оплачено ✓
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetail(project);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
