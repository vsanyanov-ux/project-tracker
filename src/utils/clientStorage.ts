import type { Client, ClientStats, ClientStatus } from '../types/client';
import type { Project } from '../types/project';

const CLIENTS_STORAGE_KEY = 'antigravity_clients_data_v1';

export const getStoredClients = (): Client[] => {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading clients from localStorage:', err);
    return [];
  }
};

export const saveClients = (clients: Client[]): void => {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (err) {
    console.error('Error saving clients to localStorage:', err);
  }
};

export const calculateClientStats = (client: Client, projects: Project[]): ClientStats => {
  const normName = client.name.trim().toLowerCase();
  const normCompany = client.company ? client.company.trim().toLowerCase() : '';

  const matchedProjects = projects.filter((p) => {
    const pClient = p.client.trim().toLowerCase();
    return pClient === normName || (normCompany && pClient === normCompany);
  });

  const totalProjectsCount = matchedProjects.length;
  const activeProjectsCount = matchedProjects.filter(
    (p) => p.status !== 'completed' && p.status !== 'cancelled'
  ).length;
  const completedProjectsCount = matchedProjects.filter((p) => p.status === 'completed').length;

  let totalRevenueLtv = 0;
  let totalContractValue = 0;
  let latestActivity: string | undefined = client.updatedAt || client.createdAt;

  matchedProjects.forEach((p) => {
    if (p.status !== 'cancelled') {
      totalContractValue += p.totalBudget || 0;
    }
    (p.payments || []).forEach((pay) => {
      if (pay.isPaid) {
        totalRevenueLtv += pay.amount || 0;
      }
    });

    if (p.updatedAt && (!latestActivity || p.updatedAt > latestActivity)) {
      latestActivity = p.updatedAt;
    }
  });

  const pendingDebt = Math.max(0, totalContractValue - totalRevenueLtv);

  // Check if follow up is due (today or in the past)
  let isFollowUpDue = false;
  if (client.nextFollowUp) {
    const today = new Date().toISOString().split('T')[0];
    isFollowUpDue = client.nextFollowUp <= today;
  }

  return {
    totalProjectsCount,
    activeProjectsCount,
    completedProjectsCount,
    totalRevenueLtv,
    totalContractValue,
    pendingDebt,
    lastActivityDate: latestActivity,
    isFollowUpDue
  };
};

export const seedClientsFromProjects = (projects: Project[], existingClients: Client[]): Client[] => {
  const existingNames = new Set(
    existingClients.map((c) => c.name.trim().toLowerCase())
  );

  const newClients: Client[] = [];

  projects.forEach((p) => {
    const rawName = p.client.trim();
    if (!rawName) return;

    const norm = rawName.toLowerCase();
    if (existingNames.has(norm)) return;

    existingNames.add(norm);

    // Guess contact details
    let telegram: string | undefined;
    let phone: string | undefined;
    let email: string | undefined;

    const contact = (p.clientContact || '').trim();
    if (contact.startsWith('@') || contact.includes('t.me/')) {
      telegram = contact;
    } else if (contact.includes('@')) {
      email = contact;
    } else if (/[\d+]{7,}/.test(contact)) {
      phone = contact;
    } else if (contact) {
      telegram = contact;
    }

    // Determine status
    let status: ClientStatus = 'regular';
    const clientProjects = projects.filter((item) => item.client.trim().toLowerCase() === norm);
    const hasActive = clientProjects.some((item) => item.status !== 'completed' && item.status !== 'cancelled');
    const totalPaid = clientProjects.reduce(
      (sum, item) => sum + (item.payments || []).filter((pm) => pm.isPaid).reduce((s, pm) => s + pm.amount, 0),
      0
    );

    if (totalPaid >= 300000) {
      status = 'vip';
    } else if (hasActive) {
      status = 'active';
    } else if (clientProjects.every((item) => item.status === 'completed')) {
      status = 'regular';
    }

    const categories = Array.from(new Set(clientProjects.map((item) => item.category).filter(Boolean)));

    newClients.push({
      id: 'client-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: rawName,
      company: rawName.includes('ИП ') || rawName.includes('ООО ') ? rawName : undefined,
      telegram,
      phone,
      email,
      status,
      tags: categories,
      notes: `Клиент импортирован из проектов трекера. Связанных проектов: ${clientProjects.length}.`,
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  return [...existingClients, ...newClients];
};
