import React, { useState, useEffect } from 'react';
import type { Project, ProjectStatus, Priority, Task, Payment, ProjectLink } from '../types/project';
import { 
  formatCurrency, 
  calculateProjectFinancials, 
  calculateProjectProgress, 
  getDeadlineStatus, 
  getTimelineMetrics, 
  formatDate, 
  STATUS_CONFIG, 
  COLOR_THEME_GRADIENTS 
} from '../utils/formatters';
import { getContactUrl, formatTelegramHandle } from '../utils/messenger';
import { 
  X, 
  Calendar, 
  Clock, 
  Wallet, 
  CheckSquare, 
  Plus, 
  Trash2, 
  ExternalLink, 
  FileText, 
  Edit3, 
  User, 
  Layers, 
  CreditCard,
  Send,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Zap,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  ShieldAlert,
  TrendingUp,
  Loader2,
  Wand2,
  Key,
  Archive
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  generateClientCommunication, 
  parseClientFeedbackToTasks, 
  auditProjectRisks, 
  hasDeepSeekConfigured 
} from '../services/deepseek';
import type { AiClientUpdateMode } from '../types/ai';

interface ProjectDetailModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (updated: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenEditModal: (project: Project) => void;
  onOpenAiSettings?: () => void;
}

type TabType = 'tasks' | 'finance' | 'links' | 'notes' | 'ai';

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdateProject,
  onDeleteProject,
  onOpenEditModal,
  onOpenAiSettings
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newPaymentTitle, setNewPaymentTitle] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<ProjectLink['type']>('other');
  const [notesDraft, setNotesDraft] = useState(project ? (project.notes || '') : '');
  const [isNotesSaved, setIsNotesSaved] = useState(false);

  // AI State
  const [aiCommsMode, setAiCommsMode] = useState<AiClientUpdateMode>('weekly_report');
  const [aiCommsNote, setAiCommsNote] = useState('');
  const [aiCommsResult, setAiCommsResult] = useState('');
  const [isGeneratingComms, setIsGeneratingComms] = useState(false);
  const [commsError, setCommsError] = useState<string | null>(null);
  const [commsCopied, setCommsCopied] = useState(false);

  // AI Feedback to Tasks State
  const [feedbackText, setFeedbackText] = useState('');
  const [isParsingFeedback, setIsParsingFeedback] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<Array<{ title: string; priority: Priority; selected: boolean }>>([]);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // AI Audit State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setNotesDraft(project.notes || '');
    }
  }, [project]);

  // Quick Prepayment adjustment input state
  const [quickPrepaymentInput, setQuickPrepaymentInput] = useState<string>('');

  const { paid, owed, total, percentPaid } = calculateProjectFinancials(project);
  const progress = calculateProjectProgress(project);
  const deadlineInfo = getDeadlineStatus(project.deadline, project.status);
  const timeline = getTimelineMetrics(project.startDate, project.deadline, project.status);
  const statusConfig = STATUS_CONFIG[project.status];
  const theme = COLOR_THEME_GRADIENTS[project.colorTheme] || COLOR_THEME_GRADIENTS.purple;

  // Task Handlers
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = project.tasks.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        if (nextCompleted) {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.6 }
          });
        }
        return { ...t, completed: nextCompleted };
      }
      return t;
    });

    onUpdateProject({
      ...project,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: 'task-' + Date.now(),
      title: newTaskTitle.trim(),
      completed: false
    };

    onUpdateProject({
      ...project,
      tasks: [...(project.tasks || []), newTask],
      updatedAt: new Date().toISOString()
    });
    setNewTaskTitle('');
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateProject({
      ...project,
      tasks: project.tasks.filter(t => t.id !== taskId),
      updatedAt: new Date().toISOString()
    });
  };

  // Payment Handlers
  const handleTogglePaymentPaid = (paymentId: string) => {
    const updatedPayments = project.payments.map(p => {
      if (p.id === paymentId) {
        const nextPaid = !p.isPaid;
        if (nextPaid) {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.5 }
          });
        }
        return {
          ...p,
          isPaid: nextPaid,
          paidDate: nextPaid ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return p;
    });

    onUpdateProject({
      ...project,
      payments: updatedPayments,
      updatedAt: new Date().toISOString()
    });
  };

  const handleSetQuickPrepayment = (newPrepaymentAmount: number) => {
    const safeAmount = Math.max(0, Math.min(project.totalBudget, newPrepaymentAmount));
    const safeRemaining = Math.max(0, project.totalBudget - safeAmount);

    let updatedPayments: Payment[] = [];
    if (safeAmount === 0) {
      updatedPayments = [
        {
          id: 'pay-' + Date.now() + '-1',
          title: 'Оплата по завершению (100%)',
          amount: project.totalBudget,
          isPaid: false,
          dueDate: project.deadline,
          notes: 'Без предоплаты'
        }
      ];
    } else if (safeRemaining === 0) {
      updatedPayments = [
        {
          id: 'pay-' + Date.now() + '-1',
          title: 'Полная оплата (100%)',
          amount: project.totalBudget,
          isPaid: true,
          paidDate: new Date().toISOString().split('T')[0],
          notes: 'Оплачено 100%'
        }
      ];
    } else {
      const percent = Math.round((safeAmount / project.totalBudget) * 100);
      updatedPayments = [
        {
          id: 'pay-' + Date.now() + '-1',
          title: `Предоплата (${percent}%)`,
          amount: safeAmount,
          isPaid: true,
          paidDate: new Date().toISOString().split('T')[0],
          notes: 'Внесенный аванс'
        },
        {
          id: 'pay-' + Date.now() + '-2',
          title: `Остаток после сдачи (${100 - percent}%)`,
          amount: safeRemaining,
          isPaid: false,
          dueDate: project.deadline,
          notes: 'Ожидается после релиза'
        }
      ];
    }

    onUpdateProject({
      ...project,
      payments: updatedPayments,
      updatedAt: new Date().toISOString()
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 }
    });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newPaymentAmount);
    if (!newPaymentTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const newPayment: Payment = {
      id: 'pay-' + Date.now(),
      title: newPaymentTitle.trim(),
      amount: amountNum,
      isPaid: false,
      dueDate: project.deadline
    };

    onUpdateProject({
      ...project,
      payments: [...(project.payments || []), newPayment],
      updatedAt: new Date().toISOString()
    });
    setNewPaymentTitle('');
    setNewPaymentAmount('');
  };

  const handleDeletePayment = (paymentId: string) => {
    onUpdateProject({
      ...project,
      payments: project.payments.filter(p => p.id !== paymentId),
      updatedAt: new Date().toISOString()
    });
  };

  // Link Handlers
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    let formattedUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const newLink: ProjectLink = {
      id: 'link-' + Date.now(),
      title: newLinkTitle.trim(),
      url: formattedUrl,
      type: newLinkType
    };

    onUpdateProject({
      ...project,
      links: [...(project.links || []), newLink],
      updatedAt: new Date().toISOString()
    });
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleDeleteLink = (linkId: string) => {
    onUpdateProject({
      ...project,
      links: (project.links || []).filter(l => l.id !== linkId),
      updatedAt: new Date().toISOString()
    });
  };

  // Notes Auto/Manual Save
  const handleSaveNotes = () => {
    onUpdateProject({
      ...project,
      notes: notesDraft,
      updatedAt: new Date().toISOString()
    });
    setIsNotesSaved(true);
    setTimeout(() => setIsNotesSaved(false), 2000);
  };

  // AI Copilot Handlers
  const handleGenerateComms = async () => {
    if (!hasDeepSeekConfigured()) {
      setCommsError('API-ключ DeepSeek не настроен. Нажмите "Настроить AI", чтобы ввести ключ.');
      return;
    }
    setIsGeneratingComms(true);
    setCommsError(null);
    try {
      const text = await generateClientCommunication({
        project,
        mode: aiCommsMode,
        customNote: aiCommsNote
      });
      setAiCommsResult(text);
    } catch (err) {
      setCommsError(err instanceof Error ? err.message : 'Ошибка генерации текста через DeepSeek');
    } finally {
      setIsGeneratingComms(false);
    }
  };

  const handleCopyComms = () => {
    if (!aiCommsResult) return;
    navigator.clipboard.writeText(aiCommsResult);
    setCommsCopied(true);
    setTimeout(() => setCommsCopied(false), 2000);
  };

  const handleParseFeedback = async () => {
    if (!feedbackText.trim()) {
      setFeedbackError('Введите текст правок или сообщений клиента');
      return;
    }
    if (!hasDeepSeekConfigured()) {
      setFeedbackError('API-ключ DeepSeek не настроен. Нажмите "Настроить AI", чтобы ввести ключ.');
      return;
    }
    setIsParsingFeedback(true);
    setFeedbackError(null);
    try {
      const extracted = await parseClientFeedbackToTasks(feedbackText);
      setExtractedTasks(extracted.map(t => ({
        title: t.title,
        priority: (t.priority as Priority) || 'medium',
        selected: true
      })));
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Не удалось разобрать сообщение');
    } finally {
      setIsParsingFeedback(false);
    }
  };

  const handleAddExtractedTasksToProject = () => {
    const tasksToAdd = extractedTasks.filter(t => t.selected);
    if (tasksToAdd.length === 0) return;

    const newTasks: Task[] = tasksToAdd.map((t, idx) => ({
      id: 'task-' + Date.now() + '-' + idx,
      title: t.title,
      completed: false
    }));

    onUpdateProject({
      ...project,
      tasks: [...(project.tasks || []), ...newTasks],
      updatedAt: new Date().toISOString()
    });

    confetti({
      particleCount: 35,
      spread: 45,
      origin: { y: 0.6 }
    });

    setFeedbackText('');
    setExtractedTasks([]);
    setActiveTab('tasks');
  };

  const handleRunAudit = async () => {
    if (!hasDeepSeekConfigured()) {
      setAuditError('API-ключ DeepSeek не настроен. Нажмите "Настроить AI", чтобы ввести ключ.');
      return;
    }
    setIsAuditing(true);
    setAuditError(null);
    try {
      const audit = await auditProjectRisks(project);
      onUpdateProject({
        ...project,
        aiAudit: audit,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : 'Ошибка проведения AI-аудита');
    } finally {
      setIsAuditing(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="glass-panel w-full max-w-4xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden my-auto relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${theme.ring}`} />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                {project.category}
              </span>
              
              {/* Priority Select */}
              <select
                value={project.priority}
                onChange={(e) => onUpdateProject({ ...project, priority: e.target.value as Priority, updatedAt: new Date().toISOString() })}
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border border-white/10 text-slate-200 cursor-pointer focus:outline-none"
              >
                <option value="low">🟢 Низкий приоритет</option>
                <option value="medium">🔵 Средний приоритет</option>
                <option value="high">🟡 Высокий приоритет</option>
                <option value="urgent">🔥 Срочный приоритет</option>
              </select>

              {/* Status Select */}
              <select
                value={project.status}
                onChange={(e) => {
                  const nextStatus = e.target.value as ProjectStatus;
                  if (nextStatus === 'completed') {
                    confetti({
                      particleCount: 60,
                      spread: 60,
                      origin: { y: 0.5 }
                    });
                  }
                  onUpdateProject({ ...project, status: nextStatus, updatedAt: new Date().toISOString() });
                }}
                className={`text-xs font-semibold px-3 py-0.5 rounded-full border bg-slate-900 cursor-pointer focus:outline-none ${statusConfig.border} ${statusConfig.text}`}
              >
                <option value="backlog">Бэклог / План</option>
                <option value="in_progress">В работе</option>
                <option value="in_review">На проверке</option>
                <option value="waiting_payment">Ждёт оплаты</option>
                <option value="completed">Завершён (В архив 📦)</option>
                <option value="on_hold">На паузе</option>
                <option value="cancelled">Отменён (В архив 📦 ✕)</option>
              </select>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              {project.title}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Заказчик: <strong className="text-slate-200">{project.client}</strong></span>
              </div>
              {project.clientContact && (() => {
                const contactUrl = getContactUrl(project.clientContact);
                const isMail = contactUrl?.startsWith('mailto:');
                const isPhone = contactUrl?.startsWith('tel:');
                return (
                  <a 
                    href={contactUrl}
                    target={contactUrl && !isMail && !isPhone ? "_blank" : undefined}
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40"
                    title={isMail ? "Написать на email" : isPhone ? "Позвонить" : "Открыть чат в Telegram"}
                  >
                    <Send className="w-3 h-3" />
                    {formatTelegramHandle(project.clientContact)}
                  </a>
                );
              })()}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => onOpenEditModal(project)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Редактировать проект"
            >
              <Edit3 className="w-4 h-4" />
              <span>Изменить</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Вы уверены, что хотите удалить проект "${project.title}"?`)) {
                  onDeleteProject(project.id);
                  onClose();
                }
              }}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all text-xs"
              title="Удалить проект"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Archived Banner Notice */}
        {project.status === 'completed' && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs flex-wrap shadow-lg">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <Archive className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Этот проект завершён и находится в разделе «Архив».</span>
            </div>
            <button
              onClick={() => {
                onUpdateProject({
                  ...project,
                  status: 'in_progress',
                  updatedAt: new Date().toISOString()
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30 cursor-pointer text-xs"
              title="Вернуть проект из архива в статус «В работе»"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Вернуть в активную работу</span>
            </button>
          </div>
        )}

        {/* Cancelled Banner Notice */}
        {project.status === 'cancelled' && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-zinc-800/90 border border-zinc-600/50 flex items-center justify-between gap-3 text-xs flex-wrap shadow-lg">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              <AlertCircle className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span>Этот проект отменён и перемещён в «Архив». Бюджет и остаток долга сброшены (0 {project.currency}).</span>
            </div>
            <button
              onClick={() => {
                onUpdateProject({
                  ...project,
                  status: 'in_progress',
                  updatedAt: new Date().toISOString()
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer text-xs"
              title="Возобновить проект"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Возобновить разработку</span>
            </button>
          </div>
        )}

        {/* Timeline & Money Banner */}
        <div className="bg-slate-950/60 p-4 border-b border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Progress metric */}
          <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center font-extrabold text-indigo-400 text-base">
              {progress}%
            </div>
            <div className="flex-1">
              <div className="flex justify-between font-semibold text-white mb-1">
                <span>Общий прогресс</span>
                <span className="text-indigo-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full ${theme.bar}`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {/* Timeline Dates */}
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-white/5 flex flex-col justify-center">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Старт:</span>
              <span className="font-semibold text-slate-200">{formatDate(project.startDate)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Дедлайн:</span>
              <span className="font-semibold text-slate-200">{formatDate(project.deadline)}</span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-white/5 flex justify-between items-center text-[11px]">
              <span className="text-slate-500">{timeline.elapsedDays} дн. в разработке</span>
              <span className={`px-1.5 py-0.2 rounded border font-medium ${deadlineInfo.badgeBg}`}>
                {deadlineInfo.label}
              </span>
            </div>
          </div>

          {/* Money Breakdown: Prepayment vs Debt */}
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-white/5 flex flex-col justify-center">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Общая стоимость:</span>
              <span className="font-extrabold text-white text-sm">{formatCurrency(total, project.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Предоплата: {formatCurrency(paid, project.currency)}
              </span>
              <span className={owed > 0 ? 'text-amber-400 font-semibold flex items-center gap-1' : 'text-emerald-400'}>
                {owed > 0 ? <AlertCircle className="w-3 h-3 text-amber-400" /> : null}
                {owed > 0 ? `Долг: ${formatCurrency(owed, project.currency)}` : 'Оплачено 100%'}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1.5 flex">
              <div className="bg-emerald-500 h-full" style={{ width: `${percentPaid}%` }} />
              <div className="bg-amber-500/80 h-full" style={{ width: `${100 - percentPaid}%` }} />
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/10 bg-slate-900/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'tasks'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            Задачи и Этапы ({project.tasks?.filter(t => t.completed).length || 0}/{project.tasks?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'finance'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            Финансы и Предоплата ({formatCurrency(paid, project.currency)} / {formatCurrency(total, project.currency)})
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'links'
                ? 'border-cyan-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-cyan-400" />
            Ссылки и Стенды ({project.links?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-400" />
            Заметки и ТЗ
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'border-cyan-400 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>DeepSeek AI</span>
            {project.aiAudit && (
              <span 
                className={`w-2 h-2 rounded-full ${
                  project.aiAudit.status === 'healthy' ? 'bg-emerald-400' :
                  project.aiAudit.status === 'warning' ? 'bg-amber-400' : 'bg-rose-500'
                }`} 
                title={`AI Аудит: ${project.aiAudit.score}/100`}
              />
            )}
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 max-h-[500px]">
          
          {/* TAB 1: Tasks & Milestones */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              {/* Milestones list */}
              {project.milestones && project.milestones.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Ключевые этапы проекта
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {project.milestones.map((ms) => (
                      <div key={ms.id} className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-slate-200 line-clamp-2">
                            {ms.title}
                          </span>
                          <span className="text-xs font-bold text-indigo-400 ml-2">
                            {ms.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                          <div 
                            className={`h-full rounded-full ${ms.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${ms.progress}%` }} 
                          />
                        </div>
                        {ms.dueDate && (
                          <span className="text-[10px] text-slate-500">Срок: {formatDate(ms.dueDate)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                    Чек-лист задач
                  </h4>
                  <span className="text-xs text-slate-400">
                    Выполнено: {project.tasks?.filter(t => t.completed).length || 0} из {project.tasks?.length || 0}
                  </span>
                </div>

                {/* Add new task input */}
                <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Добавить новую задачу..."
                    className="flex-1 glass-input px-4 py-2.5 rounded-xl text-xs placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить
                  </button>
                </form>

                {/* Tasks List */}
                <div className="space-y-2">
                  {project.tasks && project.tasks.length > 0 ? (
                    project.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          task.completed
                            ? 'bg-emerald-950/20 border-emerald-800/30 text-slate-400 line-through'
                            : 'bg-slate-900/60 border-white/5 text-slate-200 hover:border-indigo-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => {}}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                          />
                          <span className="text-xs select-none font-medium">{task.title}</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                          title="Удалить задачу"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      Задач пока нет. Добавьте первую задачу выше!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Finance & Payments */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              
              {/* Financial Stats Bar with Prepayment & Debt */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                  <span className="text-xs text-emerald-400 font-semibold block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Получено (Предоплата)
                  </span>
                  <div className="text-2xl font-extrabold text-white">{formatCurrency(paid, project.currency)}</div>
                  <span className="text-[11px] text-emerald-400/80 mt-1 block font-medium">
                    {percentPaid}% от общей суммы
                  </span>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20">
                  <span className="text-xs text-amber-400 font-semibold block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Остаток долга (Ожидается)
                  </span>
                  <div className="text-2xl font-extrabold text-white">{formatCurrency(owed, project.currency)}</div>
                  <span className="text-[11px] text-amber-400/80 mt-1 block font-medium">
                    {100 - percentPaid}% к выплате
                  </span>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20">
                  <span className="text-xs text-cyan-400 font-semibold block mb-1 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    Общий бюджет проекта
                  </span>
                  <div className="text-2xl font-extrabold text-white">{formatCurrency(total, project.currency)}</div>
                  <span className="text-[11px] text-cyan-400/80 mt-1 block font-medium">
                    Полная стоимость
                  </span>
                </div>
              </div>

              {/* Quick Prepayment Adjuster Box */}
              <div className="glass-panel p-4 rounded-2xl border border-indigo-500/30 bg-slate-900/90 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Быстрое изменение предоплаты
                  </h5>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSetQuickPrepayment(0)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] text-slate-300 font-semibold transition-all"
                    >
                      0% (Без аванса)
                    </button>
                    <button
                      onClick={() => handleSetQuickPrepayment(Math.round(project.totalBudget * 0.3))}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] text-slate-300 font-semibold transition-all"
                    >
                      30% ({formatCurrency(Math.round(project.totalBudget * 0.3), project.currency)})
                    </button>
                    <button
                      onClick={() => handleSetQuickPrepayment(Math.round(project.totalBudget * 0.5))}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/40 hover:bg-indigo-600/70 border border-indigo-500/40 text-[11px] text-indigo-300 font-bold transition-all"
                    >
                      50% ({formatCurrency(Math.round(project.totalBudget * 0.5), project.currency)})
                    </button>
                    <button
                      onClick={() => handleSetQuickPrepayment(project.totalBudget)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/40 hover:bg-emerald-600/70 border border-emerald-500/40 text-[11px] text-emerald-300 font-bold transition-all"
                    >
                      100% (Вся сумма)
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    value={quickPrepaymentInput}
                    onChange={(e) => setQuickPrepaymentInput(e.target.value)}
                    placeholder={`Указать сумму предоплаты (например, ${formatCurrency(Math.round(project.totalBudget / 2), project.currency)})...`}
                    className="flex-1 glass-input px-3.5 py-2 rounded-xl text-xs"
                  />
                  <button
                    onClick={() => {
                      const val = parseFloat(quickPrepaymentInput);
                      if (!isNaN(val)) {
                        handleSetQuickPrepayment(val);
                        setQuickPrepaymentInput('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1"
                  >
                    Применить
                  </button>
                </div>
              </div>

              {/* Add Payment Form */}
              <form onSubmit={handleAddPayment} className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
                <h5 className="text-xs font-bold text-slate-300">Добавить произвольный транш</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newPaymentTitle}
                    onChange={(e) => setNewPaymentTitle(e.target.value)}
                    placeholder="Название транша (напр. Доплата за доп. правки)"
                    className="glass-input px-3 py-2 rounded-xl text-xs sm:col-span-2"
                  />
                  <input
                    type="number"
                    value={newPaymentAmount}
                    onChange={(e) => setNewPaymentAmount(e.target.value)}
                    placeholder="Сумма (₽)"
                    className="glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  Добавить транш
                </button>
              </form>

              {/* Payments List */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">График платежей</h5>
                {project.payments && project.payments.length > 0 ? (
                  project.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                        payment.isPaid
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-slate-900/80 border-white/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h6 className="font-bold text-white text-sm">{payment.title}</h6>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            payment.isPaid
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {payment.isPaid ? 'Оплачено ✓' : 'Ожидает оплаты'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                          {payment.paidDate && <span>Дата оплаты: {formatDate(payment.paidDate)}</span>}
                          {payment.dueDate && !payment.isPaid && <span>Срок: {formatDate(payment.dueDate)}</span>}
                          {payment.notes && <span className="text-slate-500 italic">({payment.notes})</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="font-extrabold text-white text-base">
                          {formatCurrency(payment.amount, project.currency)}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePaymentPaid(payment.id)}
                            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
                              payment.isPaid
                                ? 'bg-white/10 hover:bg-white/20 text-slate-300'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            {payment.isPaid ? 'Снять отметку' : 'Отметить оплату'}
                          </button>

                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                            title="Удалить транш"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Платежей пока нет.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Links & Resources */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              {/* Add Link Form */}
              <form onSubmit={handleAddLink} className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
                <h5 className="text-xs font-bold text-slate-300">Добавить ссылку на ресурс</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    placeholder="Название (напр. Figma макет)"
                    className="glass-input px-3 py-2 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="URL (https://...)"
                    className="glass-input px-3 py-2 rounded-xl text-xs"
                  />
                  <select
                    value={newLinkType}
                    onChange={(e) => setNewLinkType(e.target.value as ProjectLink['type'])}
                    className="glass-input px-3 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    <option value="figma">🎨 Figma</option>
                    <option value="github">🐙 GitHub / Репозиторий</option>
                    <option value="live">🚀 Тестовый стенд / Демо</option>
                    <option value="docs">📄 Документация / ТЗ</option>
                    <option value="chat">💬 Чат / Канал</option>
                    <option value="other">🔗 Другое</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-600/30"
                >
                  <Plus className="w-4 h-4" />
                  Сохранить ссылку
                </button>
              </form>

              {/* Links Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.links && project.links.length > 0 ? (
                  project.links.map((link) => (
                    <div
                      key={link.id}
                      className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between group hover:border-cyan-500/40 transition-all"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 flex-1 truncate mr-2"
                      >
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <h6 className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors truncate">
                            {link.title}
                          </h6>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {link.url}
                          </span>
                        </div>
                      </a>

                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                        title="Удалить ссылку"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-6 text-slate-500 text-xs">
                    Ссылок пока нет.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Notes & Context */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Заметки, ТЗ и контекст проекта
                </h5>
                <button
                  onClick={handleSaveNotes}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  {isNotesSaved ? '✓ Сохранено!' : 'Сохранить заметки'}
                </button>
              </div>

              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Вставьте требования клиента, доступы к стендам, детали ТЗ или важные договоренности..."
                rows={10}
                className="w-full glass-input p-4 rounded-2xl text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500"
              />

              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">💡 Подсказка:</span>
                <p>Все заметки автоматически сохраняются в локальной базе вашего браузера и доступны оффлайн.</p>
              </div>
            </div>
          )}

          {/* TAB 5: DeepSeek AI Suite */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              
              {/* Feature 3: AI Risk & Health Advisor */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-cyan-950/40 border border-cyan-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        Аудит рисков и здоровья проекта
                        <span className="text-[10px] lowercase font-normal px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                          health check
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Анализ дедлайна, темпа выполнения задач и финансовых разрывов
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenAiSettings && (
                      <button
                        onClick={onOpenAiSettings}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/10 transition-colors"
                        title="Настройки DeepSeek"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={handleRunAudit}
                      disabled={isAuditing}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isAuditing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-200" />
                          <span>Анализ...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                          <span>{project.aiAudit ? 'Обновить аудит' : 'Запустить аудит'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {auditError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{auditError}</span>
                  </div>
                )}

                {project.aiAudit ? (
                  <div className="space-y-3 pt-2">
                    {/* Score Bar & Status */}
                    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/80 border border-white/5 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl font-black ${
                          project.aiAudit.status === 'healthy' ? 'text-emerald-400' :
                          project.aiAudit.status === 'warning' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {project.aiAudit.score}/100
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              project.aiAudit.status === 'healthy' ? 'bg-emerald-400 animate-pulse' :
                              project.aiAudit.status === 'warning' ? 'bg-amber-400 animate-pulse' : 'bg-rose-500 animate-pulse'
                            }`} />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              {project.aiAudit.status === 'healthy' ? '🟢 В графике / Низкий риск' :
                               project.aiAudit.status === 'warning' ? '🟡 Умеренный риск / Внимание' : '🔴 Критический риск срыва'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            Проверено: {new Date(project.aiAudit.analyzedAt).toLocaleString('ru-RU')}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full sm:w-48 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            project.aiAudit.status === 'healthy' ? 'bg-emerald-500' :
                            project.aiAudit.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${project.aiAudit.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Summary Verdict */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 leading-relaxed">
                      <strong className="text-white block mb-1">Вердикт эксперта:</strong>
                      {project.aiAudit.summary}
                    </div>

                    {/* Bottlenecks & Recommendations Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Bottlenecks */}
                      {project.aiAudit.bottlenecks && project.aiAudit.bottlenecks.length > 0 && (
                        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                            Узкие места и угрозы
                          </span>
                          <ul className="space-y-1 text-xs text-slate-300">
                            {project.aiAudit.bottlenecks.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-rose-400 font-bold">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {project.aiAudit.recommendations && project.aiAudit.recommendations.length > 0 && (
                        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                            Советы по оптимизации
                          </span>
                          <ul className="space-y-1 text-xs text-slate-300">
                            {project.aiAudit.recommendations.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-cyan-400 font-bold">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-dashed border-white/10 text-center text-xs text-slate-400">
                    Нажмите «Запустить аудит», чтобы DeepSeek проанализировал оставшиеся дни, незакрытые задачи и дал рекомендации.
                  </div>
                )}
              </div>

              {/* Feature 2: AI Client Updates Copilot */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-indigo-950/40 border border-purple-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Send className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        AI-Копирайтер для заказчика
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Генерация статус-отчетов, напоминаний об оплате и фоллоу-апов в Telegram/WhatsApp
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mode Switcher Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setAiCommsMode('weekly_report')}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                      aiCommsMode === 'weekly_report'
                        ? 'bg-purple-600/30 border-purple-400 text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold">📢 Статус-отчет</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Что сделано и шаги</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiCommsMode('payment_reminder')}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                      aiCommsMode === 'payment_reminder'
                        ? 'bg-amber-600/30 border-amber-400 text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold">💳 Оплата счета</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Долг: {formatCurrency(owed, project.currency)}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiCommsMode('milestone_done')}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                      aiCommsMode === 'milestone_done'
                        ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold">🎉 Сдача этапа</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Готово к тестам</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiCommsMode('gentle_followup')}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                      aiCommsMode === 'gentle_followup'
                        ? 'bg-cyan-600/30 border-cyan-400 text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold">⏳ Фоллоу-ап</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Ожидание ответа</div>
                  </button>
                </div>

                {/* Additional custom comment input */}
                <div>
                  <input
                    type="text"
                    value={aiCommsNote}
                    onChange={(e) => setAiCommsNote(e.target.value)}
                    placeholder="Дополнительное пожелание (например: упомянуть, что ждем логотип, или перенести созвон на 15:00)..."
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs placeholder:text-slate-500"
                  />
                </div>

                {/* Generate Button */}
                <div className="flex items-center justify-between gap-3">
                  {commsError && (
                    <div className="text-[11px] text-rose-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{commsError}</span>
                    </div>
                  )}
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={handleGenerateComms}
                    disabled={isGeneratingComms}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingComms ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                        <span>Генерация текста...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 text-purple-200" />
                        <span>Сгенерировать сообщение</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Result Message Box */}
                {aiCommsResult && (
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/30 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                        Готовое сообщение:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyComms}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {commsCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Скопировано!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-300" />
                              <span>Скопировать</span>
                            </>
                          )}
                        </button>

                        {project.clientContact && (() => {
                          const contactUrl = getContactUrl(project.clientContact);
                          if (contactUrl && contactUrl.includes('t.me')) {
                            const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(aiCommsResult)}`;
                            return (
                              <a
                                href={tgShareUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>В Telegram</span>
                              </a>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    <textarea
                      value={aiCommsResult}
                      onChange={(e) => setAiCommsResult(e.target.value)}
                      rows={6}
                      className="w-full bg-transparent text-xs text-slate-200 leading-relaxed resize-none focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Feature 2b: AI Feedback Parser to Tasks */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-teal-950/40 border border-emerald-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        Парсер правок от клиента в задачи
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Вставьте сумбурные правки из мессенджера — ИИ выделит конкретные задачи и добавит в проект
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => {
                      setFeedbackText(e.target.value);
                      setFeedbackError(null);
                    }}
                    placeholder="Вставьте текст клиента (например: «Привет! Поправь кнопку на главной, замени номер телефона в подвале на +7999... и сделай картинки в каталоге кликабельными»)..."
                    rows={3}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs placeholder:text-slate-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  {feedbackError && (
                    <div className="text-[11px] text-rose-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{feedbackError}</span>
                    </div>
                  )}
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={handleParseFeedback}
                    disabled={isParsingFeedback || !feedbackText.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isParsingFeedback ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                        <span>Извлечение задач...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-200" />
                        <span>Извлечь задачи</span>
                      </>
                    )}
                  </button>
                </div>

                {extractedTasks.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                        Найдено задач ({extractedTasks.filter(t => t.selected).length} из {extractedTasks.length}):
                      </span>
                      <button
                        type="button"
                        onClick={handleAddExtractedTasksToProject}
                        disabled={extractedTasks.filter(t => t.selected).length === 0}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить в проект</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {extractedTasks.map((t, idx) => (
                        <label 
                          key={idx}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                            t.selected 
                              ? 'bg-emerald-950/30 border-emerald-500/30 text-slate-200' 
                              : 'bg-white/5 border-white/5 text-slate-500 line-through'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={t.selected}
                            onChange={() => {
                              setExtractedTasks(extractedTasks.map((item, i) => 
                                i === idx ? { ...item, selected: !item.selected } : item
                              ));
                            }}
                            className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className="text-xs flex-1">{t.title}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-400">
                            {t.priority}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>ID: {project.id}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
