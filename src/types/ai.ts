export type DeepSeekModel = 'deepseek-chat' | 'deepseek-reasoner';

export interface AiProjectBreakdown {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  suggestedBudget: number;
  estimatedDays: number;
  tasks: Array<{ title: string }>;
  milestones: Array<{ title: string; progress: number }>;
  payments: Array<{ title: string; amount: number }>;
  recommendations?: string[];
}

export interface AiAuditResult {
  status: 'healthy' | 'warning' | 'critical';
  score: number; // 0 to 100
  summary: string;
  bottlenecks: string[];
  recommendations: string[];
  analyzedAt: string;
}

export type AiClientUpdateMode = 
  | 'weekly_report' 
  | 'payment_reminder' 
  | 'milestone_done' 
  | 'gentle_followup';

export interface AiExtractedTask {
  title: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}
