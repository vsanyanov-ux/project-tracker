import type { 
  RaciMatrixRow, 
  RaciStorageState, 
  ClientCardArtifact, 
  ChecklistItem, 
  DecisionLogEntry, 
  WeeklyReportData,
  SavedRaciAiTask
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

export const INITIAL_AI_RACI_HISTORY: SavedRaciAiTask[] = [
  {
    id: 'ai-task-vps-migration',
    createdAt: '2026-11-20T09:05:00.000Z',
    rawPrompt: 'Перенести базу пациентов и сайт с турецкого сервера на российский VPS по 152-ФЗ',
    result: {
      taskSummary: 'Миграция баз данных пациентов и сервисов AI Admin с турецкого VPS на российский хостинг (Timeweb Cloud/Selectel) для полного соблюдения 152-ФЗ и 242-ФЗ.',
      hatsSequence: [
        {
          role: 'Founder',
          stage: 'Шаг 1: Оценка юридических рисков и бюджета',
          action: 'Выбрать российского облачного провайдера (Timeweb Cloud / Selectel) с аттестатом защиты ПДн в локации Москва/СПб и оплатить базовый VPS.',
          hatExplanation: 'Затрагивает финансы, юридическую ответственность и стратегию компании.'
        },
        {
          role: 'Product Owner',
          stage: 'Шаг 2: Планирование бесшовного окна миграции',
          action: 'Назначить техническое окно миграции на глубокую ночь (02:00–05:00 МСК), когда боты не ведут диалогов, и зафиксировать сохранность сессий WhatsApp.',
          hatExplanation: 'Защищает клиентский опыт клиник и исключает сбои в расписании.'
        },
        {
          role: 'Engineer',
          stage: 'Шаг 3: Технический перенос и развертывание Docker',
          action: 'Создать резервную копию *.db и .wwebjs_auth на турецком сервере, передать по SCP на сервер в РФ и поднять docker compose up -d.',
          hatExplanation: 'Чистая техническая реализация по инженерному регламенту.'
        },
        {
          role: 'QA',
          stage: 'Шаг 4: Приемочное тестирование до смены DNS',
          action: 'Проверить здоровье моста WhatsApp (healthy), целостность баз клиник Gladkaya и Forma, запустить диагностику core.doctor --strict.',
          hatExplanation: 'Контроль качества перед пуском боевого пациентского трафика.'
        },
        {
          role: 'Engineer',
          stage: 'Шаг 5: Переключение доменов и SSL',
          action: 'Перенаправить DNS-записи на новый IP-адрес сервера в РФ и выпустить SSL-сертификаты Certbot/Let\'s Encrypt.',
          hatExplanation: 'Финальный технический ввод в эксплуатацию.'
        }
      ],
      raciBreakdown: {
        accountable: 'Вы как Founder (за соблюдение 152-ФЗ и выбор хостинга)',
        responsible: 'Вы как Engineer (за перенос файлов, Nginx и запуск Docker)',
        consulted: 'Клиент-косметолог (если требуется уведомить об изменении тех. условий)',
        informed: 'Администраторы клиник (уведомление об успешном переезде)'
      },
      risksAndStopFlags: {
        requiresClientApproval: false,
        requiresPilotTest: false,
        warningText: 'Критически важно выполнить остановку контейнеров перед копированием SQLite баз, чтобы избежать рассинхронизации данных пациентов.'
      },
      actionChecklist: [
        { title: 'Арендовать и настроить VPS Ubuntu в РФ (Timeweb/Selectel)', roleTag: 'Founder', required: true },
        { title: 'Снять полный бэкап баз gladkaya.db, forma.db и сессий .wwebjs_auth', roleTag: 'Engineer', required: true },
        { title: 'Перенести архив на сервер в РФ и развернуть docker compose up -d', roleTag: 'Engineer', required: true },
        { title: 'Проверить авторизацию WhatsApp и запустить core.doctor --strict', roleTag: 'QA', required: true },
        { title: 'Переключить DNS и выпустить SSL сертификаты', roleTag: 'Engineer', required: true }
      ],
      decisionLogDraft: {
        decision: 'Перенос баз пациентов и сервисов AI Admin на российский VPS (152-ФЗ)',
        rationale: 'Устранение рисков блокировки РКН и штрафов до 6 млн ₽ по 242-ФЗ о локализации ПДн граждан РФ.',
        approvedBy: 'Вы (как Founder / Compliance)',
        approverRole: 'Вы как Founder'
      }
    },
    isChecklistAdded: true,
    isDecisionAdded: true
  }
];

const AI_RACI_HISTORY_KEY = 'antigravity_raci_ai_history_v1';
const AI_RACI_ACTIVE_ID_KEY = 'antigravity_raci_ai_active_id_v1';

export function getStoredAiRaciHistory(): SavedRaciAiTask[] {
  try {
    const raw = localStorage.getItem(AI_RACI_HISTORY_KEY);
    if (!raw) {
      localStorage.setItem(AI_RACI_HISTORY_KEY, JSON.stringify(INITIAL_AI_RACI_HISTORY));
      return INITIAL_AI_RACI_HISTORY;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_AI_RACI_HISTORY;
  } catch (err) {
    console.error('Failed to load AI RACI history:', err);
    return INITIAL_AI_RACI_HISTORY;
  }
}

export function saveAiRaciHistory(history: SavedRaciAiTask[]): void {
  try {
    localStorage.setItem(AI_RACI_HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save AI RACI history:', err);
  }
}

export function getStoredActiveAiTaskId(): string | null {
  try {
    return localStorage.getItem(AI_RACI_ACTIVE_ID_KEY);
  } catch {
    return null;
  }
}

export function saveActiveAiTaskId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(AI_RACI_ACTIVE_ID_KEY, id);
    } else {
      localStorage.removeItem(AI_RACI_ACTIVE_ID_KEY);
    }
  } catch {}
}
