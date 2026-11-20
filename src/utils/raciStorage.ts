import type { 
  RaciMatrixRow, 
  RaciStorageState, 
  ClientCardArtifact, 
  ChecklistItem, 
  DecisionLogEntry, 
  WeeklyReportData 
} from '../types/raci';

export const RACI_MATRIX_DATA: RaciMatrixRow[] = [
  {
    id: 'raci-0',
    task: 'Привлечь клиники и продать AI Admin (B2B)',
    category: 'growth',
    founder: 'I',
    growth: 'A + R',
    productOwner: 'C',
    engineer: '—',
    clientCosmetologist: '—',
    description: 'Лидогенерация, холодный аутрич, проведение демо-созвонов и закрытие сделок с владельцами клиник.',
    ruleHint: 'Вы как Growth (A+R) единолично отвечаете за наполнение воронки продаж и деньги от новых клиник.'
  },
  {
    id: 'raci-01',
    task: 'Упаковать кейсы и офферы вашего агентства',
    category: 'growth',
    founder: 'A',
    growth: 'A + R',
    productOwner: 'C',
    engineer: '—',
    clientCosmetologist: 'C',
    description: 'Оцифровка результатов возвращенной выручки (Gladkaya, Forma) в продающие кейсы и презентации.',
    ruleHint: 'Founder утверждает позиционирование (A), Growth создает конверсионные материалы и статьи (A+R).'
  },
  {
    id: 'raci-1',
    task: 'Выбрать сегмент и ценность продукта',
    category: 'strategy',
    founder: 'A',
    growth: 'R',
    productOwner: 'R',
    engineer: 'C',
    clientCosmetologist: 'C',
    description: 'Определить нишу, позиционирование, ценовую модель и какую ценность AI Admin дает клинике.',
    ruleHint: 'Вы как Founder единолично отвечаете (A) за выбор бизнес-модели и сегмента клиентов.'
  },
  {
    id: 'raci-11',
    task: 'Разработать оффер и копирайтинг для пациентов',
    category: 'growth',
    founder: 'I',
    growth: 'A',
    productOwner: 'R',
    engineer: '—',
    clientCosmetologist: 'C',
    description: 'Формулирование триггерного оффера (подарочный депозит вместо скидки) и психология первого касания.',
    ruleHint: 'Growth отвечает (A) за отклик и конверсию в диалог, косметолог консультирует (C) по маржинальности.'
  },
  {
    id: 'raci-2',
    task: 'Согласовать сценарий возврата клиентов',
    category: 'product',
    founder: 'I',
    growth: 'C',
    productOwner: 'A',
    engineer: 'R',
    clientCosmetologist: 'C',
    description: 'Прописать шаги диалога бота: реактивация «спящих» 90+ дней, ответы на частые вопросы, мягкая запись.',
    ruleHint: 'Product Owner отвечает (A) за логику скрипта и пользовательский опыт пациента.'
  },
  {
    id: 'raci-3',
    task: 'Настроить агент / рассылку',
    category: 'engineering',
    founder: 'I',
    growth: 'I',
    productOwner: 'C',
    engineer: 'A + R',
    clientCosmetologist: 'I',
    description: 'Подключение WhatsApp/Telegram API, CRM (AlfaCRM/YClients), баз данных, промптов и лимитов отправки.',
    ruleHint: 'Инженер полностью владеет технологией (A+R). Ошибки кода и блокировки номеров — зона инженера.'
  },
  {
    id: 'raci-4',
    task: 'Проверить тексты, сегменты, consent',
    category: 'compliance',
    founder: 'I',
    growth: 'R',
    productOwner: 'R',
    engineer: 'R',
    clientCosmetologist: 'A',
    description: 'Юридическая проверка: согласия пациентов (152-ФЗ), корректность медицинских названий и скидки.',
    ruleHint: '🛑 ТОЛЬКО КЛИЕНТ (A)! Вы не вправе сами решать медицинские формулировки и спамить без согласия.'
  },
  {
    id: 'raci-5',
    task: 'Запустить кампанию (Пилот 20–50 ➔ Масштаб)',
    category: 'operations',
    founder: 'I',
    growth: 'C',
    productOwner: 'C',
    engineer: 'R',
    clientCosmetologist: 'A',
    description: 'Финальное нажатие кнопки старта после пилотного теста на 20–50 контактов.',
    ruleHint: '🛑 КЛИЕНТ — A! Финальный аппрув на отправку по реальным пациентам дает только владелец клиники.'
  },
  {
    id: 'raci-6',
    task: 'Обработать входящие записи и лиды',
    category: 'operations',
    founder: 'I',
    growth: 'R',
    productOwner: 'C',
    engineer: 'R',
    clientCosmetologist: 'A + R',
    description: 'Прием лидов от бота, звонок-подтверждение, запись в график клиники и встреча пациента.',
    ruleHint: 'Клиника и её ресепшен (A+R) встречают гостей и конвертируют диалог бота в реальный визит.'
  },
  {
    id: 'raci-7',
    task: 'Отчитаться по возврату клиентов и выручке',
    category: 'analytics',
    founder: 'A',
    growth: 'R',
    productOwner: 'R',
    engineer: 'R',
    clientCosmetologist: 'I',
    description: 'Свести воронку: база → доставлено → ответили → записались → дошли → кассовая выручка клиники.',
    ruleHint: 'Вы как Founder (A) защищаете ценность перед клиентом и показываете окупаемость системы.'
  },
  {
    id: 'raci-8',
    task: 'Решить, масштабировать ли кампанию',
    category: 'strategy',
    founder: 'A',
    growth: 'R',
    productOwner: 'R',
    engineer: 'C',
    clientCosmetologist: 'C',
    description: 'Оценить юнит-экономику и решить, подключать ли филиалы клиники или расширять базу до 2 000+ контактов.',
    ruleHint: 'Стратегическое решение о масштабировании принимает Founder (A) на основе цифр ROI.'
  }
];

