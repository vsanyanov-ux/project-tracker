import React, { useState } from 'react';
import type { Client, PipelineStage } from '../types/client';
import type { Project } from '../types/project';
import { formatCurrency } from '../utils/formatters';
import { getTelegramUrl, formatTelegramHandle } from '../utils/messenger';
import { ClientPhoneContact } from './ClientPhoneContact';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  GripVertical, 
  MessageSquare, 
  Rocket, 
  FolderKanban,
  Edit2, 
  Trash2,
  Clock,
  AlertCircle
} from 'lucide-react';

interface CrmPipelineBoardProps {
  clients: Client[];
  projects?: Project[];
  onUpdateClientStage: (clientId: string, newStage: PipelineStage) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onCreateProjectForClient: (client: Client) => void;
  onAddNewClientInStage: (stage: PipelineStage) => void;
  onOpenProjectDetail?: (id: string) => void;
}

interface StageColumnDef {
  stage: PipelineStage;
  title: string;
  icon: string;
  desc: string;
  gradient: string;
  border: string;
  badge: string;
}

const PIPELINE_STAGES: StageColumnDef[] = [
  {
    stage: 'new_lead',
    title: 'Новый контакт',
    icon: '📥',
    desc: 'Первичное обращение',
    gradient: 'from-cyan-500/15 via-cyan-500/5 to-transparent',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
  },
  {
    stage: 'contact_call',
    title: 'Квалификация / Созвон',
    icon: '📞',
    desc: 'Назначен бриф / созвон',
    gradient: 'from-indigo-500/15 via-indigo-500/5 to-transparent',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
  },
  {
    stage: 'negotiation',
    title: 'Переговоры / КП',
    icon: '🤝',
    desc: 'Согласование ТЗ и условий',
    gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  },
  {
    stage: 'awaiting_payment',
    title: 'Счёт / Предоплата',
    icon: '💳',
    desc: 'Ожидается внесение аванса',
    gradient: 'from-purple-500/15 via-purple-500/5 to-transparent',
    border: 'border-purple-500/30',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
  },
  {
    stage: 'deal_won',
    title: 'Успешно закрыта',
    icon: '🏆',
    desc: 'Оплата получена / Победа',
    gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  },
  {
    stage: 'deal_lost',
    title: 'Отказ / Архив',
    icon: '❌',
    desc: 'Отложено или отказ',
    gradient: 'from-slate-600/15 via-slate-600/5 to-transparent',
    border: 'border-slate-500/30',
    badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  }
];

const STAGE_ORDER: PipelineStage[] = [
  'new_lead',
  'contact_call',
  'negotiation',
  'awaiting_payment',
  'deal_won',
  'deal_lost'
];

function getClientEffectiveStage(client: Client): PipelineStage {
  if (client.pipelineStage) return client.pipelineStage;
  // Smart fallback based on client status
  if (client.status === 'lead') return 'negotiation';
  if (client.status === 'dormant') return 'deal_lost';
  return 'deal_won'; // active, regular, vip
}

