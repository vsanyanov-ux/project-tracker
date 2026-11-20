export type RaciRole = 
  | 'founder' 
  | 'product_owner' 
  | 'engineer' 
  | 'client_cosmetologist' 
  | 'clinic_admin';

export type RaciCode = 'A' | 'R' | 'C' | 'I' | 'A + R' | '—';

export interface RaciMatrixRow {
  id: string;
  task: string;
  category: 'strategy' | 'product' | 'engineering' | 'compliance' | 'operations' | 'analytics';
  founder: RaciCode;
  productOwner: RaciCode;
  engineer: RaciCode;
  clientCosmetologist: RaciCode;
  clinicAdmin?: RaciCode;
  description: string;
  ruleHint: string;
}

export interface ClientCardArtifact {
  id: string;
  clientName: string;
  clinicName: string;
  contactPerson: string;
  contactPhone: string;
  approverName: string; // Владелец решения (Accountable)
  approverRole: string; // Например, Главврач / Владелец клиники
  isApprovedWritten: boolean; // Письменное согласие получено?
  campaignGoal: string; // Цель кампании
  targetAudience: string; // Сегмент базы
  databaseSize: number; // Количество контактов в спящей базе
  channel: 'WhatsApp' | 'Telegram' | 'SMS' | 'Комбинированный';
  offerDescription: string; // Текст оффера / спецпредложения
  budget: number; // Бюджет кампании (руб)
  targetKpi: string; // Целевой KPI (например, 15 записей, выручка > 90к)
  backupAdminName: string; // Дежурный администратор клиники для перехвата
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  category: 'data' | 'consent' | 'content' | 'links' | 'pilot' | 'handoff';
  title: string;
  description: string;
  completed: boolean;
  requiredForLaunch: boolean;
}

export interface DecisionLogEntry {
  id: string;
  date: string;
  decision: string;
  rationale: string;
  approvedBy: string; // Кто утвердил (A)
  approverRole: 'Клиент-косметолог' | 'Вы как Founder' | 'Вы как Product Owner' | 'Вы как Engineer';
  reviewDate: string; // Когда пересматриваем
  status: 'active' | 'in_review' | 'archived';
}

export interface WeeklyReportData {
  id: string;
  periodTitle: string; // Например, «Неделя 1 (18–24 ноября 2026)»
  clientName: string;
  totalContacts: number; // Всего контактов в базе
  deliveredCount: number; // Доставлено
  dialogStartedCount: number; // Начали диалог с ботом
  appointmentsBookedCount: number; // Записались на прием
  visitsCompletedCount: number; // Дошли до клиники и оплатили
  generatedRevenue: number; // Выручка клиники (руб)
  averageTicket: number; // Средний чек (руб)
  issuesList: string[]; // Список проблем и инцидентов
  nextWeekPlan: string; // План на следующую неделю
}

export interface RaciStorageState {
  clientCard: ClientCardArtifact;
  checklist: ChecklistItem[];
  decisionLog: DecisionLogEntry[];
  weeklyReport: WeeklyReportData;
}
