/**
 * Очищает номер телефона от спецсимволов (скобки, дефисы, пробелы).
 * Для 11-значных номеров РФ, начинающихся с 8, нормализует в международный формат 7...
 */
export const cleanPhoneForMessenger = (phone: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) {
    return '7' + digits.slice(1);
  }
  return digits;
};

/**
 * Формирует прямую ссылку для открытия чата в WhatsApp по номеру телефона
 */
export const getWhatsAppUrl = (phone?: string): string | undefined => {
  if (!phone) return undefined;
  const digits = cleanPhoneForMessenger(phone);
  if (!digits) return undefined;
  return `https://wa.me/${digits}`;
};

/**
 * Формирует прямую валидную ссылку для перехода в Telegram чат/канал/профиль (https://t.me/...).
 * Корректно очищает любые форматы ввода и защищает от ошибочных дублей:
 * - '@username' -> 'https://t.me/username'
 * - 't.me/username' -> 'https://t.me/username'
 * - 'https://t.me/username' -> 'https://t.me/username'
 * - 'https://t.me/t.me/username' -> 'https://t.me/username' (защита от зацикливания на telegram.org)
 * - 'telegram.me/username' -> 'https://t.me/username'
 * - '+79991234567' -> 'https://t.me/+79991234567'
 * - 't.me/+join_hash' -> 'https://t.me/+join_hash'
 */
export const getTelegramUrl = (tg?: string): string | undefined => {
  if (!tg) return undefined;
  let clean = tg.trim();
  if (!clean) return undefined;

  // Если это системный URI схемы tg://
  if (clean.startsWith('tg://resolve?domain=')) {
    clean = clean.replace('tg://resolve?domain=', '');
  } else if (clean.startsWith('tg://')) {
    return clean;
  }

  // Убираем протокол http/https и www
  clean = clean.replace(/^https?:\/\//i, '');
  clean = clean.replace(/^www\./i, '');

  // Циклически вычищаем любые дубли доменов t.me, telegram.me, telegram.org
  while (/^(t\.me|telegram\.me|telegram\.org)\//i.test(clean)) {
    clean = clean.replace(/^(t\.me|telegram\.me|telegram\.org)\//i, '');
  }

  // Убираем ведущие @ или слеши (но сохраняем ведущий + для инвайт-ссылок или телефонов)
  clean = clean.replace(/^[@/]+/, '').replace(/\/+$/, '');

  // Если строка пустая или остался просто "telegram", ссылка некорректна
  if (!clean || clean.toLowerCase() === 'telegram') return undefined;

  return `https://t.me/${clean}`;
};

/**
 * Форматирует отображение никнейма Telegram (@username)
 */
export const formatTelegramHandle = (tg?: string): string => {
  if (!tg) return '';
  let clean = tg.trim();
  if (!clean) return '';

  clean = clean.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  while (/^(t\.me|telegram\.me|telegram\.org)\//i.test(clean)) {
    clean = clean.replace(/^(t\.me|telegram\.me|telegram\.org)\//i, '');
  }
  clean = clean.replace(/^[@/]+/, '').replace(/\/+$/, '');

  if (!clean) return tg;
  if (clean.startsWith('+')) return clean;
  return `@${clean}`;
};

/**
 * Универсальный резолвер ссылки по контакту клиента (Telegram, Email, Телефон)
 */
export const getContactUrl = (contact?: string): string | undefined => {
  if (!contact) return undefined;
  const trimmed = contact.trim();
  if (!trimmed) return undefined;

  if (trimmed.includes('@') && !trimmed.startsWith('@') && !trimmed.includes('/')) {
    return `mailto:${trimmed}`;
  }
  if (/^(\+?\d[\d\s\-()]{6,}\d)$/.test(trimmed)) {
    return `tel:${cleanPhoneForMessenger(trimmed)}`;
  }
  return getTelegramUrl(trimmed);
};

/**
 * Проверяет, является ли значение прямой ссылкой на профиль в МАКС (max.ru/u/...)
 */
export const isMaxProfileUrl = (val?: string): boolean => {
  if (!val) return false;
  const trimmed = val.trim();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.includes('max.ru/u/') ||
    trimmed.includes('web.max.ru/u/') ||
    trimmed.startsWith('max://u/')
  );
};

/**
 * Получает ссылку для перехода в МАКС
 */
export const getMaxUrl = (maxVal?: string): string => {
  if (!maxVal) return 'https://web.max.ru';
  const trimmed = maxVal.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.includes('max.ru')) {
    return `https://${trimmed.replace(/^https?:\/\//, '')}`;
  }
  return 'https://web.max.ru';
};

/**
 * Копирует номер телефона в буфер обмена
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write failed, fallbacking...', err);
  }
  
  // Fallback for older environments
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
};

/**
 * Обработчик открытия чата МАКС: копирует номер телефона в буфер обмена
 * и открывает веб-клиент web.max.ru (или прямую ссылку на профиль).
 */
export const handleOpenMax = async (
  phoneOrVal?: string,
  onNotify?: (msg: string) => void
) => {
  if (!phoneOrVal) return;
  const trimmed = phoneOrVal.trim();
  const isDirectUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('max.ru/u/');

  if (isDirectUrl) {
    window.open(getMaxUrl(trimmed), '_blank', 'noopener,noreferrer');
    return;
  }

  // If it's a phone number, copy it for convenient search in MAX
  const clean = cleanPhoneForMessenger(trimmed) || trimmed;
  await copyToClipboard(clean);
  if (onNotify) {
    onNotify(`Номер ${clean} скопирован в буфер для поиска в МАКС!`);
  }
  window.open('https://web.max.ru', '_blank', 'noopener,noreferrer');
};
