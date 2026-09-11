import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Trash2,
  Cpu,
  ShieldCheck,
  Globe,
  Wallet
} from 'lucide-react';
import { 
  getDeepSeekApiKey, 
  setDeepSeekApiKey, 
  getDeepSeekModel, 
  setDeepSeekModel, 
  getAiProvider,
  setAiProvider,
  getAiBaseUrl,
  setAiBaseUrl,
  getAiBalance,
  testDeepSeekConnection, 
  clearDeepSeekConfig,
  PROVIDER_DEFAULTS
} from '../services/deepseek';
import type { AiProvider, DeepSeekModel } from '../types/ai';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [provider, setProviderState] = useState<AiProvider>(() => getAiProvider());
  const [baseUrl, setBaseUrl] = useState(() => getAiBaseUrl());
  const [apiKey, setApiKey] = useState(() => getDeepSeekApiKey());
  const [model, setModel] = useState<DeepSeekModel>(() => getDeepSeekModel());
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hasSavedKey, setHasSavedKey] = useState(() => !!getDeepSeekApiKey());
  const [balance, setBalance] = useState<string | null>(() => getAiBalance());

  if (!isOpen) return null;

  const handleProviderSelect = (selected: AiProvider) => {
    setProviderState(selected);
    const defaults = PROVIDER_DEFAULTS[selected];
    if (defaults) {
      setBaseUrl(defaults.baseUrl);
      if (selected === 'aitunnel') {
        setModel('deepseek-chat');
      } else if (selected === 'deepseek') {
        setModel('deepseek-chat');
      }
    }
    setTestResult(null);
  };

  const handleSave = () => {
    setAiProvider(provider);
    setAiBaseUrl(baseUrl);
    setDeepSeekApiKey(apiKey);
    setDeepSeekModel(model);
    setHasSavedKey(!!apiKey);
    if (onSaved) onSaved();
    onClose();
  };

  const handleClear = () => {
    if (window.confirm('Удалить сохраненные настройки и ключ API из браузера?')) {
      clearDeepSeekConfig();
      setApiKey('');
      setBalance(null);
      setHasSavedKey(false);
      setTestResult(null);
      if (onSaved) onSaved();
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Сначала введите API-ключ' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testDeepSeekConnection(apiKey.trim(), model, baseUrl.trim(), provider);
      setTestResult(res);
      if (res.balance) {
        setBalance(res.balance);
      }
    } catch (err) {
      setTestResult({ 
        success: false, 
        message: err instanceof Error ? err.message : 'Ошибка подключения' 
      });
    } finally {
      setIsTesting(false);
    }
  };

  const currentProviderDefaults = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.aitunnel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-scale-up max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Подключение ИИ
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI-Tunnel / DeepSeek
                </span>
              </h2>
              <p className="text-xs text-slate-400">Настройка провайдера, API-ключа и модели</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Provider Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Выберите провайдера API
              </span>
              {balance && (
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  <Wallet className="w-3 h-3 text-emerald-400" />
                  Баланс: {balance} ₽
                </span>
              )}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleProviderSelect('aitunnel')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  provider === 'aitunnel'
                    ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                  <span>AI-Tunnel</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/30 text-cyan-300">РФ</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Без VPN, оплата картой РФ</div>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('deepseek')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  provider === 'deepseek'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-100">DeepSeek</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Официальный API</div>
              </button>

              <button
                type="button"
                onClick={() => handleProviderSelect('custom')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  provider === 'custom'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/40'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-100">Свой URL</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Любой прокси / v1</div>
              </button>
            </div>
          </div>

          {/* Base URL Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>API Base URL</span>
              <span className="text-[10px] text-slate-500 font-mono">OpenAI-compatible endpoint</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value);
                setTestResult(null);
              }}
              placeholder="https://api.aitunnel.ru/v1"
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                {provider === 'aitunnel' ? 'API-ключ AI-Tunnel' : 'API-ключ'}
              </span>
              {currentProviderDefaults.helpUrl && (
                <a 
                  href={currentProviderDefaults.helpUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
                >
                  {provider === 'aitunnel' ? 'Кабинет aitunnel.ru' : 'Получить ключ'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder={provider === 'aitunnel' ? 'aitunnel-... или ваш ключ из кабинета' : 'sk-...'}
                className="w-full glass-input px-3.5 py-2.5 pr-10 rounded-xl text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/50"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {provider === 'aitunnel' && (
              <p className="text-[11px] text-cyan-300/80 mt-1">
                💡 Вставьте ваш API-ключ из личного кабинета <a href="https://aitunnel.ru/" target="_blank" rel="noreferrer" className="underline font-semibold">aitunnel.ru</a>.
              </p>
            )}
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Модель ИИ
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setModel('deepseek-chat')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  model === 'deepseek-chat'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-200">deepseek-chat</div>
                <div className="text-[10px] text-slate-400 mt-0.5">V3 • Быстрая и умная</div>
              </button>

              <button
                type="button"
                onClick={() => setModel('deepseek-r1')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  model === 'deepseek-r1' || model === 'deepseek-reasoner'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-200">deepseek-r1</div>
                <div className="text-[10px] text-slate-400 mt-0.5">R1 • Reasoning логика</div>
              </button>

              <button
                type="button"
                onClick={() => setModel('gpt-4o-mini')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  model === 'gpt-4o-mini'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-200">gpt-4o-mini</div>
                <div className="text-[10px] text-slate-400 mt-0.5">OpenAI модель</div>
              </button>
            </div>
          </div>

          {/* Connection Test Button & Feedback */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !apiKey.trim()}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600/20 via-indigo-600/20 to-purple-600/20 hover:from-cyan-600/30 hover:to-purple-600/30 border border-cyan-500/30 text-xs font-bold text-cyan-200 hover:text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Проверка подключения к {currentProviderDefaults.name}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Проверить подключение к API</span>
                </>
              )}
            </button>

            {testResult && (
              <div 
                className={`mt-2.5 p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-fade-in ${
                  testResult.success 
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' 
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-semibold">{testResult.message}</div>
                  {testResult.success && (
                    <div className="text-[11px] text-emerald-400/80 mt-0.5">
                      Готово к работе! Все три AI-функции проекта активны.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Security Banner */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              Ключ хранится локально в браузере (<code className="bg-indigo-950 px-1 py-0.5 rounded text-[10px]">localStorage</code>) и направляется напрямую на выбранный эндпоинт.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-slate-900/60 flex items-center justify-between gap-3 shrink-0">
          {hasSavedKey ? (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Очистить</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              Сохранить настройки
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
