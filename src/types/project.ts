export type ProjectStatus =
  | 'backlog'
  | 'in_progress'
  | 'in_review'
  | 'waiting_payment'
  | 'completed'
  | 'on_hold';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export const DEFAULT_CATEGORIES = [
  'Лендинг',
  'Веб-сервис',
  'Автоматизация / Бот',
  'Fullstack / CRM',
  'Мобильное приложение',
  'Дизайн / UI/UX',
  'Мультимедиа',
  'Консалтинг / Аудит'
] as const;

export type ProjectCategory = typeof DEFAULT_CATEGORIES[number] | string;

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  assignedTo?: string;
}

export interface Payment {
  id: string;
  title: string;
  amount: number;
  isPaid: boolean;
  paidDate?: string;
  dueDate?: string;
  notes?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  progress: number; // 0 to 100
  dueDate?: string;
  completed: boolean;
}

export interface ProjectLink {
  id: string;
  title: string;
  url: string;
  type: 'figma' | 'github' | 'live' | 'docs' | 'chat' | 'other';
}

export type ColorTheme = 'purple' | 'cyan' | 'emerald' | 'amber' | 'blue' | 'rose' | 'indigo';

export interface Project {
  id: string;
  title: string;
  description: string;
  client: string;
  clientContact?: string;
  category: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  totalBudget: number;
  currency: string;
  payments: Payment[];
  tasks: Task[];
  milestones: ProjectMilestone[];
  links: ProjectLink[];
  notes: string;
  colorTheme: ColorTheme;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  search: string;
  status: string;
  category: string;
  priority: string;
  sortBy: 'deadline' | 'progress' | 'budget' | 'title' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

export type ViewMode = 'grid' | 'kanban' | 'table';