export const CrmPipelineBoard: React.FC<CrmPipelineBoardProps> = ({
  clients,
  projects,
  onUpdateClientStage,
  onEditClient,
  onDeleteClient,
  onCreateProjectForClient,
  onAddNewClientInStage,
  onOpenProjectDetail
}) => {
  const [draggedClientId, setDraggedClientId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const getNextStage = (current: PipelineStage): PipelineStage | null => {
    const idx = STAGE_ORDER.indexOf(current);
    if (idx !== -1 && idx < STAGE_ORDER.length - 2) {
      return STAGE_ORDER[idx + 1];
    }
    if (current === 'awaiting_payment') return 'deal_won';
    return null;
  };

  const getPrevStage = (current: PipelineStage): PipelineStage | null => {
    const idx = STAGE_ORDER.indexOf(current);
    if (idx > 0 && current !== 'deal_lost') {
      return STAGE_ORDER[idx - 1];
    }
    if (current === 'deal_lost') return 'negotiation';
    return null;
  };

  const handleDragStart = (e: React.DragEvent, client: Client) => {
    setDraggedClientId(client.id);
    e.dataTransfer.setData('text/plain', client.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedClientId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX >= rect.right ||
      e.clientY < rect.top ||
      e.clientY >= rect.bottom
    ) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    const clientId = e.dataTransfer.getData('text/plain') || draggedClientId;
    if (clientId) {
      onUpdateClientStage(clientId, targetStage);
    }
    setDraggedClientId(null);
    setDragOverStage(null);
  };

  return (
    <div className="space-y-4">
      {/* Horizontal Pipeline Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start min-h-[580px] custom-scrollbar">
        {PIPELINE_STAGES.map((col) => {
          const colClients = clients.filter(
            (c) => getClientEffectiveStage(c) === col.stage
          );
          const colTotalValue = colClients.reduce(
            (sum, c) => sum + (c.dealValue || 0),
            0
          );
          const isOver = dragOverStage === col.stage;

          return (
            <div
              key={col.stage}
              onDragOver={(e) => handleDragOver(e, col.stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.stage)}
              className={`flex-shrink-0 w-80 rounded-2xl flex flex-col transition-all duration-200 border ${
                isOver
                  ? 'border-indigo-400/80 bg-indigo-950/20 ring-2 ring-indigo-500/30'
                  : `${col.border} glass-panel bg-slate-900/40`
              }`}
            >
              {/* Column Header */}
              <div className={`p-4 border-b border-white/5 rounded-t-2xl bg-gradient-to-b ${col.gradient}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-lg shrink-0">{col.icon}</span>
                    <h3 className="font-bold text-sm text-white truncate tracking-tight">
                      {col.title}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black border ${col.badge}`}>
                    {colClients.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span className="truncate">{col.desc}</span>
                  {colTotalValue > 0 && (
                    <span className="font-bold text-emerald-400 shrink-0 ml-2">
                      {formatCurrency(colTotalValue)}
                    </span>
                  )}
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[640px] custom-scrollbar min-h-[140px]">
                {colClients.length === 0 ? (
                  <div className="h-28 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 text-xs p-3 text-center">
                    <span>Нет сделок на этом этапе</span>
                    <button
                      onClick={() => onAddNewClientInStage(col.stage)}
                      className="mt-2 text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Добавить
                    </button>
                  </div>
                ) : (
                  colClients.map((client) => {
                    const isDragging = draggedClientId === client.id;
                    const isFollowUpDue = client.nextFollowUp && client.nextFollowUp <= today;
                    const nextStage = getNextStage(col.stage);
                    const prevStage = getPrevStage(col.stage);
                    const tgUrl = getTelegramUrl(client.telegram);

                    const clientActiveProjects = (projects || []).filter((p) => {
                      const normName = client.name.trim().toLowerCase();
                      const normCompany = client.company ? client.company.trim().toLowerCase() : '';
                      const pClient = p.client.trim().toLowerCase();
                      const isMatch = pClient === normName || (normCompany && pClient === normCompany);
                      return isMatch && p.status !== 'completed' && p.status !== 'cancelled';
                    });
                    const hasActiveProjects = clientActiveProjects.length > 0;

                    return (
                      <div
                        key={client.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, client)}
                        onDragEnd={handleDragEnd}
                        className={`group p-3.5 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing relative ${
                          isDragging
                            ? 'opacity-40 scale-95 border-indigo-500/50 bg-slate-950/80'
                            : 'bg-slate-900/90 hover:bg-slate-850 border-white/10 hover:border-indigo-500/40 shadow-lg hover:shadow-indigo-500/10'
                        }`}
                      >
                        {/* Drag Handle & Client Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical className="w-3.5 h-3.5 text-slate-500 opacity-40 group-hover:opacity-100 shrink-0" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                                {client.name}
                              </h4>
                              {client.contactPerson && (
                                <p className="text-[11px] text-slate-400 truncate">
                                  {client.contactPerson}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => onEditClient(client)}
                              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Редактировать клиента"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteClient(client.id)}
                              className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Удалить клиента"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Deal Value */}
                        {client.dealValue ? (
                          <div className="mb-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-300 flex items-center justify-between">
                            <span className="text-[10px] text-emerald-400/80 uppercase font-semibold">Бюджет:</span>
                            <span>{formatCurrency(client.dealValue)}</span>
                          </div>
                        ) : null}

                        {/* Follow-up Reminder Badge */}
                        {client.nextFollowUp && (
                          <div
                            className={`mb-2 px-2.5 py-1.5 rounded-lg text-[11px] flex items-center justify-between border ${
                              isFollowUpDue
                                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse font-bold'
                                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                            }`}
                            title={isFollowUpDue ? 'Срочно связаться!' : 'Запланирован контакт'}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              {isFollowUpDue ? (
                                <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                              ) : (
                                <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                              )}
                              <span className="truncate">
                                {isFollowUpDue ? 'Касание сегодня!' : 'Контакт:'}
                              </span>
                            </div>
                            <span className="font-mono font-bold shrink-0">{client.nextFollowUp}</span>
                          </div>
                        )}

                        {/* Contact info: Telegram / Phone / WhatsApp / MAX */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 my-2">
                          {tgUrl && (
                            <a
                              href={tgUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 truncate hover:underline"
                            >
                              <MessageSquare className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[100px]">{formatTelegramHandle(client.telegram)}</span>
                            </a>
                          )}
                          {(client.phone || client.whatsapp || client.max) && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <ClientPhoneContact
                                phone={client.phone}
                                whatsapp={client.whatsapp}
                                max={client.max}
                                compact={true}
                              />
                            </div>
                          )}
                        </div>

                        {/* Notes Snippet */}
                        {client.notes && (
                          <p className="text-[11px] text-slate-400 bg-white/[0.02] border border-white/5 p-2 rounded-lg line-clamp-2 my-2">
                            {client.notes}
                          </p>
                        )}

                        {/* Tags */}
                        {client.tags && client.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 my-2">
                            {client.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions Footer: Shift Stage + Launch Project Button */}
                        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-1.5">
                          {/* Prev Stage Button */}
                          {prevStage ? (
                            <button
                              onClick={() => onUpdateClientStage(client.id, prevStage)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs cursor-pointer"
                              title="Вернуть на предыдущий этап"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <div className="w-6" />
                          )}

                          {/* Quick "Launch Project" button or "In Progress" badge */}
                          {hasActiveProjects ? (
                            onOpenProjectDetail ? (
                              <button
                                onClick={() => onOpenProjectDetail(clientActiveProjects[0].id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer truncate max-w-[135px]"
                                title={`Проект уже в работе: "${clientActiveProjects[0].title}". Нажмите, чтобы открыть в трекере.`}
                              >
                                <FolderKanban className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                                <span className="truncate">В работе ({clientActiveProjects.length})</span>
                              </button>
                            ) : (
                              <span
                                className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 truncate"
                                title="Проект уже запущен в трекере"
                              >
                                <FolderKanban className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                                <span className="truncate">В работе ({clientActiveProjects.length})</span>
                              </span>
                            )
                          ) : col.stage === 'deal_won' ? (
                            <button
                              onClick={() => onCreateProjectForClient(client)}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                              title="Сделка закрыта! Запустить рабочий проект в трекере"
                            >
                              <Rocket className="w-3.5 h-3.5 text-cyan-300" />
                              <span>Запустить проект</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onCreateProjectForClient(client)}
                              className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Создать рабочий проект для этого клиента"
                            >
                              <Rocket className="w-3 h-3 text-indigo-400" />
                              <span>В проект</span>
                            </button>
                          )}

                          {/* Next Stage Button */}
                          {nextStage ? (
                            <button
                              onClick={() => onUpdateClientStage(client.id, nextStage)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs cursor-pointer"
                              title="Передвинуть на следующий этап воронки"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <div className="w-6" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Column Footer: Add client in this stage */}
              <div className="p-2 border-t border-white/5">
                <button
                  onClick={() => onAddNewClientInStage(col.stage)}
                  className="w-full py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Добавить лид</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
