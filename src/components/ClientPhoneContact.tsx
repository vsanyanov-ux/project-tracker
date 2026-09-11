import React, { useState, useRef, useEffect } from 'react';
import { Phone, Copy, Check, ExternalLink } from 'lucide-react';
import { WhatsAppIcon, MaxIcon } from './MessengerIcons';
import { 
  getWhatsAppUrl, 
  handleOpenMax, 
  copyToClipboard 
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

  const onMaxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleOpenMax(effectiveMax, (msg) => {
      setFeedback(msg);
      setTimeout(() => setFeedback(null), 3000);
    });
    setIsOpen(false);
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
    </div>
  );
};
