import type { 
  AiProjectBreakdown, 
  AiAuditResult, 
  AiClientUpdateMode, 
  AiExtractedTask, 
  DeepSeekModel 
} from '../types/ai';
import type { Project } from '../types/project';
import { calculateProjectFinancials, calculateProjectProgress, getDeadlineStatus } from '../utils/formatters';

const STORAGE_KEY_API_KEY = 'project_tracker_deepseek_api_key';
const STORAGE_KEY_MODEL = 'project_tracker_deepseek_model';

const DIRECT_API_URL = 'https://api.deepseek.com/chat/completions';
const PROXY_API_URL = '/api/deepseek/chat/completions';

export function getDeepSeekApiKey(): string {
  return localStorage.getItem(STORAGE_KEY_API_KEY) || '';
}

export function setDeepSeekApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
}

export function getDeepSeekModel(): DeepSeekModel {
  const model = localStorage.getItem(STORAGE_KEY_MODEL);
  return (model === 'deepseek-reasoner' ? 'deepseek-reasoner' : 'deepseek-chat') as DeepSeekModel;
}

export function setDeepSeekModel(model: DeepSeekModel): void {
  localStorage.setItem(STORAGE_KEY_MODEL, model);
}

export function hasDeepSeekConfigured(): boolean {
  return getDeepSeekApiKey().length > 0;
}

export function clearDeepSeekConfig(): void {
  localStorage.removeItem(STORAGE_KEY_API_KEY);
  localStorage.removeItem(STORAGE_KEY_MODEL);
}

interface RequestOptions {
  apiKey?: string;
  model?: DeepSeekModel;
  json?: boolean;
  temperature?: number;
}

/**
 * Low-level chat completion call to DeepSeek
 */
export async function callDeepSeekChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: RequestOptions = {}
): Promise<string> {
  const apiKey = options.apiKey || getDeepSeekApiKey();
  if (!apiKey) {
    throw new Error('API-ключ DeepSeek не задан. Пожалуйста, укажите его в настройках AI.');
  }

  const model = options.model || getDeepSeekModel();
  const isReasoner = model === 'deepseek-reasoner';

  const payload: Record<string, unknown> = {
    model,
    messages,
  };

  // deepseek-reasoner doesn't support temperature or json_object format in certain endpoints
  if (!isReasoner) {
    if (options.temperature !== undefined) {
      payload.temperature = options.temperature;
    }
    if (options.json) {
      payload.response_format = { type: 'json_object' };
    }
  }

  // Try direct API first; in dev fallback to Vite proxy if CORS fails
  const endpoints = [DIRECT_API_URL, PROXY_API_URL];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errDetails = '';
        try {
          const errData = await response.json();
          errDetails = errData?.error?.message || response.statusText;
        } catch {
          errDetails = response.statusText;
        }

        if (response.status === 401) {
          throw new Error('Неверный API-ключ DeepSeek. Проверьте правильность ключа в настройках.');
        } else if (response.status === 402) {
          throw new Error('Недостаточно средств на балансе DeepSeek аккаунта.');
        } else if (response.status === 429) {
          throw new Error('Превышен лимит запросов (Rate Limit) DeepSeek. Попробуйте через пару секунд.');
        } else {
          throw new Error(`Ошибка DeepSeek (${response.status}): ${errDetails}`);
        }
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== 'string') {
        throw new Error('DeepSeek вернул пустой или некорректный ответ.');
      }
      return content;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      // If it's a fetch network error and we have another endpoint to try, continue
      if (endpoint === DIRECT_API_URL && (error.message.includes('Failed to fetch') || error.name === 'TypeError')) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('Не удалось связаться с сервером DeepSeek.');
}

/**
 * Test connectivity and key validity
 */
export async function testDeepSeekConnection(
  testKey?: string,
  testModel?: DeepSeekModel
): Promise<{ success: boolean; message: string }> {
  try {
    const reply = await callDeepSeekChat(
      [
        { role: 'system', content: 'Ответь ровно одним словом: OK' },
        { role: 'user', content: 'ping' }
      ],
      {
        apiKey: testKey,
        model: testModel || 'deepseek-chat',
        temperature: 0.1
      }
    );

    if (reply.toLowerCase().includes('ok')) {
      return { success: true, message: 'Подключение к DeepSeek успешно установлено!' };
    }
    return { success: true, message: `Подключение успешно: "${reply.trim().slice(0, 50)}"` };
  } catch (err) {
    return { 
      success: false, 
      message: err instanceof Error ? err.message : 'Неизвестная ошибка проверки подключения' 
    };
  }
}

