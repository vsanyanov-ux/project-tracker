import type { Project, Priority, ColorTheme } from '../types/project';
import { INITIAL_PROJECTS } from '../data/initialProjects';

const STORAGE_KEY = 'antigravity_projects_data_v1';

export const getStoredProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const yatvInit = INITIAL_PROJECTS.find((p) => p.id === 'proj-yatv');
      let updated = false;

      let merged: Project[] = (parsed as Project[]).map((p: Project): Project => {
        // If user already had a project containing 'ятв', update it with full milestones and schedule
        if (yatvInit && (p.id === 'proj-yatv' || p.title.toLowerCase().includes('ятв'))) {
          updated = true;
          return {
            ...p,
            id: p.id || 'proj-yatv',
            title: p.title || yatvInit.title,
            description: yatvInit.description,
            category: 'Мультимедиа',
            status: p.status || 'in_progress',
            priority: 'urgent' as Priority,
            startDate: yatvInit.startDate,
            deadline: yatvInit.deadline,
            colorTheme: 'rose' as ColorTheme,
            milestones: yatvInit.milestones,
            tasks: yatvInit.tasks,
            notes: yatvInit.notes,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });

      const hasYatv = merged.some((p: Project) => p.id === 'proj-yatv' || p.title.toLowerCase().includes('ятв'));
      if (!hasYatv && yatvInit) {
        merged.unshift(yatvInit);
        updated = true;
      }

      if (updated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    }
    return INITIAL_PROJECTS;
  } catch (err) {
    console.error('Error loading projects from localStorage:', err);
    return INITIAL_PROJECTS;
  }
};

export const saveProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Error saving projects to localStorage:', err);
  }
};

export const resetToDefaultProjects = (): Project[] => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
    return INITIAL_PROJECTS;
  } catch (err) {
    console.error('Error resetting projects:', err);
    return INITIAL_PROJECTS;
  }
};

export const exportProjectsToJson = (projects: Project[]): void => {
  try {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('download', `projects_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (err) {
    console.error('Error exporting projects:', err);
  }
};

export const importProjectsFromJson = (file: File): Promise<Project[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          saveProjects(parsed);
          resolve(parsed);
        } else {
          reject(new Error('Некорректный формат файла. Ожидался массив проектов.'));
        }
      } catch (e) {
        console.error(e);
        reject(new Error('Ошибка чтения JSON файла'));
      }
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsText(file);
  });
};
