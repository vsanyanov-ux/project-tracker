import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  CheckSquare,
  FileSpreadsheet
} from 'lucide-react';

interface ThreeQuestionsWidgetProps {
  onGoToChecklist?: () => void;
  onGoToDecisionLog?: () => void;
}

export const ThreeQuestionsWidget: React.FC<ThreeQuestionsWidgetProps> = ({
  onGoToChecklist,
  onGoToDecisionLog
}) => {
  const [q1, setQ1] = useState<'execute' | 'decide' | null>(null);
  const [q2, setQ2] = useState<'internal' | 'client' | null>(null);
  const [q3, setQ3] = useState<'yes' | 'no' | null>(null);

  const reset = () => {
    setQ1(null);
    setQ2(null);
    setQ3(null);
  };

  const isAllAnswered = q1 !== null && q2 !== null && q3 !== null;

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Практическое правило соло-фаундера
            </span>
            <span className="text-xs text-slate-400">Стоп-кран перед запуском</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            3 контрольных вопроса перед каждым действием
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1">
            Помогает не смешивать роли, не брать чужую ответственность и исключить риск фатальной рассылки по базе пациентов клиники.
          </p>
        </div>

        {(q1 !== null || q2 !== null || q3 !== null) && (
          <button
            onClick={reset}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-center border border-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Сбросить ответы
          </button>
        )}
      </div>

      {/* 3 Questions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Вопрос 1 */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
          q1 === null 
            ? 'glass-card border-white/10 bg-slate-900/40' 
            : q1 === 'execute'
              ? 'border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
              : 'border-purple-500/40 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/5">
                Вопрос 1
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">Роль</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-2 leading-snug">
              Я сейчас выполняю операцию или принимаю решение?
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Разделяет исполнительность от стратегической ответственности.
            </p>
          </div>

          <div className="space-y-2 mt-auto">
            <button
              onClick={() => setQ1('execute')}
              className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                q1 === 'execute'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
              }`}
            >
              🛠 Выполняю операцию
              <span className="block text-[10px] opacity-80 font-normal mt-0.5">
                (импорт, чистка базы, настройка бота, мониторинг)
              </span>
            </button>

            <button
              onClick={() => setQ1('decide')}
              className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                q1 === 'decide'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
              }`}
            >
              🎯 Принимаю решение
              <span className="block text-[10px] opacity-80 font-normal mt-0.5">
                (размер скидки, оффер, кому писать, остановка)
              </span>
            </button>
          </div>
        </div>

        {/* Вопрос 2 */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
          q2 === null 
            ? 'glass-card border-white/10 bg-slate-900/40' 
            : q2 === 'client'
              ? 'border-rose-500/40 bg-rose-950/20 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
              : 'border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/5">
                Вопрос 2
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">Последствия</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-2 leading-snug">
              Кто понесёт последствия, если это действие провалится?
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Определяет, кто в RACI обязан быть Accountable (A).
            </p>
          </div>

          <div className="space-y-2 mt-auto">
            <button
              onClick={() => setQ2('client')}
              className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                q2 === 'client'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-md font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
              }`}
            >
              🏥 Клиент, пациенты или его репутация
              <span className="block text-[10px] opacity-80 font-normal mt-0.5">
                (негатив клиентов, жалобы на спам, медицинские ошибки)
              </span>
            </button>

            <button
              onClick={() => setQ2('internal')}
              className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                q2 === 'internal'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
              }`}
            >
              💻 Я / внутренний пайплайн разработки
              <span className="block text-[10px] opacity-80 font-normal mt-0.5">
                (ошибка в коде вебхука, форматирование логов)
              </span>
            </button>
          </div>
        </div>

        {/* Вопрос 3 */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
          q3 === null 
            ? 'glass-card border-white/10 bg-slate-900/40' 
            : q3 === 'no'
              ? 'border-amber-500/40 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
              : 'border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/5">
                Вопрос 3
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">Верификация</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-2 leading-snug">
              Могу ли я проверить результат до массовой отправки?
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Защита от отправки непроверенных промптов по реальным клиентам.
            </p>
          </div>

          <div className="space-y-2 mt-auto">
            <button
              onClick={() => setQ3('yes')}
              className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                q3 === 'yes'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
              }`}
            >
              ✅ Да, могу протестировать
              <span className="block text-[10px] opacity-80 font-normal mt-0.5">
                (на своих номерах, в эмуляторе диалогов)
              </span>
            </button>

            <button
              onClick={() => setQ3('no')}
              className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                q3 === 'no'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
              }`}
            >
              ⚠️ Нет / Не уверен в 100% реакции
              <span className="block text-[10px] opacity-80 font-normal mt-0.5">
                (живой контакт со спящим клиентом клиники)
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* Dynamic Action Verdict Box */}
      {isAllAnswered ? (
        <div className={`p-6 rounded-2xl border transition-all ${
          q2 === 'client'
            ? 'bg-rose-950/40 border-rose-500/50 text-rose-100'
            : q3 === 'no'
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-100'
              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-2xl shrink-0 ${
                q2 === 'client' 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : q3 === 'no'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {q2 === 'client' ? (
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                ) : q3 === 'no' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-white/10">
                    Вердикт RACI
                  </span>
                  <h4 className="text-base font-extrabold">
                    {q2 === 'client'
                      ? '🛑 СТОП! Требуется письменный аппрув косметолога'
                      : q3 === 'no'
                        ? '🧪 СТОП! Запрещен массовый запуск — сначала тест 20–50'
                        : q1 === 'execute'
                          ? '🛠 Зеленый свет: выполняйте строго по чек-листу'
                          : '📝 Зафиксируйте решение в Журнале решений'}
                  </h4>
                </div>

                <p className="text-xs sm:text-sm opacity-90 leading-relaxed max-w-2xl">
                  {q2 === 'client' ? (
                    <>
                      Поскольку последствия несет владелец клиники (репутация, штрафы, пациенты), 
                      <strong> косметолог является единственным Accountable (A)</strong>. Вы не имеете права запускать это самостоятельно! 
                      Подготовьте 2–3 варианта, покажите прогноз и получите письменное подтверждение («Да, запускаем»).
                    </>
                  ) : q3 === 'no' ? (
                    <>
                      Нельзя запускать рассылку на всю базу! Правило соло-фаундера: 
                      <strong> запустите пилот строго на 20–50 контактов</strong>, проверьте вручную ответы первых пациентов, 
                      убедитесь в отсутствии ошибок и только потом масштабируйте.
                    </>
                  ) : q1 === 'execute' ? (
                    <>
                      Вы находитесь в роли <strong>Исполнителя (R)</strong>. Исполнительность нужна в повторяемых операциях: 
                      не импровизируйте, откройте <strong>Чек-лист запуска</strong> и последовательно отметьте каждый пункт.
                    </>
                  ) : (
                    <>
                      Вы принимаете инженерное или продуктовое решение. Зафиксируйте его в 
                      <strong> Журнале решений</strong>: критерий успеха, риск, дату пересмотра и кто несет ответственность.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              {q1 === 'execute' && onGoToChecklist && (
                <button
                  onClick={onGoToChecklist}
                  className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <CheckSquare className="w-4 h-4" />
                  Открыть Чек-лист запуска
                </button>
              )}

              {q1 === 'decide' && onGoToDecisionLog && (
                <button
                  onClick={onGoToDecisionLog}
                  className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  В Журнал решений
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Explanatory Callout */
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-200 text-xs flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-indigo-300">Классический пример из косметологии: </span>
            Вы не должны сами решать: <em>«Отправим всем спящим клиентам скидку 30%»</em>. Это решение владельца клиники. 
            Ваша роль как Growth / Product Owner — подготовить 2–3 варианта оффера, показать прогноз конверсии, 
            получить письменное согласие на выбранную версию и затем как Engineer технически запустить её.
          </div>
        </div>
      )}
    </div>
  );
};