export const INITIAL_CLIENT_CARD: ClientCardArtifact = {
  id: 'card-gladkaya-01',
  clientName: 'Клиника эстетической косметологии «Gladkaya»',
  clinicName: 'Gladkaya Beauty Lab',
  contactPerson: 'Доктор Анна (Главный врач / Собственник)',
  contactPhone: '+7 (999) 456-78-90',
  approverName: 'Анна Сергеевна Гладкая',
  approverRole: 'Владелец клиники / Главврач',
  isApprovedWritten: true,
  campaignGoal: 'Реактивация спящей базы (пациенты, не посещавшие клинику от 90 до 180 дней) на сезонные уходовые протоколы и пилинги.',
  targetAudience: 'Спящие клиенты >90 дней, средний чек прошлого года от 4 500 ₽, без активных записей в CRM.',
  databaseSize: 348,
  channel: 'WhatsApp',
  offerDescription: '«Персональный подарочный депозит 1 500 ₽ на осенне-зимний восстанавливающий протокол или комбинированную чистку при бронировании времени до конца недели».',
  budget: 25000,
  targetKpi: 'Не менее 15 подтвержденных записей, выручка от 90 000 ₽, конверсия в диалог > 18%.',
  backupAdminName: 'Екатерина (Старший администратор ресепшена, тел. +7 999 111-22-33)',
  notes: 'Согласие на рассылку утверждено в WhatsApp 19 ноября. Лимит отправки: не более 50 сообщений в день с 10:30 до 19:00 для защиты от спам-фильтров.',
  createdAt: '2026-11-19T10:00:00.000Z',
  updatedAt: '2026-11-20T08:00:00.000Z'
};

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: 'chk-1',
    category: 'data',
    title: 'Очистка и сегментация базы клиентов',
    description: 'База выгружена из CRM, удалены дубли, проверены валидные номера телефонов, исключены активные пациенты с визитами за последние 90 дней.',
    completed: true,
    requiredForLaunch: true
  },
  {
    id: 'chk-2',
    category: 'consent',
    title: 'Проверка согласий на коммуникацию (Consent & 152-ФЗ)',
    description: 'Клиент-косметолог подтвердил, что контакты давали согласие на информирование в договоре оказания услуг клиники.',
    completed: true,
    requiredForLaunch: true
  },
  {
    id: 'chk-3',
    category: 'content',
    title: 'Письменное утверждение текстов и оффера косметологом',
    description: 'Текст первого сообщения, повод обращения и условия спецпредложения зафиксированы и письменно согласованы с собственником.',
    completed: true,
    requiredForLaunch: true
  },
  {
    id: 'chk-4',
    category: 'links',
    title: 'Тест переменных персонализации и ссылок',
    description: 'Отправлены тестовые сообщения на 3 номера команды: имя клиента, ссылка на онлайн-запись и номер клиники подставляются без ошибок.',
    completed: true,
    requiredForLaunch: true
  },
  {
    id: 'chk-5',
    category: 'pilot',
    title: 'Пилотный запуск на 20–50 контактов (Стресс-тест)',
    description: 'Первый батч отправлен строго на 25 контактов. Ответы проверены вручную, замерена реакция, жалоб и спам-блокировок нет.',
    completed: true,
    requiredForLaunch: true
  },
  {
    id: 'chk-6',
    category: 'handoff',
    title: 'Резервная передача диалога живому администратору',
    description: 'Проверена эскалация: при словах «жалоба», «аллергия», «срочно», бот замолкает и отправляет уведомление старшему админу Екатерине.',
    completed: true,
    requiredForLaunch: true
  }
];

