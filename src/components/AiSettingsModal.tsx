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
  ShieldCheck
} from 'lucide-react';
import { 
  getDeepSeekApiKey, 
  setDeepSeekApiKey, 
  getDeepSeekModel, 
  setDeepSeekModel, 
  testDeepSeekConnection, 
  clearDeepSeekConfig 
} from '../services/deepseek';
import type { DeepSeekModel } from '../types/ai';

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
  const [apiKey, setApiKey] = useState(() => getDeepSeekApiKey());
  const [model, setModel] = useState<DeepSeekModel>(() => getDeepSeekModel());
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hasSavedKey, setHasSavedKey] = useState(() => !!getDeepSeekApiKey());


  if (!isOpen) return null;

  const handleSave = () => {
    setDeepSeekApiKey(apiKey);
    setDeepSeekModel(model);
    setHasSavedKey(!!apiKey);
    if (onSaved) onSaved();
    onClose();
  };

  const handleClear = () => {
    if (window.confirm('Удалить сохраненный ключ DeepSeek API из браузера?')) {
      clearDeepSeekConfig();
      setApiKey('');
      setHasSavedKey(false);
      setTestResult(null);
      if (onSaved) onSaved();
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Сначала введите API-ключ DeepSeek' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testDeepSeekConnection(apiKey.trim(), model);
      setTestResult(res);
    } catch (err) {
      setTestResult({ 
        success: false, 
        message: err instanceof Error ? err.message : 'Ошибка подключения' 
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Интеграция DeepSeek AI
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  OpenAI-Compatible
                </span>
              </h2>
              <p className="text-xs text-slate-400">Настройка модели и персонального API-ключа</p>
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
        <div className="p-6 space-y-5">
          {/* Security Banner */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-200 text-xs">
            <ShieldCheck className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-indigo-300">Безопасность данных: </span>
              Ваш ключ хранится только в локальном хранилище вашего браузера (<code className="bg-indigo-950 px-1 py-0.5 rounded text-[11px]">localStorage</code>) и направляется напрямую в официальный API DeepSeek.
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                DeepSeek API Key
              </span>
              <a 
                href="https://platform.deepseek.com/api_keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
              >
                Получить ключ
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
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
          </div>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Модель интеллекта
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModel('deepseek-chat')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  model === 'deepseek-chat'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-200">deepseek-chat</div>
                <div className="text-[11px] text-slate-400 mt-0.5">V3 • Быстрая, точная и экономичная (рекомендуется)</div>
              </button>

              <button
                type="button"
                onClick={() => setModel('deepseek-reasoner')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  model === 'deepseek-reasoner'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-200">deepseek-reasoner</div>
                <div className="text-[11px] text-slate-400 mt-0.5">R1 • Глубокое reasoning-мышление для сложных задач</div>
              </button>
            </div>
          </div>

          {/* Connection Test Button & Feedback */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !apiKey.trim()}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Проверка связи с DeepSeek...</span>
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
                className={`mt-2.5 p-2.5 rounded-xl border text-xs flex items-start gap-2 animate-fade-in ${
                  testResult.success 
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 bg-slate-900/60 flex items-center justify-between gap-3">
          {hasSavedKey ? (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Удалить ключ</span>
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
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
