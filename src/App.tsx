import { useState, useEffect, useMemo } from 'react';
import type { Project, ProjectStatus, FilterOptions, ViewMode } from './types/project';
import { DEFAULT_CATEGORIES } from './types/project';
import { getStoredProjects, saveProjects, resetToDefaultProjects, exportProjectsToJson, importProjectsFromJson } from './utils/storage';
import { BackgroundGlow } from './components/BackgroundGlow';
import { Header } from './components/Header';
import { FinancialSummary } from './components/FinancialSummary';
import { ProjectCard } from './components/ProjectCard';
import { KanbanBoard } from './components/KanbanBoard';
import { ProjectTableView } from './components/ProjectTableView';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ProjectFormModal } from './components/ProjectFormModal';
import { Plus, FolderSearch, CheckCircle } from 'lucide-react';

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
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

  // Unique Categories list (including default presets)
  const categories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  // Filtered and Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
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

      // Status
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
  }, [projects, filters]);

  // CRUD Operations
  const handleUpdateProject = (updated: Project) => {
    const updatedList = projects.map((p) => (p.id === updated.id ? updated : p));
    setProjects(updatedList);
    saveProjects(updatedList);
    showToast(`Проект "${updated.title}" обновлен`);
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
    showToast('Статус проекта обновлен');
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
        />

        {/* Top Financial & Analytics Summary Bar */}
        <FinancialSummary 
          projects={projects}
          onFilterStatus={(st) => handleFilterChange({ status: st })}
        />

        {/* View Content: Grid / Kanban / Table */}
        {filteredProjects.length === 0 ? (
          /* Empty State */
          <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 max-w-xl mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
              <FolderSearch className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Проекты не найдены</h3>
            <p className="text-xs text-slate-400 mb-6">
              По вашему запросу и выбранным фильтрам ничего не найдено. Попробуйте сбросить фильтры или добавить новый проект.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setFilters({ search: '', status: 'all', category: 'all', priority: 'all', sortBy: 'deadline', sortOrder: 'asc' })}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-all"
              >
                Сбросить фильтры
              </button>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsFormModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
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
