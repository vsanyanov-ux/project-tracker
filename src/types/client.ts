export type ClientStatus = 'lead' | 'active' | 'regular' | 'vip' | 'dormant';

export interface Client {
  id: string;
  name: string;
  company?: string;
  contactPerson?: string;
  telegram?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: ClientStatus;
  notes?: string;
  tags?: string[];
  nextFollowUp?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface ClientStats {
  totalProjectsCount: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  totalRevenueLtv: number; // Общая сумма оплаченных счетов
  totalContractValue: number; // Общая сумма всех контрактов
  pendingDebt: number; // Ожидает оплаты
  lastActivityDate?: string;
  isFollowUpDue: boolean;
}

export type ClientSortBy = 'ltv' | 'projects' | 'name' | 'followUp' | 'updatedAt';
