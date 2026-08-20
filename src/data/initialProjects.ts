import type { Project } from '../types/project';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Лендинг #1 (Промо-страница)',
    description: 'Конверсионный промо-лендинг для инвестиционного клуба Capital Flow с интерактивным калькулятором доходности и динамическими 3D-элементами.',
    client: 'Инвест-клуб Capital Flow',
    clientContact: '@capital_flow_manager',
    category: 'Лендинг',
    status: 'in_progress',
    priority: 'high',
    startDate: '2026-08-05',
    deadline: '2026-08-25',
    totalBudget: 65000,
    currency: '₽',
    colorTheme: 'cyan',
    payments: [
      {
        id: 'pay-1-1',
        title: 'Предоплата 50%',
        amount: 32500,
        isPaid: true,
        paidDate: '2026-08-05',
        notes: 'Получено на карту Сбер'
      },
      {
        id: 'pay-1-2',
        title: 'Финальный расчет после сдачи',
        amount: 32500,
        isPaid: false,
        dueDate: '2026-08-25',
        notes: 'Выставить счет после релиза'
      }
    ],
    milestones: [
      {
        id: 'ms-1-1',
        title: 'Анализ, структура и UI-дизайн в Figma',
        progress: 100,
        dueDate: '2026-08-12',
        completed: true
      },
      {
        id: 'ms-1-2',
        title: 'Верстка компонентов и анимации (Tailwind)',
        progress: 75,
        dueDate: '2026-08-20',
        completed: false
      },
      {
        id: 'ms-1-3',
        title: 'Интеграция форм, Telegram-уведомлений и аналитики',
        progress: 20,
        dueDate: '2026-08-25',
        completed: false
      }
    ],
    tasks: [
      { id: 't-1-1', title: 'Согласовать референсы и цветовую гамму', completed: true },
      { id: 't-1-2', title: 'Разработать макет в Figma (десктоп + мобайл)', completed: true },
      { id: 't-1-3', title: 'Сверстать первый экран с неоновым 3D-градиентом', completed: true },
      { id: 't-1-4', title: 'Реализовать адаптивную сетку под смартфоны и планшеты', completed: true },
      { id: 't-1-5', title: 'Сделать интерактивный калькулятор инвестора', completed: false },
      { id: 't-1-6', title: 'Подключить API отправки лидов в Telegram бота', completed: false },
      { id: 't-1-7', title: 'Настроить Яндекс.Метрику и цели на кнопки', completed: false }
    ],
    links: [
      { id: 'l-1-1', title: 'Figma дизайн', url: 'https://figma.com', type: 'figma' },
      { id: 'l-1-2', title: 'GitHub репозиторий', url: 'https://github.com', type: 'github' },
      { id: 'l-1-3', title: 'Тестовый стенд (Vercel)', url: 'https://demo-landing1.vercel.app', type: 'live' }
    ],
    notes: 'Клиент просил сделать упор на скорость загрузки в мобильных сетях и премиальный темный стиль.',
    createdAt: '2026-08-05T10:00:00.000Z',
    updatedAt: '2026-08-19T18:30:00.000Z'
  },
  {
    id: 'proj-2',
    title: 'Лендинг #2 (Продуктовая страница курсов)',
    description: 'Продающий лонгрид для EdTech академии FutureSkills с видео-плеером, программой курса и таймером спецпредложения.',
    client: 'EdTech Академия FutureSkills',
    clientContact: 't.me/futureskills_leads',
    category: 'Лендинг',
    status: 'in_review',
    priority: 'medium',
    startDate: '2026-08-01',
    deadline: '2026-08-22',
    totalBudget: 80000,
    currency: '₽',
    colorTheme: 'purple',
    payments: [
      {
        id: 'pay-2-1',
        title: 'Аванс на разработку 50%',
        amount: 40000,
        isPaid: true,
        paidDate: '2026-08-01',
        notes: 'Безналичный расчет (самозанятый)'
      },
      {
        id: 'pay-2-2',
        title: 'Остаток после согласования правок',
        amount: 40000,
        isPaid: false,
        dueDate: '2026-08-22',
        notes: 'Ждем финальное подтверждение от маркетолога'
      }
    ],
    milestones: [
      {
        id: 'ms-2-1',
        title: 'Копирайтинг и прототип',
        progress: 100,
        dueDate: '2026-08-07',
        completed: true
      },
      {
        id: 'ms-2-2',
        title: 'UI дизайн и верстка всех 9 экранов',
        progress: 100,
        dueDate: '2026-08-18',
        completed: true
      },
      {
        id: 'ms-2-3',
        title: 'Согласование и правки от команды заказчика',
        progress: 85,
        dueDate: '2026-08-22',
        completed: false
      }
    ],
    tasks: [
      { id: 't-2-1', title: 'Оформить тарифную сетку с переключателем валют', completed: true },
      { id: 't-2-2', title: 'Интегрировать форму захвата контактов', completed: true },
      { id: 't-2-3', title: 'Оптимизировать загрузку тяжелых изображений', completed: true },
      { id: 't-2-4', title: 'Внести правки в блок отзывов спикеров', completed: true },
      { id: 't-2-5', title: 'Заменить видео-презентацию в hero блоке', completed: false },
      { id: 't-2-6', title: 'Финальный перенос на основной домен', completed: false }
    ],
    links: [
      { id: 'l-2-1', title: 'Figma макет', url: 'https://figma.com', type: 'figma' },
      { id: 'l-2-2', title: 'Staging сервер', url: 'https://course-staging.web.app', type: 'live' }
    ],
    notes: 'Маркетолог должен прислать обновленный видеоролик до 21 августа.',
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-08-20T09:15:00.000Z'
  },
  {
    id: 'proj-3',
    title: 'Сервис сжатия и оптимизации фотографий',
    description: 'Высокопроизводительное веб-приложение для пакетного сжатия (WebP, AVIF, MozJPEG) прямо в браузере через WebAssembly без передачи на сервер.',
    client: 'SaaS Startup / Внутренний сервис',
    clientContact: 'founder@imageopt.io',
    category: 'Веб-сервис',
    status: 'in_progress',
    priority: 'urgent',
    startDate: '2026-08-10',
    deadline: '2026-08-28',
    totalBudget: 140000,
    currency: '₽',
    colorTheme: 'emerald',
    payments: [
      {
        id: 'pay-3-1',
        title: 'Этап 1: WASM движок и архитектура',
        amount: 50000,
        isPaid: true,
        paidDate: '2026-08-10',
        notes: 'Оплачено'
      },
      {
        id: 'pay-3-2',
        title: 'Этап 2: Drag&Drop UI и параллельная очередь',
        amount: 50000,
        isPaid: false,
        dueDate: '2026-08-24',
        notes: 'Демонстрация работы на 50 файлах'
      },
      {
        id: 'pay-3-3',
        title: 'Этап 3: Релиз и упаковка в PWA',
        amount: 40000,
        isPaid: false,
        dueDate: '2026-08-28',
        notes: 'Финальный релиз'
      }
    ],
    milestones: [
      {
        id: 'ms-3-1',
        title: 'Интеграция WASM кодеков (MozJPEG + libvips)',
        progress: 95,
        dueDate: '2026-08-16',
        completed: true
      },
      {
        id: 'ms-3-2',
        title: 'Многопоточная обработка Web Workers & UI',
        progress: 80,
        dueDate: '2026-08-23',
        completed: false
      },
      {
        id: 'ms-3-3',
        title: 'Пакетная выгрузка ZIP и замеры производительности',
        progress: 40,
        dueDate: '2026-08-28',
        completed: false
      }
    ],
    tasks: [
      { id: 't-3-1', title: 'Собрать WebAssembly бинарники для MozJPEG и AVIF', completed: true },
      { id: 't-3-2', title: 'Сделать Drag&Drop зону с предпросмотром миниатюр', completed: true },
      { id: 't-3-3', title: 'Реализовать сплиттер До/После для оценки артефактов', completed: true },
      { id: 't-3-4', title: 'Настроить многопоточный пул воркеров (Web Workers)', completed: true },
      { id: 't-3-5', title: 'Реализовать стриминг в ZIP архив через JSZip', completed: false },
      { id: 't-3-6', title: 'Добавить ручные ползунки качества и масштабирования', completed: false },
      { id: 't-3-7', title: 'Провести тесты на файлах > 25MB и утечки памяти', completed: false }
    ],
    links: [
      { id: 'l-3-1', title: 'Репозиторий GitHub', url: 'https://github.com/vanya/image-opt-wasm', type: 'github' },
      { id: 'l-3-2', title: 'Figma UI Kit', url: 'https://figma.com', type: 'figma' },
      { id: 'l-3-3', title: 'Live Sandbox', url: 'https://opt-sandbox.dev', type: 'live' }
    ],
    notes: 'Главное конкурентное преимущество — 100% приватность (фотографии никуда не улетают с устройства пользователя).',
    createdAt: '2026-08-10T08:00:00.000Z',
    updatedAt: '2026-08-20T09:40:00.000Z'
  },
  {
    id: 'proj-4',
    title: 'Реактиватор для Оли Потаповой',
    description: 'Интеллектуальная система автоматической реактивации спящей клиентской базы и подогрева холодных лидов через Telegram и WhatsApp воронки.',
    client: 'Ольга Потапова',
    clientContact: 't.me/olga_potapova_biz',
    category: 'Автоматизация / Бот',
    status: 'in_progress',
    priority: 'high',
    startDate: '2026-08-08',
    deadline: '2026-08-24',
    totalBudget: 95000,
    currency: '₽',
    colorTheme: 'rose',
    payments: [
      {
        id: 'pay-4-1',
        title: 'Аванс за проектирование и запуск бота',
        amount: 45000,
        isPaid: true,
        paidDate: '2026-08-08',
        notes: 'Оплачено (Тинькофф)'
      },
      {
        id: 'pay-4-2',
        title: 'Остаток после тестовой рассылки на 500 контактов',
        amount: 50000,
        isPaid: false,
        dueDate: '2026-08-24',
        notes: 'Ждем результатов конверсии'
      }
    ],
    milestones: [
      {
        id: 'ms-4-1',
        title: 'Разработка карты сценариев и триггеров ответов',
        progress: 100,
        dueDate: '2026-08-13',
        completed: true
      },
      {
        id: 'ms-4-2',
        title: 'Бэкенд логики реактивации и вебхуки CRM',
        progress: 70,
        dueDate: '2026-08-21',
        completed: false
      },
      {
        id: 'ms-4-3',
        title: 'Тестовый запуск и аналитический дашборд для Ольги',
        progress: 30,
        dueDate: '2026-08-24',
        completed: false
      }
    ],
    tasks: [
      { id: 't-4-1', title: 'Составить карту диалогов и вариаций офферов', completed: true },
      { id: 't-4-2', title: 'Создать Telegram-бота и настроить меню команд', completed: true },
      { id: 't-4-3', title: 'Подключить API базы контактов из Google Sheets / CRM', completed: true },
      { id: 't-4-4', title: 'Настроить логику задержек и умного тайминга сообщений', completed: false },
      { id: 't-4-5', title: 'Сделать распознавание ключевых фраз (ДА / ИНТЕРЕСНО / СТОИМОСТЬ)', completed: false },
      { id: 't-4-6', title: 'Записать короткое видео для Ольги по работе с базой', completed: false }
    ],
    links: [
      { id: 'l-4-1', title: 'Miro схема воронок', url: 'https://miro.com', type: 'docs' },
      { id: 'l-4-2', title: 'Тестовый бот', url: 'https://t.me/potapova_reactivate_bot', type: 'chat' }
    ],
    notes: 'Ольга просила сделать максимально вежливый и ненавязчивый тон сообщений, без спам-триггеров.',
    createdAt: '2026-08-08T11:20:00.000Z',
    updatedAt: '2026-08-19T21:10:00.000Z'
  },
  {
    id: 'proj-5',
    title: 'Чат и панель администратора для Соломастера',
    description: 'Полнофункциональная экосистема коммуникации: встраиваемый WebSocket чат-виджет для клиентов + панель администратора с распределением диалогов по мастерам.',
    client: 'Сервис Соломастер',
    clientContact: 't.me/solomaster_tech',
    category: 'Fullstack / CRM',
    status: 'in_progress',
    priority: 'urgent',
    startDate: '2026-08-02',
    deadline: '2026-08-26',
    totalBudget: 185000,
    currency: '₽',
    colorTheme: 'blue',
    payments: [
      {
        id: 'pay-5-1',
        title: 'Аванс 40% на старте проекта',
        amount: 75000,
        isPaid: true,
        paidDate: '2026-08-02',
        notes: 'Оплачено на расчетный счет'
      },
      {
        id: 'pay-5-2',
        title: 'Этап 2: Рабочая версия админки и чата',
        amount: 60000,
        isPaid: true,
        paidDate: '2026-08-16',
        notes: 'Оплачено после демонстрации'
      },
      {
        id: 'pay-5-3',
        title: 'Финальный расчет при сдаче под ключ',
        amount: 50000,
        isPaid: false,
        dueDate: '2026-08-26',
        notes: 'Остаток'
      }
    ],
    milestones: [
      {
        id: 'ms-5-1',
        title: 'Real-time WebSocket бэкенд и структура БД',
        progress: 100,
        dueDate: '2026-08-10',
        completed: true
      },
      {
        id: 'ms-5-2',
        title: 'Клиентский чат-виджет с отправкой файлов и аудио',
        progress: 90,
        dueDate: '2026-08-18',
        completed: true
      },
      {
        id: 'ms-5-3',
        title: 'Панель администратора, фильтры и Telegram пуши',
        progress: 65,
        dueDate: '2026-08-26',
        completed: false
      }
    ],
    tasks: [
      { id: 't-5-1', title: 'Настроить Fastify + Socket.io сервер с Redis PubSub', completed: true },
      { id: 't-5-2', title: 'Спроектировать схему базы данных PostgreSQL (чаты, сообщения, мастера)', completed: true },
      { id: 't-5-3', title: 'Сверстать виджет чата с кастомизацией темы под бренд Соломастера', completed: true },
      { id: 't-5-4', title: 'Реализовать интерфейс оператора со списком активных диалогов', completed: true },
      { id: 't-5-5', title: 'Добавить систему тегов и быстрого переназначения мастера', completed: false },
      { id: 't-5-6', title: 'Сделать мгновенные уведомления мастерам в Telegram с кнопками ответа', completed: false },
      { id: 't-5-7', title: 'Финальное развертывание на сервере Ubuntu и SSL', completed: false }
    ],
    links: [
      { id: 'l-5-1', title: 'Админка Staging', url: 'https://admin-staging.solomaster.ru', type: 'live' },
      { id: 'l-5-2', title: 'GitLab репозиторий', url: 'https://gitlab.com/solomaster-chat', type: 'github' },
      { id: 'l-5-3', title: 'API Спецификация (Swagger)', url: 'https://api-staging.solomaster.ru/docs', type: 'docs' }
    ],
    notes: 'Самый ответственный проект: высокая нагрузка, требуется безотказная доставка сообщений и удобный UI для менеджеров.',
    createdAt: '2026-08-02T14:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z'
  }
];
