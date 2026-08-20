import type { Project, ProjectStatus, Priority } from '../types/project';

export const formatCurrency = (amount: number, currency: string = '₽'): string => {
  return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + currency;
};

export const calculateProjectFinancials = (project: Project) => {
  const paid = (project.payments || [])
    .filter(p => p.isPaid)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  
  const total = Number(project.totalBudget || 0);
  const owed = Math.max(0, total - paid);
  const percentPaid = total > 0 ? Math.round((paid / total) * 100) : 0;

  return { paid, owed, total, percentPaid };
};

export const calculateFinancials = (projects: Project[]) => {
  let totalEarned = 0;
  let totalOwed = 0;
  let totalBudget = 0;

  projects.forEach(p => {
    const fin = calculateProjectFinancials(p);
    totalEarned += fin.paid;
    totalOwed += fin.owed;
    totalBudget += fin.total;
  });

  const paymentRate = totalBudget > 0 ? Math.round((totalEarned / totalBudget) * 100) : 0;

  return { totalEarned, totalOwed, totalBudget, paymentRate };
};

export const calculateProjectProgress = (project: Project): number => {
  if (project.status === 'completed') return 100;

  if (project.tasks && project.tasks.length > 0) {
    const completedTasks = project.tasks.filter(t => t.completed).length;
    const taskProgress = Math.round((completedTasks / project.tasks.length) * 100);
    
    if (project.milestones && project.milestones.length > 0) {
      const milestoneProgress = Math.round(
        project.milestones.reduce((acc, m) => acc + (m.completed ? 100 : Number(m.progress || 0)), 0) / project.milestones.length
      );
      return Math.round((taskProgress * 0.6) + (milestoneProgress * 0.4));
    }
    return taskProgress;
  }

  if (project.milestones && project.milestones.length > 0) {
    return Math.round(
      project.milestones.reduce((acc, m) => acc + (m.completed ? 100 : Number(m.progress || 0)), 0) / project.milestones.length
    );
  }

  if (project.status === 'in_review') return 85;
  if (project.status === 'waiting_payment') return 95;
  if (project.status === 'in_progress') return 50;
  return 10;
};

export const getDeadlineStatus = (deadlineStr: string, status?: ProjectStatus) => {
  if (status === 'completed') {
    return {
      daysLeft: 0,
      isOverdue: false,
      isUrgent: false,
      label: 'Завершён ✓',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
    };
  }

  if (!deadlineStr) return { daysLeft: 0, isOverdue: false, isUrgent: false, label: 'Без дедлайна', color: 'text-slate-400', badgeBg: 'bg-slate-800/60 border-slate-700' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      daysLeft,
      isOverdue: true,
      isUrgent: true,
      label: `Просрочено на ${Math.abs(daysLeft)} дн.`,
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300'
    };
  }

  if (daysLeft === 0) {
    return {
      daysLeft: 0,
      isOverdue: false,
      isUrgent: true,
      label: 'Дедлайн сегодня!',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300'
    };
  }

  if (daysLeft <= 3) {
    return {
      daysLeft,
      isOverdue: false,
      isUrgent: true,
      label: `Осталось ${daysLeft} дн. (срочно)`,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300'
    };
  }

  return {
    daysLeft,
    isOverdue: false,
    isUrgent: false,
    label: `Осталось ${daysLeft} дн.`,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
  };
};

export const getTimelineMetrics = (startDateStr: string, deadlineStr: string, status?: ProjectStatus) => {
  const start = new Date(startDateStr || new Date().toISOString().split('T')[0]);
  const end = new Date(deadlineStr || new Date().toISOString().split('T')[0]);
  const now = new Date();

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const totalDuration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const timePercent = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDuration) * 100)));

  return {
    totalDuration,
    elapsedDays,
    daysLeft,
    timePercent,
    isOverdue: status === 'completed' ? false : daysLeft < 0
  };
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const STATUS_CONFIG: Record<ProjectStatus, { label: string; bg: string; text: string; border: string; glow: string }> = {
  backlog: {
    label: 'Бэклог',
    bg: 'bg-slate-800/70',
    text: 'text-slate-300',
    border: 'border-slate-700/60',
    glow: 'rgba(148, 163, 184, 0.2)'
  },
  in_progress: {
    label: 'В работе',
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    glow: 'rgba(59, 130, 246, 0.4)'
  },
  in_review: {
    label: 'На проверке',
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    glow: 'rgba(245, 158, 11, 0.4)'
  },
  waiting_payment: {
    label: 'Ждёт оплаты',
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/40',
    glow: 'rgba(168, 85, 247, 0.4)'
  },
  completed: {
    label: 'Завершён',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    glow: 'rgba(16, 185, 129, 0.4)'
  },
  on_hold: {
    label: 'На паузе',
    bg: 'bg-rose-500/20',
    text: 'text-rose-400',
    border: 'border-rose-500/40',
    glow: 'rgba(244, 63, 94, 0.4)'
  }
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dotClass: string; badge: string }> = {
  low: { label: 'Низкий', color: 'text-slate-400', dotClass: 'bg-slate-400', badge: 'bg-slate-800 text-slate-400 border-slate-700' },
  medium: { label: 'Средний', color: 'text-blue-400', dotClass: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]', badge: 'bg-blue-950/60 text-blue-300 border-blue-800/60' },
  high: { label: 'Высокий', color: 'text-amber-400', dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]', badge: 'bg-amber-950/60 text-amber-300 border-amber-800/60' },
  urgent: { label: 'Срочно 🔥', color: 'text-rose-400', dotClass: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,1)] animate-pulse', badge: 'bg-rose-950/60 text-rose-300 border-rose-800/60' }
};

export const COLOR_THEME_GRADIENTS: Record<string, { ring: string; bar: string; text: string; bgSoft: string; border: string; glow: string }> = {
  purple: {
    ring: 'from-purple-500 to-indigo-500',
    bar: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    text: 'text-purple-400',
    bgSoft: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    glow: 'rgba(168, 85, 247, 0.3)'
  },
  cyan: {
    ring: 'from-cyan-500 to-blue-500',
    bar: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    text: 'text-cyan-400',
    bgSoft: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    glow: 'rgba(6, 182, 212, 0.3)'
  },
  emerald: {
    ring: 'from-emerald-500 to-teal-500',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    text: 'text-emerald-400',
    bgSoft: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'rgba(16, 185, 129, 0.3)'
  },
  amber: {
    ring: 'from-amber-500 to-orange-500',
    bar: 'bg-gradient-to-r from-amber-500 to-orange-500',
    text: 'text-amber-400',
    bgSoft: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'rgba(245, 158, 11, 0.3)'
  },
  blue: {
    ring: 'from-blue-500 to-indigo-600',
    bar: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    text: 'text-blue-400',
    bgSoft: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    glow: 'rgba(59, 130, 246, 0.3)'
  },
  rose: {
    ring: 'from-rose-500 to-pink-500',
    bar: 'bg-gradient-to-r from-rose-500 to-pink-500',
    text: 'text-rose-400',
    bgSoft: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    glow: 'rgba(244, 63, 94, 0.3)'
  },
  indigo: {
    ring: 'from-indigo-500 to-violet-500',
    bar: 'bg-gradient-to-r from-indigo-500 to-violet-500',
    text: 'text-indigo-400',
    bgSoft: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    glow: 'rgba(99, 102, 241, 0.3)'
  }
};
