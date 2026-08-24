import { useState, useEffect, useMemo } from 'react';
import type { Project, ProjectStatus, FilterOptions, ViewMode, MainTab } from './types/project';
import { DEFAULT_CATEGORIES } from './types/project';
import { getStoredProjects, saveProjects, resetToDefaultProjects, exportProjectsToJson, importProjectsFromJson } from './utils/storage';
import { PRIORITY_WEIGHTS, calculateProjectProgress, calculateProjectFinancials } from './utils/formatters';
import { BackgroundGlow } from './components/BackgroundGlow';
import { Header } from './components/Header';
import { FinancialSummary } from './components/FinancialSummary';
import { ProjectCard } from './components/ProjectCard';
import { KanbanBoard } from './components/KanbanBoard';
import { ProjectTableView } from './components/ProjectTableView';
import { ArchiveView } from './components/ArchiveView';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ProjectFormModal } from './components/ProjectFormModal';
import { Plus, FolderSearch, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentTab, setCurrentTab] = useState<MainTab>('active');
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('antigravity_view_mode_v1');
      if (saved === 'kanban' || saved === 'grid' || saved === 'table') {
        return saved;
      }
    } catch {}
    return 'kanban';
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem('antigravity_view_mode_v1', mode);
    } catch {}
  };
  
  // Selected project for deep drill-down view
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Form Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Filters State
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    category: 'all',
    priority: 'all',
    sortBy: 'deadline',
    sortOrder: 'asc'
  });

  // Load from storage on mount
  useEffect(() => {
    const loaded = getStoredProjects();
    setProjects(loaded);
  }, []);

  // Update Filters helper
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Helper for archive status check (completed or cancelled)
  const isArchivedProject = (p: Project) => p.status === 'completed' || p.status === 'cancelled';

  // Active & Archive counts
  const activeCount = useMemo(() => projects.filter(p => !isArchivedProject(p)).length, [projects]);
  const archiveCount = useMemo(() => projects.filter(isArchivedProject).length, [projects]);

  // Unique Categories list (including default presets)
  const categories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  // Filtered and Sorted Projects based on currentTab (Active vs Archive)
  const filteredProjects = useMemo(() => {
    // 1. Separate base projects by tab
    const baseProjects = currentTab === 'archive'
      ? projects.filter(isArchivedProject)
      : projects.filter(p => !isArchivedProject(p));

    const filtered = baseProjects.filter((p) => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(query);
        const inClient = p.client.toLowerCase().includes(query);
        const inDesc = (p.description || '').toLowerCase().includes(query);
        const inCategory = (p.category || '').toLowerCase().includes(query);
        const inTasks = (p.tasks || []).some(t => t.title.toLowerCase().includes(query));
        if (!inTitle && !inClient && !inDesc && !inCategory && !inTasks) return false;
      }

      // Status filter
      if (filters.status !== 'all' && p.status !== filters.status) {
        return false;
      }

      // Category
      if (filters.category !== 'all' && p.category !== filters.category) {
        return false;
      }

      // Priority
      if (filters.priority !== 'all' && p.priority !== filters.priority) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      let res = 0;
      if (filters.sortBy === 'priority') {
        const weightA = PRIORITY_WEIGHTS[a.priority] || 0;
        const weightB = PRIORITY_WEIGHTS[b.priority] || 0;
        res = weightA - weightB;
      } else if (filters.sortBy === 'deadline') {
        const timeA = a.deadline ? new Date(a.deadline).getTime() : 0;
        const timeB = b.deadline ? new Date(b.deadline).getTime() : 0;
        res = timeA - timeB;
      } else if (filters.sortBy === 'progress') {
        res = calculateProjectProgress(a) - calculateProjectProgress(b);
      } else if (filters.sortBy === 'budget') {
        res = (calculateProjectFinancials(a).total) - (calculateProjectFinancials(b).total);
      } else if (filters.sortBy === 'title') {
        res = a.title.localeCompare(b.title, 'ru');
      } else if (filters.sortBy === 'updatedAt') {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        res = timeA - timeB;
      }

      return filters.sortOrder === 'asc' ? res : -res;
    });
  }, [projects, filters, currentTab]);

  // CRUD Operations
  const handleUpdateProject = (updated: Project) => {
    const prev = projects.find((p) => p.id === updated.id);
    const updatedList = projects.map((p) => (p.id === updated.id ? updated : p));
    setProjects(updatedList);
    saveProjects(updatedList);

    const prevArchived = prev ? isArchivedProject(prev) : false;
    const nextArchived = isArchivedProject(updated);

    if (updated.status === 'completed' && prev?.status !== 'completed') {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast(`Проект "${updated.title}" завершён и перемещён в Архив! 📦 🎉`);
    } else if (updated.status === 'cancelled' && prev?.status !== 'cancelled') {
      showToast(`Проект "${updated.title}" отменён и перемещён в Архив! 📦 (Бюджет и долг сброшены)`);
    } else if (prevArchived && !nextArchived) {
      showToast(`Проект "${updated.title}" возвращён в активные проекты! 🚀`);
    } else {
      showToast(`Проект "${updated.title}" обновлен`);
    }
  };

  const handleSaveProjectFromForm = (savedProject: Project) => {
    const exists = projects.some((p) => p.id === savedProject.id);
    let updatedList: Project[];
    if (exists) {
      updatedList = projects.map((p) => (p.id === savedProject.id ? savedProject : p));
      showToast(`Проект "${savedProject.title}" сохранен`);
    } else {
      updatedList = [savedProject, ...projects];
      showToast(`Проект "${savedProject.title}" успешно создан! 🎉`);
    }
    setProjects(updatedList);
    saveProjects(updatedList);
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    const updatedList = projects.filter((p) => p.id !== projectId);
    setProjects(updatedList);
    saveProjects(updatedList);
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
    showToast(`Проект "${proj?.title || ''}" удален`);
  };

  const handleQuickStatusChange = (projectId: string, newStatus: ProjectStatus) => {
    const proj = projects.find(p => p.id === projectId);
    const updatedList = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });
    setProjects(updatedList);
    saveProjects(updatedList);

    const prevArchived = proj ? isArchivedProject(proj) : false;
    const nextArchived = newStatus === 'completed' || newStatus === 'cancelled';

    if (newStatus === 'completed') {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast(`Проект "${proj?.title || ''}" завершён и перемещён в Архив! 📦 🎉`);
    } else if (newStatus === 'cancelled') {
      showToast(`Проект "${proj?.title || ''}" отменён и перемещён в Архив! 📦 (Бюджет и долг сброшены)`);
    } else if (prevArchived && !nextArchived) {
      showToast(`Проект "${proj?.title || ''}" возвращён в активные проекты! 🚀`);
    } else {
      showToast('Статус проекта обновлен');
    }
  };

  // Restore Project from Archive
  const handleRestoreFromArchive = (projectId: string) => {
    handleQuickStatusChange(projectId, 'in_progress');
  };

  // Export / Import / Reset
  const handleExportData = () => {
    exportProjectsToJson(projects);
    showToast('Бэкап проектов экспортирован в JSON');
  };

  const handleImportData = async (file: File) => {
    try {
      const imported = await importProjectsFromJson(file);
      setProjects(imported);
      showToast(`Успешно импортировано ${imported.length} проектов!`);
    } catch (err: any) {
      alert(err.message || 'Ошибка импорта файла');
    }
  };

  const handleResetData = () => {
    const defaults = resetToDefaultProjects();
    setProjects(defaults);
    showToast('Данные сброшены к 5 стартовым проектам');
  };

  const currentSelectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-indigo-500 selection:text-white font-sans relative">
      {/* Aurora Ambient Glowing Backdrops */}
      <BackgroundGlow />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Header with Search, Switcher & Quick Filters */}
        <Header
          filters={filters}
          onFilterChange={handleFilterChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenNewProject={() => {
            setEditingProject(null);
            setIsFormModalOpen(true);
          }}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onResetData={handleResetData}
          categories={categories}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          activeCount={activeCount}
          archiveCount={archiveCount}
        />

        {/* Section View: Active vs Archive */}
        {currentTab === 'archive' ? (
          /* Archive Section View */
          <ArchiveView
            projects={filteredProjects}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onOpenDetail={(p) => setSelectedProjectId(p.id)}
            onRestoreProject={handleRestoreFromArchive}
            onUpdateStatus={handleQuickStatusChange}
            onGoToActive={() => {
              setCurrentTab('active');
              handleFilterChange({ status: 'all' });
            }}
          />
        ) : (
          /* Active Projects Section View */
          <>
            {/* Top Financial & Analytics Summary Bar */}
            <FinancialSummary 
              projects={projects}
              onFilterStatus={(st) => handleFilterChange({ status: st })}
              onOpenArchive={() => setCurrentTab('archive')}
            />

            {/* View Content: Grid / Kanban / Table */}
            {filteredProjects.length === 0 ? (
              /* Empty State for Active Projects */
              <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 max-w-xl mx-auto my-12 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
                  <FolderSearch className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Активные проекты не найдены</h3>
                <p className="text-xs text-slate-400 mb-6">
                  {filters.search || filters.status !== 'all' || filters.category !== 'all' || filters.priority !== 'all'
                    ? 'По выбранным фильтрам ничего не найдено. Попробуйте сбросить фильтры.'
                    : 'Все ваши проекты завершены и находятся в Архиве, либо список пуст.'}
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => setFilters({ search: '', status: 'all', category: 'all', priority: 'all', sortBy: 'deadline', sortOrder: 'asc' })}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Сбросить фильтры
                  </button>
                  {archiveCount > 0 && (
                    <button
                      onClick={() => setCurrentTab('archive')}
                      className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                    >
                      Открыть Архив ({archiveCount})
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingProject(null);
                      setIsFormModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
                  >
                    <Plus className="w-4 h-4" />
                    Создать проект
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpenDetail={() => setSelectedProjectId(project.id)}
                    onQuickStatusChange={handleQuickStatusChange}
                  />
                ))}
              </div>
            ) : viewMode === 'kanban' ? (
              /* Kanban View */
              <KanbanBoard
                projects={filteredProjects}
                onOpenDetail={(p) => setSelectedProjectId(p.id)}
                onUpdateStatus={handleQuickStatusChange}
                onAddNewProject={() => {
                  setEditingProject(null);
                  setIsFormModalOpen(true);
                }}
              />
            ) : (
              /* Table View */
              <ProjectTableView
                projects={filteredProjects}
                onOpenDetail={(p) => setSelectedProjectId(p.id)}
                onUpdateStatus={handleQuickStatusChange}
              />
            )}
          </>
        )}


      </div>

      {/* Deep Drill-Down Detail Modal */}
      {currentSelectedProject && (
        <ProjectDetailModal
          project={currentSelectedProject}
          isOpen={!!currentSelectedProject}
          onClose={() => setSelectedProjectId(null)}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onOpenEditModal={(p) => {
            setEditingProject(p);
            setIsFormModalOpen(true);
          }}
        />
      )}

      {/* Create / Edit Project Modal */}
      <ProjectFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProjectFromForm}
        initialProject={editingProject}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel bg-slate-900/95 border border-indigo-500/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
