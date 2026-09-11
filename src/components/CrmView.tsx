import { useState, useMemo } from 'react';
import type { Client, ClientStatus, ClientSortBy, PipelineStage } from '../types/client';
import type { Project } from '../types/project';
import { calculateClientStats } from '../utils/clientStorage';
import { formatCurrency } from '../utils/formatters';
import { getTelegramUrl, formatTelegramHandle } from '../utils/messenger';
import { CrmPipelineBoard } from './CrmPipelineBoard';
import { ClientPhoneContact } from './ClientPhoneContact';
import {
  Users,
  UserPlus,
  Building2,
  Mail,
  Globe,
  MessageSquare,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  Plus,
  Edit2,
  Trash2,
  FolderGit2,
  ArrowUpDown,
  CheckCircle2,
  RefreshCw,
  Kanban,
  LayoutGrid
} from 'lucide-react';

interface CrmViewProps {
  clients: Client[];
  projects: Project[];
  onOpenNewClient: (initialStage?: PipelineStage) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onCreateProjectForClient: (client: Client) => void;
  onOpenProjectDetail: (projectId: string) => void;
  onSyncFromProjects: () => void;
  onUpdateClientStage: (clientId: string, newStage: PipelineStage) => void;
  externalSearch?: string;
}

const STATUS_BADGES: Record<ClientStatus, { label: string; icon: string; badge: string }> = {
  active: { label: 'В работе', icon: '⚡', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  vip: { label: 'VIP клиент', icon: '👑', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]' },
  regular: { label: 'Постоянный', icon: '💎', badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  lead: { label: 'Лид (Переговоры)', icon: '🌱', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  dormant: { label: 'Спящий', icon: '💤', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30' }
};

const AVATAR_GRADIENTS = [
  'from-indigo-600 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600'
];

export function CrmView({
  clients,
  projects,
  onOpenNewClient,
  onEditClient,
  onDeleteClient,
  onCreateProjectForClient,
  onOpenProjectDetail,
  onSyncFromProjects,
  onUpdateClientStage,
  externalSearch = ''
}: CrmViewProps) {
  const [crmSubView, setCrmSubView] = useState<'pipeline' | 'grid'>(() => {
    try {
      const saved = localStorage.getItem('antigravity_crm_subview_v1');
      if (saved === 'pipeline' || saved === 'grid') return saved;
    } catch {}
    return 'pipeline';
  });

  const handleSubViewChange = (mode: 'pipeline' | 'grid') => {
    setCrmSubView(mode);
    try {
      localStorage.setItem('antigravity_crm_subview_v1', mode);
    } catch {}
  };

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<ClientSortBy>('ltv');

  const effectiveSearch = externalSearch;

  // Compute overall CRM statistics
  const crmStats = useMemo(() => {
    let totalLtv = 0;
    let totalActiveClients = 0;
    let followUpDueCount = 0;
    const today = new Date().toISOString().split('T')[0];

    clients.forEach((c) => {
      const stats = calculateClientStats(c, projects);
      totalLtv += stats.totalRevenueLtv;
      if (stats.activeProjectsCount > 0 || c.status === 'active') {
        totalActiveClients += 1;
      }
      if (c.nextFollowUp && c.nextFollowUp <= today) {
        followUpDueCount += 1;
      }
    });

    return {
      totalClients: clients.length,
      totalActiveClients,
      totalLtv,
      followUpDueCount
    };
  }, [clients, projects]);

  // Clients with precalculated statistics
  const clientsWithStats = useMemo(() => {
    return clients.map((c) => {
      const stats = calculateClientStats(c, projects);
      const matchedProjects = projects.filter((p) => {
        const norm = c.name.trim().toLowerCase();
        const pNorm = p.client.trim().toLowerCase();
        const cComp = c.company ? c.company.trim().toLowerCase() : '';
        return pNorm === norm || (cComp && pNorm === cComp);
      });

      return {
        client: c,
        stats,
        matchedProjects
      };
    });
  }, [clients, projects]);

  // Filtered & Sorted Clients
  const filteredClients = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return clientsWithStats
      .filter(({ client: c }) => {
        // Status filter
        if (selectedStatus === 'follow_up') {
          if (!c.nextFollowUp || c.nextFollowUp > today) return false;
        } else if (selectedStatus !== 'all' && c.status !== selectedStatus) {
          return false;
        }

        // Search query
        if (effectiveSearch) {
          const q = effectiveSearch.toLowerCase();
          const inName = c.name.toLowerCase().includes(q);
          const inCompany = (c.company || '').toLowerCase().includes(q);
          const inContact = (c.contactPerson || '').toLowerCase().includes(q);
          const inTg = (c.telegram || '').toLowerCase().includes(q);
          const inPhone = (c.phone || '').toLowerCase().includes(q);
          const inWa = (c.whatsapp || '').toLowerCase().includes(q);
          const inMax = (c.max || '').toLowerCase().includes(q);
          const inNotes = (c.notes || '').toLowerCase().includes(q);
          const inTags = (c.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!inName && !inCompany && !inContact && !inTg && !inPhone && !inWa && !inMax && !inNotes && !inTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'ltv') {
          return b.stats.totalRevenueLtv - a.stats.totalRevenueLtv;
        }
        if (sortBy === 'projects') {
          return b.stats.totalProjectsCount - a.stats.totalProjectsCount;
        }
        if (sortBy === 'name') {
          return a.client.name.localeCompare(b.client.name, 'ru');
        }
        if (sortBy === 'followUp') {
          if (!a.client.nextFollowUp) return 1;
          if (!b.client.nextFollowUp) return -1;
          return a.client.nextFollowUp.localeCompare(b.client.nextFollowUp);
        }
        // updatedAt
        return (b.client.updatedAt || '').localeCompare(a.client.updatedAt || '');
      });
  }, [clientsWithStats, selectedStatus, effectiveSearch, sortBy]);

  // Helper for initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getGradientForIndex = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
    return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top CRM Financial & KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-indigo-500/40 transition-all shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Всего клиентов в базе</p>
              <h3 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
                {crmStats.totalClients}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Централизованная клиентская база</span>
          </p>
        </div>

        {/* Active Clients */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Клиентов в работе</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1 tracking-tight">
                {crmStats.totalActiveClients}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>С активными текущими проектами</span>
          </p>
        </div>

        {/* Total LTV Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Общий LTV клиентской базы</p>
              <h3 className="text-2xl font-extrabold text-white mt-1 tracking-tight">
                {formatCurrency(crmStats.totalLtv)}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-amber-400/90 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-amber-400" />
            <span>Фактически полученный доход</span>
          </p>
        </div>

        {/* Follow-up Reminders */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'follow_up' ? 'all' : 'follow_up')}
          className={`glass-panel p-5 rounded-2xl border relative overflow-hidden group transition-all shadow-xl cursor-pointer ${
            crmStats.followUpDueCount > 0
              ? 'border-rose-500/40 bg-rose-950/10 hover:border-rose-400'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none -mr-6 -mt-6" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Требуют касания (Follow-up)</p>
              <h3 className={`text-2xl font-extrabold mt-1 tracking-tight ${
                crmStats.followUpDueCount > 0 ? 'text-rose-400' : 'text-slate-300'
              }`}>
                {crmStats.followUpDueCount}
              </h3>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
              crmStats.followUpDueCount > 0 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse' 
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-rose-400" />
            <span>{crmStats.followUpDueCount > 0 ? 'Напоминания на сегодня или ранее' : 'Все клиенты охвачены'}</span>
          </p>
        </div>
      </div>

      {/* Control Bar: Filters, Sorting, Search and Actions */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar text-xs">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Все ({clients.length})
          </button>

          <button
            onClick={() => setSelectedStatus('active')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              selectedStatus === 'active'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            ⚡ В работе
          </button>

          <button
            onClick={() => setSelectedStatus('vip')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              selectedStatus === 'vip'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            👑 VIP
          </button>

          <button
            onClick={() => setSelectedStatus('regular')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              selectedStatus === 'regular'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            💎 Постоянные
          </button>

          <button
            onClick={() => setSelectedStatus('lead')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              selectedStatus === 'lead'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            🌱 Лиды
          </button>

          {crmStats.followUpDueCount > 0 && (
            <button
              onClick={() => setSelectedStatus('follow_up')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedStatus === 'follow_up'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Касание ({crmStats.followUpDueCount})</span>
            </button>
          )}

          <button
            onClick={() => setSelectedStatus('dormant')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              selectedStatus === 'dormant'
                ? 'bg-slate-700 text-white shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            💤 Спящие
          </button>
        </div>

        {/* Right side: View Mode Switcher, Sorting, Sync & New Client */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          {/* View Mode Toggle: Pipeline vs Grid */}
          <div className="glass-panel p-1 rounded-xl flex items-center border border-white/5 bg-slate-900/60">
            <button
              onClick={() => handleSubViewChange('pipeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                crmSubView === 'pipeline'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Интерактивная канбан-воронка лидов и сделок"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Воронка продаж</span>
            </button>
            <button
              onClick={() => handleSubViewChange('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                crmSubView === 'grid'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="База клиентов (Сетка карточек)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Карточки</span>
            </button>
          </div>

          {/* Sorting (available in grid mode) */}
          {crmSubView === 'grid' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 p-1 rounded-xl border border-white/5">
              <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ClientSortBy)}
                className="bg-transparent text-slate-200 text-xs py-1 pr-2 outline-none cursor-pointer"
              >
                <option value="ltv" className="bg-slate-900">По LTV (доходу)</option>
                <option value="followUp" className="bg-slate-900">По дате касания</option>
                <option value="projects" className="bg-slate-900">По числу проектов</option>
                <option value="name" className="bg-slate-900">По имени А-Я</option>
                <option value="updatedAt" className="bg-slate-900">По активности</option>
              </select>
            </div>
          )}

          {/* Sync Button */}
          <button
            onClick={onSyncFromProjects}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Собрать новых клиентов из существующих проектов трекера"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Собрать из проектов</span>
          </button>

          {/* Add Client Button */}
          <button
            onClick={() => onOpenNewClient()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Новый клиент</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Pipeline vs Grid */}
      {crmSubView === 'pipeline' ? (
        <CrmPipelineBoard
          clients={filteredClients.map((fc) => fc.client)}
          projects={projects}
          onUpdateClientStage={onUpdateClientStage}
          onEditClient={onEditClient}
          onDeleteClient={onDeleteClient}
          onCreateProjectForClient={onCreateProjectForClient}
          onAddNewClientInStage={(stage) => onOpenNewClient(stage)}
          onOpenProjectDetail={onOpenProjectDetail}
        />
      ) : filteredClients.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 max-w-xl mx-auto my-12 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Клиенты не найдены</h3>
          <p className="text-xs text-slate-400 mb-6">
            {effectiveSearch || selectedStatus !== 'all'
              ? 'По заданным параметрам поиска клиентов не найдено. Попробуйте сбросить фильтры.'
              : 'База клиентов пока пуста. Вы можете добавить первого клиента или автоматически собрать клиентов из проектов!'}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => onOpenNewClient()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              + Добавить клиента
            </button>
            <button
              onClick={onSyncFromProjects}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              Собрать из проектов трекера
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map(({ client: c, stats, matchedProjects }) => {
            const statusConfig = STATUS_BADGES[c.status] || STATUS_BADGES.active;
            const tgUrl = getTelegramUrl(c.telegram);
            const avatarGrad = getGradientForIndex(c.id);
            const today = new Date().toISOString().split('T')[0];
            const isFollowUpDue = c.nextFollowUp && c.nextFollowUp <= today;

            return (
              <div
                key={c.id}
                className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between relative group hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all"
              >
                {/* Top Section: Avatar, Name, Status */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${avatarGrad} p-[1.5px] shrink-0 shadow-md`}>
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xs font-extrabold text-white">
                          {getInitials(c.name)}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-indigo-300 transition-colors">
                          {c.name}
                        </h4>
                        {c.company && c.company !== c.name && (
                          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{c.company}</span>
                          </p>
                        )}
                        {c.contactPerson && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            ЛПР: <span className="text-slate-300 font-medium">{c.contactPerson}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 flex items-center gap-1 ${statusConfig.badge}`}>
                      <span>{statusConfig.icon}</span>
                      <span>{statusConfig.label}</span>
                    </span>
                  </div>

                  {/* Financial Metrics Strip */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">LTV (Выручка)</span>
                      <p className="text-sm font-extrabold text-white mt-0.5">
                        {formatCurrency(stats.totalRevenueLtv)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Проекты</span>
                      <p className="text-xs font-bold text-slate-300 mt-0.5 flex items-center gap-1.5">
                        <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{stats.totalProjectsCount} всего</span>
                        {stats.activeProjectsCount > 0 && (
                          <span className="text-[10px] text-emerald-400 font-extrabold">
                            ({stats.activeProjectsCount} в работе)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Follow-up Reminder Badge */}
                  {c.nextFollowUp && (
                    <div className={`mb-3 px-3 py-2 rounded-xl text-xs flex items-center justify-between border ${
                      isFollowUpDue
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 animate-pulse'
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-semibold">
                          {isFollowUpDue ? 'Связаться с клиентом!' : 'Следующий контакт:'}
                        </span>
                      </div>
                      <span className="font-bold">{c.nextFollowUp}</span>
                    </div>
                  )}

                  {/* Contacts List */}
                  <div className="space-y-1.5 text-xs my-3 pt-1 border-t border-white/5">
                    {c.telegram && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        {tgUrl ? (
                          <a
                            href={tgUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 hover:underline truncate"
                          >
                            {formatTelegramHandle(c.telegram)}
                          </a>
                        ) : (
                          <span className="truncate">{c.telegram}</span>
                        )}
                      </div>
                    )}

                    {(c.phone || c.whatsapp || c.max) && (
                      <div className="pt-0.5">
                        <ClientPhoneContact
                          phone={c.phone}
                          whatsapp={c.whatsapp}
                          max={c.max}
                        />
                      </div>
                    )}

                    {c.email && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <a href={`mailto:${c.email}`} className="hover:text-indigo-300 truncate">
                          {c.email}
                        </a>
                      </div>
                    )}

                    {c.website && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <a
                          href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:underline truncate"
                        >
                          {c.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Notes Snippet */}
                  {c.notes && (
                    <div className="my-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 line-clamp-2">
                      <span className="font-semibold text-slate-300">Заметка: </span>
                      {c.notes}
                    </div>
                  )}

                  {/* Associated Projects Pill List */}
                  {matchedProjects.length > 0 && (
                    <div className="my-3">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1.5">
                        Проекты клиента:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchedProjects.slice(0, 3).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => onOpenProjectDetail(p.id)}
                            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-[11px] text-slate-200 border border-white/10 hover:border-indigo-400/40 transition-all flex items-center gap-1 cursor-pointer"
                            title={`Открыть детали проекта "${p.title}"`}
                          >
                            <span className="truncate max-w-[120px]">{p.title}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              p.status === 'completed' ? 'bg-emerald-400' : 'bg-indigo-400'
                            }`} />
                          </button>
                        ))}
                        {matchedProjects.length > 3 && (
                          <span className="text-[10px] text-slate-500 self-center">
                            +{matchedProjects.length - 3} ещё
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {c.tags && c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-400 border border-white/5"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {tgUrl && (
                      <a
                        href={tgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                        title="Написать клиенту в Telegram"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>TG</span>
                      </a>
                    )}

                    <button
                      onClick={() => onCreateProjectForClient(c)}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Создать новый проект для этого клиента"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Проект</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditClient(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Редактировать клиента"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Удалить клиента "${c.name}" из CRM базы?`)) {
                          onDeleteClient(c.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Удалить клиента"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
