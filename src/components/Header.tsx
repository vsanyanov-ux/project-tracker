import React, { useRef } from 'react';
import type { ViewMode, FilterOptions, SortByOption, MainTab } from '../types/project';
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  Kanban, 
  Table as TableIcon, 
  Download, 
  Upload, 
  RotateCcw, 
  Sparkles, 
  Filter,
  ArrowUpDown,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  X,
  Archive,
  Layers,
  Users,
  UserPlus
} from 'lucide-react';

interface HeaderProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenNewProject: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onResetData: () => void;
  categories: string[];
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  activeCount: number;
  archiveCount: number;
  clientsCount?: number;
  onOpenNewClient?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  onOpenNewProject,
  onExportData,
  onImportData,
  onResetData,
  categories,
  currentTab,
  onTabChange,
  activeCount,
  archiveCount,
  clientsCount = 0,
  onOpenNewClient
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <header className="mb-8 space-y-4">
      {/* Top Navbar */}
      <div className="glass-panel rounded-2xl p-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10 shadow-2xl">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight leading-none m-0">
                  Project<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Tracker</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Glass Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Управление проектами, дедлайнами и финансами</p>
            </div>
          </div>

          {/* Mobile + Button */}
          <button
            onClick={currentTab === 'clients' ? (onOpenNewClient || onOpenNewProject) : onOpenNewProject}
            className="md:hidden p-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer"
            title={currentTab === 'clients' ? 'Новый клиент' : 'Новый проект'}
          >
            {currentTab === 'clients' ? <UserPlus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Поиск по названию, клиенту, тегу..."
            className="w-full glass-input pl-10 pr-9 py-2 rounded-xl text-xs placeholder:text-slate-500"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls & Switchers */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          
          {/* View Mode Switcher */}
          <div className="glass-panel p-1 rounded-xl flex items-center border border-white/5 bg-slate-900/60">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? (currentTab === 'archive' ? 'bg-emerald-600 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md')
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Вид: Сетка карточек"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Сетка</span>
            </button>

            {currentTab === 'active' && (
              <button
                onClick={() => onViewModeChange('kanban')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Вид: Канбан-доска"
              >
                <Kanban className="w-4 h-4" />
                <span className="hidden sm:inline">Канбан</span>
              </button>
            )}

            <button
              onClick={() => onViewModeChange('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? (currentTab === 'archive' ? 'bg-emerald-600 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md')
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Вид: Таблица"
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Таблица</span>
            </button>
          </div>

          {/* Backup & Tools */}
          <div className="flex items-center gap-1">
            <button
              onClick={onExportData}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all text-xs"
              title="Экспорт проектов в JSON файл"
            >
              <Download className="w-4 h-4" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all text-xs"
              title="Импорт проектов из JSON"
            >
              <Upload className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (window.confirm('Сбросить данные к стартовым 5 проектам?')) {
                  onResetData();
                }
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all text-xs"
              title="Сбросить на демо-данные"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop "+ Новый проект / клиент" button */}
          {currentTab === 'clients' ? (
            <button
              onClick={onOpenNewClient || onOpenNewProject}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Новый клиент</span>
            </button>
          ) : (
            <button
              onClick={onOpenNewProject}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Новый проект</span>
            </button>
          )}

        </div>
      </div>

      {/* Primary Section Switcher: CRM vs Active Projects vs Archive */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Клиенты / CRM */}
          <button
            onClick={() => {
              onTabChange('clients');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              currentTab === 'clients'
                ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-cyan-600/30'
                : 'glass-panel text-slate-400 hover:text-white border-white/5 hover:border-white/20'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Клиенты / CRM</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              currentTab === 'clients' 
                ? 'bg-white/20 text-white' 
                : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
            }`}>
              {clientsCount}
            </span>
          </button>

          {/* 2. Активные проекты */}
          <button
            onClick={() => {
              onTabChange('active');
              if (filters.status === 'completed' || filters.status === 'cancelled') {
                onFilterChange({ status: 'all' });
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              currentTab === 'active'
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'glass-panel text-slate-400 hover:text-white border-white/5 hover:border-white/20'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Активные проекты</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              currentTab === 'active' ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
            }`}>
              {activeCount}
            </span>
          </button>

          {/* 3. Архив */}
          <button
            onClick={() => {
              onTabChange('archive');
              if (filters.status !== 'all' && filters.status !== 'completed' && filters.status !== 'cancelled') {
                onFilterChange({ status: 'all' });
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              currentTab === 'archive'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                : 'glass-panel text-slate-400 hover:text-white border-white/5 hover:border-white/20'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Архив</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              currentTab === 'archive' 
                ? 'bg-white/20 text-white' 
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}>
              {archiveCount}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar (hidden on CRM tab) */}
      {currentTab !== 'clients' && (
      <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
        
        {/* Status Filter Chips */}
        {currentTab === 'active' ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 mr-1 flex items-center gap-1 font-medium">
              <Filter className="w-3.5 h-3.5" />
              Статус:
            </span>

            {[
              { id: 'all', label: 'Все активные' },
              { id: 'in_progress', label: 'В работе' },
              { id: 'in_review', label: 'На проверке' },
              { id: 'waiting_payment', label: 'Ожидает оплаты' },
              { id: 'backlog', label: 'Бэклог' },
              { id: 'on_hold', label: 'На паузе' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => onFilterChange({ status: st.id })}
                className={`px-3 py-1 rounded-full transition-all text-xs font-semibold ${
                  filters.status === st.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'glass-panel text-slate-400 hover:text-slate-200 border-white/5 hover:border-white/20'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 mr-1 flex items-center gap-1 font-medium">
              <Archive className="w-3.5 h-3.5" />
              В архиве:
            </span>

            {[
              { id: 'all', label: 'Все в архиве' },
              { id: 'completed', label: 'Завершённые ✓' },
              { id: 'cancelled', label: 'Отменённые ✕' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => onFilterChange({ status: st.id })}
                className={`px-3 py-1 rounded-full transition-all text-xs font-semibold ${
                  filters.status === st.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'glass-panel text-slate-400 hover:text-slate-200 border-white/5 hover:border-white/20'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}

        {/* Category, Priority & Sort Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="glass-input text-xs px-3 py-1 rounded-full cursor-pointer bg-slate-900 border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Фильтр по категории"
          >
            <option value="all">Все категории</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange({ priority: e.target.value })}
            className="glass-input text-xs px-3 py-1 rounded-full cursor-pointer bg-slate-900 border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Фильтр по приоритету"
          >
            <option value="all">Все приоритеты</option>
            <option value="urgent">🔥 Срочно</option>
            <option value="high">🟡 Высокий</option>
            <option value="medium">🔵 Средний</option>
            <option value="low">🟢 Низкий</option>
          </select>

          {/* Sort Controls Group */}
          <div className="flex items-center glass-panel rounded-full border border-white/10 bg-slate-900/80 px-2 py-0.5 shadow-sm">
            <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium pointer-events-none pl-1">
              <ArrowUpDown className="w-3 h-3 text-indigo-400" />
            </span>
            <select
              value={filters.sortBy}
              onChange={(e) => {
                const newSortBy = e.target.value as SortByOption;
                if (newSortBy === 'priority' && filters.sortBy !== 'priority') {
                  onFilterChange({ sortBy: newSortBy, sortOrder: 'desc' });
                } else {
                  onFilterChange({ sortBy: newSortBy });
                }
              }}
              className="bg-transparent text-xs py-0.5 px-1.5 cursor-pointer text-slate-200 focus:outline-none focus:ring-0 border-none font-medium"
              title="Параметр сортировки проектов"
            >
              <option value="priority" className="bg-slate-900 text-slate-200">🔥 По приоритету</option>
              <option value="deadline" className="bg-slate-900 text-slate-200">📅 По дедлайну</option>
              <option value="progress" className="bg-slate-900 text-slate-200">📊 По готовности</option>
              <option value="budget" className="bg-slate-900 text-slate-200">💰 По бюджету</option>
              <option value="title" className="bg-slate-900 text-slate-200">🔤 По названию</option>
              <option value="updatedAt" className="bg-slate-900 text-slate-200">🕒 По обновлению</option>
            </select>

            <button
              onClick={() => onFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
              className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs flex items-center justify-center"
              title={
                filters.sortBy === 'priority'
                  ? (filters.sortOrder === 'desc' ? 'Сначала срочные (🔥) ➔ Низкие (🟢)' : 'Сначала низкие (🟢) ➔ Срочные (🔥)')
                  : (filters.sortOrder === 'desc' ? 'По убыванию' : 'По возрастанию')
              }
            >
              {filters.sortOrder === 'desc' ? (
                <ArrowDownNarrowWide className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <ArrowUpNarrowWide className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </button>
          </div>
        </div>

      </div>
      )}
    </header>
  );
};
