import React, { useState, useRef, useEffect } from 'react';
import { Phone, Copy, Check, ExternalLink } from 'lucide-react';
import { WhatsAppIcon, MaxIcon } from './MessengerIcons';
import { 
  getWhatsAppUrl, 
  copyToClipboard,
  isMaxProfileUrl,
  getMaxUrl,
  cleanPhoneForMessenger
} from '../utils/messenger';

interface ClientPhoneContactProps {
  phone?: string;
  whatsapp?: string;
  max?: string;
  className?: string;
  compact?: boolean;
}

export const ClientPhoneContact: React.FC<ClientPhoneContactProps> = ({
  phone,
  whatsapp,
  max,
  className = '',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showMaxModal, setShowMaxModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const effectivePhone = phone?.trim();
  const effectiveWhatsapp = whatsapp?.trim() || effectivePhone;
  const effectiveMax = max?.trim() || effectivePhone;
  const waUrl = getWhatsAppUrl(effectiveWhatsapp);

  // Close menu on click outside - must be called unconditionally before early return
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // If no phone or messengers are configured, don't render anything
  if (!effectivePhone && !effectiveWhatsapp && !effectiveMax) {
    return null;
  }

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const numToCopy = effectivePhone || effectiveWhatsapp || effectiveMax || '';
    if (numToCopy) {
      const ok = await copyToClipboard(numToCopy);
      if (ok) {
        setCopied(true);
        setFeedback('Номер скопирован!');
        setTimeout(() => {
          setCopied(false);
          setFeedback(null);
        }, 2500);
      }
    }
  };

  const onMaxClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);

    // If it's an invite link (max.ru/u/...), open it directly in MAX
    if (isMaxProfileUrl(effectiveMax)) {
      window.open(getMaxUrl(effectiveMax), '_blank', 'noopener,noreferrer');
      return;
    }

    // If it's a phone number, copy to clipboard, open web.max.ru and show guidance modal
    const clean = cleanPhoneForMessenger(effectiveMax || '') || effectiveMax || '';
    await copyToClipboard(clean);
    setFeedback('Номер скопирован!');
    setTimeout(() => setFeedback(null), 3000);
    setShowMaxModal(true);
    window.open('https://web.max.ru', '_blank', 'noopener,noreferrer');
  };

  const onWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (waUrl) {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <div className="flex items-center gap-2">
        {/* Main Phone Button / Trigger */}
        {effectivePhone && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
            className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-300 transition-colors group cursor-pointer text-left"
            title="Нажмите, чтобы открыть чат в WhatsApp, МАКС или позвонить"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className={`truncate group-hover:underline font-mono text-xs ${compact ? 'max-w-[95px]' : ''}`}>
              {effectivePhone}
            </span>
          </button>
        )}

        {/* Quick 1-Click WhatsApp Action Button */}
        {effectiveWhatsapp && (
          <button
            type="button"
            onClick={onWhatsAppClick}
            className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm"
            title={`Написать в WhatsApp (${effectiveWhatsapp})`}
          >
            <WhatsAppIcon className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Quick 1-Click MAX Action Button */}
        {effectiveMax && (
          <button
            type="button"
            onClick={onMaxClick}
            className="p-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer shadow-sm"
            title={`Открыть чат в МАКС (${effectiveMax})`}
          >
            <MaxIcon className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Inline Copied Status Pill */}
        {feedback && (
          <span className="text-[10px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full animate-fade-in truncate max-w-[200px]">
            {feedback}
          </span>
        )}
      </div>

      {/* Dropdown Menu when clicking on the phone number */}
      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-1.5 z-50 min-w-[220px] bg-slate-900/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl p-2 animate-fade-in space-y-1 text-xs"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 mb-1 flex items-center justify-between">
            <span>Связаться с клиентом</span>
            {effectivePhone && <span className="text-slate-500 font-mono">{effectivePhone}</span>}
          </div>

          {/* WhatsApp Action */}
          {effectiveWhatsapp && (
            <button
              type="button"
              onClick={onWhatsAppClick}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-slate-200 hover:text-white hover:bg-emerald-500/15 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold block text-emerald-300">Написать в WhatsApp</span>
                  <span className="text-[10px] text-slate-400 block">{effectiveWhatsapp}</span>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-300" />
            </button>
          )}

          {/* MAX Action */}
          {effectiveMax && (
            <button
              type="button"
              onClick={onMaxClick}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-slate-200 hover:text-white hover:bg-indigo-500/15 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MaxIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold block text-indigo-300">Открыть в МАКС</span>
                  <span className="text-[10px] text-slate-400 block">web.max.ru + номер в буфер</span>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-300" />
            </button>
          )}

          {/* Regular Phone Call */}
          {effectivePhone && (
            <a
              href={`tel:${effectivePhone}`}
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-slate-200 hover:text-white hover:bg-white/10 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white/10 text-slate-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium block text-slate-200">Позвонить</span>
                  <span className="text-[10px] text-slate-400 block">{effectivePhone}</span>
                </div>
              </div>
            </a>
          )}

          {/* Copy Number */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-white/10 transition-all group cursor-pointer border-t border-white/5 mt-1"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/5 text-slate-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs">
                {copied ? 'Номер скопирован!' : 'Скопировать номер'}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Max Contact Guidance Modal */}
      {showMaxModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setShowMaxModal(false);
          }}
        >
          <div 
            className="w-full max-w-md bg-slate-900/95 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl glass-panel relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
                  <MaxIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Переход в чат МАКС</h3>
                  <p className="text-[11px] text-slate-400">Поиск контакта по номеру</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMaxModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="py-4 space-y-3">
              {/* Number Banner */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block">Номер в буфере обмена:</span>
                  <span className="font-mono text-base font-bold text-white tracking-wider">
                    {effectiveMax}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Скопировано</span>
                </span>
              </div>

              {/* Instructions */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 text-[11px] font-bold">1</span>
                  <span>Приложение или сайт <strong>MAX</strong> открыты</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 text-[11px] font-bold">2</span>
                  <span>В МАКС нажмите в строку <strong>«Поиск»</strong> вверху</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 text-[11px] font-bold">3</span>
                  <span>Вставьте номер (<kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Ctrl+V</kbd>) и нажмите <strong>«Найти по номеру»</strong></span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                💡 <em>В мессенджере МАКС прямые ссылки по номеру телефона отключены разработчиками для защиты приватности. Если клиент пришлет ссылку на свой профиль (<code className="text-indigo-300">max.ru/u/...</code>), сохраните её в карточке, и чат будет открываться сразу в 1 клик!</em>
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  window.open('https://web.max.ru', '_blank', 'noopener,noreferrer');
                }}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Открыть МАКС ещё раз</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMaxModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
