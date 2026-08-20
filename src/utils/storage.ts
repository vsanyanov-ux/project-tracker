import type { Project } from '../types/project';
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
      return parsed;
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