export const INITIAL_DECISION_LOG: DecisionLogEntry[] = [
  {
    id: 'dec-1',
    date: '2026-11-19',
    decision: 'Отправлять подарочный депозит 1 500 ₽ вместо скидки 30%',
    rationale: 'Скидка в % обесценивает премиальный статус клиники, а фиксированный депозит стимулирует высокий средний чек от 6 000 ₽.',
    approvedBy: 'Доктор Анна (Владелец клиники)',
    approverRole: 'Клиент-косметолог',
    reviewDate: '2026-12-05',
    status: 'active'
  },
  {
    id: 'dec-2',
    date: '2026-11-19',
    decision: 'Лимит скорости отправки: 50 сообщений в день с рандомным интервалом 40–90 секунд',
    rationale: 'Предотвращение бана WhatsApp Business номера и снижение пиковой нагрузки на дежурного администратора клиники.',
    approvedBy: 'Вы (как AI Engineer)',
    approverRole: 'Вы как Engineer',
    reviewDate: '2026-11-26',
    status: 'active'
  },
  {
    id: 'dec-3',
    date: '2026-11-18',
    decision: 'Фокус исключительно на пациентах с интервалом отсутствия 90–180 дней',
    rationale: 'Пациенты >360 дней имеют конверсию <3%, а 90–180 дней — самая «горячая» спящая база с максимальным LTV.',
    approvedBy: 'Вы (как Product Owner)',
    approverRole: 'Вы как Product Owner',
    reviewDate: '2026-12-10',
    status: 'active'
  }
];

export const INITIAL_WEEKLY_REPORT: WeeklyReportData = {
  id: 'rep-wk-1',
  periodTitle: 'Неделя 1 (Пилотный запуск и первая сотня)',
  clientName: 'Клиника «Gladkaya»',
  totalContacts: 348,
  deliveredCount: 332,
  dialogStartedCount: 78,
  appointmentsBookedCount: 22,
  visitsCompletedCount: 16,
  generatedRevenue: 104500,
  averageTicket: 6531,
  issuesList: [
    '3 пациента переспросили о противопоказаниях к пилингу — бот корректно перевел на живого администратора.',
    '2 контакта попросили больше не писать — добавлены в стоп-лист мгновенно.',
    'В пятницу вечером администратор отвечала с задержкой 40 минут — настроили автоответ бота о нерабочем времени.'
  ],
  nextWeekPlan: 'Запустить вторую когорту базы (150 контактов), протестировать напоминание тем, кто начал диалог, но не выбрал точное время записи.'
};

const RACI_STORAGE_KEY = 'antigravity_raci_state_v1';

export function getStoredRaciData(): RaciStorageState {
  try {
    const raw = localStorage.getItem(RACI_STORAGE_KEY);
    if (!raw) {
      const initial: RaciStorageState = {
        clientCard: INITIAL_CLIENT_CARD,
        checklist: INITIAL_CHECKLIST,
        decisionLog: INITIAL_DECISION_LOG,
        weeklyReport: INITIAL_WEEKLY_REPORT
      };
      localStorage.setItem(RACI_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as RaciStorageState;
  } catch (err) {
    console.error('Failed to load RACI state:', err);
    return {
      clientCard: INITIAL_CLIENT_CARD,
      checklist: INITIAL_CHECKLIST,
      decisionLog: INITIAL_DECISION_LOG,
      weeklyReport: INITIAL_WEEKLY_REPORT
    };
  }
}

export function saveRaciData(state: RaciStorageState): void {
  try {
    localStorage.setItem(RACI_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save RACI state:', err);
  }
}

export function resetRaciData(): RaciStorageState {
  const initial: RaciStorageState = {
    clientCard: INITIAL_CLIENT_CARD,
    checklist: INITIAL_CHECKLIST,
    decisionLog: INITIAL_DECISION_LOG,
    weeklyReport: INITIAL_WEEKLY_REPORT
  };
  try {
    localStorage.setItem(RACI_STORAGE_KEY, JSON.stringify(initial));
  } catch {}
  return initial;
}