/**
 * 1. AI-Декомпозитор проектов из свободной фразы / ТЗ
 */
export async function generateProjectFromPrompt(
  prompt: string,
  categories: string[] = []
): Promise<AiProjectBreakdown> {
  const systemPrompt = `Ты — ведущий Senior Project Manager и архитектор цифровых проектов.
Пользователь описывает проект своими словами. Ты должен декомпозировать его в профессиональный структурированный план.

Доступные категории проектов (выбери наиболее подходящую или предложи точную):
${categories.join(', ')}

Верни СТРОГО JSON-объект следующей структуры:
{
  "title": "Ёмкое, презентабельное название проекта (до 50 символов)",
  "description": "Четкое описание скоупа проекта и ценности для клиента (2-4 предложения)",
  "category": "Подходящая категория",
  "priority": "medium" (выбери: "low", "medium", "high", "urgent"),
  "suggestedBudget": 75000 (число в рублях, адекватная рыночная оценка если не указано явно),
  "estimatedDays": 14 (реалистичный срок разработки в календарных днях),
  "tasks": [
    { "title": "1. Согласование структуры и интерактивного прототипа" },
    { "title": "2. UI/UX дизайн ключевых экранов" },
    { "title": "3. Разработка фронтенда и анимаций" },
    { "title": "4. Бэкенд, базы данных и интеграции" },
    { "title": "5. QA тестирование и выкатка на прод" }
  ],
  "milestones": [
    { "title": "Прототип и дизайн", "progress": 0 },
    { "title": "Базовый функционал (MVP)", "progress": 0 },
    { "title": "Релиз и передача клиенту", "progress": 0 }
  ],
  "payments": [
    { "title": "Предоплата 40% (старт работ)", "amount": 30000 },
    { "title": "Промежуточный платеж 30% (согласование MVP)", "amount": 22500 },
    { "title": "Финальный расчет 30% (передача исходников)", "amount": 22500 }
  ],
  "recommendations": [
    "Совет по стеку или рискам реализации"
  ]
}

Важно:
1. Задачи должны быть конкретными и практичными (5-8 задач).
2. Сумма платежей должна строго равняться suggestedBudget!
3. Верни только валидный JSON, без markdown-разметки кодовых блоков.`;

  const rawJson = await callDeepSeekChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Вот описание проекта от заказчика/фрилансера:\n${prompt}` }
    ],
    { json: true, temperature: 0.5 }
  );

  try {
    const cleaned = cleanJsonString(rawJson);
    const parsed = JSON.parse(cleaned) as AiProjectBreakdown;

    // Safety checks & normalizations
    if (!parsed.title) parsed.title = 'Новый проект';
    if (!Array.isArray(parsed.tasks)) parsed.tasks = [];
    if (!Array.isArray(parsed.milestones)) parsed.milestones = [];
    if (!Array.isArray(parsed.payments)) parsed.payments = [];
    if (!parsed.suggestedBudget || parsed.suggestedBudget <= 0) {
      parsed.suggestedBudget = 50000;
    }
    if (!parsed.estimatedDays || parsed.estimatedDays <= 0) {
      parsed.estimatedDays = 14;
    }

    return parsed;
  } catch (err) {
    console.error('Failed to parse AI project breakdown:', rawJson, err);
    throw new Error('ИИ вернул ответ в непредвиденном формате. Попробуйте уточнить запрос.');
  }
}

/**
 * 2. AI-Копирайтер для клиентов: создание отчетов, напоминаний об оплате, поздравлений
 */
export async function generateClientCommunication(params: {
  project: Project;
  mode: AiClientUpdateMode;
  customNote?: string;
}): Promise<string> {
  const { project, mode, customNote } = params;
  const { paid, owed, total } = calculateProjectFinancials(project);
  const progress = calculateProjectProgress(project);
  const deadlineInfo = getDeadlineStatus(project.deadline, project.status);

  const completedTasks = project.tasks.filter(t => t.completed).map(t => t.title);
  const pendingTasks = project.tasks.filter(t => !t.completed).map(t => t.title);

  const contextPrompt = `
ДАННЫЕ О ПРОЕКТЕ:
- Название проекта: "${project.title}"
- Имя клиента: "${project.client || 'Клиент'}"
- Категория: "${project.category}"
- Дедлайн: ${project.deadline} (${deadlineInfo.label})
- Общий бюджет: ${total} ${project.currency}
- Оплачено: ${paid} ${project.currency}
- Остаток к оплате (долг): ${owed} ${project.currency}
- Прогресс: ${progress}%
- Выполненные задачи (${completedTasks.length}):
${completedTasks.length > 0 ? completedTasks.map(t => `  ✓ ${t}`).join('\n') : '  (пока нет завершенных задач)'}
- Задачи в работе/осталось (${pendingTasks.length}):
${pendingTasks.length > 0 ? pendingTasks.map(t => `  ⏳ ${t}`).join('\n') : '  (все задачи закрыты)'}
${customNote ? `\nДОПОЛНИТЕЛЬНЫЙ КОММЕНТАРИЙ ОТ ИСПОЛНИТЕЛЯ:\n"${customNote}"` : ''}
`;

  let modeInstruction = '';
  switch (mode) {
    case 'weekly_report':
      modeInstruction = `Сформируй статус-отчет (weekly/daily update) для клиента в мессенджер (Telegram/WhatsApp).
Тон: вежливый, уверенный, партнерский, без канцеляризмов.
Структура:
1. Дружелюбное приветствие по имени.
2. Что уже сделано (перечисли конкретные результаты простым языком).
3. Что делаем прямо сейчас / следующие шаги.
4. Статус по срокам (в графике).
5. Готовность ответить на вопросы.
Используй аккуратные эмодзи.`;
      break;

    case 'payment_reminder':
      modeInstruction = `Сформируй деликатное, вежливое напоминание клиенту о необходимости внести очередной платеж или закрыть остаток.
Остаток к оплате: ${owed} ${project.currency}.
Тон: абсолютно уважительный, дипломатичный, без давления, но с четким обозначением суммы и следующего шага работ.
Не делай текст длинным — 3-5 предложений максимум.`;
      break;

    case 'milestone_done':
      modeInstruction = `Сформируй сообщение о завершении важного этапа проекта.
Поздравь с прогрессом, опиши что готово для тестирования/ревью клиентом и предложи посмотреть результат.`;
      break;

    case 'gentle_followup':
      modeInstruction = `Сформируй мягкий фоллоу-ап клиенту, если от него ожидается обратная связь или материалы, чтобы не затягивать дедлайн.`;
      break;
  }

  const result = await callDeepSeekChat(
    [
      {
        role: 'system',
        content: `Ты — опытный фрилансер и аккаунт-менеджер, пишущий безупречные, теплые и эффективные сообщения клиентам в мессенджерах на русском языке.\n${modeInstruction}`
      },
      {
        role: 'user',
        content: `Сгенерируй сообщение на основе следующих данных:\n${contextPrompt}`
      }
    ],
    { temperature: 0.6 }
  );

  return result.trim();
}

/**
 * 2b. Парсер правок от клиента в структурированные задачи
 */
export async function parseClientFeedbackToTasks(rawMessage: string): Promise<AiExtractedTask[]> {
  const systemPrompt = `Ты — технический аналитик и проджект-менеджер.
Клиент прислал сырое сообщение, список правок или сумбурный фидбек из мессенджера/созвона.
Твоя задача — вычленить оттуда конкретные атомарные задачи, которые разработчик/дизайнер может взять в работу.

Верни СТРОГО JSON-объект вида:
{
  "tasks": [
    {
      "title": "Четко сформулированная задача с глагола (например: 'Поправить отступы в шапке сайта')",
      "priority": "medium" (low / medium / high / urgent)
    }
  ]
}
Каждая задача должна быть понятной, без лишней воды. Не придумывай лишнего, бери только то, о чем говорил клиент.`;

  const rawJson = await callDeepSeekChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Вот сообщение от клиента:\n"""\n${rawMessage}\n"""` }
    ],
    { json: true, temperature: 0.3 }
  );

  try {
    const cleaned = cleanJsonString(rawJson);
    const parsed = JSON.parse(cleaned);
    const list: AiExtractedTask[] = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    return list.filter(t => t && t.title && t.title.trim().length > 0);
  } catch (err) {
    console.error('Failed to parse client feedback tasks:', rawJson, err);
    throw new Error('Не удалось разобрать текст клиента на задачи.');
  }
}

