import React, { useState, useEffect } from 'react';
import type { Project, ProjectStatus, Priority, ColorTheme, Payment, Task, ProjectMilestone } from '../types/project';
import type { Client } from '../types/client';
import { DEFAULT_CATEGORIES } from '../types/project';
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  Wallet, 
  CheckCircle2, 
  Clock,
  Loader2,
  Wand2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Key
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { generateProjectFromPrompt, hasDeepSeekConfigured } from '../services/deepseek';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  initialProject?: Project | null; // If editing
  existingClients?: Client[];
  prefilledClient?: Client | null;
  onOpenAiSettings?: () => void;
}

const CATEGORY_PRESETS = [...DEFAULT_CATEGORIES];

const COLOR_THEMES: { value: ColorTheme; label: string; bg: string }[] = [
  { value: 'cyan', label: 'Неоновый Циан', bg: 'bg-cyan-500' },
  { value: 'purple', label: 'Глубокий Пурпур', bg: 'bg-purple-500' },
  { value: 'emerald', label: 'Изумруд', bg: 'bg-emerald-500' },
  { value: 'blue', label: 'Сапфировый', bg: 'bg-blue-500' },
  { value: 'rose', label: 'Розовый Неон', bg: 'bg-rose-500' },
  { value: 'amber', label: 'Золотой Янтарь', bg: 'bg-amber-500' },
  { value: 'indigo', label: 'Индиго', bg: 'bg-indigo-500' }
];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject,
  existingClients,
  prefilledClient,
  onOpenAiSettings
}) => {
  const isEditing = !!initialProject;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [category, setCategory] = useState('Лендинг');
  const [status, setStatus] = useState<ProjectStatus>('in_progress');
  const [priority, setPriority] = useState<Priority>('high');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('cyan');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [totalBudget, setTotalBudget] = useState<number>(10000);
  const [prepayment, setPrepayment] = useState<number>(5000);
  const [currency, setCurrency] = useState('₽');
  const [notes, setNotes] = useState('');

  // AI Generator state
  const [isAiExpanded, setIsAiExpanded] = useState(!initialProject);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);

  // Initial tasks for creation
  const [tempTasks, setTempTasks] = useState<string[]>([
    'Согласовать ТЗ и структуру',
    'Разработать прототип и UI дизайн',
    'Верстка и программирование логики',
    'Тестирование и сдача клиенту'
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  const handleAiGenerate = async (presetText?: string) => {
    const promptToUse = presetText || aiPrompt;
    if (!promptToUse.trim()) {
      setAiError('Введите описание проекта или ТЗ для ИИ');
      return;
    }
    if (!hasDeepSeekConfigured()) {
      setAiError('API-ключ DeepSeek не задан. Нажмите "Настроить AI" ниже, чтобы ввести ключ.');
      return;
    }

    setIsAiGenerating(true);
    setAiError(null);
    setAiSuccess(null);

    try {
      const breakdown = await generateProjectFromPrompt(promptToUse, CATEGORY_PRESETS);
      if (breakdown.title) setTitle(breakdown.title);
      if (breakdown.description) setDescription(breakdown.description);
      if (breakdown.category) setCategory(breakdown.category);
      if (breakdown.priority) setPriority(breakdown.priority);
      if (breakdown.suggestedBudget) {
        setTotalBudget(breakdown.suggestedBudget);
        setPrepayment(Math.round(breakdown.suggestedBudget * 0.4));
      }
      if (breakdown.estimatedDays) {
        const target = new Date(Date.now() + breakdown.estimatedDays * 86400000);
        setDeadline(target.toISOString().split('T')[0]);
      }
      if (breakdown.tasks && breakdown.tasks.length > 0) {
        setTempTasks(breakdown.tasks.map(t => t.title));
      }
      if (breakdown.recommendations && breakdown.recommendations.length > 0) {
        const aiTips = '💡 Рекомендации DeepSeek:\n• ' + breakdown.recommendations.join('\n• ');
        setNotes(prev => prev ? `${prev}\n\n${aiTips}` : aiTips);
      }
      setAiSuccess('✨ Проект успешно декомпозирован! Форма заполнена, можете проверить данные.');
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Ошибка генерации проекта через DeepSeek');
    } finally {
      setIsAiGenerating(false);
    }
  };

  useEffect(() => {
    if (initialProject) {
      setTitle(initialProject.title);
      setDescription(initialProject.description || '');
      setClient(initialProject.client);
      setClientContact(initialProject.clientContact || '');
      setCategory(initialProject.category || 'Лендинг');
      setStatus(initialProject.status);
      setPriority(initialProject.priority);
      setColorTheme(initialProject.colorTheme || 'purple');
      setStartDate(initialProject.startDate);
      setDeadline(initialProject.deadline);
      setTotalBudget(initialProject.totalBudget);

      // Calculate already paid amount as prepayment
      const paidSum = (initialProject.payments || [])
        .filter((p) => p.isPaid)
        .reduce((sum, p) => sum + p.amount, 0);
      setPrepayment(paidSum);

      setCurrency(initialProject.currency || '₽');
      setNotes(initialProject.notes || '');
    } else {
      // Reset defaults for new project (e.g. 10 000 budget, 5 000 prepay)
      setTitle('');
      setDescription('');
      setClient(prefilledClient ? prefilledClient.name : '');
      setClientContact(
        prefilledClient
          ? (prefilledClient.telegram || prefilledClient.phone || prefilledClient.email || '')
          : ''
      );
      setCategory('Лендинг');
      setStatus('in_progress');
      setPriority('high');
      setColorTheme('cyan');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDeadline(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setTotalBudget(10000);
      setPrepayment(5000);
      setCurrency('₽');
      setNotes('');
      setTempTasks([
        'Согласовать ТЗ и структуру',
        'Разработать прототип и UI дизайн',
        'Верстка и программирование логики',
        'Тестирование и сдача клиенту'
      ]);
    }
  }, [initialProject, prefilledClient, isOpen]);

  const handleClientChange = (name: string) => {
    setClient(name);
    if (existingClients && name.trim()) {
      const q = name.trim().toLowerCase();
      const match = existingClients.find(
        (c) =>
          c.name.toLowerCase() === q ||
          (c.company && c.company.toLowerCase() === q) ||
          (c.contactPerson && c.contactPerson.toLowerCase() === q)
      );
      if (match && !clientContact) {
        const contact = match.telegram || match.phone || match.email || '';
        if (contact) setClientContact(contact);
      }
    }
  };

  const handleSetPrepayPercent = (percent: number) => {
    const calculated = Math.round((totalBudget * percent) / 100);
    setPrepayment(calculated);
  };

  const handleAddTempTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTempTasks([...tempTasks, newTaskInput.trim()]);
    setNewTaskInput('');
  };

  const handleRemoveTempTask = (index: number) => {
    setTempTasks(tempTasks.filter((_, i) => i !== index));
  };

  const remainingDebt = Math.max(0, totalBudget - prepayment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !client.trim()) {
      alert('Пожалуйста, укажите название проекта и имя заказчика.');
      return;
    }

    const safeBudget = Math.max(0, Number(totalBudget));
    const safePrepayment = Math.min(safeBudget, Math.max(0, Number(prepayment)));
    const safeDebt = Math.max(0, safeBudget - safePrepayment);

    if (isEditing && initialProject) {
      // If payments need adjustment according to new prepayment
      let updatedPayments: Payment[] = [];
      if (safePrepayment === 0) {
        updatedPayments = [
          {
            id: 'pay-' + Date.now() + '-full',
            title: 'Оплата по завершению (100%)',
            amount: safeBudget,
            isPaid: false,
            dueDate: deadline,
            notes: 'Без предоплаты'
          }
        ];
      } else if (safeDebt === 0) {
        updatedPayments = [
          {
            id: 'pay-' + Date.now() + '-full',
            title: 'Полная оплата (100%)',
            amount: safeBudget,
            isPaid: true,
            paidDate: startDate,
            notes: 'Оплачено полностью'
          }
        ];
      } else {
        updatedPayments = [
          {
            id: 'pay-' + Date.now() + '-prepay',
            title: `Предоплата (${Math.round((safePrepayment / safeBudget) * 100)}%)`,
            amount: safePrepayment,
            isPaid: true,
            paidDate: startDate,
            notes: 'Внесенный аванс'
          },
          {
            id: 'pay-' + Date.now() + '-final',
            title: 'Остаток после сдачи проекта',
            amount: safeDebt,
            isPaid: false,
            dueDate: deadline,
            notes: 'Оплата после релиза'
          }
        ];
      }

      const updated: Project = {
        ...initialProject,
        title: title.trim(),
        description: description.trim(),
        client: client.trim(),
        clientContact: clientContact.trim(),
        category,
        status,
        priority,
        colorTheme,
        startDate,
        deadline,
        totalBudget: safeBudget,
        currency,
        payments: updatedPayments,
        notes: notes.trim(),
        updatedAt: new Date().toISOString()
      };
      onSave(updated);
    } else {
      // Build new project payments
      let initialPayments: Payment[] = [];
      if (safePrepayment === 0) {
        initialPayments = [
          {
            id: 'pay-' + Date.now() + '-1',
            title: 'Оплата по завершению (100%)',
            amount: safeBudget,
            isPaid: false,
            dueDate: deadline,
            notes: 'Без предоплаты'
          }
        ];
      } else if (safeDebt === 0) {
        initialPayments = [
          {
            id: 'pay-' + Date.now() + '-1',
            title: 'Полная оплата (100%)',
            amount: safeBudget,
            isPaid: true,
            paidDate: startDate,
            notes: 'Оплачено 100%'
          }
        ];
      } else {
        const prepayPercent = Math.round((safePrepayment / safeBudget) * 100);
        initialPayments = [
          {
            id: 'pay-' + Date.now() + '-1',
            title: `Предоплата (${prepayPercent}%)`,
            amount: safePrepayment,
            isPaid: true,
            paidDate: startDate,
            notes: 'Стартовый аванс'
          },
          {
            id: 'pay-' + Date.now() + '-2',
            title: `Остаток после сдачи (${100 - prepayPercent}%)`,
            amount: safeDebt,
            isPaid: false,
            dueDate: deadline,
            notes: 'Оплата после релиза'
          }
        ];
      }

      const initialTasks: Task[] = tempTasks.map((t, idx) => ({
        id: 'task-' + Date.now() + '-' + idx,
        title: t,
        completed: idx === 0 // Mark first as done for demo feel
      }));

      const initialMilestones: ProjectMilestone[] = [
        { id: 'ms-1', title: 'Проектирование и дизайн', progress: 100, completed: true, dueDate: startDate },
        { id: 'ms-2', title: 'Разработка функционала', progress: 30, completed: false, dueDate: deadline },
        { id: 'ms-3', title: 'Тестирование и сдача', progress: 0, completed: false, dueDate: deadline }
      ];

      const newProj: Project = {
        id: 'proj-' + Date.now(),
        title: title.trim(),
        description: description.trim(),
        client: client.trim(),
        clientContact: clientContact.trim(),
        category,
        status,
        priority,
        colorTheme,
        startDate,
        deadline,
        totalBudget: safeBudget,
        currency,
        payments: initialPayments,
        tasks: initialTasks,
        milestones: initialMilestones,
        links: [],
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onSave(newProj);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="glass-panel w-full max-w-2xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden my-auto relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              {isEditing ? 'Редактировать проект' : 'Создать новый проект'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditing ? 'Обновите параметры, бюджет, предоплату и сроки' : 'Заполните ключевые данные по проекту, бюджету и предоплате'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* AI Project Breakdown Card */}
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-slate-900/60 to-purple-950/30 p-4 shadow-xl shadow-cyan-950/20">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsAiExpanded(!isAiExpanded)}
                className="flex items-center gap-2.5 text-left font-bold text-slate-200 hover:text-white cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 p-[1px] flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                    <Wand2 className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">AI-Декомпозитор проекта</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      DeepSeek
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Вставьте ТЗ или опишите проект своими словами — ИИ заполнит форму и создаст задачи
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-2">
                {onOpenAiSettings && (
                  <button
                    type="button"
                    onClick={onOpenAiSettings}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/10 transition-colors"
                    title="Настройки DeepSeek"
                  >
                    <Key className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsAiExpanded(!isAiExpanded)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                >
                  {isAiExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isAiExpanded && (
              <div className="mt-3.5 space-y-3 pt-3 border-t border-white/10 animate-fade-in">
                <div>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => {
                      setAiPrompt(e.target.value);
                      setAiError(null);
                    }}
                    placeholder="Например: Сделать Telegram-бота для бронирования столиков в ресторане с админкой на FastAPI и оплатой ЮKassa, бюджет 120k, срок 3 недели..."
                    rows={3}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs placeholder:text-slate-500 resize-none"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400">Быстрые примеры:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = 'Telegram-бот заказа пиццы с админ-панелью и онлайн-оплатой ЮKassa, бюджет 90 000 ₽, срок 14 дней';
                      setAiPrompt(text);
                      handleAiGenerate(text);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/30 border border-white/10 text-slate-300 transition-colors cursor-pointer"
                  >
                    🤖 Telegram-бот с оплатой
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = 'Редизайн интернет-магазина одежды на React, корзина, фильтры и каталог, бюджет 130 000 ₽, срок 3 недели';
                      setAiPrompt(text);
                      handleAiGenerate(text);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-indigo-500/20 hover:border-indigo-500/30 border border-white/10 text-slate-300 transition-colors cursor-pointer"
                  >
                    🛍️ Магазин на React
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = 'Конверсионный лендинг для онлайн-школы дизайна с квизом и заявками в CRM, бюджет 45 000 ₽, срок 10 дней';
                      setAiPrompt(text);
                      handleAiGenerate(text);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 hover:border-purple-500/30 border border-white/10 text-slate-300 transition-colors cursor-pointer"
                  >
                    🚀 Лендинг с CRM
                  </button>
                </div>

                {/* Actions & Alerts */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex-1">
                    {aiError && (
                      <div className="flex items-center gap-2 text-[11px] text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{aiError}</span>
                      </div>
                    )}
                    {aiSuccess && (
                      <div className="flex items-center gap-2 text-[11px] text-emerald-300 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{aiSuccess}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAiGenerate()}
                    disabled={isAiGenerating || !aiPrompt.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  >
                    {isAiGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                        <span>Декомпозиция...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 text-cyan-200" />
                        <span>Сгенерировать проект</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Название проекта *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Лендинг для инвест-клуба или CRM бот"
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
            />
          </div>

          {/* Client & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-300 font-semibold">
                  Клиент / Заказчик *
                </label>
                {existingClients && existingClients.length > 0 && (
                  <span className="text-[10px] text-slate-500">из базы или произвольно</span>
                )}
              </div>
              <input
                type="text"
                required
                list="crm-clients-list"
                value={client}
                onChange={(e) => handleClientChange(e.target.value)}
                placeholder="Ольга Потапова, ООО Вектор, Михаил..."
                className="w-full glass-input px-4 py-2.5 rounded-xl"
              />
              {existingClients && existingClients.length > 0 && (
                <datalist id="crm-clients-list">
                  {existingClients.map((c) => {
                    const extra = [c.company, c.contactPerson ? `ЛПР: ${c.contactPerson}` : ''].filter(Boolean).join(' • ');
                    return (
                      <React.Fragment key={c.id}>
                        <option value={c.name}>
                          {extra ? `${c.name} (${extra})` : c.name}
                        </option>
                        {c.company && c.company !== c.name && (
                          <option value={c.company}>
                            {c.company} (Компания • Клиент: {c.name})
                          </option>
                        )}
                        {c.contactPerson && (
                          <option value={c.contactPerson}>
                            {c.contactPerson} (ЛПР • Клиент: {c.name})
                          </option>
                        )}
                      </React.Fragment>
                    );
                  })}
                </datalist>
              )}
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Контакт (Telegram / Телефон)
              </label>
              <input
                type="text"
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
                placeholder="@username или +7 999 000-00-00"
                className="w-full glass-input px-4 py-2.5 rounded-xl"
              />
            </div>
          </div>

          {/* Category & Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input px-4 py-2.5 rounded-xl cursor-pointer"
              >
                {CATEGORY_PRESETS.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Цветовой неоновый акцент
              </label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_THEMES.map((th) => (
                  <button
                    key={th.value}
                    type="button"
                    onClick={() => setColorTheme(th.value)}
                    className={`w-6 h-6 rounded-full ${th.bg} transition-all ${
                      colorTheme === th.value ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'
                    }`}
                    title={th.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Статус проекта
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full glass-input px-4 py-2.5 rounded-xl cursor-pointer"
              >
                <option value="backlog" className="bg-slate-900 text-white">Бэклог / Подготовка</option>
                <option value="in_progress" className="bg-slate-900 text-white">В работе (Разработка)</option>
                <option value="in_review" className="bg-slate-900 text-white">На проверке у клиента</option>
                <option value="waiting_payment" className="bg-slate-900 text-white">Ожидает оплаты</option>
                <option value="completed" className="bg-slate-900 text-white">Завершён (В архив 📦)</option>
                <option value="on_hold" className="bg-slate-900 text-white">На паузе</option>
                <option value="cancelled" className="bg-slate-900 text-white">Отменён (В архив ✕)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full glass-input px-4 py-2.5 rounded-xl cursor-pointer"
              >
                <option value="low" className="bg-slate-900 text-white">🟢 Низкий</option>
                <option value="medium" className="bg-slate-900 text-white">🔵 Средний</option>
                <option value="high" className="bg-slate-900 text-white">🟡 Высокий</option>
                <option value="urgent" className="bg-slate-900 text-white">🔥 Срочно!</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Дата старта
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full glass-input px-4 py-2.5 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Дедлайн (Срок сдачи)
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full glass-input px-4 py-2.5 rounded-xl"
              />
            </div>
          </div>

          {/* Budget & Prepayment Section */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-indigo-500/20 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Финансы: Стоимость и Предоплата
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Total Budget */}
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Общая стоимость (Бюджет) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={totalBudget}
                  onChange={(e) => {
                    const b = Number(e.target.value);
                    setTotalBudget(b);
                    if (prepayment > b) setPrepayment(b);
                  }}
                  className="w-full glass-input px-4 py-2 rounded-xl text-sm font-bold text-white"
                  placeholder="10000"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Валюта
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl cursor-pointer"
                >
                  <option value="₽" className="bg-slate-900 text-white">₽ (Рубли)</option>
                  <option value="$" className="bg-slate-900 text-white">$ (Доллары)</option>
                  <option value="€" className="bg-slate-900 text-white">€ (Евро)</option>
                  <option value="USDT" className="bg-slate-900 text-white">USDT</option>
                </select>
              </div>
            </div>

            {/* Prepayment Input & Quick Buttons */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-emerald-400 font-semibold">
                  Полученная предоплата (Аванс)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSetPrepayPercent(0)}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-[10px] text-slate-400"
                  >
                    0%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPrepayPercent(30)}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-[10px] text-slate-300"
                  >
                    30%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPrepayPercent(50)}
                    className="px-2 py-0.5 rounded bg-indigo-600/40 hover:bg-indigo-600/70 text-[10px] text-indigo-300 font-bold border border-indigo-500/30"
                  >
                    50% (Половина)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPrepayPercent(100)}
                    className="px-2 py-0.5 rounded bg-emerald-600/40 hover:bg-emerald-600/70 text-[10px] text-emerald-300 font-bold border border-emerald-500/30"
                  >
                    100% (Вся сумма)
                  </button>
                </div>
              </div>

              <input
                type="number"
                min={0}
                max={totalBudget}
                value={prepayment}
                onChange={(e) => setPrepayment(Math.min(totalBudget, Math.max(0, Number(e.target.value))))}
                className="w-full glass-input px-4 py-2 rounded-xl text-sm font-bold text-emerald-400"
                placeholder="5000"
              />
            </div>

            {/* Live Visual Cashflow Pill */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
              <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                <span className="text-[11px] text-emerald-400/90 block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Уже получено (Заработано):
                </span>
                <span className="text-base font-extrabold text-emerald-400">
                  {formatCurrency(prepayment, currency)}
                </span>
              </div>

              <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30">
                <span className="text-[11px] text-amber-400/90 block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Остаток долга клиента:
                </span>
                <span className={`text-base font-extrabold ${remainingDebt > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {formatCurrency(remainingDebt, currency)}
                </span>
              </div>
            </div>

          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Краткое описание / Суть задачи
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Основная цель проекта, технологии или стек..."
              rows={2}
              className="w-full glass-input p-3 rounded-xl"
            />
          </div>

          {/* Initial Tasks (only when creating new) */}
          {!isEditing && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Стартовые задачи в чек-лист
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Добавить пункт в чек-лист..."
                  className="flex-1 glass-input px-3 py-2 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleAddTempTask}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                {tempTasks.map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300">
                    <span className="truncate">{task}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTempTask(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-semibold transition-all"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              {isEditing ? 'Сохранить изменения' : 'Создать проект'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