/**
 * 3. AI-Аудитор рисков и сроков (Project Health & Risk Advisor)
 */
export async function auditProjectRisks(project: Project): Promise<AiAuditResult> {
  const { paid, owed, total, percentPaid } = calculateProjectFinancials(project);
  const progress = calculateProjectProgress(project);
  const deadlineInfo = getDeadlineStatus(project.deadline, project.status);

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(t => t.completed).length;
  const remainingTasks = totalTasks - completedTasks;

  const now = new Date();
  const start = new Date(project.startDate);
  const end = new Date(project.deadline);
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
  const daysRemaining = Math.round((end.getTime() - now.getTime()) / (1000 * 3600 * 24));

  const prompt = `
ПРОЕКТ ДЛЯ АУДИТА:
- Название: "${project.title}"
- Категория: "${project.category}"
- Статус: "${project.status}"
- Приоритет: "${project.priority}"
- Календарный срок: с ${project.startDate} по ${project.deadline} (всего ${totalDays} дн., осталось ${daysRemaining} дн.)
- Статус дедлайна: ${deadlineInfo.label} (isUrgent: ${deadlineInfo.isUrgent}, isOverdue: ${deadlineInfo.isOverdue})
- Задачи: всего ${totalTasks}, выполнено ${completedTasks} (${progress}%), осталось ${remainingTasks}
- Финансы: бюджет ${total} ${project.currency}, оплачено ${paid} (${percentPaid}%), остаток долга ${owed}
- Список невыполненных задач:
${project.tasks.filter(t => !t.completed).map(t => `- ${t.title}`).slice(0, 10).join('\n') || '(нет)'}
`;

  const systemPrompt = `Ты — независимый AI-аудитор проектов и эксперт по риск-менеджменту.
Твоя цель — объективно и честно оценить жизнеспособность проекта, вероятность срыва дедлайна и финансовые риски.

Определи:
1. "status": "healthy" (всё отлично, рисков нет), "warning" (есть тревожные сигналы, требуется внимание), "critical" (высокий риск срыва дедлайна или неоплаты).
2. "score": оценка здоровья проекта от 0 до 100 (100 - идеал).
3. "summary": краткий вердикт на 1-2 предложения с сутью ситуации.
4. "bottlenecks": массив из 1-3 главных узких мест или факторов риска (например: "Осталось 3 дня, а 70% задач не начаты", "Не внесена предоплата при активной разработке").
5. "recommendations": массив из 2-3 конкретных действий разработчику/менеджеру прямо сейчас.

Верни СТРОГО JSON:
{
  "status": "warning",
  "score": 68,
  "summary": "...",
  "bottlenecks": ["..."],
  "recommendations": ["..."]
}`;

  const rawJson = await callDeepSeekChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    { json: true, temperature: 0.3 }
  );

  try {
    const cleaned = cleanJsonString(rawJson);
    const parsed = JSON.parse(cleaned);

    const validStatus = ['healthy', 'warning', 'critical'].includes(parsed.status)
      ? parsed.status
      : 'warning';

    return {
      status: validStatus,
      score: typeof parsed.score === 'number' ? Math.max(0, Math.min(100, parsed.score)) : 70,
      summary: parsed.summary || 'Анализ проекта завершен.',
      bottlenecks: Array.isArray(parsed.bottlenecks) ? parsed.bottlenecks : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      analyzedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Failed to parse AI risk audit:', rawJson, err);
    throw new Error('Не удалось получить результаты аудита от ИИ.');
  }
}

/**
 * Utility helper to strip potential markdown code fences from JSON strings
 */
function cleanJsonString(str: string): string {
  let text = str.trim();
  if (text.startsWith('```json')) {
    text = text.slice(7);
  } else if (text.startsWith('```')) {
    text = text.slice(3);
  }
  if (text.endsWith('```')) {
    text = text.slice(0, -3);
  }
  return text.trim();
}
